import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './provider/AuthProvider';
import { UsageProvider } from './contexts/UsageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <UsageProvider>
      <App />
    </UsageProvider>
    </AuthProvider>
  </React.StrictMode>
);