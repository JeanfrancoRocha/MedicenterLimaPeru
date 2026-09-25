import React from 'react';
import { motion } from 'motion/react';
import { Video, Mic, ShieldCheck, Check, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Doctor } from '../data/medicenterData';

interface TeleWaitingViewProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor) => void;
  onStart: () => void;
  onCancel: () => void;
}

export const TeleWaitingView: React.FC<TeleWaitingViewProps> = ({
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onStart,
  onCancel,
}) => {
  const tips = [
    {
      icon: <Video className="text-medical-blue" size={24} />,
      text: 'Asegúrate de estar en un lugar iluminado para que el doctor pueda verte bien.',
    },
    {
      icon: <Mic className="text-medical-blue" size={24} />,
      text: 'Usa audífonos si es posible para evitar el eco y ruidos externos.',
    },
    {
      icon: <ShieldCheck className="text-medical-blue" size={24} />,
      text: 'Tu información y video están protegidos bajo protocolos de seguridad médica.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 flex flex-col min-h-[80vh] space-y-8"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Cita Virtual
        </h1>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
          aria-label="Cancelar y volver"
        >
          <X size={24} className="text-slate-400" />
        </button>
      </div>

      {/* Select Specialist */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-medical-green animate-pulse" />
          <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest leading-none pt-1">
            Selecciona un Especialista Disponible
          </h2>
        </div>

        <div
          className="grid grid-cols-1 gap-6"
          role="radiogroup"
          aria-label="Selecciona un médico disponible"
        >
          {doctors.map((doc) => {
            const isSelected = selectedDoctor?.id === doc.id;

            return (
              <button
                key={doc.id}
                onClick={() => onSelectDoctor(doc)}
                role="radio"
                aria-checked={isSelected}
                className={clsx(
                  'relative p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 text-left group outline-none focus-visible:ring-4 focus-visible:ring-medical-blue/30 cursor-pointer',
                  isSelected
                    ? 'bg-medical-blue text-white border-medical-blue shadow-2xl shadow-medical-blue/40 scale-[1.02]'
                    : 'bg-white text-slate-800 border-slate-100 hover:border-medical-blue/30 hover:bg-slate-50'
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-medical-blue shadow-lg">
                    <Check size={20} strokeWidth={4} />
                  </div>
                )}

                <div className="relative shrink-0">
                  <img
                    src={doc.image}
                    alt={`Médico ${doc.name}, ${doc.specialty}`}
                    className={clsx(
                      'w-28 h-28 rounded-[2rem] object-cover transition-all duration-500',
                      isSelected
                        ? 'ring-4 ring-white/30 scale-110'
                        : 'grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105'
                    )}
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-medical-green rounded-full border-4 border-white shadow-sm" />
                </div>

                <div className="flex-1">
                  <p
                    className={clsx(
                      'text-[10px] font-black uppercase tracking-[0.2em] mb-1',
                      isSelected ? 'text-medical-green' : 'text-medical-blue'
                    )}
                  >
                    Disponible Ahora
                  </p>
                  <p className="font-black text-2xl tracking-tight leading-none mb-2">
                    {doc.name}
                  </p>
                  <p
                    className={clsx(
                      'text-sm font-bold',
                      isSelected ? 'text-white/80' : 'text-slate-500'
                    )}
                  >
                    {doc.specialty} • {doc.reviewCount} pacientes atendidos
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preparation summary or placeholder */}
      {selectedDoctor ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-medical-blue/5 rounded-[2.5rem] p-6 border border-medical-blue/10 space-y-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
              Resumen de Preparación
            </span>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 border border-white">
              <span className="text-[10px] font-black text-medical-blue uppercase">
                Hoy 15:00 PM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white"
              >
                <div className="shrink-0">{item.icon}</div>
                <p className="text-slate-600 text-[11px] leading-tight font-bold">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="w-full bg-medical-green text-white font-black uppercase tracking-[0.2em] py-5 rounded-[1.5rem] flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-medical-green/40 active:scale-[0.98] transition-all min-h-[64px] cursor-pointer"
          >
            <span>
              Iniciar Videollamada con {selectedDoctor.name.split(' ')[1] || selectedDoctor.name}
            </span>
            <ArrowRight size={20} />
          </button>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-3">
          <Video className="text-slate-200" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Por favor selecciona un médico para continuar
          </p>
        </div>
      )}
    </motion.div>
  );
};
