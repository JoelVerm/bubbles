import { query } from './api/data.js'
import { checkLoggedin } from './api/users.js'
import { ResponseData } from '../main.js'

/**
 * @param {import('../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function main(inp) {
    const loggedIn = await checkLoggedin(inp.postData, inp.ip, inp.cookies)
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
    let id = inp?.searchParams?.id
    if (!id) {
        return new ResponseData({
            content: {
                startNote: await query({
                    type: 'random',
                    username
                }),
                username
            },
            cookies
        })
    }
    let result = await query({
        type: 'get',
        id: id,
        username
    })
    if (result.ERROR)
        return new ResponseData({
            redirect: '/',
            cookies
        })
    return new ResponseData({
        content: {
            startNote: result,
            username
        },
        cookies
    })
}
