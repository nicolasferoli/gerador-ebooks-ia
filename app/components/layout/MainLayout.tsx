'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
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
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar se é desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Verificar na montagem
    checkIsDesktop();
    
    // Adicionar listener
    window.addEventListener('resize', checkIsDesktop);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  };

  const overlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 20,
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-in-out',
    opacity: sidebarOpen ? 0.5 : 0,
    backgroundColor: 'black',
    display: sidebarOpen ? 'block' : 'none',
  };

  const sidebarContainerStyle = {
    position: isDesktop ? 'static' as const : 'fixed' as const,
    insetY: 0,
    left: 0,
    zIndex: 30,
    width: '14rem',
    backgroundColor: '#1e293b',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transitionProperty: 'transform',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-in-out',
    transform: sidebarOpen || isDesktop ? 'translateX(0)' : 'translateX(-100%)',
  };

  const mainContentStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: '1',
    width: '100%',
    overflow: 'hidden',
  };

  const mainStyle = {
    flex: 1,
    overflow: 'auto' as const,
    paddingTop: '2rem',
    paddingBottom: '3rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    backgroundColor: '#f9fafb'
  };

  // Aplicar padding responsivo baseado no tamanho da tela
  useEffect(() => {
    const updatePadding = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        if (window.innerWidth >= 1024) {
          mainElement.style.paddingLeft = '2rem';
          mainElement.style.paddingRight = '2rem';
        } else if (window.innerWidth >= 768) {
          mainElement.style.paddingLeft = '1.5rem';
          mainElement.style.paddingRight = '1.5rem';
        } else {
          mainElement.style.paddingLeft = '1rem';
          mainElement.style.paddingRight = '1rem';
        }
      }
    };
    
    updatePadding();
    window.addEventListener('resize', updatePadding);
    
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  const contentWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar para mobile com overlay */}
      <div
        style={overlayStyle}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div style={sidebarContainerStyle}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <div style={mainContentStyle}>
        <Header toggleSidebar={toggleSidebar} tasks={tasks} />
        
        <main style={mainStyle}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={contentWrapperStyle}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
} 