import { loadNote } from './editPane.js'

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
    notesList = r
    update()
}

search()

export const page = () => html`
    <section class="searchPane">
        <style>
            .searchPane {
                background-color: #222;
                display: flex;
                flex-direction: column;
            }
            .searchPane .searchBar {
                width: calc(100% - 30px);
                margin: 15px;
                margin-bottom: 0;
                padding: 0.5rem;
                background-color: #444;
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
                margin-top: 15px;
            }
            .searchPane .results .result {
                width: calc(100% - 30px);
                margin-bottom: 15px;
                margin-left: 15px;
                padding: 0.5rem;
                background-color: #333;
                border-radius: 5px;
            }
            .searchPane .results .result .tags {
                margin-left: -15px;
            }
            .searchPane .tags .tagBar {
                cursor: text;
            }
            .searchPane .tags .tagBar:empty::before {
                content: 'Search a tag...';
                color: #888;
            }
        </style>
        <input
            type="text"
            class="searchBar"
            placeholder="Search text..."
            onkeyup=${e => {
                searchTerm = e.target.value.trim()
                search()
            }}
        />
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
                        class="tag"
                        onclick=${() => {
                            searchTags.splice(i, 1)
                            search()
                        }}
                        >${t}<ion-icon name="close-outline"></ion-icon
                    ></span>`
            )}
        </div>
        <div class="results">
            ${notesList.map(
                e =>
                    html`<div class="result" onclick=${() => loadNote(e)}>
                        <div class="content">
                            ${e.content
                                .split('\n')
                                .slice(0, 5)
                                .map((s, i, a) =>
                                    i < a.length - 1
                                        ? html`${s} <br /> `
                                        : html`${s}`
                                )}${e.content.split('\n').length > 5
                                ? html`<br />...`
                                : ''}
                        </div>
                        <div class="tags">
                            ${e.tags.map(t => searchableTag(t))}
                        </div>
                    </div>`
            )}
        </div>
    </section>
`
