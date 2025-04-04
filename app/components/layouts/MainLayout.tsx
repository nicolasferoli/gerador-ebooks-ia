'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  PlusCircle,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  User,
} from 'lucide-react';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '16rem',
    position: 'fixed' as const,
    height: '100vh',
    borderRight: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    padding: '1.5rem 1.25rem',
    overflowY: 'auto' as const,
    zIndex: 40,
  },
  mobileSidebar: {
    position: 'fixed' as const,
    inset: '0',
    zIndex: 50,
  },
  mobileOverlay: {
    position: 'fixed' as const,
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
  },
  mobileSidebarContent: {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    width: '16rem',
    height: '100%',
    backgroundColor: '#ffffff', 
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '1.5rem 1.25rem',
    overflowY: 'auto' as const,
  },
  sidebarHeader: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '1.5rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: '1 1 0%',
    width: '100%',
    minHeight: '100vh',
  },
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 30,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    height: '4rem',
  },
  searchContainer: {
    position: 'relative' as const,
    flex: '1 1 0%',
    maxWidth: '20rem',
    marginLeft: '1.5rem',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: '0.875rem',
  },
  searchIcon: {
    position: 'absolute' as const,
    top: '50%',
    left: '0.75rem',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: '#9ca3af',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingLeft: '1rem',
  },
  userIcon: {
    backgroundColor: '#f3f4f6',
    borderRadius: '9999px',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '0.125rem',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  main: {
    flex: '1 1 0%',
    padding: '1.5rem 2rem',
    overflowY: 'auto' as const,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#4b5563',
    textDecoration: 'none',
    width: '100%',
  },
  navItemIcon: {
    marginRight: '0.75rem',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    marginBottom: '2rem',
    color: '#4f46e5',
  },
  menuButton: {
    display: 'block',
    padding: '0.375rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  }
};

type Props = {
  children: React.ReactNode;
};

export function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Efeito para detectar o tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Verificar tamanho inicial
    checkScreenSize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup do listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fechar sidebar quando mudar de rota em mobile
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [pathname, isDesktop]);

  return (
    <div style={styles.container}>
      {/* Sidebar - versão móvel */}
      {sidebarOpen && !isDesktop && (
        <div style={styles.mobileSidebar}>
          <div style={styles.mobileOverlay} onClick={toggleSidebar}></div>
          <div style={styles.mobileSidebarContent}>
            <div style={styles.sidebarHeader}>
              <h1 style={styles.logo}>Gerador de E-books</h1>
              <button
                onClick={toggleSidebar}
                style={styles.menuButton}
                aria-label="Fechar menu"
              >
                <X style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              </button>
            </div>

            <nav>
              <NavLinks currentPath={pathname} />
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar - desktop */}
      {isDesktop && (
        <div style={styles.sidebar}>
          <h1 style={styles.logo}>Gerador de E-books</h1>
          
          <nav style={{ flex: '1' }}>
            <NavLinks currentPath={pathname} />
          </nav>
          
          <div style={{
            marginTop: 'auto', 
            padding: '1rem 0',
            borderTop: '1px solid #f3f4f6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <User size={18} />
              </div>
              <div>
                <p style={styles.userName}>Usuário</p>
                <p style={styles.userEmail}>usuario@exemplo.com</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div style={{
        ...styles.mainContent,
        marginLeft: isDesktop ? '16rem' : '0',
      }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            {!isDesktop && (
              <button
                onClick={toggleSidebar}
                style={styles.menuButton}
                aria-label="Abrir menu"
              >
                <Menu style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
              </button>
            )}

            <div style={{
              ...styles.searchContainer,
              display: isDesktop ? 'block' : 'none',
              marginLeft: isDesktop ? '1.5rem' : '0',
            }}>
              <div style={styles.searchIcon}>
                <Search style={{ width: '1rem', height: '1rem' }} />
              </div>
              <input
                type="search"
                style={styles.searchInput}
                placeholder="Pesquisar..."
              />
            </div>

            <div style={{
              ...styles.userSection,
              marginLeft: isDesktop ? 'auto' : 'auto',
              marginRight: '0.5rem',
            }}>
              <button style={{ 
                position: 'relative' as const,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
              }}>
                <Bell style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
                <span style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '0.625rem', 
                  height: '0.625rem', 
                  backgroundColor: '#ef4444', 
                  borderRadius: '9999px',
                  border: '2px solid white',
                }}></span>
              </button>

              {isDesktop && (
                <div style={styles.userInfo}>
                  <span style={styles.userName}>Usuário</span>
                  <span style={styles.userEmail}>usuario@exemplo.com</span>
                </div>
              )}

              <button style={{ 
                ...styles.userIcon,
                display: 'flex',
              }}>
                <User style={{ width: '1.25rem', height: '1.25rem', color: '#4b5563' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  const activeStyle = {
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    fontWeight: 600,
  };
  
  return (
    <Link 
      href={href}
      style={{
        ...styles.navItem,
        transition: 'background-color 0.2s ease, color 0.2s ease',
        ...(isActive ? activeStyle : {}),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#4f46e5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#4b5563';
        }
      }}
    >
      <span style={{
        ...styles.navItemIcon,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isActive ? '#6d28d9' : 'inherit',
      }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

type NavLinksProps = {
  currentPath: string;
};

function NavLinks({ currentPath }: NavLinksProps) {
  const links = [
    { href: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { href: '/ebooks', icon: <BookOpen size={18} />, label: 'Meus E-books' },
    { href: '/ebooks/new', icon: <PlusCircle size={18} />, label: 'Novo E-book' },
    { href: '/settings', icon: <Settings size={18} />, label: 'Configurações' },
  ];

  return (
    <>
      {links.map((link) => (
        <NavItem 
          key={link.href}
          href={link.href} 
          icon={link.icon} 
          label={link.label} 
          isActive={currentPath.startsWith(link.href)}
        />
      ))}
    </>
  );
} 