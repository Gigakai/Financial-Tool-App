import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export default MainLayout