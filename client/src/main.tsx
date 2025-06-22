import { createRoot } from "react-dom/client";
import "./index.css";

function SimpleApp() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Cosmofy Loading Test</h1>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);
