import { db } from './db.js'
import crypto from 'crypto'
import { Buffer } from 'buffer'

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

export async function createAccount(data) {
    const user = (
        await dbQuery('SELECT * FROM users WHERE name = $name', {
            name: data.name
        })
    )[0]
    if (user)
        return {
            content: {
                created: false
            }
        }
    const passwordHash = await hash(data.password)
    await db.create('users', {
        name: data.name,
        password: passwordHash
    })
    return {
        content: {
            created: true
        }
    }
}
export async function login(data, ip) {
    const user = (
        await dbQuery('SELECT * FROM users WHERE name = $name', {
            name: data.name
        })
    )[0]
    if (!user)
        return {
            content: {
                loggedIn: false
            }
        }
    const passwordValid = await verify(data.password, user.password)
    if (!passwordValid)
        return {
            content: {
                loggedIn: false
            }
        }
    const token = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'CREATE sessions SET user = $name, ip = $ip, token = $token, time = time::now()',
        {
            name: data.name,
            ip,
            token
        }
    )
    return {
        content: {
            loggedIn: true
        },
        cookies: [
            {
                name: 'loginToken',
                value: token,
                path: '/'
            }
        ]
    }
}
export async function checkLoggedin(data, ip, cookies) {
    if (!cookies.loginToken) return false
    let session = (
        await dbQuery(
            'SELECT * FROM sessions WHERE ip = $ip AND token = $token',
            {
                ip,
                token: cookies.loginToken
            }
        )
    )[0]
    if (!session) return false
    const token = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'UPDATE sessions SET token = $newToken, time = time::now() WHERE ip = $ip AND token = $token',
        {
            ip,
            token: cookies.loginToken,
            newToken: token
        }
    )
    return token
}
export async function logout(data, ip, cookies) {
    if (!cookies.loginToken)
        return {
            content: {
                loggedOut: false
            }
        }
    let session = (
        await dbQuery(
            'SELECT * FROM sessions WHERE ip = $ip AND token = $token',
            {
                ip,
                token: cookies.loginToken
            }
        )
    )[0]
    if (!session)
        return {
            content: {
                loggedOut: false
            }
        }
    await dbQuery('DELETE sessions WHERE ip = $ip AND token = $token', {
        ip,
        token: cookies.loginToken
    })
    return {
        content: {
            loggedOut: true
        }
    }
}
