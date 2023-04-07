export const page = (note, onNoteClick, tagComponent) => html`<div
    class="noteWidget"
    onclick=${onNoteClick}
>
    <div class="content">
        ${note.content
            .split('\n')
            .slice(0, 5)
            .map((s, i, a) =>
                i < a.length - 1 ? html`${s} <br /> ` : html`${s}`
            )}${note.content.split('\n').length > 5 ? html`<br />...` : ''}
    </div>
    <div class="tags">${note.tags.map(t => tagComponent(t))}</div>
</div>`
