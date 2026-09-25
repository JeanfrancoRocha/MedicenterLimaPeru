import React from 'react';
import { Activity, Eye, EyeOff, LogIn, LogOut, UserCircle2, Shield, Stethoscope, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import { AuthUser } from '../data/medicenterData';

interface HeaderProps {
  highContrast: boolean;
  onToggleContrast: () => void;
  onLogoClick?: () => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  highContrast,
  onToggleContrast,
  onLogoClick,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const getRoleBadge = (role: AuthUser['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            <Shield size={14} /> Admin
          </span>
        );
      case 'medico':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-medical-blue border border-blue-200">
            <Stethoscope size={14} /> Médico
          </span>
        );
      case 'recepcionista':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck size={14} /> Recepción
          </span>
        );
      case 'paciente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <UserCircle2 size={14} /> Paciente
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-medical-blue rounded-xl p-1 shrink-0 cursor-pointer"
          aria-label="Ir al inicio de MEDICENTER"
        >
          <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center text-white shadow-md shadow-medical-blue/20">
            <Activity size={24} />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-medical-blue block leading-none">
              MEDICENTER
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">
              Red Médica Lima
            </span>
          </div>
        </button>

        {/* Action Controls: Accessibility + LOGIN side-by-side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Modo Accesibilidad */}
          <button
            onClick={onToggleContrast}
            className={clsx(
              'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[42px] outline-none focus-visible:ring-2 focus-visible:ring-medical-blue cursor-pointer',
              highContrast
                ? 'bg-black text-white hover:bg-slate-900 border border-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            aria-label={
              highContrast
                ? 'Desactivar modo alto contraste'
                : 'Activar modo alto contraste'
            }
          >
            {highContrast ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="hidden md:inline font-semibold text-xs sm:text-sm">
              Modo Accesibilidad
            </span>
          </button>

          {/* User Status / LOGIN button */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full pl-3 pr-1.5 py-1">
              <div className="hidden sm:flex items-center gap-2">
                {getRoleBadge(currentUser.role)}
                <span className="text-xs font-bold text-slate-700 max-w-[130px] truncate">
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black uppercase tracking-wider bg-medical-blue text-white hover:bg-blue-800 shadow-md shadow-medical-blue/20 transition-all duration-200 min-h-[42px] outline-none focus-visible:ring-4 focus-visible:ring-medical-blue/30 cursor-pointer"
              aria-label="Iniciar Sesión"
            >
              <LogIn size={18} />
              <span>LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
