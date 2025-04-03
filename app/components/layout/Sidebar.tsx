'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Book, 
  BarChart3, 
  Settings, 
  FileText, 
  Plus, 
  Home,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type SidebarProps = {
  className?: string;
  closeSidebar?: () => void;
};

export default function Sidebar({ className, closeSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Meus E-books', href: '/ebooks', icon: Book },
    { name: 'Novo E-book', href: '/new-ebook', icon: Plus },
    { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Configurações', href: '/account', icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCloseSidebar = () => {
    if (closeSidebar) {
      closeSidebar();
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 h-full z-40",
        "bg-gradient-to-b from-purple-800 to-purple-950 text-slate-50 w-64 shadow-xl",
        "flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-purple-700/50 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Gerador de E-books
        </h1>
        <button 
          onClick={handleCloseSidebar}
          className="lg:hidden p-2 rounded-full hover:bg-purple-700/50"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                    "hover:bg-purple-700 hover:shadow-md",
                    isActive 
                      ? "bg-purple-700 font-medium shadow-md" 
                      : "bg-transparent"
                  )}
                  onClick={handleCloseSidebar}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-purple-200"} />
                  <span>{item.name}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User/Logout */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-purple-700/50 mt-auto"
      >
        <button className="flex items-center gap-2 p-3 w-full rounded-lg hover:bg-purple-700/70 transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </motion.div>
    </motion.aside>
  );
} 