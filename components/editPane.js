import { setSearchTags, searchableTag, search } from './searchPane.js'
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
/* global SERVER */
if (SERVER.startNote && !SERVER.startNote.ERROR)
    data = {
        type: 'update',
        id: SERVER.startNote.id,
        content: SERVER.startNote.content,
        tags: SERVER.startNote.tags
    }
else data = createNoteData()
function insertUrlParam(key, value) {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search)
        searchParams.set(key, value)
        let newUrl =
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname +
            '?' +
            searchParams.toString()
        window.history.pushState({ path: newUrl }, '', newUrl)
    }
}
export const loadNote = note => {
    data = {
        type: 'update',
        id: note.id,
        content: note.content,
        tags: note.tags
    }
    insertUrlParam('id', note.id)
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

const save = async () => {
    if (!data.content) {
        if (!data.id) return
        await request({
            type: 'delete',
            id: data.id
        })
        data = createNoteData()
        document.querySelector('.editPane .editor .edit').value = data.content
    } else {
        let r = await request(data).then(r => r.json())
        data.id = r.id
        data.type = 'update'
    }
    search()
}

let autoTagIsLoading = false

export const page = () => html`
    <section class="editPane">
        <style>
            .editPane {
                position: relative;
                background-color: var(--bg-1);
                overflow: hidden;
            }

            @keyframes bobbingButton {
                from,
                80%,
                to {
                    translate: 0px 0px;
                }
                40% {
                    translate: 0px -30%;
                }
            }
            .editPane .topBar .autoTagButton.loading ion-icon {
                animation: bobbingButton 1s ease infinite;
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
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                margin-top: 0.5em;
                margin-bottom: 0.5em;
            }
            .editPane .editor .markdown h1 {
                font-size: 1.4rem;
                color: var(--col-1);
            }
            .editPane .editor .markdown h2 {
                font-size: 1.3rem;
            }
            .editPane .editor .markdown h3 {
                font-size: 1.2rem;
            }
            .editPane .editor .markdown h4 {
                font-size: 1.1rem;
            }
            .editPane .editor .markdown > :first-child:not(:has(br)) {
                color: var(--col-1);
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
                color: var(--col-txt);
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
            <div class="button saveButton" onclick=${save}>
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
                class=${`button autoTagButton ${
                    autoTagIsLoading ? 'loading' : ''
                }`}
                onclick=${async () => {
                    if (autoTagIsLoading) return
                    autoTagIsLoading = true
                    update()
                    let tagString = await fetch('api/keywords', {
                        method: 'POST',
                        mode: 'cors',
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        redirect: 'follow',
                        body: JSON.stringify({
                            text: data.content
                        })
                    }).then(r => r.text())
                    data.tags = data.tags.concat(tagString.split(','))
                    autoTagIsLoading = false
                    save()
                }}
            >
                <ion-icon name="pricetags-outline"></ion-icon>
            </div>
            <div
                class="button searchTagsButton"
                onclick=${() => {
                    setSearchTags([...data.tags])
                    search()
                }}
            >
                <ion-icon name="search-outline"></ion-icon>
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
                    onfocusout=${save}
                >
                    ${data.content}
                </textarea
                >
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
                    save()
                }}
                onkeyup=${e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!e.target.innerText) return
                        data.tags.push(e.target.innerText.trim())
                        e.target.innerText = ''
                        save()
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
                            save()
                        }}
                    >
                        <ion-icon name="trash-outline"></ion-icon>
                    </div>`
                )
            )}
        </div>
    </section>
`
