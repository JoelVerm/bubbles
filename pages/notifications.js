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
                    position: relative;
                    height: 99vh;
                }
                .center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    translate: -50% -50%;
                }
            </style>
            ${cursor()}
            <div class="center">
                <p>
                    Nope!<br />
                    We don't do notifications here!<br />
                    Please enjoy a calming, satisfying video of bell polyrithms
                    instead!<br />
                    <a
                        href="https://www.youtube.com/watch?v=gvGfgCcfAEg&t=1089s"
                        >Click here</a
                    ><br />
                    <a href="/">Or go back to your notes</a>
                </p>
            </div>
        </main>
    `
)
