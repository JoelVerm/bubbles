import { page as editPane } from '../components/editPane.js'
import { page as searchPane } from '../components/searchPane.js'

flami(
    () => html`
        <main>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap');

                * {
                    box-sizing: border-box;
                    font-family: 'Josefin Sans', sans-serif;
                    font-size: 1rem;
                    color: #eed;
                }
                body {
                    margin: 0;
                    --bg-1: #222;
                    --bg-2: #333;
                    --bg-3: #444;
                    --col-1: #db5;
                }
                main {
                    display: flex;
                    height: 100vh;
                    background-color: var(--bg-1);
                }
                .editPane {
                    flex: 2;
                }
                .searchPane {
                    flex: 1;
                }
            </style>
            ${editPane()} ${searchPane()}
        </main>
    `
)
