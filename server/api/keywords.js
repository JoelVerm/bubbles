import { ResponseData } from '../../main.js'
import { Buffer } from 'buffer'

export async function main(inp) {
    const url =
        'http://ai:8080/keywords?' +
        Buffer.from(inp.postData.text, 'utf-8').toString('base64')
    const result = await fetch(url).then(data => data.text())
    return new ResponseData({
        content: result
    })
}
