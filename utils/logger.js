'use strict'

const log4js = require('log4js')
const config = require('config')

log4js.configure(config.log4js)

const logger = log4js.getLogger('[Default]')

logger.error = logger.error.bind(logger)
logger.info = logger.info.bind(logger)

module.exports = {
    logger
}
