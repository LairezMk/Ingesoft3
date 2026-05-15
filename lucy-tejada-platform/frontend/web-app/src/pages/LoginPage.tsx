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
import lucyTejadaBackground from '@/assets/images/LUCY-TEJADA.jpeg';
import logoImage from '@/assets/images/logo.png';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const TheaterMaskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4.5 5.5h15v9.5a7.5 7.5 0 0 1-15 0V5.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path
      d="M8.5 14.5c1.1 1 2.2 1.5 3.5 1.5s2.4-.5 3.5-1.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const DanceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="4.8" r="2.1" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 7v3.2m0 0-3.2 2.1m3.2-2.1 3.4 2.2M8.4 15.1l-3 2.4m6.6-2.4 2.4 3.7m-1.9-8.6 2.8-1.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.3 8.4 7.7 6.8M15.8 15.8l2.4 1.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

      if (!response.success || !response.data) {
        toast.error(response.message || 'No se pudo iniciar sesión.');
        return;
      }

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${lucyTejadaBackground})` }}
      >
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/45 via-primary-900/30 to-secondary-900/45" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl xl:text-7xl font-display font-bold text-white mb-6">
              Centro Cultural
              <br />
              <span className="text-secondary-300">Lucy Tejada</span>
            </h1>
            <p className="text-2xl leading-relaxed text-primary-100 max-w-lg">
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
              {
                icon: TheaterMaskIcon,
                label: 'Teatro',
                iconContainerClass: 'bg-cyan-500/25 ring-1 ring-cyan-300/50',
                iconClass: 'text-cyan-200',
              },
              {
                icon: DanceIcon,
                label: 'Danza',
                iconContainerClass: 'bg-pink-500/25 ring-1 ring-pink-300/50',
                iconClass: 'text-pink-200',
              },
              {
                icon: MusicalNoteIcon,
                label: 'Música',
                iconContainerClass: 'bg-violet-500/25 ring-1 ring-violet-300/50',
                iconClass: 'text-violet-200',
              },
              {
                icon: PaintBrushIcon,
                label: 'Artes Visuales',
                iconContainerClass: 'bg-amber-500/25 ring-1 ring-amber-300/50',
                iconClass: 'text-amber-200',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.iconContainerClass}`}
                >
                  <item.icon className={`w-6 h-6 ${item.iconClass}`} />
                </div>
                <span className="text-xl text-white font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

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
            <div className="inline-flex items-center justify-center w-60 h-60 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-dark-200 mb-6 dark:bg-dark-800 dark:ring-dark-700">
              <img
                src={logoImage}
                alt="Logo Centro Cultural Lucy Tejada"
                className="w-full h-full object-cover"
              />
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
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                    value: 6,
                    message: 'Mínimo 6 caracteres',
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
              © 2026 Centro Cultural Lucy Tejada
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
