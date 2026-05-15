import { createStore } from './create-store.js'
import { createGlimpsInitialState } from '../data/mocks/glimps.js'
import { canCreateGlimps } from '../domain/glimps/index.js'

const initialState = createGlimpsInitialState()

export const glimpsState = createStore({
  ...initialState,
  creationPolicy: canCreateGlimps({
    createdToday: 0,
    dailyLimit: 1,
    draftText: 'placeholder'
  })
})
