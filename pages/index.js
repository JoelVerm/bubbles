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
            <style>
                main {
                    overflow-x: auto;
                }
                main {
                    scrollbar-color: var(--color-contrast) rgba(0, 0, 0, 0);
                }
                main::-webkit-scrollbar {
                    background: rgba(0, 0, 0, 0);
                }
                main::-webkit-scrollbar-thumb {
                    background: var(--color-contrast);
                }
                main::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0);
                }
                .appBox {
                    min-width: 900px;
                    display: flex;
                    height: 100vh;
                }
            </style>
            <div class="appBox">${cursor()} ${editPane()} ${searchPane()}</div>
        </main>
    `
)
