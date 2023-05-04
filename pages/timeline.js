import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

/* global SERVER */

let timeline = SERVER.timeline.map(e => ({
    ...e,
    date: new Date(e.time_created).toDateString(),
    hour: new Date(e.time_created).getHours()
}))
let days = timeline.reduce(function (r, e) {
    const day = e.date
    const hour = e.hour
    r[day] ??= {}
    r[day][hour] ??= []
    r[day][hour].push(e)
    return r
}, {})

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                .timeline {
                    position: relative;
                    margin: 20px;
                    border-left: 5px solid var(--color-bg-2);
                    overflow-y: auto;
                    padding-right: 20px;
                }
                .timeline .day {
                    padding-left: 20px;
                }
                .timeline .hour {
                    padding-left: 20px;
                    border-left: 5px solid var(--color-bg-2);
                }
                .timeline .hour h2 {
                    display: inline-block;
                }
                .timeline .entry {
                    display: inline-block;
                    background-color: var(--color-bg-2);
                    border-radius: 1000vmax;
                    padding: 5px;
                    margin-right: 10px;
                    margin-bottom: 10px;
                }
                .timeline .entry:focus-visible {
                    outline: 2px solid var(--color-contrast-dim) !important;
                }
            </style>
            ${cursor()}
            <div class="timeline">
                ${Object.entries(days).map(
                    ([day_key, hours]) =>
                        html`
                            <div class="day">
                                <h1>${day_key}</h1>
                                ${Object.entries(hours).map(
                                    ([hour_key, notes]) => html`
                                        <div class="hour">
                                            <h2>
                                                ${hour_key}h -
                                                ${Number(hour_key) + 1}h
                                            </h2>
                                            <div class="entries">
                                                ${notes.map(
                                                    e => html`<a
                                                        href=${`/?id=${e.id}`}
                                                        class="entry button"
                                                    >
                                                        ${e.firstWords}...
                                                    </a>`
                                                )}
                                            </div>
                                        </div>
                                    `
                                )}
                            </div>
                        `
                )}
            </div>
        </main>
    `
)
