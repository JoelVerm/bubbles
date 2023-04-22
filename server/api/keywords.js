import { spawn } from 'child_process'

let runPython = (path, args = []) =>
    new Promise(function (resolve, reject) {
        const program = spawn('python', [path, ...args])
        program.stdout.on('data', data => resolve(data.toString()))
        program.stderr.on('data', data => reject(data.toString()))
    })

/**
 * @param {import('../../main.js').RunningRequest} req
 */
export async function flami(req) {
    let q = await req.getPostData()
    let keywords = await runPython('server/api/python/keywords.py', [q.text])
    return keywords
}
