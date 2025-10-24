// frontend/src/main.tsx - react app entry point and DOM mounting
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
