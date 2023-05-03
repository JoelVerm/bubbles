import { URLSearchParams } from 'url'
import { query } from '../api/data.js'

const token = 'iYSvMH46OXNbZV0RSINEGpUr2d9E7KXrss6Pvjcoi90Uxa06fM' // use your access token here

const fetchFromExportApi = async (updatedAfter = null) => {
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

console.log('querying...')

// Get all of a user's books/highlights from all time
const allData = await fetchFromExportApi()

console.log('converting...')

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
            time_updated: highlight.updated_at
        }))
    )
    .flat()

console.log('adding to database...')

await Promise.all(
    notes.map(async note => await query({ type: 'add', ...note }))
)

console.log('finished!')

// Later, if you want to get new highlights updated since your last fetch of allData, do this.
// const lastFetchWasAt = new Date(Date.now() - 24 * 60 * 60 * 1000) // use your own stored date
// const newData = await fetchFromExportApi(lastFetchWasAt.toISOString())
