import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Doctor } from '../data/medicenterData';

interface ConfirmationViewProps {
  doctor: Doctor;
  time: string;
  date: string;
  onFinish: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  doctor,
  time,
  date,
  onFinish,
}) => {
  const formattedDate =
    date === 'Hoy' ? 'Hoy, 25 Sep' : date === 'Mañana' ? 'Mañana, 26 Sep' : date;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center"
      role="main"
    >
      <div
        className="w-20 h-20 bg-medical-green text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-medical-green/20"
        aria-hidden="true"
      >
        <CheckCircle2 size={40} />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Cita Reservada!</h2>
      <p className="text-slate-500 mb-4 max-w-[280px]">
        Hemos confirmado tu cita con éxito. El doctor te espera.
      </p>

      <div className="bg-medical-green/10 text-medical-green px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
        Confirmación enviada vía WhatsApp
      </div>

      <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 space-y-6 text-left shadow-sm mb-10">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Resumen de Cita
          </h3>
          <span
            className="bg-medical-green/10 text-medical-green text-[10px] font-bold px-2 py-1 rounded"
            role="status"
          >
            Activo
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-medical-blue">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Médico Especialista</p>
              <p className="font-bold text-slate-700">{doctor.name}</p>
              <p className="text-xs text-slate-500">{doctor.specialty}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-medical-blue">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Fecha y Hora</p>
              <p className="font-bold text-slate-700">{formattedDate}</p>
              <p className="text-sm font-semibold text-medical-blue flex items-center gap-1">
                <Clock size={14} /> {time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-medical-blue">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Ubicación</p>
              <p className="font-bold text-slate-700">Centro Médico Medicenter</p>
              <p className="text-xs text-slate-500">{doctor.district}, Lima</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onFinish}
          className="flex-1 bg-medical-blue text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-medical-blue/20 min-h-[56px] cursor-pointer"
        >
          <span>Finalizar y Volver al Inicio</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
