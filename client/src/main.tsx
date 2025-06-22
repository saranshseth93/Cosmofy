// Test basic DOM manipulation
console.log("Script loading...");
const root = document.getElementById("root");
if (root) {
  root.innerHTML = "<h1>Cosmofy Direct DOM Test</h1>";
  console.log("DOM updated successfully");
} else {
  console.error("Root element not found");
}
