#!/usr/bin/env node

import readline from 'readline'
import process from 'process'
import { db } from './db.js'

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
 *
 * @param {{
 *      type: 'add' | 'update' | 'get' | 'delete'| 'random' | 'query' | 'related',
 *      content?:String,
 *      tags?:Array<string>,
 *      id?:String
 * }} q
 */
export async function query(q) {
    let note
    switch (q.type) {
        case 'add':
            note = await db
                .create('notes', {
                    content: q.content,
                    tags: q.tags
                })
                .catch(console.error)
            break
        case 'update':
            note = (await db.select(`notes:${q.id}`).catch(console.error))?.[0]
            if (!note)
                return await query({
                    ...q,
                    type: 'add'
                })
            if (q.content) note.content = q.content
            if (q.tags) note.tags = q.tags
            await db.update(`notes:${q.id}`, note).catch(console.error)
            break
        case 'get':
            note = (await db.select(`notes:${q.id}`).catch(console.error))?.[0]
            if (!note)
                return {
                    ERROR: `Unable to retrieve note with id ${q.id}`
                }
            break
        case 'delete':
            await db.delete(`notes:${q.id}`).catch(console.error)
            return { SUCCESS: `Deleted node with id ${q.id}` }
        case 'random':
            return (
                (
                    await dbQuery('SELECT * FROM notes ORDER BY RAND() LIMIT 1')
                )?.[0] ?? { ERROR: 'Unable to retrieve random note' }
            )
        case 'query':
            return (
                (await dbQuery(
                    `SELECT * FROM (SELECT *, count([${q.tags
                        .map((t, i) => `tags ?~ $t${i}`)
                        .join(
                            ', '
                        )}]) AS matches FROM notes ORDER BY RAND()) WHERE matches >= $minTagCount AND content ~ $content ORDER BY matches DESC LIMIT 50`,
                    {
                        ...Object.fromEntries(
                            q.tags.map((t, i) => [`t${i}`, t])
                        ),
                        minTagCount: Math.round(q.tags.length / 2),
                        content: q.content
                    }
                )) ?? { ERROR: 'Unable to find matching search results' }
            )
    }
    note.id = note.id.split(':')[1]
    if (note) return note
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

rl.on('line', async line => {
    let postData = JSON.parse(line).postData
    let result = {
        content: await query(postData)
    }
    console.log(JSON.stringify(result))
})
