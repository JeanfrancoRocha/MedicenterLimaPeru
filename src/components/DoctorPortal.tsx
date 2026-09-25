import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  FileEdit,
  X,
  Building2,
  Hospital,
  ShieldCheck,
  Search,
  Activity,
  FileText,
  Printer,
  HeartPulse,
  AlertCircle,
  Pill,
  Thermometer,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ClipboardList,
  FileCheck
} from 'lucide-react';
import clsx from 'clsx';
import {
  AuthUser,
  Doctor,
  AppointmentRecord,
  AppointmentStatus,
  initialDoctors,
  VitalSigns,
} from '../data/medicenterData';

interface DoctorPortalProps {
  currentUser: AuthUser;
  appointments: AppointmentRecord[];
  onUpdateAppointment: (updated: AppointmentRecord) => void;
  onGoToHome: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  currentUser,
  appointments,
  onUpdateAppointment,
  onGoToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'horario' | 'colegas'>('agenda');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchPatient, setSearchPatient] = useState<string>('');

  // Clinical Modal States (Atención y Ficha Clínica)
  const [attendingApt, setAttendingApt] = useState<AppointmentRecord | null>(null);
  const [isViewOnly, setIsViewOnly] = useState<boolean>(false);

  // Form Fields for Ficha Clínica
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [clinicalObservations, setClinicalObservations] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [prescription, setPrescription] = useState<string>('');

  // Vital Signs
  const [bloodPressure, setBloodPressure] = useState<string>('120/80');
  const [heartRate, setHeartRate] = useState<string>('74');
  const [temperature, setTemperature] = useState<string>('36.7');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('99');
  const [weight, setWeight] = useState<string>('68');
  const [height, setHeight] = useState<string>('1.65');

  // Filter appointments for this doctor
  const myAppointments = appointments.filter((apt) => {
    return (
      apt.doctorId === currentUser.doctorId ||
      apt.doctorName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      apt.specialty === currentUser.specialty
    );
  });

  // Map internal statuses to the 3 canonical states requested:
  // "En sala de espera" | "En atención" | "Atendida"
  const getNormalizedStatus = (status: AppointmentStatus): 'En sala de espera' | 'En atención' | 'Atendida' | 'Programada' => {
    if (status === 'En sala de espera' || status === 'Llegó / En Espera' || status === 'Pendiente') {
      return 'En sala de espera';
    }
    if (status === 'En atención' || status === 'En Consulta') {
      return 'En atención';
    }
    if (status === 'Atendida' || status === 'Atendido') {
      return 'Atendida';
    }
    return 'Programada';
  };

  const filteredAppointments = myAppointments.filter((apt) => {
    const norm = getNormalizedStatus(apt.status);

    if (statusFilter === 'espera' && norm !== 'En sala de espera') return false;
    if (statusFilter === 'atencion' && norm !== 'En atención') return false;
    if (statusFilter === 'atendida' && norm !== 'Atendida') return false;

    if (searchPatient.trim()) {
      const q = searchPatient.toLowerCase();
      const matchName = apt.patientName.toLowerCase().includes(q);
      const matchDni = apt.patientDni.includes(q);
      if (!matchName && !matchDni) return false;
    }

    return true;
  });

  // KPI Counters
  const countInWaitingRoom = myAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'En sala de espera'
  ).length;

  const countInAttention = myAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'En atención'
  ).length;

  const countAttended = myAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'Atendida'
  ).length;

  // Actions
  const handleMoveToWaitingRoom = (apt: AppointmentRecord) => {
    onUpdateAppointment({
      ...apt,
      status: 'En sala de espera',
      history: [
        ...(apt.history || []),
        {
          action: 'Ingreso a Sala de Espera',
          timestamp: new Date().toISOString(),
          note: 'Paciente ingresó a sala de espera del consultorio.',
        },
      ],
    });
  };

  const handleStartConsultation = (apt: AppointmentRecord) => {
    onUpdateAppointment({
      ...apt,
      status: 'En atención',
      history: [
        ...(apt.history || []),
        {
          action: 'Inicio de Consulta',
          timestamp: new Date().toISOString(),
          note: 'Médico llamó al paciente. Consulta médica en atención.',
        },
      ],
    });
    // Open clinical record modal automatically
    handleOpenFicha(apt, false);
  };

  const handleOpenFicha = (apt: AppointmentRecord, viewOnly: boolean = false) => {
    setAttendingApt(apt);
    setIsViewOnly(viewOnly);

    // Populate existing or defaults
    setMedicalHistory(
      apt.medicalHistory ||
        '• Niega alergias medicamentosas conocidas.\n• Niega cirugías previas de relevancia.\n• Antecedentes familiares: HTA controlada.'
    );
    setClinicalObservations(
      apt.clinicalObservations ||
        'Paciente acude refiriendo cuadro de 3 días de evolución. Buen estado general, lúcido y orientado en tiempo, espacio y persona (LOTEP). Sin signos de alarma agudos.'
    );
    setDiagnosis(
      apt.diagnosis ||
        (apt.specialty === 'Cardiología'
          ? 'I10 - Hipertensión esencial (primaria) - En control'
          : apt.specialty === 'Pediatría'
          ? 'J00 - Rinofaringitis aguda (resfriado común)'
          : apt.specialty === 'Dermatología'
          ? 'L20 - Dermatitis atópica leve'
          : 'Z00.0 - Examen médico general de rutina')
    );
    setPrescription(
      apt.prescription ||
        '1. Hidratación adecuada (2L de agua al día).\n2. Paracetamol 500mg VO c/8h por 3 días si hay dolor/malestar.\n3. Reposo relativo y control de signos vitales.'
    );

    if (apt.vitalSigns) {
      setBloodPressure(apt.vitalSigns.bloodPressure || '120/80');
      setHeartRate(apt.vitalSigns.heartRate || '74');
      setTemperature(apt.vitalSigns.temperature || '36.7');
      setOxygenSaturation(apt.vitalSigns.oxygenSaturation || '99');
      setWeight(apt.vitalSigns.weight || '68');
      setHeight(apt.vitalSigns.height || '1.65');
    } else {
      setBloodPressure('120/80');
      setHeartRate('74');
      setTemperature('36.7');
      setOxygenSaturation('99');
      setWeight('68');
      setHeight('1.65');
    }
  };

  const handleSaveFicha = () => {
    if (!attendingApt) return;

    const vitalSignsData: VitalSigns = {
      bloodPressure,
      heartRate,
      temperature,
      oxygenSaturation,
      weight,
      height,
    };

    const updated: AppointmentRecord = {
      ...attendingApt,
      status: 'Atendida',
      diagnosis: diagnosis || 'Evaluación médica completada sin novedades.',
      clinicalObservations: clinicalObservations || 'Examen físico dentro de parámetros esperados.',
      medicalHistory: medicalHistory || 'Sin antecedentes patológicos declarados.',
      prescription: prescription || 'Indicaciones de estilo de vida saludable y control regular.',
      vitalSigns: vitalSignsData,
      attendedAt: new Date().toISOString(),
      history: [
        ...(attendingApt.history || []),
        {
          action: 'Atención Completada',
          timestamp: new Date().toISOString(),
          note: `Ficha clínica y receta médica registradas por ${currentUser.name}.`,
        },
      ],
    };

    onUpdateAppointment(updated);
    setAttendingApt(null);
  };

  // Find other doctors in the same specialty
  const specialtyColleagues = initialDoctors.filter(
    (d) => d.specialty === currentUser.specialty && d.id !== currentUser.doctorId
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-medical-blue via-blue-900 to-indigo-950 text-white rounded-[3rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/20 shrink-0 shadow-inner">
              <Stethoscope size={38} className="text-medical-green" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-medical-green/20 text-medical-green border border-medical-green/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <ShieldCheck size={12} /> Módulo Asistencial Oficial
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-white/80 font-bold text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-3">
                <span className="text-emerald-400 font-extrabold">{currentUser.specialty}</span>
                <span>•</span>
                <span>{currentUser.cmp || 'CMP-45892'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Hospital size={14} /> {currentUser.hospital || 'Sede Lima'}
                </span>
                <span>•</span>
                <span className="text-yellow-300 font-bold">Consultorio 302</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={onGoToHome}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors border border-white/20 cursor-pointer"
            >
              Ver Portal Público
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Total Turnos Hoy
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {myAppointments.length}
            </p>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              En sala de espera
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
              {countInWaitingRoom}
            </p>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 flex items-center gap-1">
              <Activity size={10} className="text-blue-300" />
              En atención
            </p>
            <p className="text-2xl sm:text-3xl font-black text-blue-300 mt-0.5">
              {countInAttention}
            </p>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-300" />
              Atendidas
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
              {countAttended}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('agenda')}
          className={clsx(
            'px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'agenda'
              ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Calendar size={16} />
          <span>Agenda del Día (Turnos: {myAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('horario')}
          className={clsx(
            'px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'horario'
              ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Clock size={16} />
          <span>Mis Horarios y Consultorio</span>
        </button>

        <button
          onClick={() => setActiveTab('colegas')}
          className={clsx(
            'px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'colegas'
              ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Building2 size={16} />
          <span>Especialistas de {currentUser.specialty} ({specialtyColleagues.length})</span>
        </button>
      </div>

      {/* TAB 1: AGENDA DEL DÍA (LISTA DE TURNOS CON ESTADOS) */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          {/* Controls: Search and Status Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                placeholder="Buscar por paciente o DNI..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-medical-blue"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>

            {/* Filter Pills with Requested States */}
            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'todos', label: 'Todos los turnos', count: myAppointments.length },
                { id: 'espera', label: 'En sala de espera', count: countInWaitingRoom },
                { id: 'atencion', label: 'En atención', count: countInAttention },
                { id: 'atendida', label: 'Atendida', count: countAttended },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5',
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={clsx(
                      'px-1.5 py-0.2 rounded-full text-[10px]',
                      statusFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List of Doctor's Daily Appointment Slots */}
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt, idx) => {
                const normStatus = getNormalizedStatus(apt.status);

                return (
                  <div
                    key={apt.id}
                    className={clsx(
                      'bg-white rounded-3xl border p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6',
                      normStatus === 'En atención'
                        ? 'border-blue-400 ring-4 ring-blue-50'
                        : normStatus === 'En sala de espera'
                        ? 'border-amber-200 bg-amber-50/10'
                        : 'border-slate-100'
                    )}
                  >
                    {/* Patient & Slot Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={clsx(
                          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-sm',
                          normStatus === 'En atención'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : normStatus === 'En sala de espera'
                            ? 'bg-amber-100 text-amber-800'
                            : normStatus === 'Atendida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        <User size={26} />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {apt.id}
                          </span>

                          {/* EXACT 3 REQUESTED STATES */}
                          {normStatus === 'En sala de espera' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              En sala de espera
                            </span>
                          )}

                          {normStatus === 'En atención' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-medical-blue border border-blue-200">
                              <Activity size={13} className="animate-spin" />
                              En atención
                            </span>
                          )}

                          {normStatus === 'Atendida' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} />
                              Atendida
                            </span>
                          )}

                          {normStatus === 'Programada' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              {apt.status}
                            </span>
                          )}

                          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                            Seguro: {apt.insurance || 'Particular'}
                          </span>
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-800">
                          {apt.patientName}
                        </h3>

                        <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-3">
                          <span>DNI: <strong className="text-slate-700">{apt.patientDni}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {apt.patientPhone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-medical-blue">
                            <Clock size={12} /> {apt.date} • {apt.time}
                          </span>
                        </div>

                        {/* Quick Clinical Diagnosis Snippet if Attended */}
                        {apt.diagnosis && (
                          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-0.5">
                            <p className="font-bold text-slate-900">
                              <span className="text-medical-blue">Dx:</span> {apt.diagnosis}
                            </p>
                            {apt.prescription && (
                              <p className="text-[11px] text-slate-500 truncate">
                                <strong>Receta:</strong> {apt.prescription}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons to Transition Through States */}
                    <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Case 1: Programmed / Solicitada -> Allow passing to Waiting Room */}
                      {normStatus === 'Programada' && (
                        <button
                          onClick={() => handleMoveToWaitingRoom(apt)}
                          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Clock size={14} />
                          <span>Pasar a Sala de Espera</span>
                        </button>
                      )}

                      {/* Case 2: In Waiting Room -> Call to Attention */}
                      {normStatus === 'En sala de espera' && (
                        <button
                          onClick={() => handleStartConsultation(apt)}
                          className="px-5 py-3 bg-medical-blue hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-medical-blue/20 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Activity size={16} />
                          <span>Llamar a Consulta (Iniciar Atención)</span>
                        </button>
                      )}

                      {/* Case 3: In Attention -> Complete Clinical Record & Prescription */}
                      {normStatus === 'En atención' && (
                        <button
                          onClick={() => handleOpenFicha(apt, false)}
                          className="px-5 py-3 bg-medical-green hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-medical-green/30 transition-all cursor-pointer flex items-center gap-2 animate-bounce"
                        >
                          <FileEdit size={16} />
                          <span>Registrar Ficha Clínica & Atender</span>
                        </button>
                      )}

                      {/* Case 4: Attended -> View/Print Ficha Clínica */}
                      {normStatus === 'Atendida' && (
                        <button
                          onClick={() => handleOpenFicha(apt, true)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText size={14} />
                          <span>Ver Ficha Clínica</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-bold text-base">
                  No hay turnos registrados en este filtro.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Los pacientes agendados para hoy aparecerán aquí en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HORARIO Y CONSULTORIO */}
      {activeTab === 'horario' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Horarios Asignados y Consultorio
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                Sede oficial: {currentUser.hospital} ({currentUser.district || 'Lima'})
              </p>
            </div>
            <span className="text-xs font-bold text-medical-green bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start">
              <Building2 size={14} /> Consultorio Asignado: N° 302 (Pabellón B)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              '08:00 AM',
              '09:00 AM',
              '10:00 AM',
              '11:00 AM',
              '12:00 PM',
              '01:00 PM',
              '02:00 PM',
              '03:00 PM',
              '04:00 PM',
              '05:00 PM',
            ].map((slot) => (
              <div
                key={slot}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2"
              >
                <p className="font-black text-sm text-slate-800">{slot}</p>
                <span className="inline-block text-[10px] font-bold text-medical-blue bg-blue-50 px-2 py-0.5 rounded">
                  45 min / Turno
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COLEGAS DE LA ESPECIALIDAD */}
      {activeTab === 'colegas' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 text-lg">
                Cuerpo Médico de {currentUser.specialty}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                5 especialistas activos en Lima para interconsultas y derivaciones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialtyColleagues.map((colleague) => (
              <div
                key={colleague.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
              >
                <img
                  src={colleague.image}
                  alt={colleague.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="truncate flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base truncate">
                    {colleague.name}
                  </h4>
                  <p className="text-xs text-medical-blue font-bold">
                    {colleague.cmp}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {colleague.hospital}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL ASISTENCIAL: ATENCIÓN Y FICHA CLÍNICA (DIAGNÓSTICO, OBSERVACIONES Y ANTECEDENTES) */}
      <AnimatePresence>
        {attendingApt && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAttendingApt(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto my-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-medical-green font-bold shrink-0">
                    <ClipboardList size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-medical-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Ficha Médica Electrónica
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {attendingApt.id}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-800 text-xl mt-0.5">
                      {isViewOnly ? 'Ficha Clínica del Paciente' : 'Atención y Registro Clínico'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setAttendingApt(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Paciente
                  </span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {attendingApt.patientName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    DNI
                  </span>
                  <span className="font-mono font-extrabold text-slate-800 text-sm">
                    {attendingApt.patientDni}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Seguro
                  </span>
                  <span className="font-bold text-slate-800">
                    {attendingApt.insurance || 'Particular'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Hora de Cita
                  </span>
                  <span className="font-bold text-medical-blue">
                    {attendingApt.date} • {attendingApt.time}
                  </span>
                </div>
              </div>

              {/* Triaje / Signos Vitales */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-rose-500" />
                  Signos Vitales y Triaje
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">P/A (mmHg)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Pulso (lpm)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Temp (°C)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Sat O2 (%)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Peso (kg)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Talla (m)</span>
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="font-bold text-xs w-full bg-transparent outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields: Antecedentes, Observaciones, Diagnóstico y Receta */}
              <div className="space-y-4">
                {/* 1. ANTECEDENTES */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ClipboardList size={14} className="text-medical-blue" />
                      1. Antecedentes Médicos y Quirúrgicos:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold lowercase">
                      (patologías, alergias, antecedentes familiares)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    disabled={isViewOnly}
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Registrar antecedentes patológicos, alergias medicamentosas, cirugías previas..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:border-medical-blue focus:bg-white transition-all font-medium leading-relaxed"
                  />
                </div>

                {/* 2. OBSERVACIONES CLÍNICAS */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope size={14} className="text-medical-blue" />
                      2. Observaciones Clínicas y Examen Físico:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold lowercase">
                      (anamnesis, sintomatología, hallazgos)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    disabled={isViewOnly}
                    value={clinicalObservations}
                    onChange={(e) => setClinicalObservations(e.target.value)}
                    placeholder="Observaciones de la evaluación presencial, signos clínicos, evolución..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:border-medical-blue focus:bg-white transition-all font-medium leading-relaxed"
                  />
                </div>

                {/* 3. DIAGNÓSTICO CLÍNICO */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FileCheck size={14} className="text-medical-blue" />
                      3. Diagnóstico Clínico (CIE-10 / Diagnóstico Principal):
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full font-bold">
                      CIE-10 Oficial
                    </span>
                  </label>
                  <input
                    type="text"
                    disabled={isViewOnly}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Ej: I10 - Hipertensión esencial primaria"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-blue focus:bg-white transition-all"
                  />
                </div>

                {/* 4. TRATAMIENTO Y RECETA MÉDICA */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Pill size={14} className="text-medical-blue" />
                      4. Plan Terapéutico y Receta Farmacológica:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold lowercase">
                      (medicación, dosis, recomendaciones)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    disabled={isViewOnly}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Detalle de medicamentos, posología, pautas de alarma y próxima cita de control..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:border-medical-blue focus:bg-white transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Doctor Stamp & Signature Footer */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-black text-slate-800">{currentUser.name}</p>
                  <p className="text-slate-500 font-bold">
                    Especialista en {currentUser.specialty} • {currentUser.cmp || 'CMP-45892'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Firma Médica Digital Válida
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAttendingApt(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isViewOnly ? 'Cerrar Ficha' : 'Regresar a la Lista'}
                </button>

                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={handleSaveFicha}
                    className="flex-2 py-3.5 bg-medical-green hover:bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-medical-green/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>Guardar Ficha y Marcar Atendida</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
