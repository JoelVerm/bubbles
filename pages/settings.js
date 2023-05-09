import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                .settings {
                    position: relative;
                    padding: 20px;
                    overflow-y: auto;
                }
                .settings > * {
                    display: block;
                    padding: 5px;
                    margin-right: 10px;
                    margin-bottom: 10px;
                }
                .settings input {
                    background-color: var(--color-bg-2);
                    border-radius: 1000vmax;
                    outline: none;
                    border: none;
                    padding: 5px;
                }
            </style>
            ${cursor()}
            <form class="settings" action="" method="POST">
                <span
                    ><label for="readwiseToken"
                        ><ion-icon name="reader-outline"></ion-icon> Readwise
                        token</label
                    >
                    <input
                        type="text"
                        name="readwiseToken"
                        class="readwiseInput button"
                        placeholder="Readwise token"
                /></span>
                <input type="submit" class="button tag" value="Save settings" />
            </form>
        </main>
    `
)
