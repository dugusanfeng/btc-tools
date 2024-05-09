const fs = require('fs');
const { decrypt } = require('./utils/crypto')
const { logger } = require('./utils/logger')
const { execSync } = require('child_process');
const { network, nodeUrl, cookiePath } = require('config')
const inquirer = require('inquirer');
const args = require('minimist')(process.argv.slice(2))


function importWallet(walletName, mnemonic) {
    try {
        const output = execSync(`echo "${mnemonic}" | ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --chain ${network} wallet --name ${walletName} restore --from mnemonic`);
        // const result = JSON.parse(output.toString())
        /*
        {
          "rune": "ZTHE•TEST•RUNE",
          "pile": {
            "amount": 10000,
            "divisibility": 2,
            "symbol": "$"
          },
          "mint": "4fce3dd0f2a4d6b5c1e11987be00fffd3be9f8b458b4eca97d52a41023751e47"
        }
        */
        logger.info(`导入钱包(${walletName})成功: ${output.toString()}`)
        console.log("导入钱包成功: ", output.toString())
    } catch (error) {
        logger.error(`导入钱包(${walletName})失败: ${error.message}`);
        console.error(`导入钱包: ${error.message}`);
    }
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

async function passInput() {
    const password = await inquirer.prompt([{
        type: 'password',
        message: '请输入生成账户的keystore加密密码: ',
        name: 'password',
        mask: '*',
    }]);
    return password.password
}

const walletName = args['walletName']
const filePath = args['path']

async function start()
{
    const password = await passInput()
    if (password && password.match(/\w{6,20}$/)) {
        const [mnemonic, error] = dec(password, filePath)
        console.log(mnemonic, error)
        if (error) {
            console.log("助记词keystore密码错误，请重新输入")
            start()
        } else {
            importWallet(walletName, mnemonic)
        }
    } else {
        console.log("Keystore密码格式错误，必须为6-20位字符。请重新输入")
        start()
    }
}

start()
