const { execSync } = require('child_process');
const { network, nodeUrl, cookiePath, feeRateUrl } = require('config')
const { logger } = require('./utils/logger')
const { requestGet } = require('./utils/request')
const args = require('minimist')(process.argv.slice(2))


function inscription(walletName, filePath, feeRate, receiver) {
    try {
        let command = `ord --cookie-file ${cookiePath} --bitcoin-rpc-url ${nodeUrl} --chain ${network} wallet --name ${walletName} inscribe --fee-rate ${feeRate} --file ${filePath}`
        if (receiver) {
            command += ` --destination ${receiver}`
        }
        logger.info(`执行命令: ${command}`)
        const output = execSync(command);
        // const result = JSON.parse(output.toString())
        /*
        {
          "commit": "6072135dac582aaba728fa9cc474d4c26e36d8bbcba2df4efbb8b3dd78810642",
          "commit_psbt": null,
          "inscriptions": [
            {
              "destination": "bcrt1p9e7q3vhqyc7ee3p94f4s07ustct47ymfvv5r56hxdcmdly8gtvwqn8xkrd",
              "id": "40fc5adc33b416a415907f142f6091881bc0989ed11087b7f53d8a86e11b8182i0",
              "location": "40fc5adc33b416a415907f142f6091881bc0989ed11087b7f53d8a86e11b8182:0:0"
            }
          ],
          "parent": null,
          "reveal": "40fc5adc33b416a415907f142f6091881bc0989ed11087b7f53d8a86e11b8182",
          "reveal_broadcast": true,
          "reveal_psbt": null,
          "rune": null,
          "total_fees": 1098
        }
         */
        logger.info(`铭刻(${filePath})成功: ${output.toString()}`)
        logger.info(`接收地址: ${receiver}`)
        console.log("铭刻成功: ", output.toString())
    } catch (error) {
        logger.error(`铭刻(${filePath})失败: ${error.message}`);
        console.error(`铭刻失败: ${error.message}`);
    }
}

let walletName = args['walletName']
let filePath = args['filePath']
let feeRate = args['feeRate']
let receiver = args['receiver']

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
    if (!filePath) {
        console.error("文件路径为空，请检查参数--filePath")
        return
    }
    inscription(walletName, filePath, feeRate, receiver)
}

start()
