import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import SideBar from '../components/SideBar/SideBar';
import AdminNav from '../components/AdminNav/AdminNav';
import PublicNav from '../components/PublicNav/PublicNav';
// import Navbar from '../components/Navbar/Navbar';
// import SideBar from '../components/SideBar/SideBar'

const MainLayout = () => {

    return (
        <div style={{ height: `100vh`, width: `100%` }}>
            <Navbar />
            <div className="content-body">
                <Outlet />
            </div>
            {/* <Footer /> */}
        </div>
    )
}

export const PublicLayout = () => {
    return (
        <div style={{ height: `100vh`, width: `100%` }}>
            <PublicNav />
            <div className="content-body">
                <Outlet />
            </div>
            {/* <Footer /> */}
        </div>
    )
}

export const AdminLayout = () => {
    const [menuToggle, setMenuToggle] = useState(false);
    return (
        <div style={{ height: `100%`, width: `100%` }}>
            <div className="content-body d-flex">
                <SideBar menuToggle={menuToggle} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <AdminNav menuToggle={menuToggle} setMenuToggle={setMenuToggle}/>
                    <Outlet />
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    )
}

export default MainLayout;