#!/usr/bin/env node

import { query } from './api/data.js'
import process from 'process'

export async function getData(data) {
    let id = data?.searchParams?.id
    if (!id) {
        return {
            content: {
                startNote: await query({
                    type: 'random'
                })
            }
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

const stdin = process.openStdin()

stdin.addListener('data', async function (inp) {
    console.log(JSON.stringify(await getData(JSON.parse(inp))))
})
