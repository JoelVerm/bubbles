import { query } from './api/data.js'
import { checkLoggedin } from './api/users.js'

export async function main(data) {
    const loggedIn = await checkLoggedin(data.postData, data.ip, data.cookies)
    if (!loggedIn)
        return {
            redirect: '/login'
        }
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
        return {
            redirect: '/',
            cookies
        }
    return {
        content: {
            timeline: result
        },
        cookies
    }
}
