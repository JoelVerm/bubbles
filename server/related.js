import { query } from './api/data.js'

/**
 * @param {import('../main.js').RunningRequest} req
 */
export async function flami(req) {
    let id = req.params.id
    if (!id) req.redirect('/')
    let result = await query({
        type: 'related',
        id: id
    })
    console.log(result)
    if (result.ERROR) req.redirect('/')
    return {
        relatedNotes: result
    }
}
