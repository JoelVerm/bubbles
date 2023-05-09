import { ResponseData } from '../../main.js'
import { db } from './db.js'
import { checkLoggedin } from './users.js'

/**
 * @param {String} query
 * @param {Record<string, unknown>} variables
 */
export const dbQuery = async (query, variables = undefined) =>
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
 *      id?:String,
 *      username?:String,
 *      public?:Boolean
 * }} q
 */
export async function query(q) {
    console.error('query:', q)
    let note
    switch (q.type) {
        case 'add':
            note = await db
                .create('notes', {
                    content: q.content,
                    tags: q.tags,
                    time_created: q.time_created ?? new Date().toISOString(),
                    time_updated: q.time_updated ?? new Date().toISOString(),
                    writer: q.username,
                    public: q.public ?? false
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
            if (q.content != null) note.content = q.content
            if (q.tags != null) note.tags = q.tags
            if (q.public != null) note.public = q.public
            note.time_updated = new Date().toISOString()
            await db.update(`notes:${q.id}`, note).catch(console.error)
            break
        case 'get':
            note = (await db.select(`notes:${q.id}`).catch(console.error))?.[0]
            if (!note || !(note.writer === q.username || note.public))
                return {
                    ERROR: `Unable to retrieve note with id ${q.id}`
                }
            break
        case 'delete':
            note = (await db.select(`notes:${q.id}`).catch(console.error))?.[0]
            if (!note || !(note.writer === q.username || note.public))
                return {
                    ERROR: `Unable to delete note with id ${q.id}`
                }
            await db.delete(`notes:${q.id}`).catch(console.error)
            return { SUCCESS: `Deleted node with id ${q.id}` }
        case 'random':
            return (
                (
                    await dbQuery(
                        'SELECT * FROM notes WHERE writer = $name ORDER BY RAND() LIMIT 1',
                        { name: q.username }
                    )
                )?.[0] ?? { ERROR: 'Unable to retrieve random note' }
            )
        case 'query':
            return (
                (await dbQuery(
                    `SELECT * FROM (SELECT *, count([${q.tags
                        .map((t, i) => `tags ?~ $t${i}`)
                        .join(
                            ', '
                        )}]) AS matches FROM notes ORDER BY RAND()) WHERE matches >= $minTagCount AND content ~ $content AND writer = $name ${
                        q.public ? 'OR public = true' : ''
                    } ORDER BY matches DESC LIMIT 50`,
                    {
                        ...Object.fromEntries(
                            q.tags.map((t, i) => [`t${i}`, t])
                        ),
                        minTagCount: Math.round(q.tags.length / 2),
                        content: q.content,
                        name: q.username
                    }
                )) ?? { ERROR: 'Unable to find matching search results' }
            )
        case 'timeline':
            return (
                (await dbQuery(
                    'SELECT string::slice(content, 0, 50) as firstWords, time_created, id FROM notes WHERE writer = $name ORDER BY time_created DESC',
                    { name: q.username }
                )) ?? { ERROR: 'Unable to get the timeline' }
            )
    }
    if (note) {
        note.id = note.id.split(':')[1]
        return note
    }
}

/**
 * @param {import('../../main.js').RequestData} inp
 * @returns {ResponseData}
 */
export async function main(inp) {
    const loggedIn = await checkLoggedin(inp.postData, inp.ip, inp.cookies)
    if (!loggedIn) return {}
    const [cookieToken, username] = loggedIn
    const note = await query({ ...inp.postData, username })
    return new ResponseData({
        content: note,
        cookies: [
            {
                name: 'loginToken',
                value: cookieToken,
                path: '/'
            }
        ]
    })
}
