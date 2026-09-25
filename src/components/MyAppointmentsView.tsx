import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Stethoscope,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import clsx from 'clsx';
import {
  AppointmentRecord,
  AppointmentStatus,
  Doctor,
  getDoctorSlotStatus,
  SlotAvailabilityStatus
} from '../data/medicenterData';

interface MyAppointmentsViewProps {
  appointments: AppointmentRecord[];
  doctors: Doctor[];
  patientDni?: string;
  onCancelAppointment: (appointmentId: string, reason: string) => void;
  onReprogramAppointment: (
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => void;
  onGoToBooking: () => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  appointments,
  doctors,
  patientDni = '44892104',
  onCancelAppointment,
  onReprogramAppointment,
  onGoToBooking,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [cancelModalAppointment, setCancelModalAppointment] =
    useState<AppointmentRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(
    'Incompatibilidad de horario laboral'
  );

  const [reprogramModalAppointment, setReprogramModalAppointment] =
    useState<AppointmentRecord | null>(null);
  const [reprogramDateIdx, setReprogramDateIdx] = useState<number>(0);
  const [reprogramSelectedTime, setReprogramSelectedTime] = useState<string | null>(
    null
  );

  const [detailModalAppointment, setDetailModalAppointment] =
    useState<AppointmentRecord | null>(null);

  // Filter appointments for the patient (or all if testing)
  const patientAppointments = appointments.filter((apt) => {
    // If patient DNI matches or if testing default Stefania
    const isPatient =
      apt.patientDni === patientDni ||
      apt.patientName.toLowerCase().includes('stefania') ||
      patientDni === '';
    return isPatient;
  });

  const filteredAppointments = patientAppointments.filter((apt) => {
    // Status filter
    if (filterStatus === 'SOLICITADAS' && apt.status !== 'Solicitada') return false;
    if (filterStatus === 'CONFIRMADAS' && apt.status !== 'Confirmada') return false;
    if (filterStatus === 'REPROGRAMADAS' && apt.status !== 'Reprogramada')
      return false;
    if (filterStatus === 'CANCELADAS' && apt.status !== 'Cancelada') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoctor = apt.doctorName.toLowerCase().includes(q);
      const matchSpec = apt.specialty.toLowerCase().includes(q);
      const matchSede = apt.hospital.toLowerCase().includes(q);
      const matchId = apt.id.toLowerCase().includes(q);
      if (!matchDoctor && !matchSpec && !matchSede && !matchId) return false;
    }

    return true;
  });

  // Doctor for reprogramming modal
  const doctorForReprogram = reprogramModalAppointment
    ? doctors.find((d) => d.id === reprogramModalAppointment.doctorId) || null
    : null;

  const reprogramCurrentDay = doctorForReprogram?.availability[reprogramDateIdx];

  // Helper for Status Badges according to State Diagram
  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Solicitada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            1. Solicitada
          </span>
        );
      case 'Confirmada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            2. Confirmada
          </span>
        );
      case 'Reprogramada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw size={13} />
            3. Reprogramada
          </span>
        );
      case 'Cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalAppointment) return;
    onCancelAppointment(cancelModalAppointment.id, cancelReason);
    setCancelModalAppointment(null);
  };

  const handleConfirmReprogram = () => {
    if (
      !reprogramModalAppointment ||
      !reprogramCurrentDay ||
      !reprogramSelectedTime
    )
      return;
    onReprogramAppointment(
      reprogramModalAppointment.id,
      reprogramCurrentDay.date,
      reprogramSelectedTime
    );
    setReprogramModalAppointment(null);
    setReprogramSelectedTime(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-medical-blue mb-2">
            <CalendarCheck size={14} /> Gestión de Citas Registradas
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Mis Citas Médicas
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitorea el estado de tus citas, reprograma turnos o cancela según tu disponibilidad.
          </p>
        </div>

        <button
          onClick={onGoToBooking}
          className="px-6 py-3.5 bg-medical-green text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-medical-green/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <span>Nueva Cita</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* STATE LIFECYCLE DIAGRAM */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-medical-blue" />
            Diagrama de Estados del Ciclo de Vida de la Cita
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Reglas de Transición
          </span>
        </div>

        {/* Visual State Diagram Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* State 1 */}
          <div className="bg-sky-50/70 border-2 border-sky-200 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                1. Solicitada
              </span>
              <span className="text-[10px] font-bold bg-white text-sky-700 px-2 py-0.5 rounded-full">
                Inicial
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Cita registrada por el paciente. El cupo queda reservado y protegido con 0% solapamiento.
            </p>
          </div>

          {/* State 2 */}
          <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-600" />
                2. Confirmada
              </span>
              <span className="text-[10px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full">
                Aprobada
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Validada por la sede o médico. El paciente asiste en la fecha y hora seleccionadas.
            </p>
          </div>

          {/* State 3 */}
          <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <RotateCcw size={12} className="text-amber-600" />
                3. Reprogramada
              </span>
              <span className="text-[10px] font-bold bg-white text-amber-700 px-2 py-0.5 rounded-full">
                Modificada
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Cambio de fecha/hora. El horario anterior se libera al instante para otros pacientes.
            </p>
          </div>

          {/* State 4 */}
          <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <XCircle size={12} className="text-rose-600" />
                Cancelada
              </span>
              <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full">
                Final
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Cita dada de baja. El turno vuelve al estado <strong>Disponible</strong> inmediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'TODAS', label: 'Todas', count: patientAppointments.length },
            {
              id: 'SOLICITADAS',
              label: 'Solicitadas',
              count: patientAppointments.filter((a) => a.status === 'Solicitada')
                .length,
            },
            {
              id: 'CONFIRMADAS',
              label: 'Confirmadas',
              count: patientAppointments.filter((a) => a.status === 'Confirmada')
                .length,
            },
            {
              id: 'REPROGRAMADAS',
              label: 'Reprogramadas',
              count: patientAppointments.filter((a) => a.status === 'Reprogramada')
                .length,
            },
            {
              id: 'CANCELADAS',
              label: 'Canceladas',
              count: patientAppointments.filter((a) => a.status === 'Cancelada')
                .length,
            },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                  isActive
                    ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    'px-1.5 py-0.2 rounded-full text-[10px]',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar por médico o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-medical-blue"
          />
        </div>
      </div>

      {/* Appointment Cards Grid */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarCheck size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800">
            No tienes citas en esta categoría
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto font-medium">
            Puedes agendar una nueva cita en cualquiera de nuestras 22 especialidades médicas.
          </p>
          <button
            onClick={onGoToBooking}
            className="px-8 py-3.5 bg-medical-blue text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-medical-blue/20 hover:scale-105 transition-all cursor-pointer"
          >
            Sacar Cita Ahora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const canCancelOrReprogram =
              apt.status === 'Solicitada' ||
              apt.status === 'Confirmada' ||
              apt.status === 'Reprogramada';

            return (
              <div
                key={apt.id}
                className={clsx(
                  'bg-white rounded-[2rem] p-6 border transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6',
                  apt.status === 'Cancelada'
                    ? 'border-slate-200/60 opacity-80'
                    : 'border-slate-100'
                )}
              >
                {/* Doctor & Appointment Details */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0 font-black text-lg">
                    <Stethoscope size={24} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {apt.id}
                      </span>
                      {renderStatusBadge(apt.status)}
                      {apt.consentAccepted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ShieldCheck size={11} /> Consentimiento Digital Aceptado
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-800">
                      {apt.doctorName}
                    </h3>

                    <p className="text-xs font-bold text-medical-blue">
                      {apt.specialty}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-medical-blue" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock size={13} className="text-medical-blue" />
                        {apt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="text-slate-400" />
                        {apt.hospital} ({apt.district})
                      </span>
                    </div>

                    {/* Notice if reprogrammed */}
                    {apt.reprogrammedFrom && (
                      <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl inline-block mt-2">
                        Reprogramada anteriormente de fecha: {apt.reprogrammedFrom.date} a las {apt.reprogrammedFrom.time}
                      </p>
                    )}

                    {/* Notice if canceled */}
                    {apt.cancellationReason && (
                      <p className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl inline-block mt-2">
                        Motivo de cancelación: {apt.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => setDetailModalAppointment(apt)}
                    className="px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Ver Ticket</span>
                  </button>

                  {canCancelOrReprogram && (
                    <>
                      <button
                        onClick={() => {
                          setReprogramModalAppointment(apt);
                          setReprogramDateIdx(0);
                          setReprogramSelectedTime(null);
                        }}
                        className="px-4 py-2.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        <span>Reprogramar</span>
                      </button>

                      <button
                        onClick={() => {
                          setCancelModalAppointment(apt);
                          setCancelReason('Incompatibilidad de horario laboral');
                        }}
                        className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle size={14} />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CANCELAR CITA */}
      <AnimatePresence>
        {cancelModalAppointment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-800">
                  ¿Deseas cancelar esta cita médica?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {cancelModalAppointment.doctorName} • {cancelModalAppointment.date} a las {cancelModalAppointment.time}
                </p>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-rose-800">
                  Importante sobre la cancelación:
                </p>
                <p>
                  El cupo reservado quedará liberado automáticamente para que otro paciente pueda atenderse. Puedes reprogramar si prefieres otra fecha.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Motivo de la cancelación:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:border-medical-blue"
                >
                  <option value="Incompatibilidad de horario laboral">
                    Incompatibilidad de horario laboral
                  </option>
                  <option value="Problemas de transporte o distancia">
                    Problemas de transporte o distancia
                  </option>
                  <option value="Mejoría en el estado de salud">
                    Mejoría en el estado de salud
                  </option>
                  <option value="Atención en otra sede o centro">
                    Atención en otra sede o centro
                  </option>
                  <option value="Motivos personales / fuerza mayor">
                    Motivos personales / fuerza mayor
                  </option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCancelModalAppointment(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3.5 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Sí, Cancelar Cita
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REPROGRAMAR CITA */}
      <AnimatePresence>
        {reprogramModalAppointment && doctorForReprogram && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Reprogramar Cita
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {doctorForReprogram.name} • {doctorForReprogram.specialty}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReprogramModalAppointment(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider">
                  Cita Actual:
                </p>
                <p className="font-extrabold text-slate-800">
                  {reprogramModalAppointment.date} a las {reprogramModalAppointment.time} ({reprogramModalAppointment.hospital})
                </p>
              </div>

              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-medical-blue" />
                  Selecciona la nueva fecha:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {doctorForReprogram.availability.map((day, idx) => {
                    const isSelected = reprogramDateIdx === idx;
                    return (
                      <button
                        key={day.date}
                        onClick={() => {
                          setReprogramDateIdx(idx);
                          setReprogramSelectedTime(null);
                        }}
                        className={clsx(
                          'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all border-2 shrink-0 cursor-pointer',
                          isSelected
                            ? 'bg-medical-blue text-white border-medical-blue shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {day.date}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots with Real-time Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Horarios en tiempo real:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black">
                    0% citas solapadas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {reprogramCurrentDay?.times.map((slot) => {
                    const status = getDoctorSlotStatus(
                      doctorForReprogram,
                      reprogramCurrentDay.date,
                      slot.time,
                      appointments
                    );
                    const isAvailable = status === 'Disponible';
                    const isSelected = reprogramSelectedTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        disabled={!isAvailable}
                        onClick={() => setReprogramSelectedTime(slot.time)}
                        className={clsx(
                          'p-3 rounded-xl border-2 text-center text-xs font-bold transition-all flex flex-col items-center justify-center',
                          isAvailable
                            ? isSelected
                              ? 'bg-medical-green text-white border-medical-green font-black shadow-md cursor-pointer'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-medical-green cursor-pointer'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        )}
                      >
                        <span>{slot.time}</span>
                        <span
                          className={clsx(
                            'text-[9px] uppercase font-black tracking-wider mt-0.5 px-1.5 py-0.2 rounded-full',
                            isAvailable
                              ? isSelected
                                ? 'bg-white/20 text-white'
                                : 'text-emerald-700 bg-emerald-50'
                              : 'text-slate-500 bg-slate-200'
                          )}
                        >
                          {status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirmation Action */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setReprogramModalAppointment(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  disabled={!reprogramSelectedTime}
                  onClick={handleConfirmReprogram}
                  className={clsx(
                    'flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                    reprogramSelectedTime
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  )}
                >
                  <RotateCcw size={14} />
                  <span>Confirmar Reprogramación</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: VER TICKET / FICHA DIGITAL */}
      <AnimatePresence>
        {detailModalAppointment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center font-black">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      Ticket de Admisión Médica
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {detailModalAppointment.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDetailModalAppointment(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-slate-400 font-bold block">Paciente:</span>
                    <span className="font-extrabold text-slate-800">
                      {detailModalAppointment.patientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">DNI:</span>
                    <span className="font-extrabold text-slate-800">
                      {detailModalAppointment.patientDni}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Celular:</span>
                    <span className="font-extrabold text-slate-800">
                      {detailModalAppointment.patientPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Seguro:</span>
                    <span className="font-extrabold text-slate-800">
                      {detailModalAppointment.insurance || 'Particular'}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Médico:</span>
                    <span className="font-black text-medical-blue">
                      {detailModalAppointment.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Especialidad:</span>
                    <span className="font-extrabold text-slate-700">
                      {detailModalAppointment.specialty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Fecha y Hora:</span>
                    <span className="font-black text-slate-800">
                      {detailModalAppointment.date} a las {detailModalAppointment.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Sede:</span>
                    <span className="font-extrabold text-slate-700">
                      {detailModalAppointment.hospital}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-bold">Estado Actual:</span>
                    {renderStatusBadge(detailModalAppointment.status)}
                  </div>
                </div>

                {/* Consentimiento Informado Cert */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-black text-emerald-800">
                      Consentimiento Informado Aceptado Digitalmente
                    </p>
                    <p className="text-slate-600 font-medium">
                      Conforme a la Ley General de Salud N° 26842 y Ley N° 29733. Registrado en el sistema.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailModalAppointment(null)}
                className="w-full py-3.5 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
