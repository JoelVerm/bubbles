import Surreal from 'surrealdb.js'
import process from 'process'

export const db = new Surreal('http://127.0.0.1:8000/rpc')

try {
    await db.signin({
        user: 'root',
        pass: 'root'
    })

    await db.use('bubbles', 'bubbles')
} catch (e) {
    console.error('ERROR', e)
    process.exit(1)
}
