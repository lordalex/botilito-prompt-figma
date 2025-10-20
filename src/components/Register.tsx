import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Eye, EyeOff, Phone, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import registerImage from 'figma:asset/60be6d6fe2b2bb2089603fb76c90d0926c3104a3.png';
import botilitoImage from 'figma:asset/ce81bb4aba8c9f36807cd145a086a12ce7f876dc.png';
import { signUp } from '../utils/supabase/auth';

interface RegisterProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

export function Register({ onRegister, onBackToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    city: '',
    birthDate: ''
  });

  // Departamentos de Colombia
  const departments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas',
    'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
    'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
    'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (credentials.password !== credentials.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    if (credentials.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        email: credentials.email,
        password: credentials.password,
        name: credentials.fullName,
        phone: credentials.phone,
        location: `${credentials.city}, ${credentials.department}`,
        birthDate: credentials.birthDate
      });
      onRegister();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
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
              src={registerImage} 
              alt="Botilito Register Reference" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-0 h-full">
            {/* Lado izquierdo - Presentación de Botilito */}
            <div className="bg-gradient-to-br from-primary to-secondary p-8 lg:p-12 flex flex-col justify-center items-center text-center">
              {/* Burbuja de diálogo */}
              <div className="bg-white rounded-2xl p-6 mb-8 relative shadow-lg max-w-md">
                <h1 className="text-3xl font-bold text-black mb-4">
                  ¡Únete a la lucha!
                </h1>
                <p className="text-gray-700 leading-relaxed">
                  Ayúdame a combatir la desinformación y crear un internet más seguro para todos.
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
                  className="w-80 h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Lado derecho - Formulario de registro */}
            <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* Header del formulario */}
                <div className="text-center mb-8">
                  <div className="inline-block bg-primary text-black px-6 py-3 rounded-2xl text-xl font-bold mb-6">
                    ¡A camellar contra las noticias falsas!
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Campo de nombre completo */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">
                      Nombre y apellido
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={credentials.fullName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  {/* Campo de email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="tu@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Campo de teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Número de teléfono</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={credentials.phone}
                      onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="3001234567"
                      required
                    />
                  </div>

                  {/* Ubicación: Departamento y Ciudad */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Departamento</span>
                      </Label>
                      <Select
                        value={credentials.department}
                        onValueChange={(value) => setCredentials(prev => ({ ...prev, department: value }))}
                        required
                      >
                        <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700">
                        Ciudad/Municipio
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        value={credentials.city}
                        onChange={(e) => setCredentials(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Tu ciudad"
                        required
                      />
                    </div>
                  </div>

                  {/* Fecha de nacimiento */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-gray-700 flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha de nacimiento</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={credentials.birthDate}
                      onChange={(e) => setCredentials(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Campos de contraseña en fila */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Campo de contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Campo de confirmar contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={credentials.confirmPassword}
                          onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox de términos y condiciones */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                      <div>Al crear una cuenta confirmas que has leído y aceptas nuestros:</div>
                      <div className="mt-1">
                        <button type="button" className="text-[rgba(0,0,0,1)] hover:text-secondary font-medium underline">
                          Términos y Condiciones
                        </button>
                      </div>
                      <div className="mt-1">
                        <button type="button" className="text-[rgba(0,0,0,1)] hover:text-secondary font-medium underline">
                          Política de Privacidad
                        </button>
                      </div>
                    </Label>
                  </div>

                  {/* Botón de registrarse */}
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!acceptTerms || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                        Creando cuenta...
                      </>
                    ) : (
                      '¡Vamos pa\'dentro!'
                    )}
                  </Button>

                  {/* Enlace de login */}
                  <div className="text-center">
                    <span className="text-gray-600">¿Ya eres miembro? </span>
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="text-primary hover:text-secondary font-medium transition-colors font-bold"
                    >
                      Inicia sesión
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}