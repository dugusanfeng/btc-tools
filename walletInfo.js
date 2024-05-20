const { execSync } = require('child_process');
const { network, nodeUrl, user, password, cookiePath } = require('config')
const { logger } = require('./utils/logger')
const args = require('minimist')(process.argv.slice(2))


function getWalletAsset(name) {
    try {
        const output = execSync(`ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --bitcoin-rpc-username ${user} --bitcoin-rpc-password ${password} --chain ${network} wallet --name ${name} balance`);
        const result = JSON.parse(output.toString())
        logger.info(`获取钱包${name}资产信息: ${output.toString()}`)
        console.log('钱包资产信息: ', result)
    } catch (error) {
        logger.error(`获取钱包信息失败: ${error.message}`);
        console.error(`获取钱包信息失败: ${error.message}`);
    }
}

function getWalletUnspent(name) {
    try {
        const output = execSync(`ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --bitcoin-rpc-username ${user} --bitcoin-rpc-password ${password} --chain ${network} wallet --name ${name} outputs`);
        const result = JSON.parse(output.toString())
        logger.info(`获取钱包(${name}) unspent信息: ${output.toString()}`)
        console.log('钱包unspent信息信息: ', result)
    } catch (error) {
        logger.error(`获取钱包unspent信息失败: ${error.message}`);
        console.error(`获取钱包unspent信息失败: ${error.message}`);
    }
}

let walletName = args['walletName']
let getUnspent = args['unspent']

async function start()
{
    if (!getUnspent) {
        getUnspent = false
    }
    if (!walletName) {
        walletName = 'ord'
    }
    if (getUnspent) {
        getWalletUnspent(walletName)
    } else {
        getWalletAsset(walletName)
    }
}

start()
