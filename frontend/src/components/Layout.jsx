import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex w-full h-full relative">
            <Sidebar />
            <div className="flex-1 ml-64 p-8 relative flex flex-col h-full">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
