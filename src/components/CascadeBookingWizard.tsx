import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  UserCheck,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Filter,
  Search,
  RotateCcw,
  Sparkles,
  Building2,
  MapPin,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import {
  Doctor,
  AppointmentRecord,
  specialties,
  getDoctorSlotStatus,
  SlotAvailabilityStatus
} from '../data/medicenterData';

interface CascadeBookingWizardProps {
  doctors: Doctor[];
  appointments: AppointmentRecord[];
  onSelectSlot: (doctor: Doctor, time: string, date: string) => void;
  initialSpecialty?: string;
  initialDoctorId?: string;
}

export const CascadeBookingWizard: React.FC<CascadeBookingWizardProps> = ({
  doctors,
  appointments,
  onSelectSlot,
  initialSpecialty = '',
  initialDoctorId = '',
}) => {
  // 3-Level Cascade States
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty || specialties[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || '');
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Search filter for specialties
  const [specSearch, setSpecSearch] = useState<string>('');

  // 1. Filtered Specialties
  const filteredSpecialties = useMemo(() => {
    return specialties.filter((s) =>
      s.toLowerCase().includes(specSearch.toLowerCase())
    );
  }, [specSearch]);

  // 2. Cascade: Doctors for chosen specialty (5 doctors per specialty)
  const doctorsInSpecialty = useMemo(() => {
    if (!selectedSpecialty) return [];
    return doctors.filter(
      (doc) => doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
    );
  }, [doctors, selectedSpecialty]);

  // Auto-select first doctor in specialty if currently selected doctor does not belong to specialty
  const activeDoctor = useMemo(() => {
    if (!doctorsInSpecialty.length) return null;
    const found = doctorsInSpecialty.find((d) => d.id === selectedDoctorId);
    return found || doctorsInSpecialty[0];
  }, [doctorsInSpecialty, selectedDoctorId]);

  // Update selectedDoctorId when specialty changes if not matched
  const handleSelectSpecialty = (spec: string) => {
    setSelectedSpecialty(spec);
    const docs = doctors.filter(
      (d) => d.specialty.toLowerCase() === spec.toLowerCase()
    );
    if (docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
    }
    setSelectedTime(null);
  };

  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctorId(doc.id);
    setSelectedTime(null);
  };

  // 3. Cascade: Agenda & Real-time Slots for chosen Doctor & Date
  const currentDateSchedule = activeDoctor?.availability[selectedDateIdx];
  const currentDate = currentDateSchedule?.date || 'Hoy';

  // Compute real-time slots with badges
  const slotsWithStatus = useMemo(() => {
    if (!activeDoctor || !currentDateSchedule) return [];
    return currentDateSchedule.times.map((slot) => {
      const status: SlotAvailabilityStatus = getDoctorSlotStatus(
        activeDoctor,
        currentDateSchedule.date,
        slot.time,
        appointments
      );
      return {
        time: slot.time,
        status,
      };
    });
  }, [activeDoctor, currentDateSchedule, appointments]);

  const availableCount = slotsWithStatus.filter((s) => s.status === 'Disponible').length;
  const reservedCount = slotsWithStatus.filter((s) => s.status === 'Reservado').length;
  const unavailableCount = slotsWithStatus.filter((s) => s.status === 'No disponible').length;

  return (
    <div className="space-y-10">
      {/* Cascade Header */}
      <div className="bg-gradient-to-r from-medical-blue to-blue-700 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-medical-blue/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md">
              <Sparkles size={14} className="text-yellow-300" />
              Filtro Dinámico en Cascada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Especialidad → Médico → Horario
            </h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Selecciona en orden progresivo con verificación de disponibilidad en tiempo real y garantía de 0% citas solapadas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-green text-white flex items-center justify-center font-black">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="block text-[11px] font-black uppercase tracking-wider text-green-300">
                0% Citas Solapadas
              </span>
              <span className="block text-xs font-semibold text-white/90">
                Bloqueo Inmediato de Cupos
              </span>
            </div>
          </div>
        </div>

        {/* Cascade Breadcrumbs / Step Navigator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="w-7 h-7 rounded-full bg-white text-medical-blue text-xs font-black flex items-center justify-center shrink-0">
              1
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Especialidad</span>
              <span className="text-xs font-black truncate block text-white">
                {selectedSpecialty || 'Seleccionar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="w-7 h-7 rounded-full bg-white text-medical-blue text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Especialista</span>
              <span className="text-xs font-black truncate block text-white">
                {activeDoctor?.name || 'Seleccionar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="w-7 h-7 rounded-full bg-white text-medical-blue text-xs font-black flex items-center justify-center shrink-0">
              3
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Horario en Tiempo Real</span>
              <span className="text-xs font-black truncate block text-white">
                {selectedTime ? `${currentDate} • ${selectedTime}` : 'Elegir turno disponible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CASCADE LEVEL 1: ESPECIALIDAD */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-black text-sm">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Paso 1: Selecciona la Especialidad Médica
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                {specialties.length} especialidades disponibles con 5 médicos certificados en cada una
              </p>
            </div>
          </div>

          {/* Quick Specialty Search */}
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={specSearch}
              onChange={(e) => setSpecSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-medical-blue focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Specialty Selector Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto p-1 border border-slate-100 rounded-3xl bg-slate-50/50">
          {filteredSpecialties.map((spec) => {
            const isSelected = selectedSpecialty.toLowerCase() === spec.toLowerCase();
            return (
              <button
                key={spec}
                onClick={() => handleSelectSpecialty(spec)}
                className={clsx(
                  'flex flex-col items-start p-3 rounded-2xl text-left border-2 transition-all cursor-pointer relative group',
                  isSelected
                    ? 'bg-white border-medical-blue shadow-md shadow-medical-blue/10 ring-2 ring-medical-blue/20'
                    : 'bg-white border-transparent hover:border-slate-200 text-slate-600'
                )}
              >
                <div
                  className={clsx(
                    'w-7 h-7 rounded-xl flex items-center justify-center mb-2 transition-colors',
                    isSelected ? 'bg-medical-blue text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-medical-blue'
                  )}
                >
                  <Stethoscope size={16} />
                </div>
                <span className={clsx('text-xs font-bold leading-tight block line-clamp-2', isSelected ? 'text-medical-blue' : 'text-slate-700')}>
                  {spec}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  5 médicos
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-medical-blue" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* CASCADE LEVEL 2: MÉDICO / ESPECIALISTA */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-black text-sm">
            2
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">
              Paso 2: Elige a tu Médico en {selectedSpecialty}
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Mostrando los 5 especialistas asignados con sus sedes hospitalarias
            </p>
          </div>
        </div>

        {/* Doctor Cards Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorsInSpecialty.map((doc) => {
            const isSelected = activeDoctor?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => handleSelectDoctor(doc)}
                className={clsx(
                  'p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative bg-white',
                  isSelected
                    ? 'border-medical-blue ring-4 ring-medical-blue/10 shadow-lg shadow-medical-blue/10'
                    : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                )}
              >
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-medical-green w-4 h-4 rounded-full border-2 border-white shadow-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {doc.cmp}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star size={12} className="fill-amber-400" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-sm mt-1 truncate">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] font-bold text-medical-blue truncate">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      {doc.district}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]">
                    {doc.hospital}
                  </span>
                  <span
                    className={clsx(
                      'text-xs font-bold px-3 py-1 rounded-full transition-colors',
                      isSelected
                        ? 'bg-medical-blue text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    )}
                  >
                    {isSelected ? 'Seleccionado' : 'Elegir'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CASCADE LEVEL 3: HORARIOS DISPONIBLES EN TIEMPO REAL */}
      {activeDoctor && (
        <section className="space-y-6 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  Paso 3: Horario y Disponibilidad en Tiempo Real
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Agenda del <span className="font-bold text-slate-700">{activeDoctor.name}</span> ({activeDoctor.hospital})
                </p>
              </div>
            </div>

            {/* Badges Legend */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ({availableCount})
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Reservado ({reservedCount})
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                <Lock size={10} />
                No disponible ({unavailableCount})
              </span>
            </div>
          </div>

          {/* Date Selector Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-medical-blue" />
              Selecciona Fecha de Atención
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {activeDoctor.availability.map((day, idx) => {
                const isSelected = selectedDateIdx === idx;
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDateIdx(idx);
                      setSelectedTime(null);
                    }}
                    className={clsx(
                      'flex flex-col items-center min-w-[95px] py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border-2 outline-none cursor-pointer shrink-0',
                      isSelected
                        ? 'bg-medical-blue text-white border-medical-blue shadow-lg shadow-medical-blue/20 scale-105'
                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <span className="text-sm font-black">{day.date}</span>
                    <span className="text-[10px] font-semibold opacity-80 mt-0.5">
                      {idx === 0 ? 'Turnos hoy' : idx === 1 ? 'Turnos mañana' : 'Disponible'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid with Real-time Badges */}
          <div className="bg-slate-50/70 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Turnos para {currentDate}:</span>
              <span className="text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full font-black text-[11px]">
                {availableCount} horarios libres
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {slotsWithStatus.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.status === 'Disponible';
                const isReserved = slot.status === 'Reservado';
                const isUnavailable = slot.status === 'No disponible';

                return (
                  <button
                    key={slot.time}
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(slot.time)}
                    className={clsx(
                      'p-4 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center relative min-h-[72px] outline-none',
                      isAvailable
                        ? isSelected
                          ? 'bg-medical-green text-white border-medical-green shadow-xl shadow-medical-green/30 scale-105 cursor-pointer font-black'
                          : 'bg-white border-slate-200/80 text-slate-800 hover:border-medical-green hover:shadow-md cursor-pointer'
                        : isReserved
                        ? 'bg-amber-50/80 border-amber-200 text-amber-800 cursor-not-allowed opacity-75'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    )}
                  >
                    <span className="text-sm font-black">{slot.time}</span>
                    
                    {/* Status Badge */}
                    <span
                      className={clsx(
                        'text-[10px] font-extrabold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                        isAvailable
                          ? isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                          : isReserved
                          ? 'bg-amber-200/80 text-amber-900'
                          : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 size={10} />
                          Disponible
                        </>
                      ) : isReserved ? (
                        <>
                          <Clock size={10} />
                          Reservado
                        </>
                      ) : (
                        <>
                          <Lock size={10} />
                          No disp.
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Strict 0% overlap guarantee message */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="text-medical-green shrink-0" size={20} />
              <p className="text-xs text-slate-500 font-medium">
                <strong className="text-slate-800">Protección Anti-Solapamiento:</strong> El sistema bloquea el cupo inmediatamente tras la confirmación de la cita, imposibilitando citas duplicadas o superpuestas.
              </p>
            </div>
          </div>

          {/* Action Button */}
          {selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border-2 border-medical-green shadow-xl shadow-medical-green/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-medical-green block">
                  Turno Seleccionado
                </span>
                <h4 className="text-lg font-black text-slate-800">
                  {currentDate} a las {selectedTime} con {activeDoctor.name}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  {activeDoctor.specialty} • {activeDoctor.hospital} ({activeDoctor.district})
                </p>
              </div>

              <button
                onClick={() => onSelectSlot(activeDoctor, selectedTime, currentDate)}
                className="px-8 py-4 bg-medical-green text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-medical-green/30 hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continuar a Admisión del Paciente</span>
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </section>
      )}
    </div>
  );
};
