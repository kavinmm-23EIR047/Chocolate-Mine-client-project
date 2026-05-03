import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import MobileBottomNav from '../layout/MobileBottomNav';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default UserLayout;
