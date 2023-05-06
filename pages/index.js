import { page as editPane } from '../components/editPane.js'
import { page as searchPane } from '../components/searchPane.js'
import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

let isInSearchPane = false
const goToSearchPane = () => {
    isInSearchPane = true
    update()
}
const goToEditPane = () => {
    isInSearchPane = false
    update()
}

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                main {
                    display: flex;
                    height: 100vh;
                }
                .editPane {
                    flex: 2;
                }
                .searchPane {
                    flex: 1;
                }
            </style>
            <style>
                ${`
                    @media (max-width: 800px) {
                        ${isInSearchPane ? '.editPane' : '.searchPane'} {
                            flex: 0;
                        }
                    }
                `}
            </style>
            ${cursor()} ${editPane(goToSearchPane)} ${searchPane(goToEditPane)}
        </main>
    `
)
