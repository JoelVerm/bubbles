import { page as noteWidget } from '../components/noteWidget.js'

/* global relatedNotes */
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
                    --col-1: #5a2;
                }
                main {
                    position: relative;
                    height: 100vh;
                    background-color: var(--bg-1);
                }

                .tag {
                    display: inline-block;
                    min-width: 100px;
                    margin-top: 15px;
                    margin-left: 15px;
                    padding: 0.5rem;
                    background-color: #444;
                    outline: none;
                    border: none;
                    border-radius: 5px;
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

                .related {
                    display: flex;
                    padding-top: 15px;
                    margin-right: 15px;
                    overflow-y: auto;
                }
                .related .column {
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                    height: fit-content;
                }
                .related .noteWidget {
                    margin-bottom: 15px;
                    margin-left: 15px;
                    padding: 0.5rem;
                    background-color: var(--bg-2);
                    border-radius: 5px;
                    cursor: pointer;
                }
                .related .noteWidget .tags {
                    margin-left: -15px;
                }
                .related .tag {
                    color: var(--col-1);
                }
            </style>
            <section class="related">
                <div class="column col-1">
                    ${relatedNotes
                        .slice(0, Math.ceil(relatedNotes.length / 3))
                        .map(e =>
                            noteWidget(
                                e,
                                () => {
                                    window.location = `/?id=${e.id}`
                                },
                                t => html`<span class="tag">${t}</span>`
                            )
                        )}
                </div>
                <div class="column col-2">
                    ${relatedNotes
                        .slice(
                            Math.ceil(relatedNotes.length / 3),
                            Math.ceil((relatedNotes.length / 3) * 2)
                        )
                        .map(e =>
                            noteWidget(
                                e,
                                () => {
                                    window.location = `/?id=${e.id}`
                                },
                                t => html`<span class="tag">${t}</span>`
                            )
                        )}
                </div>
                <div class="column col-3">
                    ${relatedNotes
                        .slice(Math.ceil((relatedNotes.length / 3) * 2))
                        .map(e =>
                            noteWidget(
                                e,
                                () => {
                                    window.location = `/?id=${e.id}`
                                },
                                t => html`<span class="tag">${t}</span>`
                            )
                        )}
                </div>
            </section>
        </main>
    `
)
