import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import App from "@/index";
import { NextUIProvider } from "@nextui-org/react";
import SmoothScroll from "@/components/SmoothScroll";
import "@/index.css";

// import { setupMockApi } from "@/api/mock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// if (import.meta.env.VITE_USE_MOCK_API === 'true') {
//   setupMockApi();
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // data is fresh for 30s — no re-fetch on navigation
      gcTime: 5 * 60_000,       // keep unused cache for 5 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NextUIProvider>
            <App />
            <Toaster />
            <HotToaster position="top-right" />
        </NextUIProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
