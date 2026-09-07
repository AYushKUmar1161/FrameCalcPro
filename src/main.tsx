import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import { ToastProvider } from './context/ToastContext'
import { AppRouter } from './AppRouter'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProjectProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </ProjectProvider>
    </BrowserRouter>
  </StrictMode>,
)
