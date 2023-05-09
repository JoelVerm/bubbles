import { login } from './users.js'

export async function main(inp) {
    return await login(inp.postData, inp.ip)
}
