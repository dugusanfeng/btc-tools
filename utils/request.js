const fetch = require('node-fetch')
async function requestPost(url, data) {
    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return response.json()
}

async function requestGet(url, options) {
    const response = await fetch(url, options)
    return response.json()
}

module.exports = {
    requestPost,
    requestGet,
}

