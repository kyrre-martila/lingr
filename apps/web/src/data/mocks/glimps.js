export const glimpsMoodOptions = ['Grounded', 'Tender', 'Hopeful', 'Quietly Joyful', 'Reflective', 'In Between']
export const glimpsPromptOptions = [
  'A moment I kept thinking about…',
  'Something small that made today better…',
  'A thought I want to share slowly…',
  'A feeling I do not want to rush…'
]

export const createGlimpsInitialState = () => ({ reflection: '', mood: '', prompt: '', imageNote: '' })
