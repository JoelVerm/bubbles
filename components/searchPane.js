import { loadNote } from './editPane.js'
import { page as noteWidget } from './noteWidget.js'

let searchTerm = ''
let searchTags = []

let notesList = []

export const searchableTag = (value, addHtml) =>
    html`<span
        class="tag"
        onclick=${e => {
            e.preventDefault()
            e.stopPropagation()
            searchTags.push(value)
            search()
        }}
        >${value}${addHtml}</span
    >`

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

export const search = async () => {
    let r = await request({
        type: 'query',
        tags: searchTags,
        content: searchTerm
    }).then(r => r.json())
    if (r.ERROR) return
    notesList = r
    update()
}

search()

export const page = () => html`
    <section class="searchPane">
        <style>
            .searchPane {
                background-color: var(--bg-1);
                display: flex;
                flex-direction: column;
            }
            .searchPane .searchBar {
                width: calc(100% - 14px);
                margin: 7px;
                padding: 0.5rem;
                background-color: var(--bg-3);
                outline: none;
                border: none;
                border-radius: 5px;
            }
            .searchPane > .tags .tag {
                position: relative;
                padding-right: 2rem;
            }
            .searchPane > .tags ion-icon {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
            }
            .searchPane .results {
                overflow-y: auto;
                flex: 1;
                margin-top: 7px;
            }
            .searchPane .results .noteWidget {
                width: calc(100% - 14px);
                margin-bottom: 7px;
                margin-left: 7px;
                padding: 0.5rem;
                background-color: var(--bg-2);
                border-radius: 5px;
            }
            .searchPane .results .noteWidget .tags {
                margin-left: -7px;
            }
            .searchPane .results .tag {
                color: var(--col-1);
            }
            .searchPane .tags .tagBar {
                cursor: text;
            }
            .searchPane .tags .tagBar:empty::before {
                content: 'Search a tag...';
                color: #888;
            }
        </style>
        <div class="topBar">
            <input
                type="text"
                class="searchBar"
                placeholder="Search text..."
                onkeyup=${e => {
                    searchTerm = e.target.value.trim()
                    search()
                }}
            />
        </div>
        <div class="tags">
            <span
                role="textbox"
                contenteditable
                class="tag tagBar"
                onfocusout=${e => {
                    if (!e.target.innerText) return
                    searchTags.push(e.target.innerText.trim())
                    e.target.innerText = ''
                    search()
                }}
                onkeyup=${e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!e.target.innerText) return
                        searchTags.push(e.target.innerText.trim())
                        e.target.innerText = ''
                        search()
                    }
                }}
            />
            ${searchTags.map(
                (t, i) =>
                    html`<span
                        class="tag button"
                        onclick=${() => {
                            searchTags.splice(i, 1)
                            search()
                        }}
                        >${t}<ion-icon name="close-outline"></ion-icon
                    ></span>`
            )}
        </div>
        <div class="results">
            ${notesList.map(e =>
                noteWidget(e, () => loadNote(e), searchableTag)
            )}
        </div>
    </section>
`
