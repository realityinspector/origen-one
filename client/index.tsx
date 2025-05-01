import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/lib/queryClient";
import { AuthProvider } from "./src/hooks/use-auth";
import { Toaster } from "./src/components/ui/toast";
import "./src/styles/theme";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
