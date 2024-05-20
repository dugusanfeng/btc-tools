const { execSync } = require('child_process');
const { network, nodeUrl, user, password, cookiePath, feeRateUrl } = require('config')
const { logger } = require('./utils/logger')
const { requestGet } = require('./utils/request')
const args = require('minimist')(process.argv.slice(2))


function mintRunes(walletName, runeName, feeRate, number, receiver) {
    try {
        let command = `ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --bitcoin-rpc-username ${user} --bitcoin-rpc-password ${password} --chain ${network} wallet --name ${walletName} mint --fee-rate ${feeRate} --rune ${runeName}`
        if (receiver) {
            command += ` --destination ${receiver}`
        }
        logger.info(`执行命令: ${command}`)
        for (var i = 0; i < number; i++) {
            const output = execSync(command);
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
            logger.info(`Mint runes(${runeName})成功: ${output.toString()}`)
            console.log("Mint runes成功: ", output.toString())
        }
        logger.info(`接收地址: ${receiver}`)
    } catch (error) {
        logger.error(`Mint Runes(${runeName})失败: ${error.message}`);
        console.error(`Mint Runes失败: ${error.message}`);
    }
}

let walletName = args['walletName']
let runeName = args['runeName']
let feeRate = args['feeRate']
let number = args['number']
let receiver = args['receiver']

async function start()
{
    if (!walletName) {
        walletName = 'ord'
    }
    if (!feeRate) {
        const result = await requestGet(feeRateUrl)
        feeRate = result?.fastestFee
    }
    if (!number) {
        number = 1
    }
    if (!runeName) {
        console.error("参数rune name为空，请检查参数--runeName")
        return
    }
    mintRunes(walletName, runeName, feeRate, number, receiver)
}

start()
