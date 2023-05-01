#!/usr/bin/env node

import { query } from './api/data.js'
import process from 'process'

export async function getData(data) {
    let result = await query({
        type: 'timeline'
    })
    if (result.ERROR)
        return {
            redirect: '/'
        }
    return {
        content: {
            timeline: result
        }
    }
}

const stdin = process.openStdin()

stdin.addListener('data', async function (inp) {
    console.log(JSON.stringify(await getData(JSON.parse(inp))))
})
