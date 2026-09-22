import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Catch-all for rendering errors visually
window.onerror = function (msg, url, lineNo, columnNo, error) {
  document.body.innerHTML = '<div style="padding: 2rem; color: red; background: #fee; font-family: monospace; z-index: 999999; position: absolute; inset: 0;">' +
    '<h1>Global Uncaught Error</h1>' +
    '<p><b>Message:</b> ' + msg + '</p>' +
    '<p><b>URL:</b> ' + url + '</p>' +
    '<p><b>Line:</b> ' + lineNo + ':' + columnNo + '</p>' +
    '<p><b>Stack:</b><br/>' + (error && error.stack ? error.stack.replace(/\n/g, '<br/>') : 'No stack') + '</p>' +
    '</div>';
  return false;
};

window.addEventListener('unhandledrejection', function (event) {
  document.body.innerHTML = '<div style="padding: 2rem; color: red; background: #fee; font-family: monospace; z-index: 999999; position: absolute; inset: 0;">' +
    '<h1>Unhandled Promise Rejection</h1>' +
    '<p><b>Reason:</b> ' + (event.reason ? (event.reason.stack || event.reason) : 'Unknown') + '</p>' +
    '</div>';
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
