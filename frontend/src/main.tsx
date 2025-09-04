import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { MockProvider } from './context/MockContext'

createRoot(document.getElementById('root')!).render(<MockProvider><App /></MockProvider>)


