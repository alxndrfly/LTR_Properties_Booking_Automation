import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import FormSelection from './FormSelection.tsx'
import './index.css'

// Simple routing logic based on URL path
const currentPath = window.location.pathname;
const AppComponent = currentPath === '/form' ? FormSelection : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)