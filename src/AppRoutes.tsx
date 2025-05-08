import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainNavbar from "./pages/Navbar";
import ExcelUpload from "./pages/excel-upload";
import Rates from "./pages/Rates/PortPair";


export default function AppRoutes() {
    return (
      <div>
        <BrowserRouter>
        <Routes>
            {/* <Route path="/" element={<h1>Home</h1>} /> */}
            <Route path="/" element={<MainNavbar />} />
            <Route path="/excel-upload" element={<ExcelUpload />} />
            <Route path="/rates" element={<Rates />} />
        </Routes>
        </BrowserRouter>
        </div>
    )
};