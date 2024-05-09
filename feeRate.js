const { feeRateUrl } = require('config')
const { requestGet } = require('./utils/request')

async function getFeeRate() {
    const result = await requestGet(feeRateUrl)
    console.log(result)
}

getFeeRate()
