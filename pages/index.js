import { page as editPane } from '../components/editPane.js'
import { page as searchPane } from '../components/searchPane.js'
import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                main {
                    display: flex;
                    height: 100vh;
                }
                .editPaneBox {
                    flex: 2;
                }
                .editPane,
                .searchPane {
                    height: 100%;
                }
                .searchPaneBox {
                    flex: 1;
                }
                @media (max-width: 800px) {
                    main {
                        flex-direction: column;
                    }
                    .editPane,
                    .searchPane {
                        height: 90vh;
                        width: 100%;
                    }
                    .editPaneBox {
                        flex: 0 0 max(10vh, 100px);
                        transition: flex 0.5s;
                        overflow: hidden;
                    }
                    .editPaneBox .tags {
                        border-radius: 0px !important;
                    }
                    .searchPaneBox {
                        flex: 0 0 min(90vh, calc(100vh - 100px));
                        transition: flex 0.5s;
                        overflow: hidden;
                    }
                    .editPaneBox:hover {
                        flex: 0 0 min(90vh, calc(100vh - 100px));
                    }
                    .editPaneBox:hover ~ .searchPaneBox {
                        flex: 0 0 max(10vh, 100px);
                    }
                }
            </style>
            ${cursor()}
            <div class="editPaneBox">${editPane()}</div>
            <div class="searchPaneBox">${searchPane()}</div>
        </main>
    `
)
