#!/usr/bin/env node

import { page as cursor } from '../components/cursor.js'
import { css } from '../components/css.js'

let username = ''
let password = ''
let loginSuccess = true

const tryLogin = async () => {
    const loginResult = await fetch('api/login', {
        method: 'POST',
        body: JSON.stringify({
            name: username,
            password
        })
    }).then(r => r.json())
    loginSuccess = loginResult.loggedIn
    if (loginSuccess) location.href = '/'
    else update()
}

flami(
    () => html`
        <main>
            <style>
                ${css}
            </style>
            <style>
                main {
                    position: relative;
                    height: 99vh;
                }
                .center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    translate: -50% -50%;
                }
                form > div {
                    margin-bottom: 10px;
                }
                form > div > * {
                    display: block;
                }
            </style>
            ${cursor()}
            <form
                class="center"
                onkeydown=${e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        tryLogin()
                        return false
                    }
                }}
            >
                <div>
                    <label for="login-name">Name</label>
                    <input
                        type="text"
                        id="login-name"
                        name="login-name"
                        placeholder="Name"
                        class="button tag"
                        onkeyup=${e => (username = e.target.value)}
                        oninput=${e => (username = e.target.value)}
                    />
                </div>
                <div>
                    <label for="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        name="login-password"
                        placeholder="Password"
                        class="button tag"
                        onkeyup=${e => (password = e.target.value)}
                        oninput=${e => (password = e.target.value)}
                    />
                </div>
                <div>
                    <button
                        class="button tag"
                        onclick=${e => {
                            e.preventDefault()
                            e.stopPropagation()
                            tryLogin()
                            return false
                        }}
                    >
                        Login
                    </button>
                </div>
                <div>
                    ${loginSuccess
                        ? ''
                        : 'Incorrect username or password. Please try again...'}
                </div>
            </form>
        </main>
    `
)
