import { searchableTag, search } from './searchPane.js'

const createNoteData = () => ({
    type: 'add',
    id: null,
    content: '',
    tags: []
})
let data
/* global startNote */
if (startNote && !startNote.ERROR)
    data = {
        type: 'update',
        id: startNote.id,
        content: startNote.content,
        tags: startNote.tags
    }
else data = createNoteData()
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
                cursor: pointer;
                background-color: var(--col-1);
                border-radius: 5px;
                transition: filter 0.2s;
            }
            .editPane .buttons div:hover {
                filter: brightness(80%);
            }
            .editPane .buttons div:active {
                filter: brightness(70%);
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
                padding-right: 2rem;
            }
            .editPane .tags .deleteButton {
                position: absolute;
                top: 0px;
                right: 0px;
                margin: 0.5rem;
            }
            .editPane .tags .tagBar {
                cursor: text;
            }
            .editPane .tags .tagBar:empty::before {
                content: 'Add a tag...';
                color: #888;
            }
            .editPane .relatedButton {
                position: absolute;
                bottom: 15px;
                left: 15px;
                background-color: var(--col-1);
                border-radius: 5px;
                aspect-ratio: 1;
                padding: 0.5rem;
                cursor: pointer;
                transition: filter 0.2s;
            }
            .editPane .relatedButton:hover {
                filter: brightness(80%);
            }
            .editPane .relatedButton:active {
                filter: brightness(70%);
            }
            .editPane .relatedButton ion-icon {
                color: #222;
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
                    if (!data.content) {
                        if (!data.id) return
                        await request({
                            type: 'delete',
                            id: data.id
                        })
                        data = createNoteData()
                    } else {
                        let r = await request(data).then(r => r.json())
                        data.id = r.id
                        data.type = 'update'
                    }
                    search()
                }}
            >
                <ion-icon name="checkmark-done-outline"></ion-icon>
            </div>
            <div
                class="deleteButton"
                onclick=${async () => {
                    await request({
                        type: 'delete',
                        id: data.id
                    })
                    data = createNoteData()
                    search()
                }}
            >
                <ion-icon name="trash-outline"></ion-icon>
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
            <div
                class="relatedButton"
                onclick=${() => {
                    if (data.id) window.location = `related?id=${data.id}`
                }}
            >
                <ion-icon name="library-outline"></ion-icon>
            </div>
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
