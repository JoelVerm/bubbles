#!/usr/bin/env node

import { query } from './api/data.js'
import readline from 'readline'
import process from 'process'

export async function getData(data) {
    let id = data.searchParams.id
    if (!id) {
        return {
            startNote: await query({
                type: 'random'
            })
        }
    }
    let result = await query({
        type: 'get',
        id: id
    })
    if (result.ERROR)
        return {
            redirect: '/'
        }
    return {
        content: {
            startNote: result
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

rl.on('line', async line => {
    console.log(JSON.stringify(await getData(JSON.parse(line))))
})
