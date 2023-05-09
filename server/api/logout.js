import { logout } from './users.js'

export async function main(inp) {
    return await logout(inp.postData, inp.ip)
}
