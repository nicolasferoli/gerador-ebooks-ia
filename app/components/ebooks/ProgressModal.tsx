'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookIcon, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { useGenerationStatus } from '../../hooks/use-generation-status';

interface ProgressModalProps {
  ebookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgressModal({ ebookId, open, onOpenChange }: ProgressModalProps) {
  const router = useRouter();
  const { 
    progress, 
    statusMessage,
    isCompleted,
    isFailed,
    refreshStatus
  } = useGenerationStatus(ebookId);

  // Atualizar status a cada 2 segundos quando modal estiver aberto
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      refreshStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [open, refreshStatus]);

  const handleComplete = () => {
    onOpenChange(false);
    if (isCompleted) {
      router.push(`/ebooks/${ebookId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerando E-book</DialogTitle>
          <DialogDescription>
            Acompanhe o progresso da geração do seu e-book em tempo real.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex justify-center mb-6">
            {isFailed ? (
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            ) : isCompleted ? (
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            ) : (
              <div className="rounded-full bg-blue-100 p-3">
                <BookIcon className="h-10 w-10 text-blue-500" />
              </div>
            )}
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">
              {isCompleted 
                ? 'E-book gerado com sucesso!' 
                : isFailed 
                  ? 'Erro na geração' 
                  : 'Gerando conteúdo...'}
            </h3>
            <p className="text-gray-500 mt-1">{statusMessage}</p>
          </div>
          
          {!isCompleted && !isFailed && (
            <Progress 
              value={progress?.progress || 0} 
              className="h-2 mb-2" 
            />
          )}
          
          {isFailed && (
            <div className="bg-red-50 p-3 rounded-md flex items-start mt-4">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Falha na geração</h4>
                <p className="text-sm text-red-700">{progress?.message || 'Ocorreu um erro durante a geração. Tente novamente mais tarde.'}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          {!isCompleted && !isFailed && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continuar em segundo plano
            </Button>
          )}
          
          {(isCompleted || isFailed) && (
            <Button onClick={handleComplete}>
              {isCompleted ? 'Ver e-book' : 'Fechar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 