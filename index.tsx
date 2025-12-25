import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
const loader = document.getElementById('loader-overlay');

const removeLoader = () => {
  if (loader) loader.classList.add('hidden');
  if (rootElement) rootElement.removeAttribute('data-booting');
};

if (!rootElement) {
  console.error("Critical DOM Error: Root container not found.");
} else {
  try {
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App onBooted={() => {
            console.log("App Component Successfully Mounted.");
            removeLoader();
        }} />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Mounting Error:", error);
    removeLoader();
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: 'Inter', sans-serif; text-align: center; max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div style="background: #fff; padding: 40px; border-radius: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #fee2e2;">
          <h1 style="color: #1e293b; margin-top: 0; font-weight: 900; font-size: 20px;">Runtime Error</h1>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 24px;">The application crashed during the initial boot phase.</p>
          <pre style="text-align: left; background: #f8fafc; padding: 12px; border-radius: 12px; font-size: 10px; color: #ef4444; overflow: auto; border: 1px solid #e2e8f0; margin-bottom: 24px;">${error instanceof Error ? error.message : String(error)}</pre>
          <button onclick="window.location.reload()" style="padding: 14px 28px; background: #2563eb; color: white; border: none; border-radius: 14px; font-weight: 800; cursor: pointer;">Restart System</button>
        </div>
      </div>
    `;
  }
}

// Global safety timeout to remove loader if React hangs
setTimeout(removeLoader, 5000);
