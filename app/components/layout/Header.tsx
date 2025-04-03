'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Menu, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function Header({ toggleSidebar, tasks = [] }: HeaderProps) {
  const router = useRouter();
  
  const hasActiveTasks = tasks && tasks.length > 0 && tasks.some(task => task.status === 'processing');
  
  const headerStyle = {
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };
  
  const headerContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    margin: '0 auto',
    maxWidth: '1400px'
  };
  
  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center'
  };
  
  const menuButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    borderRadius: '0.375rem',
    cursor: 'pointer'
  };
  
  const searchContainerStyle = {
    position: 'relative' as const,
    marginLeft: '1rem'
  };
  
  const searchInputStyle = {
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: '0.875rem'
  };
  
  const searchIconStyle = {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none' as const
  };
  
  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };
  
  const notificationButtonStyle = {
    position: 'relative' as const,
    display: 'inline-flex',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    borderRadius: '0.5rem',
    cursor: 'pointer'
  };
  
  const notificationBadgeStyle = {
    position: 'absolute' as const,
    top: '0',
    right: '0',
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '9999px',
    backgroundColor: '#ef4444',
    border: '2px solid white'
  };
  
  const userContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };
  
  const avatarStyle = {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '9999px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  };
  
  const userInfoStyle = {
    display: 'none'
  };
  
  const userNameStyle = {
    fontWeight: 'medium',
    color: '#111827',
    fontSize: '0.875rem'
  };
  
  const userRoleStyle = {
    color: '#6b7280',
    fontSize: '0.75rem'
  };

  // Aplicar regras responsivas apenas no cliente
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return (
    <header style={headerStyle}>
      <div style={headerContentStyle}>
        <div style={leftSectionStyle}>
          <button 
            onClick={toggleSidebar} 
            style={menuButtonStyle}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div 
            style={searchContainerStyle}
            className="hidden md:block"
          >
            <div style={searchIconStyle}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              style={searchInputStyle}
              className="w-64"
            />
          </div>
        </div>
        
        <div style={rightSectionStyle}>
          <button 
            style={notificationButtonStyle}
            aria-label="Notificações"
          >
            <Bell size={20} />
            {hasActiveTasks && (
              <span style={notificationBadgeStyle}></span>
            )}
          </button>
          
          <div style={userContainerStyle}>
            <div style={avatarStyle}>
              <User size={20} />
            </div>
            <div style={{...userInfoStyle, display: isDesktop ? 'block' : 'none'}}>
              <div style={userNameStyle}>Usuário</div>
              <div style={userRoleStyle}>Autor</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 