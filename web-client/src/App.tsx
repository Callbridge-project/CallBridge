// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SMSLogs from "./pages/SMSLogs";

// function App() {

//   return (
//     <BrowserRouter>
//     <Routes>
//         <Route element={<SMSLogs />} path="/" />
//     </Routes>
//     </BrowserRouter>
     
//   )
// }

// export default App

import { useEffect } from 'react';
import { signUp, login, getCurrentUser, logout } from './appwrite/auth';

function App() {
  useEffect(() => {
    const testAuth = async () => {
      console.log('--- Testing Sign Up ---');
      const signUpResult = await signUp(
        'Test User',
        'testuser2@callbridge.com',
        'Password1234!'
      );
      console.log('Sign Up Result:', signUpResult);

      console.log('--- Testing Login ---');
      const loginResult = await login(
        'testuser2@callbridge.com',
        'Password1234!'
      );
      console.log('Login Result:', loginResult);

      console.log('--- Testing Get Current User ---');
      const currentUser = await getCurrentUser();
      console.log('Current User:', currentUser);

      console.log('--- Testing Logout ---');
      const logoutResult = await logout();
      console.log('Logout Result:', logoutResult);
    };

    testAuth();
  }, []);

  return <div>Check the browser console for auth test results</div>;
}

export default App;
