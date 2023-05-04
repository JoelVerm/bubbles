#!/usr/bin/env node

import { fileURLToPath } from 'url'
import process from 'process'
import { login } from './users.js'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const stdin = process.openStdin()

    stdin.addListener('data', async function (inp) {
        inp = JSON.parse(inp)
        let result = await login(inp.postData, inp.ip)
        console.log(JSON.stringify(result))
    })
}
