import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  Syringe,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Hash,
  Filter,
  Search,
  ArrowLeft,
  Newspaper,
  ExternalLink,
  Tag,
  Image,
  Video,
  Volume2,
  Shield,
  Loader2
} from 'lucide-react';
import { useImmunizationStudio } from '../hooks/useImmunizationStudio';

// Definición de las 19 categorías de marcadores de diagnóstico
const ETIQUETAS_CATEGORIAS = [
  { id: 'verdadero', label: 'Verdadero', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'falso', label: 'Falso', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'enganoso', label: 'Engañoso', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'satirico', label: 'Satírico/Humorístico', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'manipulado', label: 'Manipulado', icon: Image, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'sin_contexto', label: 'Sin contexto', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'no_verificable', label: 'No verificable', icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  { id: 'teoria_conspirativa', label: 'Teoría conspirativa', icon: AlertTriangle, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'discurso_odio', label: 'Discurso de odio', icon: XCircle, color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' },
  { id: 'sensacionalista', label: 'Sensacionalista', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
];

export function ImmunizationStudio() {
  const {
    selectedContent,
    setSelectedContent,
    clearSelection,
    vaccines,
    newVaccineName,
    setNewVaccineName,
    newVaccineDescription,
    setNewVaccineDescription,
    newSupportTitle,
    setNewSupportTitle,
    newSupportUrl,
    setNewSupportUrl,
    editingVaccineId,
    setEditingVaccineId,
    selectedFilter,
    setSelectedFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    verifiedContents,
    casesPerPage,
    addVaccine,
    removeVaccine,
    addSupport,
    removeSupport,
    saveImmunizationStrategy,
    selectedContentData
  } = useImmunizationStudio();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Volume2;
      default: return FileText;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta Prioridad</Badge>;
      case 'medium':
        return <Badge variant="default">Prioridad Media</Badge>;
      case 'low':
        return <Badge variant="secondary">Baja Prioridad</Badge>;
      default:
        return <Badge variant="outline">Sin Prioridad</Badge>;
    }
  };

  const getMarcador = (marcadorId: string) => {
    return ETIQUETAS_CATEGORIAS.find(c => c.id === marcadorId);
  };

  const getMarcadorBadgeColor = (marcadorId: string) => {
    const marcador = getMarcador(marcadorId);
    if (!marcador) return 'bg-gray-100 text-gray-700 border-gray-300';

    const colorMap: { [key: string]: string } = {
      'verdadero': 'bg-green-100 text-green-700 border-green-300',
      'falso': 'bg-red-100 text-red-700 border-red-300',
      'enganoso': 'bg-orange-100 text-orange-700 border-orange-300',
      'satirico': 'bg-blue-100 text-blue-700 border-blue-300',
      'manipulado': 'bg-purple-100 text-purple-700 border-purple-300',
      'sin_contexto': 'bg-amber-100 text-amber-700 border-amber-300',
      'no_verificable': 'bg-gray-100 text-gray-700 border-gray-300',
      'teoria_conspirativa': 'bg-violet-100 text-violet-700 border-violet-300',
      'discurso_odio': 'bg-red-200 text-red-900 border-red-400',
      'sensacionalista': 'bg-orange-100 text-orange-600 border-orange-300',
    };
    return colorMap[marcadorId] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Si no hay caso seleccionado, mostrar la lista
  if (!selectedContent) {
    return (
      <div className="space-y-6">
        {/* Franja de Botilito */}
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={botilitoImage}
              alt="Botilito"
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Inmunólogos digitales! Aquí están todos los casos diagnosticados listos para pasar a las vacunas 💉🔬
              </p>
              <p className="text-sm mt-1 opacity-80">
                Ya estos casos pasaron por mi análisis y por el de la red humana. Ahora toca armar las vacunas pa' inmunizar a la gente contra esta desinformación. ¡A darle duro! 💪
              </p>
            </div>
          </div>
        </div>

        {/* Lista de casos verificados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-[24px]">
                  <Syringe className="h-5 w-5 text-orange-500" />
                  <span>Casos Verificados</span>
                </CardTitle>
                <CardDescription>
                  Casos ya diagnosticados listos pa' estrategias de inmunización
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Hash className="h-3 w-3 mr-1" />
                {verifiedContents.length} casos disponibles
              </Badge>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar casos por título o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-gray-300"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">Todos los casos</option>
                  <option value="high">Alta prioridad</option>
                  <option value="medium">Prioridad media</option>
                  <option value="text">Solo texto</option>
                  <option value="image">Solo imágenes</option>
                  <option value="video">Solo videos</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de casos con altura fija y scroll */}
            <div className="space-y-4 max-h-[600px] min-h-[500px] overflow-y-auto custom-scrollbar">
              {(() => {
                if (isLoading) {
                  return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
                }
                // Calcular índices para la paginación
                const indexOfLastCase = currentPage * casesPerPage;
                const indexOfFirstCase = indexOfLastCase - casesPerPage;
                const currentCases = verifiedContents.slice(indexOfFirstCase, indexOfLastCase);

                return currentCases.map((content) => {
                  const TypeIcon = getTypeIcon(content.type);

                  return (
                    <div
                      key={content.id}
                      className="p-4 border rounded-lg cursor-pointer transition-all duration-200 bg-gray-50/50 hover:bg-accent hover:shadow-md hover:border-primary/50"
                      onClick={() => setSelectedContent(content.id)}
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-3 bg-muted rounded-lg">
                            <TypeIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs bg-white border-primary/30 font-mono">
                                  {content.displayId || `CASO-${content.id.substring(0, 8).toUpperCase()}`}
                                </Badge>
                                <h4 className="font-medium text-sm">{content.title || content.headline || 'Caso sin título'}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getPriorityBadge(content.priority)}
                              </div>
                            </div>

                            <div className="space-y-1">
                              {/* Usuario y votación */}
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{content.verifiedBy}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>{content.votesCount} verificadores</span>
                                </div>
                              </div>

                              {/* Contenido preview */}
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {content.type === 'text' ? content.content : content.description || content.content}
                              </p>
                            </div>

                            <div className="space-y-2">
                              {/* Diagnóstico consensuado */}
                              {content.consensusMarkers && content.consensusMarkers.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>Diagnóstico verificado:</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {content.consensusMarkers.map((marcadorId: string, index: number) => {
                                      const marcador = getMarcador(marcadorId);
                                      if (!marcador) return null;
                                      const consensusPercentage = content.consensusPercentages?.[marcadorId] || 0;
                                      return (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className={`text-xs px-2 py-0.5 ${getMarcadorBadgeColor(marcadorId)}`}
                                        >
                                          {marcador.label} {consensusPercentage}%
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Controles de paginación */}
            {verifiedContents.length > casesPerPage && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * casesPerPage) + 1} - {Math.min(currentPage * casesPerPage, verifiedContents.length)} de {verifiedContents.length} casos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(verifiedContents.length / casesPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-primary text-primary-foreground" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(verifiedContents.length / casesPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(verifiedContents.length / casesPerPage)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si hay un caso seleccionado, mostrar el detalle con formulario de vacunas
  return (
    <div className="space-y-6">
      {/* Franja de Botilito para el detalle del caso */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img
            src={botilitoImage}
            alt="Botilito"
            className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
          />
          <div className="flex-1">
            <p className="text-xl">
              ¡Dale berraco! Acá está el caso completo pa' que le armes la estrategia de inmunización 💉🔬
            </p>
            <p className="text-sm mt-1 opacity-80">
              Este caso ya pasó por diagnóstico completo. Ahora crea las vacunas necesarias pa' inmunizar a la gente contra esta desinformación. ¡Tú puedes! 💪
            </p>
          </div>
        </div>
      </div>

      {/* Detalle del caso */}
      <Card>
        <CardHeader>
          {/* Botón de volver */}
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Franja unificada con toda la info del caso */}
              <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-6 py-4 rounded-lg border-2 border-primary/30 mb-4">
                {/* Código del caso */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Código del Caso</p>
                    <p className="font-mono font-medium">{selectedContentData?.displayId}</p>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-12" />

                {/* Prioridad */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prioridad</p>
                  {getPriorityBadge(selectedContentData?.priority || 'high')}
                </div>

                <Separator orientation="vertical" className="h-12" />

                {/* Reportado por */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reportado por</p>
                    <p className="text-sm font-medium">{selectedContentData?.submittedBy || 'usuario_123'}</p>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-12" />

                {/* Fecha de reporte */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de reporte</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedContentData?.submittedAt || '2024-01-15T10:30:00Z').toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Título de la sección */}
              <CardTitle className="flex items-center space-x-2">
                <Syringe className="h-5 w-5 text-primary" />
                <span>Caso Verificado - Estudio de Inmunización</span>
              </CardTitle>
            </>
          )}
        </CardHeader>

        {!isLoading && (
          <CardContent className="space-y-6">
            {/* Content Details - igual que en HumanVerification */}
            {/* Image at the top, full width */}
            {selectedContentData?.screenshot && (
              <div className="relative rounded-lg overflow-hidden border-2 border-secondary/40 shadow-sm mb-6">
                <img
                  src={selectedContentData.screenshot}
                  alt="Evidencia del caso"
                  className="w-full h-64 object-cover object-top"
                />

                {/* Labels overlay on the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedContentData.consensusMarkers?.map((marcadorId: string, index: number) => {
                      const marcador = getMarcador(marcadorId);
                      if (!marcador) return null;

                      const getMarkerColor = (id: string) => {
                        const colorMap: { [key: string]: string } = {
                          'verdadero': 'bg-emerald-500 hover:bg-emerald-600',
                          'falso': 'bg-red-500 hover:bg-red-600',
                          'enganoso': 'bg-orange-500 hover:bg-orange-600',
                          'satirico': 'bg-blue-500 hover:bg-blue-600',
                          'manipulado': 'bg-purple-500 hover:bg-purple-600',
                          'sin_contexto': 'bg-amber-500 hover:bg-amber-600',
                          'no_verificable': 'bg-gray-500 hover:bg-gray-600',
                          'teoria_conspirativa': 'bg-violet-600 hover:bg-violet-700',
                          'discurso_odio': 'bg-red-700 hover:bg-red-800',
                          'sensacionalista': 'bg-orange-400 hover:bg-orange-500',
                        };
                        return colorMap[id] || 'bg-gray-500 hover:bg-gray-600';
                      };

                      const Icon = marcador.icon;
                      // Use consensus percentage if available, otherwise just show label
                      const percentage = selectedContentData.consensusPercentages?.[marcadorId];

                      return (
                        <Badge
                          key={index}
                          className={`${getMarkerColor(marcadorId)} text-white border-0 shadow-lg px-3 py-1.5 backdrop-blur-sm bg-opacity-90`}
                        >
                          <Icon className="h-4 w-4 mr-1.5" />
                          {marcador.label}
                          {percentage !== undefined && <span className="ml-1 opacity-90">({percentage}%)</span>}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">

              {/* Fuente y tema */}
              {(selectedContentData?.source || selectedContentData?.theme) && (
                <div className="flex flex-wrap items-center gap-4 pb-2">
                  {/* Fuente de la noticia */}
                  {selectedContentData.source && (
                    <div className="flex items-center space-x-2">
                      <Newspaper className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Fuente:</Label>
                      <a
                        href={selectedContentData.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground rounded-md transition-colors text-xs no-hover-effect"
                      >
                        <span>{selectedContentData.source.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Tema del contenido */}
                  {selectedContentData.theme && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Tema:</Label>
                      <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                        {selectedContentData.theme}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Titular de la noticia */}
              {selectedContentData?.headline && (
                <div>
                  <Label>Titular de la noticia:</Label>
                  <div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                    <p className="font-medium">{selectedContentData.headline}</p>
                  </div>
                </div>
              )}

              {/* Contenido analizado */}
              <div>
                <Label>Contenido analizado:</Label>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {selectedContentData?.type === 'text' ?
                    selectedContentData.content :
                    selectedContentData?.description || selectedContentData?.content
                  }
                </p>
              </div>
              {/* Evaluación epidemiológica */}
              {selectedContentData?.aiAnalysis.summary && (
                <div className="mt-6">
                  <h4>Evaluación epidemiológica:</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedContentData.aiAnalysis.summary}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Estrategia de Inmunización */}
            <div>
              <Label className="mb-3 flex items-center space-x-2">
                <Syringe className="h-4 w-4 text-orange-500" />
                <span>Estrategia de Inmunización</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Crea las vacunas necesarias pa' inmunizar contra este caso. Cada vacuna debe tener un nombre, descripción y soportes (evidencias, recursos educativos, referencias).
              </p>

              {/* Agregar Nueva Vacuna */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-3 mb-4">
                <h4 className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span>Agregar Nueva Vacuna</span>
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="vaccine-name">Nombre de la Vacuna</Label>
                  <Input
                    id="vaccine-name"
                    placeholder="Ej: Alfabetización mediática sobre salud"
                    value={newVaccineName}
                    onChange={(e) => setNewVaccineName(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccine-description">Descripción</Label>
                  <Textarea
                    id="vaccine-description"
                    placeholder="Describe cómo esta vacuna inmuniza contra el caso seleccionado..."
                    value={newVaccineDescription}
                    onChange={(e) => setNewVaccineDescription(e.target.value)}
                    rows={4}
                    className="bg-white resize-none"
                  />
                </div>

                <Button
                  onClick={addVaccine}
                  disabled={!newVaccineName.trim() || !newVaccineDescription.trim()}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Vacuna</span>
                </Button>
              </div>

              {/* Lista de Vacunas */}
              {vaccines.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center space-x-2">
                    <Syringe className="h-4 w-4 text-green-600" />
                    <span>Vacunas Propuestas ({vaccines.length})</span>
                  </h4>

                  {vaccines.map((vaccine) => (
                    <Card key={vaccine.id} className="border-green-200 bg-green-50/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium text-green-800">
                            {vaccine.name}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVaccine(vaccine.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-green-700">{vaccine.description}</p>

                        {/* Soportes de la vacuna */}
                        <div className="pl-4 border-l-2 border-green-200 space-y-3">
                          <Label className="text-xs text-green-600">Soportes y Evidencias:</Label>

                          {vaccine.supports.map((support) => (
                            <div key={support.id} className="flex items-center justify-between bg-white/50 p-2 rounded border border-green-100">
                              <div className="flex items-center space-x-2 overflow-hidden">
                                <ExternalLink className="h-3 w-3 text-green-500 flex-shrink-0" />
                                <a href={support.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline truncate">
                                  {support.title}
                                </a>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSupport(vaccine.id, support.id)}
                                className="h-6 w-6 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}

                          {/* Formulario para agregar soporte */}
                          <div className="flex flex-col gap-2 pt-2">
                            <Input
                              placeholder="Título del soporte/recurso"
                              value={newSupportTitle}
                              onChange={(e) => setNewSupportTitle(e.target.value)}
                              className="h-8 text-xs bg-white"
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="URL del recurso"
                                value={newSupportUrl}
                                onChange={(e) => setNewSupportUrl(e.target.value)}
                                className="h-8 text-xs bg-white"
                              />
                              <Button
                                size="sm"
                                onClick={() => addSupport(vaccine.id)}
                                disabled={!newSupportTitle.trim() || !newSupportUrl.trim()}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={saveImmunizationStrategy}
                disabled={vaccines.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Syringe className="h-4 w-4 mr-2" />
                Guardar Estrategia de Inmunización
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div >
  );
}