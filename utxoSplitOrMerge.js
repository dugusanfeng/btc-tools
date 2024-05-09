const bitcoin = require('bitcoinjs-lib');
const { toXOnly } = require('bitcoinjs-lib/src/psbt/bip371')
const fs = require('fs');
const { network, nodeUrl, user, password, ordServerUrl } = require('config')
const { decrypt } = require('./utils/crypto')
const { logger } = require('./utils/logger')
const { requestGet } = require('./utils/request')
const { generateTaprootAddress, networks, sendRawTransaction } = require('./utils/address')
const inquirer = require('inquirer');
const args = require('minimist')(process.argv.slice(2))

async function utxoSplitOrMerge(network, account, utxos, vouts) {
    logger.info(`utxos: ${JSON.stringify(utxos)}`)

    const xOnlyPubkey = toXOnly(account.childNode.publicKey);

    const tweakedChildNode = account.childNode.tweak(
        bitcoin.crypto.taggedHash('TapTweak', xOnlyPubkey),
    );
    const psbt = new bitcoin.Psbt({ network: networks[network] })
    // 添加输入
    for (var i = 0; i < utxos.length; i++) {
        const inputData = {
            hash: utxos[i]?.txid,
            index: Number(utxos[i]?.vout),
            witnessUtxo: { value: utxos[i]?.value, script: account?.output },
            tapInternalKey: xOnlyPubkey,
        }
        psbt.addInput(inputData)
    }
    // 添加输出
    for (var i = 0; i < vouts.length; i++) {
        psbt.addOutput({
            value: vouts[i],
            address: account?.address,
        })
    }
    psbt.signAllInputs(tweakedChildNode).finalizeAllInputs();
    const tx = psbt.extractTransaction();
    let auth = ''
    if (user && password) {
        auth = `${user}:${password}`
    }
    const rawTx = tx.toHex()

    logger.info(`签名后的交易信息: rawTx: ${rawTx} ---- 交易hash: ${tx.getId()}`);
    console.log(`签名后的交易信息: rawTx: ${rawTx} ---- 交易hash: ${tx.getId()}`);
    const req = {
        method: 'sendrawtransaction',
        params: [rawTx],
        jsonrpc: '2.0',
        id: '1',
    };

    await sendRawTransaction(nodeUrl, auth, req)
}

async function getOutputDetail(output) {
    const options = {
        headers: {
            'Accept': 'application/json'
        }
    };
    const outputDetail = await requestGet(`${ordServerUrl}/output/${output}`, options)
    return outputDetail
}

async function passInput() {
    const password = await inquirer.prompt([{
        type: 'password',
        message: '请输入生成账户的keystore加密密码: ',
        name: 'password',
        mask: '*',
    }]);
    return password.password
}

function dec(password, filePath) {
    if (!filePath) {
        filePath = './config/keystore/mnemonic.json'
    }
    const file = fs.readFileSync(filePath, 'utf8');

    try {
        const mnemonic = decrypt(file, password);
        console.log('mnemonic: ', mnemonic)
        return [ mnemonic, null ]
    } catch (error) {
        return [ null, error ]
    }
}

const filePath = args['path']
const walletIndex = args['index']
const outputs = JSON.parse(args['outputs'])
const vouts = JSON.parse(args['vouts'])

async function start()
{
    if (!outputs) {
        console.error("输入utxo列表为空，请检查--outputs参数")
        return
    }
    if (!vouts || vouts?.length === 0) {
        console.error("拆分金额列表为空，请检查--vouts参数")
        return
    }
    logger.info(`命令行参数: index-${walletIndex}, outputs-${JSON.stringify(outputs)}, vouts-${JSON.stringify(vouts)}`)
    const password = await passInput()
    if (password && password.match(/\w{6,20}$/)) {
        const [mnemonic, error] = dec(password, filePath)
        console.log(mnemonic, error)
        if (error) {
            console.log("助记词keystore密码错误，请重新输入")
            start()
        } else {
            const account = generateTaprootAddress(mnemonic, walletIndex, network)
            logger.info(`助记词生成的taproot地址: ${account?.address}`)
            const utxos = []
            for (var i = 0; i < outputs.length; i++) {
                const outputDetail = await getOutputDetail(outputs[i])
                logger.info(`output (${outputs[i]}) 详情: ${JSON.stringify(outputDetail)}`)
                if (account?.address !== outputDetail?.address) {
                    logger.error("助记词生成的账户与输入的UTXO的所属地址不匹配，请检查相应的参数")
                    console.error("助记词生成的账户与输入的UTXO的所属地址不匹配，请检查相应的参数")
                    return
                }
                // runes和inscription绑定的utxo排除
                if (outputDetail?.runes.length === 0 && outputDetail?.inscriptions.length === 0) {
                    const utxo = {
                        txid: outputDetail?.transaction, // 输入交易的ID
                        vout: outputs[i].split(':')[1], // 输入交易的输出索引
                        value: outputDetail?.value, // 输入金额（以聪为单位）
                        scriptPubKey: outputDetail?.script_pubkey, // 输入脚本公钥
                    }
                    utxos.push(utxo)
                }
            }
            await utxoSplitOrMerge(network, account, utxos, vouts)
        }
    } else {
        console.error("Keystore密码格式错误，必须为6-20位字符。请重新输入")
        start()
    }
}

start()
