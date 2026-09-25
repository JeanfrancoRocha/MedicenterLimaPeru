import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  UserCircle2,
  Stethoscope,
  UserCheck,
  Shield,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import clsx from 'clsx';
import {
  AuthUser,
  initialDoctors,
  initialReceptionists,
  adminCredentials,
} from '../data/medicenterData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

type LoginTab = 'paciente' | 'medico' | 'recepcionista' | 'admin';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('paciente');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Paciente login as clean new client with no prefilled data
  const handlePatientDirectLogin = () => {
    const patientUser: AuthUser = {
      role: 'paciente',
      username: 'nuevo_paciente',
      name: '',
      dni: '',
      phone: '',
    };
    onLoginSuccess(patientUser);
    onClose();
  };

  // Handle Form submit
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }

    if (activeTab === 'medico') {
      const foundDoc = initialDoctors.find(
        (d) => d.username.toLowerCase() === cleanUser || d.id.toLowerCase() === cleanUser
      );
      if (foundDoc) {
        if (cleanPass === foundDoc.username || cleanPass === foundDoc.id || cleanPass === foundDoc.password) {
          const authUser: AuthUser = {
            role: 'medico',
            username: foundDoc.username,
            name: foundDoc.name,
            doctorId: foundDoc.id,
            specialty: foundDoc.specialty,
            cmp: foundDoc.cmp,
            hospital: foundDoc.hospital,
            district: foundDoc.district,
          };
          onLoginSuccess(authUser);
          onClose();
          return;
        }
      }
      setError('Credenciales de Médico incorrectas. Por favor verifica tu usuario y contraseña.');
      return;
    }

    if (activeTab === 'recepcionista') {
      const foundRecep = initialReceptionists.find(
        (r) => r.username.toLowerCase() === cleanUser || r.id.toLowerCase() === cleanUser
      );
      if (foundRecep) {
        if (cleanPass === foundRecep.username || cleanPass === foundRecep.id) {
          const authUser: AuthUser = {
            role: 'recepcionista',
            username: foundRecep.username,
            name: foundRecep.name,
            receptionistId: foundRecep.id,
            sede: foundRecep.sede,
            district: foundRecep.district,
            shift: foundRecep.shift,
            desk: foundRecep.desk,
          };
          onLoginSuccess(authUser);
          onClose();
          return;
        }
      }
      setError('Credenciales de Recepcionista incorrectas. Por favor verifica tu usuario y contraseña.');
      return;
    }

    if (activeTab === 'admin') {
      if (
        cleanUser === adminCredentials.username &&
        cleanPass === adminCredentials.password
      ) {
        const authUser: AuthUser = {
          role: 'admin',
          username: adminCredentials.username,
          name: adminCredentials.name,
        };
        onLoginSuccess(authUser);
        onClose();
        return;
      }
      setError('Credenciales de Administrador incorrectas. Por favor verifica tu usuario y contraseña.');
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-medical-green font-bold">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Iniciar Sesión en MEDICENTER
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Selecciona tu rol para acceder a tu panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 4 Role Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 p-2 gap-1.5 border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('paciente');
              setUsername('');
              setPassword('');
              setError(null);
            }}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'paciente'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <UserCircle2 size={20} className={activeTab === 'paciente' ? 'text-medical-blue' : ''} />
            <span>Paciente</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('medico');
              setUsername('');
              setPassword('');
              setError(null);
            }}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'medico'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Stethoscope size={20} className={activeTab === 'medico' ? 'text-medical-blue' : ''} />
            <span>Médico</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('recepcionista');
              setUsername('');
              setPassword('');
              setError(null);
            }}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'recepcionista'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <UserCheck size={20} className={activeTab === 'recepcionista' ? 'text-medical-blue' : ''} />
            <span>Recepción</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setUsername('');
              setPassword('');
              setError(null);
            }}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'admin'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Shield size={20} className={activeTab === 'admin' ? 'text-medical-blue' : ''} />
            <span>Administrador</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PACIENTE */}
          {activeTab === 'paciente' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center py-4"
            >
              <div className="w-20 h-20 bg-blue-50 text-medical-blue rounded-full flex items-center justify-center mx-auto shadow-inner">
                <UserCircle2 size={48} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  Acceso para Pacientes
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Ingresa directamente como nuevo paciente para iniciar el flujo de reserva de cita médica presencial o teleconsulta.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-left text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
                <p className="font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-medical-green shrink-0" />
                  Búsqueda directa por distrito y sede
                </p>
                <p className="font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-medical-green shrink-0" />
                  Más de 20 especialidades y turnos en tiempo real
                </p>
                <p className="font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-medical-green shrink-0" />
                  Registro de datos limpios para cliente nuevo
                </p>
              </div>

              <button
                onClick={handlePatientDirectLogin}
                className="w-full max-w-md mx-auto py-5 bg-medical-green hover:bg-emerald-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-medical-green/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Acceder y Sacar Cita Ahora</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* TAB 2: MÉDICO */}
          {activeTab === 'medico' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-medical-blue">
                  Portal del Profesional Médico
                </p>
                <p className="text-slate-600 text-xs font-medium mt-0.5">
                  Ingresa tus credenciales para acceder a tu agenda del día y atención médica.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-medical-blue transition-all"
                    />
                    <Stethoscope size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-medical-blue transition-all"
                    />
                    <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-medical-blue hover:bg-blue-800 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ingresar a Portal Médico</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: RECEPCIONISTA */}
          {activeTab === 'recepcionista' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Módulo de Admisión y Recepción
                </p>
                <p className="text-slate-600 text-xs font-medium mt-0.5">
                  Ingresa tus credenciales para registrar pacientes, turnos y cobros.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-medical-green transition-all"
                    />
                    <UserCheck size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-medical-green transition-all"
                    />
                    <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-medical-green hover:bg-emerald-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ingresar a Módulo de Recepción</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 4: ADMINISTRADOR */}
          {activeTab === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-purple-900">
                  Panel de Administración Central
                </p>
                <p className="text-slate-600 text-xs font-medium mt-0.5">
                  Ingresa con tus credenciales de administrador para gestionar el sistema.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-purple-600 transition-all"
                    />
                    <Shield size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-800 font-bold outline-none focus:border-purple-600 transition-all"
                    />
                    <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-purple-800 hover:bg-purple-900 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ingresar como Administrador</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
