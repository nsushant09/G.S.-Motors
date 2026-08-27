import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { AdminAuthProvider } from './lib/adminAuth';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AdminAuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
