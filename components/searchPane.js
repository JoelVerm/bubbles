import { loadNote } from './editPane.js'
import { page as noteWidget } from './noteWidget.js'

let searchTerm = ''
let searchTags = []
let searchPublic = false

let notesList = []

export const setSearchTags = tags => {
    searchTags = tags
}

export const searchableTag = (value, addHtml, isSpecial) =>
    html`<button
        class=${`tag button ${isSpecial ? 'searchedFor' : ''}`}
        onclick=${e => {
            e.preventDefault()
            e.stopPropagation()
            searchTags.push(value)
            search()
        }}
        tabindex="-1"
    >
        ${value}${addHtml}
    </button>`

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
        content: searchTerm,
        public: searchPublic
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
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .searchPane .searchBar {
                width: 100%;
                margin: 7px;
                padding: 0.5rem;
                background-color: var(--color-bg-2);
                outline: none;
                border: none;
                border-radius: 1000vmax;
                color: var(--color-contrast-dim);
                z-index: 20;
            }
            .searchPane .button.publicButton {
                z-index: 5;
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
            .searchPane .results:focus-visible {
                outline: 2px solid var(--color-contrast-dim) !important;
            }
            .searchPane .results .noteWidget {
                width: calc(100% - 14px);
                background-color: rgba(0, 0, 0, 0);
                text-align: left;
                margin-bottom: 7px;
                margin-left: 7px;
                padding: 0.5rem;
                border-radius: 5px;
            }
            .searchPane .results .noteWidget:focus-visible {
                outline: 2px solid var(--color-contrast-dim) !important;
            }
            .searchPane .results .noteWidget .tags {
                margin-left: -7px;
            }
            .searchPane .results .tag.searchedFor {
                color: var(--color-accent);
            }
            .searchPane .tags .tagBar {
                cursor: text;
            }
            .searchPane .tags .tagBar:empty::before {
                content: 'Search a tag...';
                color: var(--color-contrast-dim);
            }
        </style>
        <div class="topBar">
            <input
                type="text"
                class="searchBar button"
                placeholder="Search text..."
                onkeyup=${e => {
                    searchTerm = e.target.value.trim()
                    search()
                }}
            />
            <button
                class="button publicButton"
                onclick=${async () => {
                    searchPublic = !searchPublic
                    search()
                }}
                tabindex="0"
                title=${searchPublic
                    ? 'search private notes'
                    : 'also search public notes'}
            >
                <ion-icon
                    name=${`person${searchPublic ? '' : '-outline'}`}
                ></ion-icon>
            </button>
        </div>
        <div class="tags">
            <span
                role="textbox"
                contenteditable
                class="tag tagBar button"
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
                    html`<button
                        class="tag button"
                        onclick=${() => {
                            searchTags.splice(i, 1)
                            search()
                        }}
                    >
                        ${t}<ion-icon name="close-outline"></ion-icon>
                    </button>`
            )}
        </div>
        <div class="results" tabindex="0">
            ${notesList.map(e =>
                noteWidget(e, () => loadNote(e), searchableTag, searchTags)
            )}
        </div>
    </section>
`
