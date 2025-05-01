import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface QuoteGeneratorState {
  quote: string
  author: string
  quoteColor: string
  containerColor: string
  personBgColor: string
  useBgColor: boolean
  isProcessing: boolean
  error: string | null
}

const initialState: QuoteGeneratorState = {
  quote: 'Dit is een quote.',
  author: 'Game Tailors',
  quoteColor: '#4493cf',
  containerColor: '#ededed',
  personBgColor: '#ffffff',
  useBgColor: false,
  isProcessing: false,
  error: null,
}

const quoteGeneratorSlice = createSlice({
  name: 'quoteGenerator',
  initialState,
  reducers: {
    setQuote: (state, action: PayloadAction<string>) => {
      state.quote = action.payload
      state.error = null
    },
    setAuthor: (state, action: PayloadAction<string>) => {
      state.author = action.payload
    },
    setQuoteColor: (state, action: PayloadAction<string>) => {
      state.quoteColor = action.payload
    },
    setContainerColor: (state, action: PayloadAction<string>) => {
      state.containerColor = action.payload
    },
    setPersonBgColor: (state, action: PayloadAction<string>) => {
      state.personBgColor = action.payload
    },
    setUseBgColor: (state, action: PayloadAction<boolean>) => {
      state.useBgColor = action.payload
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    reset: () => initialState,
  },
})

export const {
  setQuote,
  setAuthor,
  setQuoteColor,
  setContainerColor,
  setPersonBgColor,
  setUseBgColor,
  setProcessing,
  setError,
  reset,
} = quoteGeneratorSlice.actions

export default quoteGeneratorSlice.reducer 