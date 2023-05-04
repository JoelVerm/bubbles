#!/usr/bin/env node

import { fileURLToPath } from 'url'
import process from 'process'
import { logout } from './users.js'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const stdin = process.openStdin()

    stdin.addListener('data', async function (inp) {
        inp = JSON.parse(inp)
        let result = await logout(inp.postData, inp.ip, inp.cookies)
        console.log(JSON.stringify(result))
    })
}
