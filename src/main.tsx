import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from './router';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>
);

