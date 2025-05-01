import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MaskDefinition {
  id: string
  label: string
  path: string
  w: number
  h: number
  tooltip?: {
    text: string
    uses: string[]
  }
}

interface ImageMaskerState {
  image: string | null
  selectedMaskId: string
  backgroundColor: string
  isProcessing: boolean
  error: string | null
  offsetX: number
  offsetY: number
  zoom: number
  flipH: number
  flipV: number
  hasTrasparency: boolean
}

export const masks: MaskDefinition[] = [
  {
    id: 'small',
    label: 'Small',
    path: 'M0,136.01c0,6.24,5.1,11.57,11.33,11.85l362.86,16.36c6.23.28,11.33-4.59,11.33-10.83V11.34C385.51,5.1,380.41,0,374.17,0H11.34C5.1,0,0,5.1,0,11.34v124.67Z',
    w: 385.51,
    h: 164.23,
    tooltip: {
      text: 'Used for:',
      uses: ['Offertes', 'Product previews']
    }
  },
  {
    id: 'large',
    label: 'Large',
    path: 'M0,186.01c0,6.24,5.1,11.57,11.33,11.85l362.86,16.36c6.23.28,11.33-4.59,11.33-10.83V11.34C385.51,5.1,380.41,0,374.17,0H11.34C5.1,0,0,5.1,0,11.34v174.67Z',
    w: 385.51,
    h: 214.23,
    tooltip: {
      text: 'Used for:',
      uses: ['Offertes', 'Website']
    }
  },
  {
    id: 'xl',
    label: 'XL',
    path: 'M45.12,0h368.34c14.65,0,18.72,4.07,18.72,18.72v489.8c0,14.65-4.07,18.72-18.72,18.72H18.69c-15.21,0-19.4-4.42-18.59-19.61L26.32,17.82C27.07,3.73,31.01,0,45.12,0Z',
    w: 432.18,
    h: 527.24,
    tooltip: {
      text: 'Used for:',
      uses: ['Slides']
    }
  }
];

const initialState: ImageMaskerState = {
  image: null,
  selectedMaskId: 'small',
  backgroundColor: '#ffffff',
  isProcessing: false,
  error: null,
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  flipH: 1,
  flipV: 1,
  hasTrasparency: false
}

const imageMaskerSlice = createSlice({
  name: 'imageMasker',
  initialState,
  reducers: {
    setImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload
      state.error = null
    },
    setSelectedMaskId: (state, action: PayloadAction<string>) => {
      state.selectedMaskId = action.payload
      // Reset positioning when changing mask
      state.offsetX = 0
      state.offsetY = 0
      state.zoom = 1
      state.flipH = 1
      state.flipV = 1
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload
    },
    setOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.offsetX = action.payload.x
      state.offsetY = action.payload.y
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    setFlipH: (state, action: PayloadAction<number>) => {
      state.flipH = action.payload
    },
    setFlipV: (state, action: PayloadAction<number>) => {
      state.flipV = action.payload
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setHasTransparency: (state, action: PayloadAction<boolean>) => {
      state.hasTrasparency = action.payload
    },
    reset: () => initialState,
  },
})

export const {
  setImage,
  setSelectedMaskId,
  setBackgroundColor,
  setOffset,
  setZoom,
  setFlipH,
  setFlipV,
  setProcessing,
  setError,
  setHasTransparency,
  reset,
} = imageMaskerSlice.actions

export default imageMaskerSlice.reducer 