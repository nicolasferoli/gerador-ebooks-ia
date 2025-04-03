'use client';

import { useState } from 'react';
import { EbookTemplate } from '../../types/ebook';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface TemplateSelectorProps {
  templates: EbookTemplate[];
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`overflow-hidden cursor-pointer transition-all border-2 ${
            selectedId === template.id ? 'border-blue-500 shadow-md' : 'border-transparent'
          }`}
          onClick={() => handleSelect(template.id)}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
              <img
                src={template.coverImageUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              {selectedId === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-5 w-5" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <div className="text-sm text-gray-500">
              {template.chapterStructure.length} capítulos
            </div>
            <Button
              variant={selectedId === template.id ? 'default' : 'outline'}
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleSelect(template.id);
              }}
            >
              {selectedId === template.id ? 'Selecionado' : 'Selecionar'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 