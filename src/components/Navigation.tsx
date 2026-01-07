import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Bot, Upload, Users, FileSearch, LogOut, User, Settings, Trophy, Activity, Puzzle, Map, BookOpen, LayoutDashboard, Menu } from 'lucide-react';
import { NotificationCenter } from './notifications/NotificationCenter';
import botilitoLogo from 'figma:asset/8604399dafdf4284ef499af970e8af43ff13e21b.png';
import { useState } from 'react';
import { api } from '../services/api';

import { useAuth } from '../providers/AuthProvider';

const ADMIN_CACHE_KEY = 'botilito_admin_access';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  onViewTask: (jobId: string, type: string, status?: string) => void;
  onViewAllNotifications?: () => void;
}

export function Navigation({ activeTab, onTabChange, onLogout, onViewTask, onViewAllNotifications }: NavigationProps) {
  const { user, profile, session } = useAuth(); // Get user, profile, and session from AuthProvider
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Check cached admin status on mount
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (cached) {
      try {
        const { userId, isAdmin: cachedAdmin } = JSON.parse(cached);
        if (userId === user?.id) {
          return cachedAdmin;
        }
      } catch (e) {
        sessionStorage.removeItem(ADMIN_CACHE_KEY);
      }
    }
    return false;
  });
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'upload', label: 'Análisis IA', icon: Upload },
    { id: 'verification', label: 'Validación Humana', icon: Users },
    { id: 'review', label: 'Historial', icon: Bot },
    { id: 'mapa', label: 'Mapa Desinfodémico', icon: Map },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  // Check admin access lazily when menu is opened
  const checkAdminAccess = async () => {
    if (adminCheckDone || !session) return;

    setAdminCheckDone(true);

    try {
      console.log('🔐 Checking admin access...');
      // Make a lightweight request to admin dashboard API to verify access
      await api.admin.dispatch(session, { type: 'ping' });

      console.log('✅ Admin access granted');
      // If successful, user is admin
      setIsAdmin(true);

      // Cache the result
      sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
        userId: user?.id,
        isAdmin: true,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.log('❌ Admin access denied:', error);
      // If error, user is not admin
      setIsAdmin(false);

      // Cache the result
      sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
        userId: user?.id,
        isAdmin: false,
        timestamp: Date.now()
      }));
    }
  };

  // Map real user data or fallback
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Usuario',
    email: user?.email || '',
    avatar: profile?.photo || profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}&backgroundColor=ffda00`,
    level: profile?.role || 'Usuario', 
    totalBadges: profile?.reputation !== undefined ? Math.floor(profile.reputation / 10) : 0 // heuristic if badge count not direct
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => handleTabChange('upload')}>
            <img
              src={botilitoLogo}
              alt="Botilito"
              className="h-8 sm:h-10 object-contain"
            />
            <Badge variant="secondary" className="text-xs sm:text-sm">Beta 1.2</Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <div className="flex space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'ghost'}
                  onClick={() => handleTabChange(id)}
                  size="sm"
                  className={`relative group transition-all duration-200 ${activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-white/80 hover:bg-secondary hover:scale-105'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-2 font-medium">{label}</span>
                </Button>
              ))}
            </div>

            {onLogout && (
              <div className="ml-4 pl-4 border-l border-border flex items-center space-x-2">
                <NotificationCenter onViewTask={onViewTask} onViewAllNotifications={onViewAllNotifications} />

                <DropdownMenu onOpenChange={(open) => { if (open) checkAdminAccess(); }}>
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
                    <DropdownMenuItem onClick={() => handleTabChange('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => handleTabChange('admin')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard Administrativo</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleTabChange('extension')}>
                      <Puzzle className="mr-2 h-4 w-4" />
                      <span>Extensión</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTabChange('docs')}>
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

          {/* Mobile/Tablet Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            {onLogout && (
              <>
                <NotificationCenter onViewTask={onViewTask} onViewAllNotifications={onViewAllNotifications} />
                
                <DropdownMenu onOpenChange={(open) => { if (open) checkAdminAccess(); }}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                    <DropdownMenuItem onClick={() => handleTabChange('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => handleTabChange('admin')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard Administrativo</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleTabChange('extension')}>
                      <Puzzle className="mr-2 h-4 w-4" />
                      <span>Extensión</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTabChange('docs')}>
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
              </>
            )}
            
            {/* Menú Hamburguesa */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <img
                      src={botilitoLogo}
                      alt="Botilito"
                      className="h-8 object-contain"
                    />
                    <span>Navegación</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-2">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={activeTab === id ? 'default' : 'ghost'}
                      onClick={() => handleTabChange(id)}
                      className={`justify-start h-12 ${
                        activeTab === id ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{label}</span>
                    </Button>
                  ))}
                  
                  {isAdmin && (
                    <>
                      <div className="my-2 border-t" />
                      <Button
                        variant={activeTab === 'admin' ? 'default' : 'ghost'}
                        onClick={() => handleTabChange('admin')}
                        className={`justify-start h-12 ${
                          activeTab === 'admin' ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        <span className="font-medium">Dashboard Admin</span>
                      </Button>
                    </>
                  )}
                  
                  <div className="my-2 border-t" />
                  
                  <Button
                    variant={activeTab === 'extension' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('extension')}
                    className={`justify-start h-12 ${
                      activeTab === 'extension' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <Puzzle className="h-5 w-5 mr-3" />
                    <span className="font-medium">Extensión</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="justify-start h-12"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="font-medium">Configuración</span>
                  </Button>
                  
                  <Button
                    variant={activeTab === 'docs' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('docs')}
                    className={`justify-start h-12 ${
                      activeTab === 'docs' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    <span className="font-medium">Documentación</span>
                  </Button>
                  
                  {onLogout && (
                    <>
                      <div className="my-2 border-t" />
                      <Button
                        variant="ghost"
                        onClick={onLogout}
                        className="justify-start h-12 text-red-600 hover:text-red-600 hover:bg-red-50 mb-4"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="font-medium">Cerrar Sesión</span>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}