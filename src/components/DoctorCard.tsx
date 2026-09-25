import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Star, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import {
  Doctor,
  AppointmentRecord,
  getDoctorSlotStatus,
  SlotAvailabilityStatus
} from '../data/medicenterData';

interface DoctorCardProps {
  doctor: Doctor;
  appointments?: AppointmentRecord[];
  onSelect: (doctor: Doctor, time: string, date: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  appointments = [],
  onSelect,
}) => {
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const currentAvailability = doctor.availability[selectedDateIdx];

  const handleDateChange = (idx: number) => {
    setSelectedDateIdx(idx);
    setSelectedTime(null);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      {/* Doctor Info */}
      <div className="flex gap-6">
        <div className="relative shrink-0">
          <img
            src={doctor.image}
            alt={`Fotografía del ${doctor.name}, especialista en ${doctor.specialty}`}
            className="w-24 h-24 rounded-3xl object-cover ring-8 ring-slate-50"
          />
          <div className="absolute -bottom-1 -right-1 bg-medical-green w-6 h-6 rounded-full border-4 border-white shadow-sm" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {doctor.cmp}
            </span>
            <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-0.5 rounded-xl">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-700">
                {doctor.rating}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">
            {doctor.name}
          </h3>
          <p className="text-sm text-medical-blue font-bold uppercase tracking-widest mt-1">
            {doctor.specialty}
          </p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-semibold italic">
            {doctor.hospital}
          </p>
        </div>
      </div>

      {/* Agenda & Time Slots */}
      <div className="space-y-5 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-800 text-sm font-black uppercase tracking-widest">
            <Calendar size={18} className="text-medical-blue" />
            <span>Agenda Médica en Tiempo Real</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <ShieldCheck size={11} /> 0% Citas Solapadas
          </span>
        </div>

        {/* Horizontal Dates */}
        <div
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
          role="group"
          aria-label="Seleccionar fecha de cita"
        >
          {doctor.availability.map((day, idx) => (
            <button
              key={day.date}
              onClick={() => handleDateChange(idx)}
              aria-pressed={selectedDateIdx === idx}
              className={clsx(
                'flex flex-col items-center min-w-[85px] py-3 px-4 rounded-[1.5rem] text-xs font-bold transition-all border-2 outline-none focus-visible:ring-4 focus-visible:ring-medical-blue/30 cursor-pointer shrink-0',
                selectedDateIdx === idx
                  ? 'bg-medical-blue text-white border-medical-blue shadow-lg shadow-medical-blue/30 scale-105'
                  : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
              )}
            >
              <span className="text-sm font-black">{day.date}</span>
            </button>
          ))}
        </div>

        {/* Status Badges Legend */}
        <div className="flex flex-wrap gap-3 px-1 pb-1">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Clock size={11} className="text-amber-600" />
            <span>Reservado</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
            <Lock size={11} />
            <span>No disponible</span>
          </div>
        </div>

        {/* Time Grid with Real-time Status Badges */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          role="group"
          aria-label={`Horarios disponibles para ${currentAvailability?.date}`}
        >
          {currentAvailability?.times.map((slot) => {
            const status: SlotAvailabilityStatus = getDoctorSlotStatus(
              doctor,
              currentAvailability.date,
              slot.time,
              appointments
            );
            const isAvailable = status === 'Disponible';
            const isReserved = status === 'Reservado';
            const isSelected = selectedTime === slot.time;

            return (
              <button
                key={slot.time}
                disabled={!isAvailable}
                onClick={() => setSelectedTime(slot.time)}
                aria-pressed={isSelected}
                aria-label={`${slot.time} - ${status}`}
                className={clsx(
                  'relative py-3.5 px-2 rounded-2xl text-xs font-black transition-all min-h-[58px] flex flex-col items-center justify-center border-2 outline-none',
                  isAvailable
                    ? isSelected
                      ? 'bg-medical-green text-white border-medical-green shadow-lg shadow-medical-green/20 scale-105 cursor-pointer'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-medical-green hover:shadow-sm cursor-pointer'
                    : isReserved
                    ? 'bg-amber-50/70 text-amber-800 border-amber-200 cursor-not-allowed opacity-80'
                    : 'bg-slate-50 text-slate-400 border-slate-200/60 cursor-not-allowed opacity-60'
                )}
              >
                <span>{slot.time}</span>
                <span
                  className={clsx(
                    'text-[9px] font-extrabold uppercase tracking-wider mt-1 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5',
                    isAvailable
                      ? isSelected
                        ? 'bg-white/20 text-white'
                        : 'text-emerald-700 bg-emerald-50'
                      : isReserved
                      ? 'text-amber-800 bg-amber-100'
                      : 'text-slate-500 bg-slate-100'
                  )}
                >
                  {status}
                </span>
              </button>
            );
          })}

          {(!currentAvailability || currentAvailability.times.length === 0) && (
            <div
              className="col-span-full py-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
              role="status"
            >
              <p className="text-sm text-slate-400 font-bold italic">
                No hay horarios disponibles para esta fecha.
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Button when slot selected */}
        {selectedTime && currentAvailability && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelect(doctor, selectedTime, currentAvailability.date)}
            className="w-full py-5 bg-medical-green text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-medical-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Reservar para {selectedTime}</span>
            <Clock size={20} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
