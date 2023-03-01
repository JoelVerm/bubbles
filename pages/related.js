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
                    display: relative;
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
        </main>
    `
)
