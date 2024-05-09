'use strict'
const path = require('path')

module.exports = {
    log4js: {
        disableClustering: true,
        appenders: {
            console: { type: 'console' },
            dateFile: {
                type: 'dateFile',
                filename: path.resolve(__dirname, '../logs/btc-tools.log'),
                pattern: '-yyyy-MM-dd',
                compress: true
            },
        },
        categories: {
            default: {
                appenders: ['dateFile'],
                level: 'info'
            }
        }
    },
    network: 'regtest',
    nodeUrl: 'http://10.10.8.184:18443', // 节点RPC URL
    user: 'user', // 节点user
    password: 'password', // 节点password
    cookiePath: '/Users/steven/bin/.cookie.bak', // cookie文件目录
    ordServerUrl: 'http://127.0.0.1:80', // ord服务url
    feeRateUrl: 'https://mempool.space/api/v1/fees/recommended'
}
