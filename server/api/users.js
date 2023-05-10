import { db } from './db.js'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import { ResponseData } from '../../main.js'

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

export async function hash(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(32).toString('hex')

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            resolve(salt + ':' + derivedKey.toString('hex'))
        })
    })
}
export async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(':')
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            const keyBuffer = Buffer.from(key, 'hex')
            resolve(crypto.timingSafeEqual(keyBuffer, derivedKey))
        })
    })
}

/**
 * @param {import('../../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function createAccount(data) {
    const user = (
        await dbQuery('SELECT * FROM users WHERE name = $name', {
            name: data.name
        })
    )[0]
    if (user)
        return new ResponseData({
            content: {
                created: false
            }
        })
    const passwordHash = await hash(data.password)
    await db.create('users', {
        name: data.name,
        password: passwordHash
    })
    return new ResponseData({
        content: {
            created: true
        }
    })
}
/**
 * @param {import('../../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function login(data, ip) {
    const user = (
        await dbQuery('SELECT * FROM users WHERE name = $name', {
            name: data.name
        })
    )[0]
    if (!user)
        return new ResponseData({
            content: {
                loggedIn: false
            }
        })
    const passwordValid = await verify(data.password, user.password)
    if (!passwordValid)
        return new ResponseData({
            content: {
                loggedIn: false
            }
        })
    const loginToken = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'CREATE sessions SET user = $name, ip = $ip, token = $loginToken, time = time::now()',
        {
            name: data.name,
            ip,
            loginToken
        }
    )
    return new ResponseData({
        content: {
            loggedIn: true
        },
        cookies: [
            {
                name: 'loginToken',
                value: loginToken,
                path: '/'
            }
        ]
    })
}
export async function checkLoggedin(data, ip, cookies) {
    if (!cookies.loginToken) return false
    let session = (
        await dbQuery(
            'SELECT * FROM sessions WHERE ip = $ip AND token = $loginToken',
            {
                ip,
                loginToken: cookies.loginToken
            }
        )
    )[0]
    if (!session) return false
    const token = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'UPDATE sessions SET token = $newToken, time = time::now() WHERE ip = $ip AND token = $loginToken',
        {
            ip,
            loginToken: cookies.loginToken,
            newToken: token
        }
    )
    return [token, session.user]
}
/**
 * @param {import('../../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function logout(data, ip, cookies) {
    if (!cookies.loginToken)
        return new ResponseData({
            content: {
                loggedOut: false
            }
        })
    let session = (
        await dbQuery(
            'SELECT * FROM sessions WHERE ip = $ip AND token = $loginToken',
            {
                ip,
                loginToken: cookies.loginToken
            }
        )
    )[0]
    if (!session)
        return new ResponseData({
            content: {
                loggedOut: false
            }
        })
    await dbQuery('DELETE sessions WHERE ip = $ip AND token = $loginToken', {
        ip,
        loginToken: cookies.loginToken
    })
    return new ResponseData({
        content: {
            loggedOut: true
        }
    })
}
