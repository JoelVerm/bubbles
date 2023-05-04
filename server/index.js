#!/usr/bin/env node

import { query } from './api/data.js'
import { checkLoggedin } from './api/users.js'
import process from 'process'

export async function getData(data) {
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
    let id = data?.searchParams?.id
    if (!id) {
        return {
            content: {
                startNote: await query({
                    type: 'random',
                    username
                })
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
            startNote: result
        },
        cookies
    }
}

const stdin = process.openStdin()

stdin.addListener('data', async function (inp) {
    console.log(JSON.stringify(await getData(JSON.parse(inp))))
})
