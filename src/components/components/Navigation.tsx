import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bot, Upload, Users, FileSearch, LogOut, User, Settings, Trophy, Activity, Puzzle, Map, BookOpen, Syringe } from 'lucide-react';
import { GlobalNotifications } from './GlobalNotifications';
import botilitoLogo from 'figma:asset/8604399dafdf4284ef499af970e8af43ff13e21b.png';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export function Navigation({ activeTab, onTabChange, onLogout }: NavigationProps) {
  const tabs = [
    { id: 'upload', label: 'Análisis IA', icon: Upload },
    { id: 'verification', label: 'Diagnóstico Humano', icon: Users },
    { id: 'immunization', label: 'Inmunización', icon: Syringe },
    { id: 'review', label: 'Historial', icon: Bot },
    { id: 'mapa', label: 'Mapa Desinfodémico', icon: Map },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  // Datos simulados del usuario
  const userData = {
    name: 'Dr. María González',
    email: 'maria.gonzalez@botilito.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaGonzalez&backgroundColor=ffda00',
    level: 'Especialista Senior',
    totalBadges: 5
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={botilitoLogo} 
              alt="Botilito" 
              className="h-10 object-contain" 
            />
            <Badge variant="secondary">Beta</Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'ghost'}
                  onClick={() => onTabChange(id)}
                  size="sm"
                  className={`relative group transition-all duration-200 ${
                    activeTab === id 
                      ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                      : 'bg-white/80 hover:bg-secondary hover:scale-105'
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline font-medium">{label}</span>
                  
                  {/* Tooltip para pantallas pequeñas */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none lg:hidden whitespace-nowrap z-50">
                    {label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </Button>
              ))}
            </div>
            
            {onLogout && (
              <div className="ml-4 pl-4 border-l border-border flex items-center space-x-2">
                {/* Botón de Notificaciones Globales */}
                <GlobalNotifications />
                
                {/* Avatar y Menú de Usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userData.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userData.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {userData.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Trophy className="h-3 w-3 mr-1" />
                            {userData.totalBadges} badges
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTabChange('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTabChange('extension')}>
                      <Puzzle className="mr-2 h-4 w-4" />
                      <span>Extensión</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTabChange('docs')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Documentación</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}