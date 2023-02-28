import { query } from './api/data.js'

/**
 * @param {import('../main.js').RunningRequest} req
 */
export async function flami(req) {
    let id = req.params.id
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
    if (result.ERROR) req.redirect('/')
    return {
        startNote: result
    }
}
