import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col relative overflow-x-hidden">
            <Navbar />

            {/* pt-24 ensures content naturally flows beneath the fixed Top Navbar */}
            <div className="flex-1 w-full pt-20 flex flex-col relative">
                <main className="flex-1 flex flex-col w-full h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
