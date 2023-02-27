import { searchableTag, search } from './searchPane.js'

const createNoteData = () => ({
    type: 'add',
    id: null,
    content: '',
    tags: []
})
let data = createNoteData()
export const loadNote = note => {
    data = {
        type: 'update',
        id: note.id,
        content: note.content,
        tags: note.tags
    }
    update()
}

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

export const page = () => html`
    <section class="editPane">
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
            .tag {
                display: inline-block;
                min-width: 100px;
                margin-top: 15px;
                margin-left: 15px;
                padding: 0.5rem;
                background-color: var(--bg-3);
                outline: none;
                border: none;
                border-radius: 5px;
            }
            .editPane {
                position: relative;
                display: flex;
                flex-direction: column;
                background-color: var(--bg-2);
                border-radius: 0px 15px 15px 0px;
                overflow: hidden;
            }
            .editPane .buttons {
                display: flex;
                position: absolute;
                top: 15px;
                right: 15px;
                background-color: var(--col-1);
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
                background-color: var(--bg-3);
                padding: 10px;
                outline: none;
                border: none;
                resize: none;
                border-radius: 0px 0px 15px 0px;
            }
            .editPane .tags {
                flex: 1;
                background-color: var(--bg-2);
            }
            .editPane .tag {
                position: relative;
            }
            .editPane .tags .deleteButton {
                position: absolute;
                top: 0px;
                right: 0px;
                margin: 0.5rem;
            }
            .editPane .tags .tagBar:empty::before {
                content: 'Add a tag...';
                color: #888;
            }
        </style>
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
                    search()
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
                onfocusout=${e => {
                    if (!e.target.innerText) return
                    data.tags.push(e.target.innerText.trim())
                    e.target.innerText = ''
                    update()
                }}
                onkeyup=${e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!e.target.innerText) return
                        data.tags.push(e.target.innerText.trim())
                        e.target.innerText = ''
                        update()
                    }
                }}
            />
            ${data.tags.map((t, i) =>
                searchableTag(
                    t,
                    html`<div
                        class="deleteButton"
                        onclick=${e => {
                            e.preventDefault()
                            e.stopPropagation()
                            data.tags.splice(i, 1)
                            update()
                        }}
                    >
                        <ion-icon name="trash-outline"></ion-icon>
                    </div>`
                )
            )}
        </div>
    </section>
`
