import { createRoot } from "react-dom/client";
import { LoanProvider } from "./context/LoanContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LoanProvider>
    <App />
  </LoanProvider>
);
