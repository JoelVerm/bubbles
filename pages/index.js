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
                    --col-txt: #eed;
                    --col-1: #5a2;
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

                .topBar {
                    display: flex;
                    height: 50px;
                    background-color: var(--bg-2);
                }
                .topBar .spacer {
                    flex: 1000;
                }
                .topBar .button {
                    margin: 7px;
                    padding: 10px;
                    aspect-ratio: 1;
                }
                .button {
                    border-radius: 5px;
                    transition: filter 0.2s, background-color 0.2s;
                    background-color: inherit;
                }
                .button:not([disabled]) {
                    cursor: pointer;
                }
                .button:not([disabled]):hover {
                    filter: brightness(130%);
                }
                .button:active {
                    filter: brightness(70%);
                }
                .button[disabled] {
                    filter: brightness(50%);
                }

                .tag {
                    display: inline-block;
                    min-width: 100px;
                    margin-top: 7px;
                    margin-left: 7px;
                    padding: 0.5rem;
                    background-color: #444;
                    outline: none;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }

                * {
                    scrollbar-color: #444 #333;
                }
                *::-webkit-scrollbar {
                    background: #333;
                }
                *::-webkit-scrollbar-thumb {
                    border-radius: 15px;
                    background: #444;
                }
                *::-webkit-scrollbar-track {
                    border-radius: 15px;
                    background: #333;
                }
            </style>
            ${editPane()} ${searchPane()}
        </main>
    `
)
