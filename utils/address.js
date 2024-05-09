const bitcoin = require('bitcoinjs-lib');
const fetch = require('node-fetch')
const bip39 = require('bip39');
const bip32 = require('bip32');
const ecc = require('tiny-secp256k1');

bitcoin.initEccLib(ecc);

const networks = {
    'mainnet': bitcoin.networks.bitcoin,
    'testnet': bitcoin.networks.testnet,
    'regtest': bitcoin.networks.regtest
}

function generateTaprootAddress(mnemonic, index, network) {
    // 生成种子
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // 使用种子生成比特币测试网络的根私钥
    const root = bip32.BIP32Factory(ecc).fromSeed(seed, networks[network]);
    // 从根私钥派生第一个外部（公开）键对
    const childNode = root.derivePath(`m/86'/${index}'/0'/0/0`);
    // 获取公钥
    const publicKey = childNode.publicKey;
    const internalPubkey = publicKey.slice(1, 33);
    const { address, output } = bitcoin.payments.p2tr({
        internalPubkey,
        network: networks[network]
    });
    console.log('address: ', address)
    return {address: address, childNode: childNode, output: output}
}

async function sendRawTransaction(url, auth, req) {
    let authorization = ''
    if (auth) {
        authorization = `Basic ${Buffer.from(auth).toString('base64')}`
    }
    console.log(url, authorization, req)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: authorization,
        },
        body: JSON.stringify(req),
    })
    return response
}


module.exports = {
    networks,
    generateTaprootAddress,
    sendRawTransaction
}
