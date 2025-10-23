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
    <div className="min-h-screen bg-primary">
      <div className="w-full h-screen">
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
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-0 h-full">
            {/* Lado izquierdo - Presentación de Botilito (oculto en móvil) */}
            <div className="hidden lg:flex bg-gradient-to-br from-primary to-secondary lg:p-12 flex-col justify-center items-center text-center">
              {/* Burbuja de diálogo */}
              <div className="bg-white rounded-2xl p-6 mb-8 relative shadow-lg max-w-md">
                <h1 className="text-3xl font-bold text-black mb-4">
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
              <div className="relative">
                <img
                  src={botilitoImage}
                  alt="Botilito - El ex-agente digital convertido en luchador contra la desinformación"
                  className="w-72 h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Lado derecho - Formulario de login */}
            <div className="bg-white flex flex-col justify-center px-4 py-8 sm:px-8 md:px-12 lg:px-[130px] lg:py-[48px] overflow-y-auto">
              <div className="max-w-xl mx-auto w-full">
                {/* Mobile greeting - solo visible en móvil */}
                <div className="lg:hidden flex flex-col items-center mb-6">
                  <img
                    src={botilitoImage}
                    alt="Botilito"
                    className="w-32 h-auto mb-3"
                  />
                  <h2 className="text-xl font-bold text-black text-center">
                    ¡Kiubo! Soy Botilito
                  </h2>
                  <p className="text-sm text-gray-600 text-center mt-2 max-w-xs">
                    Luchando contra la desinformación
                  </p>
                </div>

                {/* Header del formulario */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-primary text-black px-6 py-3 rounded-2xl text-xl lg:text-2xl font-bold mb-4 lg:px-8 lg:py-4">
                    ¿Me acompañas?
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Campo de usuario/email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 text-base lg:text-lg">
                      Usuario o correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 text-base lg:px-6 lg:py-4 lg:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Campo de contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 text-base lg:text-lg">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 text-base lg:px-6 lg:py-4 lg:pr-14 lg:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 lg:h-6 lg:w-6" />
                        ) : (
                          <Eye className="h-5 w-5 lg:h-6 lg:w-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Enlace "Olvidé mi contraseña" */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-base text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Olvidé mi contraseña
                    </button>
                  </div>

                  {/* Botón de ingresar */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base lg:py-4 lg:text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center md:mt-8 md:pt-6">
                  <a
                    href="https://digitalia.gov.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-hover-effect"
                  >
                    <img
                      src={digitalIALogo}
                      alt="Digital-IA - Educomunicación para la paz"
                      className="h-20 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer md:h-28"
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