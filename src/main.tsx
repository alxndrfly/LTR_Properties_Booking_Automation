import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import FormSelection from './FormSelection.tsx'
import FormRedirect from './FormRedirect.tsx'
import InquiryMerge from './InquiryMerge.tsx'
import './index.css'

// Simple routing logic based on URL path
const currentPath = window.location.pathname;
let AppComponent;
if (currentPath === '/form') {
  AppComponent = FormSelection;
} else if (currentPath === '/form_redirect') {
  AppComponent = FormRedirect;
} else if (currentPath === '/inquiry_merge') {
  AppComponent = InquiryMerge;
} else {
  AppComponent = App;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)