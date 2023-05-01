import { page as editPane } from '../components/editPane.js'
import { page as searchPane } from '../components/searchPane.js'
import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            ${cursor()} ${editPane()} ${searchPane()}
        </main>
    `
)
