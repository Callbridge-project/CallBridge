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


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SMSLogs from "./pages/SMSLogs";

// function App() {

//  return (
//     <BrowserRouter>
//     <Routes>
//         <Route element={SMSLogs} path="/" />
//     </Routes>
//     </BrowserRouter>
     
//   )
// }

// export default App

// import { useEffect } from 'react';
// import { signUp, login, getCurrentUser, logout } from './appwrite/auth';

// function App() {
//   useEffect(() => {
//     const testAuth = async () => {
//       console.log('--- Testing Sign Up ---');
//       const signUpResult = await signUp(
//         'Test User',
//         'testuser2@callbridge.com',
//         'Password1234!'
//       );
//       console.log('Sign Up Result:', signUpResult);

//       console.log('--- Testing Login ---');
//       const loginResult = await login(
//         'testuser2@callbridge.com',
//         'Password1234!'
//       );
// onst signUpResult = await signUp(
//         'Test User',
//         'testuser1@callbridge.com',
//         '#superpassword1'
//       );
//       console.log('Sign Up Result:', signUpResult);

//       console.log('--- Testing Login ---');
//       const loginResult = await login(
//         'testuser1@callbridge.com',
//         '#Realuser@5555'
//       );

  // console.log('--- Testing Login ---');
//       const loginResult = await login(
//         'emmanuelkmensah0343@gmail.com',
//         '#Nopassword@5555'
//       );

//       console.log('Login Result:', loginResult);

//       console.log('--- Testing Get Current User ---');
//       const currentUser = await getCurrentUser();
//       console.log('Current User:', currentUser);

//       console.log('--- Testing Logout ---');
//       const logoutResult = await logout();
//       console.log('Logout Result:', logoutResult);
//     };

//     testAuth();
//   }, []);

//   return <div>Check the browser console for auth test results</div>;
// }

// export default App;
