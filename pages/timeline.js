import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

/* global SERVER */

const now = Date.now()
let timeline = SERVER.timeline.map(e => ({
    ...e,
    time_passed: (now - new Date(e.time_created).valueOf()) / 1000
}))
const firstTime = timeline[0].time_passed
const lastTime = timeline.at(-1).time_passed
timeline = timeline.map(e => ({
    ...e,
    time_passed: e.time_passed - firstTime
}))

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                ${`
                    .timeline {
                        --timelineSecondScale: 1;
                        height: max(100vh, calc(${
                            lastTime - firstTime
                        }px * var(--timelineSecondScale) + 3em));
                    }
                `}
            </style>
            <style>
                main {
                    overflow-y: auto;
                }
                .timeline {
                    position: relative;
                    width: 100%;
                    margin: 7px;
                }
                .timeline .entry {
                    position: absolute;
                    top: calc(
                        var(--timelineHeight) * var(--timelineSecondScale) * 1px
                    );
                    left: 50%;
                    translate: calc(
                            -100% + 100% * var(--right) - 10px + 20px * var(--right)
                        )
                        0px;
                    background-color: var(--color-bg-2);
                    border-radius: 1000vmax;
                    padding: 5px;
                }
                .timeline .entry:focus-visible {
                    outline: 2px solid var(--color-contrast-dim) !important;
                }
            </style>
            ${cursor()}
            <div class="timeline">
                ${timeline.map(
                    (e, i) =>
                        html`
                            <a
                                href=${`/?id=${e.id}`}
                                class="entry"
                                style=${`--timelineHeight: ${
                                    e.time_passed
                                }; --right: ${i % 2};`}
                            >
                                ${e.firstWords}...
                            </a>
                        `
                )}
            </div>
        </main>
    `
)
