import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #1a1a1a, #000000)', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>COSMOFY</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Space Exploration Platform</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
