'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useSupabase } from '../../hooks/use-supabase';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useSupabase();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      const { success, error } = await register(email, password, fullName);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError(error || 'Ocorreu um erro ao fazer registro. Tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao registrar. Tente novamente mais tarde.');
      console.error('Erro de registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Banner lateral com gradiente e animações */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 flex-col justify-center items-center text-white p-10 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '400px 400px'
          }}
        />
        <motion.div 
          className="max-w-md mx-auto z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <BookOpen className="h-16 w-16 mb-6" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Gerador de E-books
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg mb-8 text-blue-100">
            Crie e-books profissionais em minutos com a ajuda da Inteligência Artificial.
          </motion.p>
          <motion.div variants={containerVariants} className="space-y-5">
            <motion.div variants={itemVariants} className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full mr-3 mt-1">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-blue-50">Gere conteúdo completo de alta qualidade para seus e-books</p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full mr-3 mt-1">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-blue-50">Personalize capas e estrutura de capítulos conforme sua necessidade</p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full mr-3 mt-1">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-blue-50">Exporte em PDF ou HTML para usar em qualquer plataforma</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Formulário de registro com animações */}
      <motion.div 
        className="w-full md:w-1/2 flex justify-center items-center p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-blue-500" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              Crie sua conta
            </h1>
            <p className="text-muted-foreground mt-1">
              Comece a criar seus e-books hoje mesmo
            </p>
          </motion.div>
          
          {error && (
            <motion.div 
              className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/60" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  className="pl-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  required
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/60" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-muted-foreground">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </div>
                ) : 'Criar minha conta'}
              </Button>
            </motion.div>
          </motion.form>
          
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">
                  Faça login
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 