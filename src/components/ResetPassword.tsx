import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import botilitoImage from 'figma:asset/ce81bb4aba8c9f36807cd145a086a12ce7f876dc.png';
import digitalIALogo from 'figma:asset/1c413bccac94a45a38e7dde790a3aa8c525d334b.png';
import { updatePassword } from '../utils/supabase/auth';

interface ResetPasswordProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function ResetPassword({ onSuccess, onBackToLogin }: ResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (passwords.password !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validate password length
    if (passwords.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(passwords.password);
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Error al actualizar la contraseña. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="w-full min-h-screen">
        <div className="relative bg-white h-full overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen">
            {/* Left side - Botilito presentation */}
            <div className="bg-gradient-to-br from-primary to-secondary p-8 lg:p-12 flex flex-col justify-center items-center text-center h-screen overflow-y-auto">
              <div className="flex flex-col items-center">
                {/* Dialog bubble */}
                <div className="bg-white rounded-2xl p-6 mb-8 relative shadow-lg max-w-md">
                  <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
                    {isSuccess ? '¡Listo, parce!' : '¡Ey, tranqui!'}
                  </h1>
                  <p className="text-gray-700 leading-relaxed">
                    {isSuccess
                      ? 'Tu contraseña ha sido actualizada. Ya puedes entrar con tu nueva clave.'
                      : 'Acá puedes crear una nueva contraseña para tu cuenta. Ponle una que sea segura pero que puedas recordar.'}
                  </p>
                  {/* Bubble arrow */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                </div>

                {/* Botilito Character */}
                <div className="relative">
                  <img
                    src={botilitoImage}
                    alt="Botilito - El ex-agente digital convertido en luchador contra la desinformación"
                    className="h-auto drop-shadow-2xl max-h-[500px] max-w-[300px] md:max-w-[400px]"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Reset password form */}
            <div className="bg-white p-6 sm:p-8 md:p-16 lg:px-[130px] lg:py-[48px] flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full">
                {/* Form header */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-primary text-black px-6 py-3 md:px-8 md:py-4 rounded-2xl text-xl md:text-2xl font-bold mb-4">
                    {isSuccess ? '¡Todo bien!' : 'Nueva contraseña'}
                  </div>
                </div>

                {isSuccess ? (
                  // Success state
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg text-center">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-semibold mb-2">¡Contraseña actualizada!</p>
                      <p className="text-sm">Te estamos redirigiendo al login...</p>
                    </div>
                    <Button
                      type="button"
                      onClick={onBackToLogin}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base md:py-4 md:text-lg rounded-lg transition-colors"
                    >
                      Ir al login ahora
                    </Button>
                  </div>
                ) : (
                  // Form state
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {/* New password field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 text-base md:text-lg">
                        Nueva contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={passwords.password}
                          onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 text-base md:px-6 md:py-4 md:pr-14 md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
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

                    {/* Confirm password field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 text-base md:text-lg">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 text-base md:px-6 md:py-4 md:pr-14 md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="Repite la contraseña"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 md:h-6 w-5 md:w-6" />
                          ) : (
                            <Eye className="h-5 md:h-6 w-5 md:w-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base md:py-4 md:text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                          Actualizando...
                        </>
                      ) : (
                        'Cambiar contraseña'
                      )}
                    </Button>

                    {/* Back to login link */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={onBackToLogin}
                        className="text-primary hover:text-secondary font-medium text-sm md:text-base transition-colors"
                      >
                        Volver al login
                      </button>
                    </div>
                  </form>
                )}

                {/* Digital-IA logo */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                  <a
                    href="https://digitalia.gov.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-hover-effect"
                  >
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
