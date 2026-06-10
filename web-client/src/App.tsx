import { BrowserRouter, Routes, Route } from "react-router-dom";
import SMSLogs from "./pages/SMSLogs";

function App() {

  return (
    <BrowserRouter>
    <Routes>
        <Route element={<SMSLogs />} path="/" />
    </Routes>
    </BrowserRouter>
     
  )
}

export default App
