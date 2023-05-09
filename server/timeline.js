import { query } from './api/data.js'
import { checkLoggedin } from './api/users.js'
import { ResponseData } from '../main.js'

/**
 * @param {import('../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function main(data) {
    const loggedIn = await checkLoggedin(data.postData, data.ip, data.cookies)
    if (!loggedIn)
        return new ResponseData({
            redirect: '/login'
        })
    const [cookieToken, username] = loggedIn
    const cookies = [
        {
            name: 'loginToken',
            value: cookieToken,
            path: '/'
        }
    ]
    let result = await query({
        type: 'timeline',
        username
    })
    if (result.ERROR)
        return new ResponseData({
            redirect: '/',
            cookies
        })
    return new ResponseData({
        content: {
            timeline: result
        },
        cookies
    })
}
