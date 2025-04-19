import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Tolgee, DevTools, TolgeeProvider, FormatSimple } from '@tolgee/react'
import './index.css'
import App from './App.tsx'


const tolgee = Tolgee().use(DevTools()).use(FormatSimple()).init({
  language: "en",

  
  apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
  apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TolgeeProvider tolgee={tolgee} fallback="Loading...">
      <App />
    </TolgeeProvider>
  </StrictMode>
)
