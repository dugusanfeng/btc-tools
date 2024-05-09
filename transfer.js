const { execSync } = require('child_process');
const { network, nodeUrl, cookiePath, feeRateUrl } = require('config')
const { logger } = require('./utils/logger')
const { requestGet } = require('./utils/request')
const args = require('minimist')(process.argv.slice(2))


function transfer(walletName, feeRate, receiver, name) {
    try {
        let command = `ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --chain ${network} wallet --name ${walletName} send --fee-rate ${feeRate} ${receiver} ${name}`
        logger.info(`执行命令: ${command}`)
        const output = execSync(command);
        // const result = JSON.parse(output.toString())
        logger.info(`转移资产${name}成功: ${output.toString()}`)
        console.log("转移资产成功: ", output.toString())
    } catch (error) {
        logger.error(`转移资产${name}失败: ${error.message}`);
        console.error(`转移资产${name}失败: ${error.message}`);
    }
}

let walletName = args['walletName']
let feeRate = args['feeRate']
let receiver = args['receiver']
let name = args['name']

async function start()
{
    if (!walletName) {
        walletName = 'ord'
    }
    if (!feeRate) {
        const result = await requestGet(feeRateUrl)
        feeRate = result?.halfHourFee
        console.log('feeRate: ', feeRate)
    }
    if (!name) {
        console.log("资产名称为空，请检查--name参数(需为inscription id或者rune_amount:rune_name)")
        return
    }
    if (!receiver) {
        console.log("资产转移接收方为空，请检查--receiver参数")
        return
    }
    transfer(walletName, feeRate, receiver, name)
}

start()
