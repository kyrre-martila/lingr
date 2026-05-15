export const createStore = (initialState) => {
  let state = { ...initialState }
  return {
    getState: () => state,
    patch: (updates) => {
      state = { ...state, ...updates }
      return state
    },
    reset: (nextState = initialState) => {
      state = { ...nextState }
      return state
    }
  }
}
