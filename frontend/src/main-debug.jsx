console.log('main.jsx loading...');

import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('React imported:', React);
console.log('ReactDOM imported:', ReactDOM);

// Ultra simple component
function TestApp() {
  console.log('TestApp rendering...');
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      background: '#667eea',
      color: 'white',
      minHeight: '100vh',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h1', { key: 'title' }, '🚀 G-Network Test'),
    React.createElement('p', { key: 'desc' }, 'React is working!'),
    React.createElement('button', {
      key: 'btn',
      onClick: () => alert('Button clicked!'),
      style: {
        padding: '10px 20px',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }
    }, 'Test Button')
  ]);
}

console.log('Getting root element...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering app...');
  root.render(React.createElement(TestApp));
  
  console.log('Render complete');
} else {
  console.error('Root element not found!');
}