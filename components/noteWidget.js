import { marked } from 'https://cdn.jsdelivr.net/gh/markedjs/marked/lib/marked.esm.js'
import markedKatex from 'https://cdn.jsdelivr.net/npm/marked-katex-extension@1.0.2/+esm'
marked.use(markedKatex({ throwOnError: false }))

marked.setOptions({
    breaks: true,
    smartypants: true
})

const maxAllowedLines = 5
const maxAllowedChars = 500

export const page = (note, onNoteClick, tagComponent) => {
    let content = note.content
    let hasDots = false
    if (content.length > maxAllowedChars) {
        hasDots = true
        content = content
            .slice(0, maxAllowedChars)
            .split(' ')
            .slice(0, -1)
            .join(' ')
    }
    let contentLines = content.split('\n')
    if (contentLines.length > maxAllowedLines) {
        hasDots = true
        content = contentLines.slice(0, maxAllowedLines).join('\n')
    }
    content = marked.parse(content)
    return html`<div class="noteWidget" onclick=${onNoteClick}>
        <style>
            .noteWidget .katex-html {
                display: none;
            }
            .noteWidget .content img {
                width: 100%;
            }
        </style>
        <div class="content">${html([content])}${hasDots ? '...' : ''}</div>
        <div class="tags">${note.tags.map(t => tagComponent(t))}</div>
    </div>`
}
