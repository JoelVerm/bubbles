import { db } from './api/db.js'
import { checkLoggedin } from './api/users.js'
import { ResponseData } from '../main.js'

/**
 * @param {String} query
 * @param {Record<string, unknown>} variables
 */
const dbQuery = async (query, variables = undefined) =>
    (await db.query(query, variables).catch(console.error))?.[0].result.map(
        e => {
            e.id = e.id.split(':')[1]
            return e
        }
    )

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
    if (inp.postData.readwiseToken != null) {
        await dbQuery(
            'UPDATE users SET settings.readwiseToken = $readwiseToken WHERE name = $username',
            {
                ...inp.postData,
                username
            }
        )
    }
    return new ResponseData({
        content: {},
        cookies
    })
}
