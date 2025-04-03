'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Book, 
  FileText, 
  Plus, 
  Home,
  X,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

type SidebarProps = {
  className?: string;
  closeSidebar?: () => void;
};

export default function Sidebar({ className, closeSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar se é dispositivo móvel após o componente montar
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Verificar inicialmente
    checkIsMobile();
    
    // Adicionar listener para resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Meus E-books', href: '/ebooks', icon: Book },
    { name: 'Novo E-book', href: '/ebooks/new', icon: Plus }
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

  const sidebarStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 40,
    background: 'linear-gradient(to bottom, #7c3aed, #4c1d95)',
    color: 'white',
    width: '14rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  };

  const logoContainerStyle = {
    padding: '1.25rem',
    borderBottom: '1px solid rgba(124, 58, 237, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoTextStyle = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, white, #e9d5ff)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent',
    color: 'transparent'
  };

  const closeButtonStyle = {
    padding: '0.375rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const navStyle = {
    flex: '1',
    overflowY: 'auto' as const,
    padding: '1rem'
  };

  const navListStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const getNavItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0.75rem',
    marginBottom: '0.25rem',
    borderRadius: '0.375rem',
    transition: 'all 200ms',
    backgroundColor: isActive ? 'rgba(124, 58, 237, 0.7)' : 'transparent',
    fontWeight: isActive ? 'medium' : 'normal',
    boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    color: 'white',
    textDecoration: 'none'
  });

  const footerStyle = {
    padding: '1rem',
    borderTop: '1px solid rgba(124, 58, 237, 0.5)',
    marginTop: 'auto'
  };

  const logoutButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem',
    width: '100%',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 200ms',
    fontWeight: 'medium',
    fontSize: '0.875rem'
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={sidebarStyle}
    >
      {/* Logo */}
      <div style={logoContainerStyle}>
        <h1 style={logoTextStyle}>
          Gerador de E-books
        </h1>
        <button 
          onClick={handleCloseSidebar}
          style={{...closeButtonStyle, display: isMobile ? 'flex' : 'none'}}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={navStyle}>
        <ul style={navListStyle}>
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ listStyleType: 'none' }}
              >
                <Link
                  href={item.href}
                  style={getNavItemStyle(isActive)}
                  onClick={handleCloseSidebar}
                >
                  <item.icon size={18} style={{ color: isActive ? 'white' : 'rgba(233, 213, 255, 0.8)' }} />
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
        style={footerStyle}
      >
        <button style={logoutButtonStyle}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </motion.div>
    </motion.aside>
  );
} 