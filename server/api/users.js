#!/usr/bin/env node

import { fileURLToPath } from 'url'
import process from 'process'
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

async function hash(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(32).toString('hex')

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            resolve(salt + ':' + derivedKey.toString('hex'))
        })
    })
}
async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(':')
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            const keyBuffer = Buffer.from(key, 'hex')
            resolve(crypto.timingSafeEqual(keyBuffer, derivedKey))
        })
    })
}

async function createAccount(data) {
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
async function login(data, ip) {
    const user = (
        await dbQuery('SELECT * FROM users WHERE name = $name', {
            name: data.name
        })
    )[0]
    const passwordValid = await verify(data.password, user.password)
    if (!passwordValid)
        return {
            content: {
                loggedIn: false
            }
        }
    const token = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'CREATE sessions SET user = $name, ip = $ip, token = $token',
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
                value: token
            }
        ]
    }
}
async function checkLoggedin(data, ip, cookies) {
    let sessions = await dbQuery(
        'SELECT * FROM sessions WHERE ip = $ip, token = $token',
        {
            ip,
            token: cookies.loginToken
        }
    )
    if (!sessions)
        return {
            content: {
                loggedIn: false
            }
        }
    const token = crypto.randomBytes(64).toString('hex')
    await dbQuery(
        'UPDATE sessions SET token = $newToken WHERE ip = $ip, token = $token',
        {
            ip,
            token: cookies.loginToken,
            newToken: token
        }
    )
    return {
        content: {
            loggedIn: true
        },
        cookies: [
            {
                name: 'loginToken',
                value: token
            }
        ]
    }
}
async function logout(data, ip, cookies) {
    let sessions = await dbQuery(
        'SELECT * FROM sessions WHERE ip = $ip, token = $token',
        {
            ip,
            token: cookies.loginToken
        }
    )
    if (!sessions)
        return {
            content: {
                loggedOut: false
            }
        }
    await dbQuery('DELETE sessions WHERE ip = $ip, token = $token', {
        ip,
        token: cookies.loginToken
    })
    return {
        content: {
            loggedOut: true
        }
    }
}

const functions = {
    create: createAccount,
    login,
    check: checkLoggedin,
    logout
}
async function main(data, ip) {
    const func = functions[data.type]
    return await func(data, ip)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const stdin = process.openStdin()

    stdin.addListener('data', async function (inp) {
        inp = JSON.parse(inp)
        let result = {
            content: JSON.stringify(
                await main(inp.postData, inp.ip, inp.cookies)
            )
        }
        console.log(JSON.stringify(result))
    })
}
