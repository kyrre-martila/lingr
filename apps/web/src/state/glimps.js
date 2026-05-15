import { createStore } from './create-store.js'
import { createGlimpsInitialState } from '../data/mocks/glimps.js'
import { validateGlimps } from '../domain/glimps/index.js'

const initialState = createGlimpsInitialState()

export const glimpsState = createStore({
  ...initialState,
  validation: validateGlimps(initialState)
})
