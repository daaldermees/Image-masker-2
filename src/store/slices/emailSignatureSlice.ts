import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface EmailSignatureState {
  firstName: string
  lastName: string
  phoneNumber: string
  jobTitle: string
  website: string
  address: string
  image: string | null
}

const initialState: EmailSignatureState = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  jobTitle: '',
  website: 'www.letstrain.com',
  address: '',
  image: null,
}

const emailSignatureSlice = createSlice({
  name: 'emailSignature',
  initialState,
  reducers: {
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload
    },
    setJobTitle: (state, action: PayloadAction<string>) => {
      state.jobTitle = action.payload
    },
    setWebsite: (state, action: PayloadAction<string>) => {
      state.website = action.payload
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setImage: (state, action: PayloadAction<string | null>) => {
      state.image = action.payload
    },
    resetEmailSignature: (state) => {
      return initialState
    },
  },
})

export const {
  setFirstName,
  setLastName,
  setPhoneNumber,
  setJobTitle,
  setWebsite,
  setAddress,
  setImage,
  resetEmailSignature,
} = emailSignatureSlice.actions

export default emailSignatureSlice.reducer 