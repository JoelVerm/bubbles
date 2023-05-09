import { query } from './api/data.js'
import { checkLoggedin } from './api/users.js'

export async function main(inp) {
    const loggedIn = await checkLoggedin(inp.postData, inp.ip, inp.cookies)
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
    let id = inp?.searchParams?.id
    if (!id) {
        return {
            content: {
                startNote: await query({
                    type: 'random',
                    username
                }),
                username
            },
            cookies
        }
    }
    let result = await query({
        type: 'get',
        id: id,
        username
    })
    if (result.ERROR)
        return {
            redirect: '/',
            cookies
        }
    return {
        content: {
            startNote: result,
            username
        },
        cookies
    }
}
