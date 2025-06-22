import { createRoot } from "react-dom/client";

function MinimalApp() {
  return <h1>Cosmofy Test</h1>;
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<MinimalApp />);
} else {
  console.error("Root element not found");
}