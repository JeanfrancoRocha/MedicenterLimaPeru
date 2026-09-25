import React from 'react';
import { motion } from 'motion/react';
import { House, Calendar, CalendarCheck, Stethoscope, UserCheck, Shield } from 'lucide-react';
import clsx from 'clsx';
import { AuthUser } from '../data/medicenterData';

export type AppStep =
  | 'HOME'
  | 'SEARCH'
  | 'DOCTOR_LIST'
  | 'PRE_CONFIRMATION'
  | 'CONFIRMATION'
  | 'MY_APPOINTMENTS'
  | 'TELE_WAITING'
  | 'TELE_ACTIVE'
  | 'DOCTOR_PORTAL'
  | 'RECEPTIONIST_PORTAL'
  | 'ADMIN_PORTAL';

interface BottomNavProps {
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  currentUser: AuthUser | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentStep,
  onNavigate,
  currentUser,
}) => {
  const isBookingActive = [
    'SEARCH',
    'DOCTOR_LIST',
    'PRE_CONFIRMATION',
    'CONFIRMATION',
  ].includes(currentStep);

  const navItems: { id: AppStep; icon: React.ReactNode; label: string; isActive?: boolean }[] = [
    {
      id: 'HOME',
      icon: <House size={22} />,
      label: 'Inicio',
      isActive: currentStep === 'HOME',
    },
    {
      id: 'SEARCH',
      icon: <Calendar size={22} />,
      label: 'Sacar Cita',
      isActive: isBookingActive,
    },
  ];

  // If user has specific role, add portal quick link
  if (currentUser?.role === 'medico') {
    navItems.push({
      id: 'DOCTOR_PORTAL',
      icon: <Stethoscope size={22} />,
      label: 'Mi Portal Médico',
      isActive: currentStep === 'DOCTOR_PORTAL',
    });
  } else if (currentUser?.role === 'recepcionista') {
    navItems.push({
      id: 'RECEPTIONIST_PORTAL',
      icon: <UserCheck size={22} />,
      label: 'Admisión Sede',
      isActive: currentStep === 'RECEPTIONIST_PORTAL',
    });
  } else if (currentUser?.role === 'admin') {
    navItems.push({
      id: 'ADMIN_PORTAL',
      icon: <Shield size={22} />,
      label: 'Panel General',
      isActive: currentStep === 'ADMIN_PORTAL',
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isCurrent =
          item.isActive !== undefined ? item.isActive : currentStep === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              'flex flex-col items-center gap-1 min-h-[48px] min-w-[80px] transition-all relative pt-2 focus-visible:bg-slate-50 focus-visible:ring-0 outline-none cursor-pointer',
              isCurrent
                ? 'text-medical-blue font-black'
                : 'text-slate-400 hover:text-slate-600'
            )}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {isCurrent && (
              <motion.div
                layoutId="navIndicator"
                className="absolute top-[-2px] w-8 h-1 bg-medical-blue rounded-full"
              />
            )}
            {item.icon}
            <span
              className={clsx(
                'text-[11px] font-bold uppercase tracking-wider transition-all',
                isCurrent ? 'opacity-100 font-extrabold' : 'opacity-80'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
