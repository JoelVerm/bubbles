#!/usr/bin/env node

import { fileURLToPath } from 'url'
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
 *      type: 'add' | 'update' | 'get' | 'delete'| 'random' | 'query' | 'timeline',
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
                    tags: q.tags,
                    time_created: q.time_created ?? new Date().toISOString(),
                    time_updated: q.time_updated ?? new Date().toISOString()
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
            note.time_updated = new Date().toISOString()
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
        case 'timeline':
            return (
                (await dbQuery(
                    'SELECT string::slice(content, 0, 50) as firstWords, time_created, id FROM notes ORDER BY time_created DESC'
                )) ?? { ERROR: 'Unable to get the timeline' }
            )
    }
    if (note) {
        note.id = note.id.split(':')[1]
        return note
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const stdin = process.openStdin()

    stdin.addListener('data', async function (inp) {
        let postData = JSON.parse(inp).postData
        let result = {
            content: await query(postData)
        }
        console.log(JSON.stringify(result))
    })
}
