/**
 * ============================================
 * MAIN LAYOUT COMPONENT
 * ============================================
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

export const MainLayout: React.FC = () => {
  const { sidebarOpen, sidebarCollapsed } = useUIStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={clsx(
          'transition-all duration-300 ease-in-out',
          sidebarOpen
            ? sidebarCollapsed
              ? 'lg:pl-20'
              : 'lg:pl-64'
            : 'lg:pl-0'
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
