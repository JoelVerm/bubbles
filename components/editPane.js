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

const createNoteData = () => ({
    type: 'add',
    id: null,
    content: '',
    tags: [],
    public: false,
    writer: SERVER.username
})
let data
/* global SERVER */
if (SERVER.startNote && !SERVER.startNote.ERROR)
    data = {
        type: 'update',
        id: SERVER.startNote.id,
        content: SERVER.startNote.content,
        tags: SERVER.startNote.tags,
        public: SERVER.startNote.public,
        writer: SERVER.startNote.writer
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
    console.log('load:', note)
    data = {
        type: 'update',
        id: note.id,
        content: note.content,
        tags: note.tags,
        public: note.public,
        writer: note.writer
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
        console.log('save:', data)
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

            .editPane .topBar .writerBox {
                margin: auto 0px;
            }
            .editPane .topBar .button:nth-of-type(5n + 1) {
                animation: var(--blob1);
            }
            .editPane .topBar .button:nth-of-type(5n + 2) {
                animation: var(--blob2);
            }
            .editPane .topBar .button:nth-of-type(5n + 3) {
                animation: var(--blob3);
            }
            .editPane .topBar .button:nth-of-type(5n + 4) {
                animation: var(--blob4);
            }
            .editPane .topBar .button:nth-of-type(5n + 5) {
                animation: var(--blob5);
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
                animation: var(--blob5);
            }
            .editPane .tags .tag.button:hover:has(.button:hover) {
                background-color: var(--color-bg-2);
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
                class="button logoutButton"
                onclick=${async () => {
                    const logoutResult = await fetch('api/logout', {
                        method: 'POST'
                    }).then(r => r.json())
                    if (logoutResult.loggedOut) location.href = '/login'
                }}
                tabindex="0"
                title="log out"
            >
                <ion-icon name="log-out-outline"></ion-icon>
            </button>
            <a
                class="button timelineButton"
                href="timeline"
                tabindex="0"
                title="view note timeline"
            >
                <ion-icon name="time-outline"></ion-icon>
            </a>
            <div class="spacer"></div>
            <div class="writerBox">
                ${data.writer === SERVER.username ? '' : `By: ${data.writer}`}
            </div>
            <div class="spacer"></div>
            <button
                class="button newButton"
                onclick=${async () => {
                    data = createNoteData()
                    document.querySelector('.editPane .editor .edit').value =
                        data.content
                    update()
                }}
                tabindex="0"
                title="new note"
            >
                <ion-icon name="document-outline"></ion-icon>
            </button>
            <button
                class="button saveButton"
                onclick=${save}
                tabindex="0"
                title="save note"
            >
                <ion-icon name="save-outline"></ion-icon>
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
                title="delete note"
            >
                <ion-icon name="trash-outline"></ion-icon>
            </button>
            <button
                class="button publishButton"
                onclick=${async () => {
                    data.public = !data.public
                    save()
                }}
                tabindex="0"
                title=${data.public ? 'make note private' : 'publish note'}
            >
                <ion-icon
                    name=${`lock-${data.public ? 'open' : 'closed'}-outline`}
                ></ion-icon>
            </button>
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
                title="auto tag note"
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
                title="search this note's tags"
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
