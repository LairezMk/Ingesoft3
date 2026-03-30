/**
 * ============================================
 * LOGIN PAGE
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      if (response.success && response.data) {
        login(
          {
            id: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role,
          },
          response.data.accessToken,
          response.data.refreshToken
        );

        toast.success('¡Bienvenido al Centro Cultural Lucy Tejada!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6">
              Centro Cultural
              <br />
              <span className="text-secondary-300">Lucy Tejada</span>
            </h1>
            <p className="text-lg text-primary-100 max-w-md">
              Plataforma de gestión institucional para la formación artística
              y cultural de Pereira, Colombia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 gap-6"
          >
            {[
              { icon: '🎭', label: 'Teatro' },
              { icon: '💃', label: 'Danza' },
              { icon: '🎵', label: 'Música' },
              { icon: '🎨', label: 'Artes Visuales' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-white font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-500/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary-400/30 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-dark-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4">
              <span className="text-3xl">🎭</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-dark-500 dark:text-dark-400">
              Accede a la plataforma de gestión
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              icon={<EnvelopeIcon className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo electrónico inválido',
                },
              })}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<LockClosedIcon className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 8,
                    message: 'Mínimo 8 caracteres',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-dark-400 hover:text-dark-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-dark-600 dark:text-dark-300">
                  Recordarme
                </span>
              </label>

              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-dark-500 dark:text-dark-400">
              © 2024 Centro Cultural Lucy Tejada
              <br />
              Alcaldía de Pereira
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
