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
    console.log(r)
    update()
}

search()

export const page = () => html`
    <section class="searchPane">
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
                background-color: #444;
                outline: none;
                border: none;
                border-radius: 5px;
            }
            .searchPane {
                background-color: #222;
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
            }
            .searchPane > .tags ion-icon {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
            }
            .searchPane .results {
                overflow-y: auto;
            }
            .searchPane .results .result {
                width: calc(100% - 30px);
                margin: 15px;
                padding: 0.5rem;
                background-color: #333;
                border-radius: 5px;
            }
            .searchPane .results .result .tags {
                margin-left: -15px;
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
                searchTerm = e.target.value
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
                    searchTags.push(e.target.innerText)
                    e.target.innerText = ''
                    search()
                }}
                onkeyup=${e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!e.target.innerText) return
                        searchTags.push(e.target.innerText)
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
                                .split(' ')
                                .slice(0, 50)
                                .join(' ')}${e.content.split(' ').length > 50
                                ? '...'
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
