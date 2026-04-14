import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx'
import { BrowserRouter } from 'react-router'
import { ChatPopupProvider } from './context/ChatPopupContext.tsx'
import { SocketProvider } from './context/SocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ChatPopupProvider>
            <App />
          </ChatPopupProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
