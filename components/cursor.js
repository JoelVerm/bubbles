export const page = () => html`
    <style>
        ${`
        .cursor {
            background: var(--color-bg-2);
            height: 200px;
            width: 200px;
            position: fixed;
            left: ${mouseX}px;
            top: ${mouseY}px;
            translate: -50% -50%;
            transition: opacity 0.5s;
            opacity: ${mouseX == 0 && mouseY == 0 ? 0 : 1};
            animation: var(--blob1);
        }
    `}
    </style>
    <div class="cursor"></div>
`

let mouseX = 0
let mouseY = 0
document.body.addEventListener('mousemove', e => {
    mouseX = e.clientX
    mouseY = e.clientY
    update()
})
