import { configureStore } from '@reduxjs/toolkit'
import imageMaskerReducer from './slices/imageMaskerSlice'
import quoteGeneratorReducer from './slices/quoteGeneratorSlice'
import emailSignatureReducer from './slices/emailSignatureSlice'

export const store = configureStore({
  reducer: {
    imageMasker: imageMaskerReducer,
    quoteGenerator: quoteGeneratorReducer,
    emailSignature: emailSignatureReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 