const createNoteData = () => ({
    type: 'add',
    id: null,
    content: '',
    tags: []
})
let data = createNoteData()
let notesList = []

const request = data =>
    fetch('api/data', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(data)
    })

const searchCallback = async value => {
    if (document.querySelector('.searchBar'))
        document.querySelector('.searchBar').value = value
    let r = await request({
        type: 'query',
        tags: value.split(' ')
    }).then(r => r.json())
    notesList = r
    update()
}
searchCallback('')

const tagHtml = value =>
    html`<span class="tag" onclick=${() => searchCallback(value)}
        >${value}</span
    >`

flami(
    () => html`
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
            }
            main {
                display: flex;
                height: 100vh;
            }
            .editPane {
                position: relative;
                flex: 2;
                display: flex;
                flex-direction: column;
            }
            .editPane .buttons {
                display: flex;
                position: absolute;
                top: 15px;
                right: 15px;
                background-color: #db5;
                border-radius: 5px;
            }
            .editPane .buttons div {
                aspect-ratio: 1;
                padding: 0.5rem;
            }
            .editPane .buttons div ion-icon {
                color: #222;
            }
            .editPane .editor {
                flex: 3;
                background-color: #444;
                padding: 10px;
                outline: none;
                border: none;
                resize: none;
            }
            .editPane .tags {
                flex: 1;
                background-color: #333;
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
            .editPane .tags .tagBar:empty::before {
                content: 'Add a tag...';
                color: #888;
            }
            .searchPane {
                flex: 1;
                background-color: #222;
            }
            .searchPane .searchBar {
                width: calc(100% - 30px);
                margin: 15px;
                padding: 0.5rem;
                background-color: #444;
                outline: none;
                border: none;
                border-radius: 5px;
            }
            .results {
                overflow-y: auto;
            }
            .results .result {
                width: calc(100% - 30px);
                margin: 15px;
                padding: 0.5rem;
                background-color: #333;
                border-radius: 5px;
            }
            .results .result .tags {
                margin-left: -15px;
            }
        </style>
        <main>
            <section class="editPane">
                <div class="buttons">
                    <div
                        class="newButton"
                        onclick=${async () => {
                            data = createNoteData()
                            update()
                        }}
                    >
                        <ion-icon name="document-outline"></ion-icon>
                    </div>
                    <div
                        class="saveButton"
                        onclick=${async () => {
                            let r = await request(data).then(r => r.json())
                            data.id = r.id
                            data.type = 'update'
                            update()
                        }}
                    >
                        <ion-icon name="checkmark-done-outline"></ion-icon>
                    </div>
                </div>
                ${html.node`<textarea
                    class="editor"
                    placeholder="Create a note..."
                    onkeyup=${e => (data.content = e.target.value)}
                >
${data.content}</textarea
                >`}
                <div class="tags">
                    <span
                        role="textbox"
                        contenteditable
                        class="tag tagBar"
                        placeholder="Add a tag..."
                        onfocusout=${e => {
                            if (!e.target.innerText) return
                            data.tags.push(e.target.innerText)
                            e.target.innerText = ''
                            update()
                        }}
                        onkeyup=${e => {
                            if (e.key === 'Enter') {
                                if (!e.target.innerText) return
                                data.tags.push(e.target.innerText)
                                e.target.innerText = ''
                                update()
                            }
                        }}
                    />
                    ${data.tags.map(tagHtml)}
                </div>
            </section>
            <section class="searchPane">
                <input
                    type="text"
                    class="searchBar"
                    placeholder="Search a tag..."
                    onkeyup=${e => searchCallback(e.target.value)}
                />
                <div class="results">
                    ${notesList.map(
                        e =>
                            html`<div class="result">
                                <div class="content">
                                    ${e.content
                                        .split(' ')
                                        .slice(0, 50)
                                        .join(' ')}${e.content.split(' ')
                                        .length > 50
                                        ? '...'
                                        : ''}
                                </div>
                                <div class="tags">${e.tags.map(tagHtml)}</div>
                            </div>`
                    )}
                </div>
            </section>
        </main>
    `
)
