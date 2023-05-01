import { setSearchTags, searchableTag, search } from './searchPane.js'
import { marked } from 'https://cdn.jsdelivr.net/gh/markedjs/marked/lib/marked.esm.js'
import markedKatex from 'https://cdn.jsdelivr.net/npm/marked-katex-extension@1.0.2/+esm'
marked.use(markedKatex({ throwOnError: false }))

marked.setOptions({
    breaks: true,
    smartypants: true
})

const renderer = {
    heading(text, level) {
        if (level !== 1) return false
        if (text.startsWith('columns start'))
            return '<div class="columns"><div class="column">'
        if (text.startsWith('columns new')) return '</div><div class="column">'
        if (text.startsWith('columns end')) return '</div></div>'
        return false
    }
}

marked.use({ renderer })

console.log(marked)

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
                overflow-y: auto;
            }
            .editPane .editorScroll {
                display: flex;
            }
            .editPane .editor .edit {
                white-space: pre-wrap;
                flex: 0 0 50%;
                padding: 10px;
                outline: none;
                border: none;
                resize: none;
                background-color: rgba(0, 0, 0, 0);
            }
            .editPane .editor .markdown {
                flex: 0 0 50%;
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
                color: var(--color-accent);
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
                color: var(--color-accent);
            }
            .editPane .editor .markdown img {
                width: 100%;
                border-radius: 5px;
            }
            .editPane .editor .markdown .katex-html {
                display: none;
            }
            .editPane .editor .markdown table {
                border: 2px solid var(--color-bg-2);
                border-radius: 5px;
                padding: 7px;
                border-spacing: 0px;
            }
            .editPane .editor .markdown table tbody tr:nth-child(2n - 1) {
                background-color: var(--color-bg-2);
            }
            .editPane .editor .markdown table td {
                padding: 5px;
            }
            .editPane .editor .markdown .columns {
                display: flex;
            }
            .editPane .editor .markdown .columns > * {
                flex: 0;
            }
            .editPane .editor .markdown .columns > .column {
                flex: 1;
                padding: 7px;
            }
            .editPane .editor .markdown .columns > .column:not(:last-of-type) {
                border-right: 2px solid var(--color-bg-2);
            }

            .editPane .tags {
                height: 25%;
                background-color: var(--color-bg-2);
                border-radius: 0px 15px 0px 0px;
            }
            .editPane .tag {
                position: relative;
                padding-right: 30px;
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
                color: var(--color-contrast-dim);
            }
        </style>
        <div class="topBar">
            <button
                class="button newButton"
                onclick=${async () => {
                    data = createNoteData()
                    document.querySelector('.editPane .editor .edit').value =
                        data.content
                    update()
                }}
                tabindex="0"
            >
                <ion-icon name="document-outline"></ion-icon>
            </button>
            <button class="button saveButton" onclick=${save} tabindex="0">
                <ion-icon name="checkmark-done-outline"></ion-icon>
            </button>
            <button
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
                tabindex="0"
            >
                <ion-icon name="trash-outline"></ion-icon>
            </button>
            <div class="spacer"></div>
            <button
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
                tabindex="0"
            >
                <ion-icon name="pricetags-outline"></ion-icon>
            </button>
            <button
                class="button searchTagsButton"
                onclick=${() => {
                    setSearchTags([...data.tags])
                    search()
                }}
                tabindex="0"
            >
                <ion-icon name="search-outline"></ion-icon>
            </button>
        </div>
        <div class="editor">
            <div class="editorScroll">
                <textarea
                    class="edit"
                    contenteditable
                    placeholder="Create a note..."
                    onkeyup=${e => {
                        if (e.ctrlKey && e.key === 's') {
                            e.cancelBubble = true
                            e.preventDefault()
                            e.stopPropagation()
                            save()
                            return false
                        }
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
                class="tag tagBar button"
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
                    html`<button
                        class="button deleteButton"
                        onclick=${e => {
                            e.preventDefault()
                            e.stopPropagation()
                            data.tags.splice(i, 1)
                            save()
                        }}
                        tabindex="0"
                    >
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>`
                )
            )}
        </div>
    </section>
`
