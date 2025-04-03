'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Bell } from 'lucide-react';
import { Progress } from './progress';
import { cn } from '../../lib/utils';

type Task = {
  id: string;
  title: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
};

type RealTimeNotificationProps = {
  tasks?: Task[];
  onTaskClick?: (taskId: string) => void;
  className?: string;
};

export function RealTimeNotification({
  tasks = [],
  onTaskClick,
  className,
}: RealTimeNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  // Simula a atualização de tarefas em tempo real
  useEffect(() => {
    setActiveTasks(tasks);
    
    if (tasks.some(task => task.status === 'processing')) {
      setHasNewNotifications(true);
    }
  }, [tasks]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen === false) {
      setHasNewNotifications(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={toggleOpen}
        className="relative p-2 text-slate-700 hover:text-purple-700 focus:outline-none rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {hasNewNotifications && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-slate-200">
          <div className="p-3 bg-purple-700 text-white font-semibold">
            Tarefas em Progresso
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {activeTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Nenhuma tarefa em progresso
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeTasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-slate-800">{task.title}</h3>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full text-white font-medium",
                          statusColors[task.status]
                        )}
                      >
                        {task.status === 'pending' && 'Pendente'}
                        {task.status === 'processing' && 'Processando'}
                        {task.status === 'completed' && 'Concluído'}
                        {task.status === 'failed' && 'Falhou'}
                      </span>
                    </div>
                    
                    {task.status === 'processing' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progresso</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" indicatorColor="bg-purple-600" />
                        {task.progress < 100 && (
                          <div className="flex items-center justify-center text-xs text-slate-500 mt-1">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            <span>Processando...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 