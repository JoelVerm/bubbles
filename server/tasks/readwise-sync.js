#!/usr/bin/env node

import { URLSearchParams } from 'url'
import { query, dbQuery } from '../api/data.js'

const fetchFromExportApi = async (token, updatedAfter = null) => {
    let fullData = []
    let nextPageCursor = null

    while (true) {
        const queryParams = new URLSearchParams()
        if (nextPageCursor) {
            queryParams.append('pageCursor', nextPageCursor)
        }
        if (updatedAfter) {
            queryParams.append('updatedAfter', updatedAfter)
        }
        const response = await fetch(
            'https://readwise.io/api/v2/export/?' + queryParams.toString(),
            {
                method: 'GET',
                headers: {
                    Authorization: `Token ${token}`
                }
            }
        )
        const responseJson = await response.json()
        fullData.push(...responseJson['results'])
        nextPageCursor = responseJson['nextPageCursor']
        if (!nextPageCursor) {
            break
        }
    }
    return fullData
}

async function getReadwiseNotes(user) {
    const token = user.settings?.readwiseToken

    if (token == null) return

    // Get all of a user's books/highlights from all time
    const allData = await fetchFromExportApi(token, user.readwise_last_updated)

    const notes = allData
        .map(item =>
            item.highlights.map(highlight => ({
                content: `# ${item.readable_title}

${highlight.text}

[link](${highlight.url})
`,
                tags: [
                    item.category,
                    item.source,
                    item.author,
                    ...item.book_tags,
                    ...highlight.tags
                ],
                time_created: highlight.created_at,
                time_updated: highlight.updated_at,
                public: false
            }))
        )
        .flat()

    await dbQuery(
        'UPDATE users SET readwise_last_updated = time::now() WHERE name = $username',
        { username: user.name }
    )
    await Promise.all(
        notes.map(note => query({ type: 'add', ...note, username: user.name }))
    )
}

async function syncAllUsers() {
    const users = await dbQuery('SELECT * FROM users')
    await Promise.all(users.map(user => getReadwiseNotes(user)))
}

const msInDay = 24 * 60 * 60 * 1000
syncAllUsers()
setInterval(syncAllUsers, msInDay)
