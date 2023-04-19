import { searchableTag, search } from './searchPane.js'
import { marked } from 'https://cdn.jsdelivr.net/gh/markedjs/marked/lib/marked.esm.js'
import markedKatex from 'https://cdn.jsdelivr.net/npm/marked-katex-extension@1.0.2/+esm'
marked.use(markedKatex({ throwOnError: false }))

marked.setOptions({
    breaks: true,
    smartypants: true
})

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
    document.querySelector('.editPane .editor .edit').value = data.content
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
                background-color: var(--bg-1);
                overflow: hidden;
            }

            .editPane .editor {
                height: calc(75% - 50px);
                background-color: var(--bg-1);
                overflow-y: auto;
            }
            .editPane .editorScroll {
                display: flex;
            }
            .editPane .editor .edit {
                white-space: pre-wrap;
                flex: 0 0 50%;
                background-color: var(--bg-1);
                padding: 10px;
                outline: none;
                border: none;
                resize: none;
            }
            .editPane .editor .markdown {
                flex: 0 0 50%;
                background-color: var(--bg-1);
                padding: 10px;
            }
            .editPane .editor .markdown img {
                width: 100%;
            }
            .editPane .editor .markdown .katex-html {
                display: none;
            }

            .editPane .tags {
                height: 25%;
                background-color: var(--bg-2);
                border-radius: 0px 15px 0px 0px;
            }
            .editPane .tag {
                position: relative;
                padding-right: 30px;
                color: var(--col-1);
            }
            .editPane .tags .deleteButton {
                position: absolute;
                top: 0px;
                right: 0px;
                padding: 7px;
            }
            .editPane .tags .tagBar {
                cursor: text;
            }
            .editPane .tags .tagBar:empty::before {
                content: 'Add a tag...';
                color: #888;
            }
        </style>
        <div class="topBar">
            <div
                class="button newButton"
                onclick=${async () => {
                    data = createNoteData()
                    document.querySelector('.editPane .editor .edit').value =
                        data.content
                    update()
                }}
            >
                <ion-icon name="document-outline"></ion-icon>
            </div>
            <div
                class="button saveButton"
                onclick=${async () => {
                    if (!data.content) {
                        if (!data.id) return
                        await request({
                            type: 'delete',
                            id: data.id
                        })
                        data = createNoteData()
                        document.querySelector(
                            '.editPane .editor .edit'
                        ).value = data.content
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
                class="button deleteButton"
                onclick=${async () => {
                    await request({
                        type: 'delete',
                        id: data.id
                    })
                    data = createNoteData()
                    document.querySelector('.editPane .editor .edit').value =
                        data.content
                    search()
                }}
            >
                <ion-icon name="trash-outline"></ion-icon>
            </div>
            <div class="spacer"></div>
            <div
                class="button relatedButton"
                onclick=${() => {
                    if (data.id) window.location = `related?id=${data.id}`
                }}
                ?disabled=${!data.id}
            >
                <ion-icon name="library-outline"></ion-icon>
            </div>
        </div>
        <div class="editor">
            <div class="editorScroll">
                <textarea
                    class="edit"
                    contenteditable
                    placeholder="Create a note..."
                    onkeyup=${e => {
                        data.content = e.target.value
                        update()
                    }}
                >
                ${data.content}
            </textarea>
                <div class="markdown">
                    ${html([marked.parse(data.content)])}
                </div>
            </div>
        </div>
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
                        class="button deleteButton"
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
