const maxAllowedLines = 5
export const page = (note, onNoteClick, tagComponent) => html`<div
    class="noteWidget"
    onclick=${onNoteClick}
>
    <div class="content">
        <img src
            onerror=${e => {
                const element = e.target.parentNode
                const resizeHandler = () => {
                    const width = element.offsetWidth
                    const fontSize = Number(
                        getComputedStyle(element).fontSize.slice(0, 2)
                    )
                    const charsPerLine = Math.floor((width / fontSize) * 2)
                    let lineCount = 0
                    let oldLineCount = 0
                    let allowedLines = []
                    for (let line of note.content.split('\n')) {
                        oldLineCount = lineCount
                        lineCount += Math.ceil(line.length / charsPerLine)
                        if (lineCount > maxAllowedLines)
                            line = line.slice(
                                0,
                                (maxAllowedLines - oldLineCount) * charsPerLine
                            )
                        allowedLines.push(line)
                        if (lineCount > maxAllowedLines) break
                        lineCount++
                    }
                    let text = allowedLines.join('\n')
                    if (lineCount > maxAllowedLines) text += '\n...'
                    element.innerText = text
                }
                addEventListener('resize', resizeHandler)
                resizeHandler()
            }}
        ></img>
        ${note.content
            .split('\n')
            .slice(0, 5)
            .map((s, i, a) =>
                i < a.length - 1 ? html`${s} <br /> ` : html`${s}`
            )}${note.content.split('\n').length > 5 ? html`<br />...` : ''}
    </div>
    <div class="tags">${note.tags.map(t => tagComponent(t))}</div>
</div>`
