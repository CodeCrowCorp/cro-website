import { writable, type Writable } from 'svelte/store'

export const platform_connection: Writable<string> = writable()
