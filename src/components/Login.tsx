import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import exampleImage from 'figma:asset/444e8e22665a8cbdab132760610010dba89f3e67.png';
import botilitoImage from 'figma:asset/ce81bb4aba8c9f36807cd145a086a12ce7f876dc.png';
import digitalIALogo from 'figma:asset/1c413bccac94a45a38e7dde790a3aa8c525d334b.png';
import { signIn } from '../utils/supabase/auth';

interface LoginProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

export function Login({ onLogin, onGoToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn({
        email: credentials.email,
        password: credentials.password
      });
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The main container now uses min-h-screen to ensure it covers the viewport but can grow if content overflows on mobile.
    <div className="min-h-screen bg-primary">
      {/* The w-full and min-h-screen ensure the container adapts to the screen height. */}
      <div className="w-full min-h-screen">
        {/* Contenedor principal con la imagen de referencia como fondo */}
        <div className="relative bg-white h-full overflow-hidden">
          {/* Imagen de fondo de referencia */}
          <div className="absolute inset-0 opacity-10">
            <img 
              src={exampleImage} 
              alt="Botilito Login Reference" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 
            RESPONSIVE LAYOUT CHANGE:
            - `grid-cols-1`: This is the default for mobile, making the layout a single column.
            - `lg:grid-cols-2`: This activates the two-column layout only on large screens (1024px and up).
            - `h-full` is changed to `min-h-screen` to allow the content to scroll on mobile if it exceeds the viewport height.
          */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen">
            {/* Lado izquierdo - Presentación de Botilito */}
            {/* 
              RESPONSIVE SPACING CHANGE:
              - `p-8`: Base padding for mobile.
              - `lg:p-12`: Larger padding for desktops.
              - The original `p-[48px]` is replaced by a more conventional and responsive spacing scale.
            */}
            <div className="bg-gradient-to-br from-primary to-secondary p-8 lg:p-12 flex flex-col justify-center items-center text-center">
              <div className="flex flex-col items-center max-h-[60vh] lg:max-h-[70vh]">
                {/* Burbuja de diálogo */}
                <div className="bg-white rounded-2xl p-6 mb-8 relative shadow-lg max-w-md">
                  {/* 
                    RESPONSIVE TYPOGRAPHY CHANGE:
                    - `text-2xl`: Font size for mobile.
                    - `md:text-3xl`: Larger font size for tablets and desktops.
                  */}
                  <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
                    ¡Kiubo! Soy Botilito
                  </h1>
                  <p className="text-gray-700 leading-relaxed">
                    Un ex-agente digital de una granja de bots! Me escapé para venirme al bando de los que luchan contra la desinformación desde digitalia.gov.co.
                  </p>
                  {/* Flecha de la burbuja */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                </div>

                {/* Botilito Character - Imagen oficial */}
                {/* 
                  RESPONSIVE SIZING CHANGE:
                  - `w-60`: Smaller image size for mobile.
                  - `lg:w-72`: Original, larger size for desktops.
                */}
                <div className="relative">
                  <img 
                    src={botilitoImage} 
                    alt="Botilito - El ex-agente digital convertido en luchador contra la desinformación" 
                    className="w-48 sm:w-60 md:w-72 lg:w-80 xl:w-96 h-auto drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Lado derecho - Formulario de login */}
            {/* 
              RESPONSIVE SPACING CHANGE:
              - `p-6`: Base padding for mobile.
              - `sm:p-8`: Slightly more padding for small screens.
              - `md:p-16`: Generous padding for tablets.
              - `lg:px-[130px] lg:py-[48px]`: The original, exact padding for large desktops to keep the design immutable.
            */}
            <div className="bg-white p-6 sm:p-8 md:p-16 lg:px-[130px] lg:py-[48px] flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full">
                {/* Header del formulario */}
                <div className="text-center mb-6">
                  {/* 
                    RESPONSIVE TYPOGRAPHY AND PADDING CHANGE:
                    - `px-6 py-3 text-xl`: Smaller padding and font size for mobile.
                    - `md:px-8 md:py-4 md:text-2xl`: Larger for tablets and up.
                  */}
                  <div className="inline-block bg-primary text-black px-6 py-3 md:px-8 md:py-4 rounded-2xl text-xl md:text-2xl font-bold mb-4">
                    ¿Me acompañas?
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Campo de usuario/email */}
                  <div className="space-y-2">
                    {/* 
                      RESPONSIVE TYPOGRAPHY CHANGE:
                      - `text-base`: Base font size for mobile.
                      - `md:text-lg`: Larger size for tablets and up.
                    */}
                    <Label htmlFor="email" className="text-gray-700 text-base md:text-lg">
                      Usuario o correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      // RESPONSIVE TYPOGRAPHY AND PADDING CHANGE: Base styles for mobile, `md:` for larger screens.
                      className="w-full px-4 py-3 text-base md:px-6 md:py-4 md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Campo de contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 text-base md:text-lg">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        // RESPONSIVE TYPOGRAPHY AND PADDING CHANGE: Base styles for mobile, `md:` for larger screens.
                        className="w-full px-4 py-3 pr-12 text-base md:px-6 md:py-4 md:pr-14 md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 md:h-6 w-5 md:w-6" />
                        ) : (
                          <Eye className="h-5 md:h-6 w-5 md:w-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Enlace "Olvidé mi contraseña" */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Olvidé mi contraseña
                    </button>
                  </div>

                  {/* Botón de ingresar */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    // RESPONSIVE TYPOGRAPHY AND PADDING CHANGE
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base md:py-4 md:text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                        Ingresando...
                      </>
                    ) : (
                      '¡Pa\' dentro!'
                    )}
                  </Button>

                  {/* Enlace de registro */}
                  <div className="text-center">
                    <span className="text-gray-600 text-sm md:text-base">¿No eres miembro? </span>
                    <button
                      type="button"
                      onClick={onGoToRegister}
                      className="text-primary hover:text-secondary font-medium text-sm md:text-base transition-colors no-hover-effect"
                    >
                      Regístrate ahora
                    </button>
                  </div>
                </form>
                
                {/* Logo de Digital-IA en la parte inferior */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                  <a 
                    href="https://digitalia.gov.co" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="no-hover-effect"
                  >
                    {/* RESPONSIVE SIZING CHANGE: Smaller logo on mobile */}
                    <img 
                      src={digitalIALogo} 
                      alt="Digital-IA - Educomunicación para la paz" 
                      className="h-24 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
