import { db } from './db.js'

/**
 * @param {import('../../main.js').RunningRequest} req
 */
export async function flami(req) {
    let q = await req.getPostData()
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
            note = (await db.select(`notes:${q.id}`).catch(console.error))[0]
            await db
                .update(`notes:${q.id}`, {
                    ...note,
                    content: q.content,
                    tags: q.tags
                })
                .catch(console.error)
            break
        case 'get':
            note = (await db.select(`notes:${q.id}`).catch(console.error))[0]
            break
        case 'delete':
            await db.delete(`notes:${q.id}`).catch(console.error)
            return []
        case 'query':
            return (
                await db
                    .query(
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
                    )
                    .catch(console.error)
            )[0].result.map(e => {
                e.id = e.id.split(':')[1]
                return e
            })
    }
    note.id = note.id.split(':')[1]
    if (note) return note
}
