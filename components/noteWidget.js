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
    return html`<div class="noteWidget" onclick=${onNoteClick}>
        <div class="content">${content}${hasDots ? html`<br />...` : ''}</div>
        <div class="tags">${note.tags.map(t => tagComponent(t))}</div>
    </div>`
}
