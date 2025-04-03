'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ToastProvider } from '../ui/toast';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  tasks?: {
    id: string;
    title: string;
    progress: number;
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
  }[];
}

export default function MainLayout({ children, tasks = [] }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar para mobile com overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity duration-200 ease-in-out ${
          sidebarOpen ? 'opacity-50 bg-black block' : 'opacity-0 hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 shadow-lg transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} tasks={tasks} />
        
        <main className="flex-1 overflow-y-auto pt-8 px-4 md:px-6 lg:px-8 pb-12 bg-gray-50 dark:bg-slate-900">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
} 