import React, { useState, useRef } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
//import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Send, X, Link2, Image as ImageIcon, Video, Volume2, Share2,
  Twitter, Facebook, MessageCircle, Instagram, Music, Youtube, Smartphone, Mail, FileText, Paperclip
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

import {
  Card,
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; 

interface ContentUploadFormProps {
  onSubmit: (content: string, files: File[], contentType: ContentType, transmissionMedium: TransmissionVector) => void;
  isSubmitting: boolean;
}

export function ContentUploadForm({ onSubmit, isSubmitting }: ContentUploadFormProps) {
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [contentType, setContentType] = useState<ContentType>('texto');
  const [transmissionMedium, setTransmissionMedium] = useState<TransmissionVector>('Otro');
  const [isDragging, setIsDragging] = useState(false);
  const [textareaRows, setTextareaRows] = useState(1);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const transmissionMediums = [
    { value: 'WhatsApp' as TransmissionVector, label: 'WhatsApp', icon: MessageCircle },
    { value: 'Facebook' as TransmissionVector, label: 'Facebook', icon: Facebook },
    { value: 'Instagram' as TransmissionVector, label: 'Instagram', icon: Instagram },
    { value: 'Twitter/X' as TransmissionVector, label: 'Twitter/X', icon: Twitter },
    { value: 'TikTok' as TransmissionVector, label: 'TikTok', icon: Music },
    { value: 'Telegram' as TransmissionVector, label: 'Telegram', icon: Send },
    { value: 'YouTube' as TransmissionVector, label: 'YouTube', icon: Youtube },
    { value: 'Email' as TransmissionVector, label: 'Email', icon: Mail },
    { value: 'SMS' as TransmissionVector, label: 'SMS', icon: Smartphone },
    { value: 'Web' as TransmissionVector, label: 'Web/Sitio', icon: Link2 },
    { value: 'Otro' as TransmissionVector, label: 'Otra plataforma digital', icon: Share2 },
  ];

  const calculateTextareaRows = (text: string): number => {
    if (!text) return 1;
    const newlineCount = (text.match(/\n/g) || []).length;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isOnlyUrl = urlRegex.test(text.trim()) && text.trim().length < 200 && newlineCount === 0;
    if (isOnlyUrl) return 1;
    let rows = 1 + Math.floor(text.length / 80);
    rows = Math.max(rows, Math.min(newlineCount + 1, 6));
    return Math.min(rows, 6);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setTextareaRows(calculateTextareaRows(newContent));
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    setContentType(urlRegex.test(newContent) ? 'url' : 'texto');
  };
  
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    setFileError(null);
    
    // Validar límites de tamaño según tipo de archivo
    const fileSizeMB = file.size / 1024 / 1024;
    let maxSizeMB = 0;
    let fileTypeLabel = '';
    
    if (file.type.startsWith('image/')) {
      maxSizeMB = 2;
      fileTypeLabel = 'imagen';
    } else if (file.type.startsWith('audio/')) {
      maxSizeMB = 25;
      fileTypeLabel = 'audio';
    } else if (file.type.startsWith('video/')) {
      maxSizeMB = 50;
      fileTypeLabel = 'video';
    }
    
    if (maxSizeMB > 0 && fileSizeMB > maxSizeMB) {
      setFileError(`El archivo de ${fileTypeLabel} excede el tamaño máximo permitido de ${maxSizeMB} MB`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setUploadedFiles([file]);
    if (file.type.startsWith('image/')) setContentType('imagen');
    else if (file.type.startsWith('video/')) setContentType('video');
    else if (file.type.startsWith('audio/')) setContentType('audio');
    else setContentType('texto');
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && uploadedFiles.length === 0) return;
    onSubmit(content, uploadedFiles, contentType, transmissionMedium);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:pt-5 space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold">Ajá! ¿listos para diagnosticar juntos lo que se esconde detrás de lo evidente?</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-solid rounded-xl p-4 md:p-8 transition-all duration-300 bg-[#ffeea9] border-secondary/60 ${
                isDragging 
                  ? 'bg-[#ffe68f] border-primary scale-[1.02] shadow-lg' 
                  : 'hover:bg-[#ffeb98] hover:border-primary/80 hover:shadow-md'
              }`}
            >
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 p-4 md:p-6 bg-[rgb(255,233,122)] rounded-[10px] border-2 border-[#ffda00]">
                    <img src={botilitoImage} alt="Botilito" className="h-20 w-20 md:h-[100px] md:w-[100px] object-contain flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <p className="text-center md:text-left"><strong>En Digital-IA me incorporaron tecnología para analizar:</strong></p>
                      <TooltipProvider>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild><div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help"><Link2 className="h-4 w-4 text-black" /><span className="text-sm">Enlaces</span></div></TooltipTrigger>
                            <TooltipContent side="bottom"><p>Pega URLs de redes sociales, noticias o cualquier link pa' verificar</p></TooltipContent>
                          </Tooltip>
                           <Tooltip>
                              <TooltipTrigger asChild><div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help"><FileText className="h-4 w-4 text-black" /><span className="text-sm">Texto</span></div></TooltipTrigger>
                              <TooltipContent side="bottom"><p>Escribe o pega el texto que quieres chequear, parce</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild><div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help"><ImageIcon className="h-4 w-4 text-black" /><span className="text-sm">Imágenes</span></div></TooltipTrigger>
                              <TooltipContent side="bottom"><p>Sube capturas de pantalla, memes o fotos que te parezcan raras</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild><div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help"><Video className="h-4 w-4 text-black" /><span className="text-sm">Videos</span></div></TooltipTrigger>
                              <TooltipContent side="bottom"><p>Sube tus archivos de video MP4, MOV, AVI o cualquier formato</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild><div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help"><Volume2 className="h-4 w-4 text-black" /><span className="text-sm">Audios</span></div></TooltipTrigger>
                              <TooltipContent side="bottom"><p>Sube notas de voz, podcasts o audios que circulan por ahí</p></TooltipContent>
                            </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="text-center"><p>Carga, pega o suelta tu contenido aquí</p></div>
                  <div className="space-y-2">
                    <div className="relative flex items-start bg-white border-2 border-secondary/60 rounded-[8px] shadow-sm min-h-11">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-transparent hover:bg-primary no-hover-effect group transition-colors mt-1 cursor-pointer" title="Adjuntar archivo">
                        <Paperclip className="h-4 w-4 text-black/60" />
                      </button>
                      <Textarea placeholder="Pega aquí una URL, texto sospechoso, o escribe lo que quieras analizar..." value={content} onChange={handleContentChange} rows={textareaRows} className="flex-1 resize-none border-0 bg-transparent px-3 min-h-11 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground text-sm leading-relaxed transition-all duration-200"/>
                    </div>
                    {content.length > 0 && <p className="text-xs text-muted-foreground text-right">{content.length} caracteres</p>}
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.wav,.mp3,.mp4" onChange={(e) => handleFileUpload(e.target.files)}/>
              {fileError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{fileError}</p>
                </div>
              )}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-6 mt-6 border-t border-secondary/40">
                  <Label>Archivos seleccionados:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-secondary/40 rounded-lg hover:border-primary/60 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-secondary/40 rounded"><ImageIcon className="h-4 w-4 text-black" /></div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0 hover:bg-secondary/40"><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Vector de Transmisión</CardTitle>
            <CardDescription>¿Por dónde recibiste este contenido?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={transmissionMedium} onValueChange={(value) => setTransmissionMedium(value as TransmissionVector)}>
              <SelectTrigger className="w-full border-2 border-gray-300 focus:border-primary/50 transition-colors"><SelectValue placeholder="Cuéntame, ¿por dónde viste eso?" /></SelectTrigger>
              <SelectContent>
                {transmissionMediums.map((medium) => {
                  const IconComponent = medium.icon;
                  return (
                    <SelectItem key={medium.value} value={medium.value}><div className="flex items-center gap-2"><IconComponent className="h-4 w-4" /><span>{medium.label}</span></div></SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={(!content && uploadedFiles.length === 0) || !transmissionMedium || isSubmitting} className="flex items-center space-x-2 mt-2">
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Analizando...' : 'Iniciar Diagnóstico'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
