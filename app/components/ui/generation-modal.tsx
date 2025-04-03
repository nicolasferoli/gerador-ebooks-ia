'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, BookOpenCheck, X } from 'lucide-react';
import { Progress } from './progress';
import { cn } from '../../lib/utils';

type GenerationStep = {
  id: number;
  message: string;
  status: 'idle' | 'loading' | 'completed' | 'error';
};

type GenerationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bookTitle?: string;
  totalChapters?: number;
  completedChapters?: number;
  currentStep?: number;
  steps?: GenerationStep[];
  className?: string;
  initialSteps?: GenerationStep[];
  onComplete?: () => void;
};

export function GenerationModal({
  isOpen,
  onClose,
  title = 'Gerando E-book',
  bookTitle = 'Seu E-book',
  totalChapters = 10,
  completedChapters = 0,
  currentStep = 0,
  className,
  initialSteps,
  onComplete,
}: GenerationModalProps) {
  const [steps, setSteps] = useState<GenerationStep[]>(
    initialSteps || [
      { id: 1, message: 'Analisando tópico principal...', status: 'idle' },
      { id: 2, message: 'Estruturando capítulos...', status: 'idle' },
      { id: 3, message: 'Gerando conteúdo detalhado...', status: 'idle' },
      { id: 4, message: 'Criando introdução e conclusão...', status: 'idle' },
      { id: 5, message: 'Revisando texto e formatação...', status: 'idle' },
      { id: 6, message: 'Finalizando e-book...', status: 'idle' },
    ]
  );

  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [generatingChapter, setGeneratingChapter] = useState<number>(1);
  const [chaptersProgress, setChaptersProgress] = useState<number>(
    completedChapters > 0 ? (completedChapters / totalChapters) * 100 : 0
  );

  useEffect(() => {
    if (!isOpen) return;

    let currentStepId = 1;
    let timeout: NodeJS.Timeout;

    const processNextStep = () => {
      if (currentStepId <= steps.length) {
        // Marcar o passo atual como em carregamento
        setActiveStepId(currentStepId);
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === currentStepId
              ? { ...step, status: 'loading' }
              : step
          )
        );

        // Simular a conclusão do passo atual após um tempo aleatório
        const delay = Math.random() * 2000 + 1000;
        timeout = setTimeout(() => {
          // Marcar o passo como concluído
          setSteps((prevSteps) =>
            prevSteps.map((step) =>
              step.id === currentStepId
                ? { ...step, status: 'completed' }
                : step
            )
          );

          // Avançar para o próximo passo
          currentStepId++;
          if (currentStepId <= steps.length) {
            processNextStep();
          } else {
            // Simulação completa
            if (onComplete) {
              onComplete();
            }
          }
        }, delay);
      }
    };

    // Iniciar o processo
    processNextStep();

    // Simular progresso dos capítulos
    const chapterInterval = setInterval(() => {
      setChaptersProgress((prev) => {
        const newValue = Math.min(prev + 1, 100);
        
        // Atualizar o capítulo atual sendo gerado
        const chaptersCompleted = Math.floor((newValue / 100) * totalChapters);
        if (chaptersCompleted < totalChapters) {
          setGeneratingChapter(chaptersCompleted + 1);
        }
        
        // Se completou 100%, limpar o intervalo
        if (newValue >= 100) {
          clearInterval(chapterInterval);
        }
        
        return newValue;
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearInterval(chapterInterval);
    };
  }, [isOpen, steps.length, totalChapters, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn",
          className
        )}
      >
        <div className="bg-purple-700 text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-purple-100 text-sm mt-1">"{bookTitle}"</p>
        </div>

        <div className="p-6">
          {/* Progress bar para capítulos */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Gerando capítulos ({completedChapters || Math.floor((chaptersProgress / 100) * totalChapters)}/{totalChapters})</span>
              <span>{Math.floor(chaptersProgress)}%</span>
            </div>
            <Progress value={chaptersProgress} className="h-3" />
            <p className="text-xs text-slate-500 mt-2">
              Gerando capítulo {generatingChapter}...
            </p>
          </div>

          {/* Lista de passos */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center p-3 rounded-lg",
                  step.status === 'completed' ? "bg-green-50" : step.status === 'loading' ? "bg-purple-50" : "bg-slate-50",
                  step.status === 'error' && "bg-red-50"
                )}
              >
                <div className="mr-3">
                  {step.status === 'loading' ? (
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  ) : step.status === 'completed' ? (
                    <BookOpenCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    step.status === 'completed' ? "text-green-800" : 
                    step.status === 'loading' ? "text-purple-800 font-medium" : 
                    "text-slate-500"
                  )}
                >
                  {step.message}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Isso pode levar alguns minutos.</p>
            <p>Você será notificado quando estiver pronto.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 