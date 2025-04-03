'use client';

import React from 'react';
import { RealTimeNotification } from '../ui/real-time-notification';
import { useRouter } from 'next/navigation';
import { User, Menu, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type HeaderProps = {
  className?: string;
  toggleSidebar: () => void;
  tasks?: Array<{
    id: string;
    title: string;
    progress: number;
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
  }>;
};

export default function Header({ className, toggleSidebar, tasks = [] }: HeaderProps) {
  const router = useRouter();
  
  const handleTaskClick = (taskId: string) => {
    // Navegar para a página de detalhes da tarefa ou ebook
    router.push(`/ebooks/${taskId}`);
  };
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`px-4 md:px-6 lg:px-8 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm ${className}`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700 lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <RealTimeNotification 
            tasks={tasks} 
            onTaskClick={handleTaskClick} 
          />
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Usuário</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">usuario@exemplo.com</p>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden cursor-pointer"
            >
              <User className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 