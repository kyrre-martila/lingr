import { createStore } from './create-store.js'
import { createGlimpsInitialState } from '../data/mocks/glimps.js'

export const glimpsState = createStore(createGlimpsInitialState())
