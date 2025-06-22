// Minimal working version to get the site loading
console.log('Script loaded successfully');

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(to bottom, #1a1a1a, #000000);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    ">
      <div style="text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">COSMOFY</h1>
        <p style="font-size: 1.2rem; opacity: 0.8;">Space Exploration Platform</p>
        <div style="margin-top: 2rem;">
          <button onclick="window.location.reload()" style="
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          ">Reload Application</button>
        </div>
      </div>
    </div>
  `;
  console.log('Content rendered successfully');
} else {
  console.error('Root element not found');
}
