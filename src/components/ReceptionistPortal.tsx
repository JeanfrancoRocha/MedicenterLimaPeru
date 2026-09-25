import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  X,
  Stethoscope,
  DollarSign,
  Ticket,
  Printer,
  ShieldCheck,
  FileText,
  AlertCircle,
  Receipt,
  Layers
} from 'lucide-react';
import clsx from 'clsx';
import {
  AuthUser,
  AppointmentRecord,
  Doctor,
  initialDoctors,
} from '../data/medicenterData';
import { ReceiptModal } from './ReceiptModal';

interface ReceptionistPortalProps {
  currentUser: AuthUser;
  appointments: AppointmentRecord[];
  onAddAppointment: (apt: AppointmentRecord) => void;
  onUpdateAppointment: (apt: AppointmentRecord) => void;
  onGoToHome: () => void;
}

export const ReceptionistPortal: React.FC<ReceptionistPortalProps> = ({
  currentUser,
  appointments,
  onAddAppointment,
  onUpdateAppointment,
  onGoToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'recepcion' | 'cobros' | 'nueva_cita' | 'medicos'>('recepcion');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Payment Registration Modal State
  const [paymentModalApt, setPaymentModalApt] = useState<AppointmentRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Efectivo' | 'Tarjeta POS' | 'Yape / Plin' | 'Transferencia'>('Yape / Plin');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'Pagado' | 'Pendiente' | 'Exonerado'>('Pagado');

  // Symbolic Receipt Viewer Modal State
  const [receiptModalApt, setReceiptModalApt] = useState<AppointmentRecord | null>(null);

  // New walk-in appointment form state
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinDni, setWalkinDni] = useState<string>('');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [walkinDoctorId, setWalkinDoctorId] = useState<string>('');
  const [walkinTime, setWalkinTime] = useState<string>('09:00 AM');
  const [walkinDate, setWalkinDate] = useState<string>('Hoy');
  const [walkinSuccess, setWalkinSuccess] = useState<string | null>(null);
  const [walkinError, setWalkinError] = useState<string | null>(null);

  // Doctors in this specific sede
  const sedeDoctors = initialDoctors.filter(
    (d) => !currentUser.sede || d.hospital === currentUser.sede
  );

  // Filter appointments for this Sede
  const sedeAppointments = appointments.filter((apt) => {
    if (!currentUser.sede) return true;
    return apt.hospital === currentUser.sede || apt.district === currentUser.district;
  });

  const filteredAppointments = sedeAppointments.filter((apt) => {
    return (
      searchTerm === '' ||
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientDni.includes(searchTerm) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Action: Mark patient arrived into waiting room
  const handleMarkArrival = (apt: AppointmentRecord) => {
    onUpdateAppointment({
      ...apt,
      status: 'En sala de espera',
      history: [
        ...(apt.history || []),
        {
          action: 'Recepción Sede',
          timestamp: new Date().toISOString(),
          note: `Paciente ingresó a sala de espera en ${currentUser.sede}.`,
        },
      ],
    });
  };

  // Open Payment Registration Modal
  const handleOpenPaymentModal = (apt: AppointmentRecord) => {
    setPaymentModalApt(apt);
    setPaymentAmount(apt.amount || 100);
    setSelectedPaymentMethod(
      apt.paymentMethod === 'Pendiente' ? 'Yape / Plin' : (apt.paymentMethod as any) || 'Yape / Plin'
    );
    setSelectedPaymentStatus(apt.paymentStatus === 'Pendiente' ? 'Pagado' : apt.paymentStatus);
  };

  // Action: Confirm administrative payment and issue symbolic receipt
  const handleConfirmPayment = () => {
    if (!paymentModalApt) return;

    const receiptNum =
      paymentModalApt.receiptNumber ||
      `B001-${paymentModalApt.id.replace('APT-', '').padStart(6, '0')}`;

    const updatedApt: AppointmentRecord = {
      ...paymentModalApt,
      amount: paymentAmount,
      paymentStatus: selectedPaymentStatus,
      paymentMethod: selectedPaymentMethod,
      receiptNumber: receiptNum,
      receiptIssuedAt: new Date().toISOString(),
      history: [
        ...(paymentModalApt.history || []),
        {
          action: 'Cobro Administrativo Registrado',
          timestamp: new Date().toISOString(),
          note: `Cobro de S/. ${paymentAmount} registrado vía ${selectedPaymentMethod} (${selectedPaymentStatus}). Boleta ${receiptNum}.`,
        },
      ],
    };

    onUpdateAppointment(updatedApt);
    setPaymentModalApt(null);
    // Show receipt immediately so receptionist can print or verify
    setReceiptModalApt(updatedApt);
  };

  // Action: Handle Walk-in booking at front desk
  const handleCreateWalkinAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError(null);
    setWalkinSuccess(null);

    if (!walkinName.trim() || !walkinDni.trim() || !walkinPhone.trim()) {
      setWalkinError('Completa todos los datos personales del paciente.');
      return;
    }
    if (walkinDni.length !== 8) {
      setWalkinError('El DNI debe contener exactamente 8 dígitos.');
      return;
    }
    if (walkinPhone.length !== 9) {
      setWalkinError('El celular debe contener 9 dígitos.');
      return;
    }
    if (!walkinDoctorId) {
      setWalkinError('Selecciona el médico que atenderá al paciente.');
      return;
    }

    const doctor = sedeDoctors.find((d) => d.id === walkinDoctorId);
    if (!doctor) {
      setWalkinError('Médico no encontrado.');
      return;
    }

    const newApt: AppointmentRecord = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: walkinName,
      patientDni: walkinDni,
      patientPhone: walkinPhone,
      insurance: 'Particular',
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      district: doctor.district,
      date: walkinDate,
      time: walkinTime,
      status: 'En sala de espera', // Walk-ins go straight to waiting room
      consentAccepted: true,
      paymentStatus: 'Pendiente',
      paymentMethod: 'Pendiente',
      amount: 100,
      createdAt: new Date().toISOString(),
      history: [
        {
          action: 'Admisión Presencial',
          timestamp: new Date().toISOString(),
          note: `Registrado en ventanilla de ${currentUser.sede}. Pasa a sala de espera.`,
        },
      ],
    };

    onAddAppointment(newApt);
    setWalkinSuccess(`¡Cita emitida con éxito! Ticket ${newApt.id} asignado a sala de espera.`);
    setWalkinName('');
    setWalkinDni('');
    setWalkinPhone('');
  };

  // Total collected calculation
  const totalSedeCollected = sedeAppointments
    .filter((a) => a.paymentStatus === 'Pagado')
    .reduce((acc, curr) => acc + (curr.amount || 100), 0);

  const pendingPaymentsCount = sedeAppointments.filter(
    (a) => a.paymentStatus === 'Pendiente'
  ).length;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Reception Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-[3rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/20 shrink-0">
              <UserCheck size={38} className="text-emerald-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Building2 size={12} /> Módulo de Admisión & Caja Sede
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-white/80 font-bold text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-3">
                <span className="text-emerald-300 font-extrabold">{currentUser.sede || 'Sede Lima'}</span>
                <span>•</span>
                <span>Ventanilla: {currentUser.desk || 'Módulo 1'}</span>
                <span>•</span>
                <span>Turno: {currentUser.shift || 'Mañana (07:00 - 15:00)'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onGoToHome}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors border border-white/20 cursor-pointer self-start md:self-auto"
          >
            Ver Portal Público
          </button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Citas Sede Hoy
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {sedeAppointments.length}
            </p>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">
              En Sala de Espera
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
              {sedeAppointments.filter((a) => a.status === 'En sala de espera' || a.status === 'Llegó / En Espera').length}
            </p>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
              Pendientes de Cobro
            </p>
            <p className="text-2xl sm:text-3xl font-black text-blue-300 mt-0.5">
              {pendingPaymentsCount}
            </p>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
              Recaudación en Caja
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
              S/. {totalSedeCollected}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer on Administrative Payment Registration */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-black">Registro Administrativo de Cobros:</strong> Este módulo gestiona el registro asistencial de pagos (efectivo, POS o transferencias digitales) y la emisión de comprobantes simbólicos internos. Conforme al diseño del sistema, no procesa pasarelas bancarias directas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('recepcion')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'recepcion'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Calendar size={16} />
          <span>Admisión & Sala de Espera ({sedeAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cobros')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'cobros'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <DollarSign size={16} />
          <span>Cobros y Caja Administrativa</span>
        </button>

        <button
          onClick={() => setActiveTab('nueva_cita')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'nueva_cita'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <PlusCircle size={16} />
          <span>Agendar Cita Presencial</span>
        </button>

        <button
          onClick={() => setActiveTab('medicos')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'medicos'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Stethoscope size={16} />
          <span>Especialistas en Sede ({sedeDoctors.length})</span>
        </button>
      </div>

      {/* TAB 1: RECEPCIÓN Y SALA DE ESPERA */}
      {activeTab === 'recepcion' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cita por paciente, DNI o médico..."
              className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
            />
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => {
                const isPaid = apt.paymentStatus === 'Pagado';
                const isWaiting =
                  apt.status === 'En sala de espera' || apt.status === 'Llegó / En Espera';

                return (
                  <div
                    key={apt.id}
                    className={clsx(
                      'bg-white rounded-3xl border p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6',
                      isWaiting ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0 font-black">
                        <User size={26} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {apt.id}
                          </span>
                          <span
                            className={clsx(
                              'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                              isWaiting
                                ? 'bg-amber-100 text-amber-800'
                                : apt.status === 'Atendida' || apt.status === 'Atendido'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'En atención' || apt.status === 'En Consulta'
                                ? 'bg-blue-100 text-medical-blue animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {apt.status}
                          </span>

                          {/* Payment status badge */}
                          <span
                            className={clsx(
                              'text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1',
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            )}
                          >
                            {isPaid ? <CheckCircle2 size={10} /> : <CreditCard size={10} />}
                            {isPaid ? `Cobrado: S/. ${apt.amount || 100}` : 'Pago Pendiente'}
                          </span>
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-800">
                          {apt.patientName}
                        </h3>

                        <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-3">
                          <span>DNI: <strong className="text-slate-700">{apt.patientDni}</strong></span>
                          <span>•</span>
                          <span>Médico: <strong className="text-medical-blue">{apt.doctorName}</strong> ({apt.specialty})</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">{apt.date} • {apt.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Mark arrived if not yet in waiting room */}
                      {!isWaiting && apt.status !== 'Atendida' && apt.status !== 'Atendido' && (
                        <button
                          onClick={() => handleMarkArrival(apt)}
                          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <UserCheck size={14} />
                          <span>Pasar a Sala de Espera</span>
                        </button>
                      )}

                      {/* Payment Action */}
                      {!isPaid ? (
                        <button
                          onClick={() => handleOpenPaymentModal(apt)}
                          className="px-4 py-2.5 bg-medical-blue hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <DollarSign size={14} />
                          <span>Registrar Cobro</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptModalApt(apt)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Receipt size={14} />
                          <span>Ver Boleta Simbólica</span>
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
                  No se encontraron citas en esta sede.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRO ADMINISTRATIVO DE COBROS */}
      {activeTab === 'cobros' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  Caja y Registro de Cobros de la Sede
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Control de pagos de consultas asistenciales presenciales y comprobantes simbólicos
                </p>
              </div>

              <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Cobrado en Ventanilla
                </span>
                <span className="text-2xl font-black text-emerald-800">
                  S/. {totalSedeCollected}.00
                </span>
              </div>
            </div>

            {/* Table of Payments */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Cita ID</th>
                    <th className="pb-3">Paciente</th>
                    <th className="pb-3">Especialista</th>
                    <th className="pb-3">Monto</th>
                    <th className="pb-3">Método</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {sedeAppointments.map((apt) => {
                    const isPaid = apt.paymentStatus === 'Pagado';
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-mono font-bold text-slate-500">{apt.id}</td>
                        <td className="py-3.5 font-bold text-slate-900">
                          {apt.patientName}
                          <span className="block text-[10px] text-slate-400 font-normal">DNI: {apt.patientDni}</span>
                        </td>
                        <td className="py-3.5">{apt.doctorName}</td>
                        <td className="py-3.5 font-bold text-slate-900">S/. {apt.amount || 100}.00</td>
                        <td className="py-3.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                            {apt.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={clsx(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                              isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {apt.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => setReceiptModalApt(apt)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Receipt size={12} />
                              <span>Ver Boleta</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPaymentModal(apt)}
                              className="px-3 py-1.5 bg-medical-blue hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Cobrar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENDAR CITA PRESENCIAL (WALK-IN) */}
      {activeTab === 'nueva_cita' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-800">
              Admisión Presencial Rápida en Ventanilla
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Emite un ticket presencial e ingresa al paciente directamente a la sala de espera
            </p>
          </div>

          {walkinSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{walkinSuccess}</span>
            </div>
          )}

          {walkinError && (
            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{walkinError}</span>
            </div>
          )}

          <form onSubmit={handleCreateWalkinAppointment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="Nombres y Apellidos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={walkinDni}
                  onChange={(e) => setWalkinDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="44892104"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Celular WhatsApp (9 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={9}
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="987654321"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Especialista en {currentUser.sede}
              </label>
              <select
                value={walkinDoctorId}
                onChange={(e) => setWalkinDoctorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
              >
                <option value="">-- Seleccionar especialista --</option>
                {sedeDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Fecha
                </label>
                <select
                  value={walkinDate}
                  onChange={(e) => setWalkinDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
                >
                  <option value="Hoy">Hoy</option>
                  <option value="Mañana">Mañana</option>
                  <option value="20 May">20 May</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Hora
                </label>
                <select
                  value={walkinTime}
                  onChange={(e) => setWalkinTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 outline-none focus:border-medical-green"
                >
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
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Ticket size={18} />
              <span>Emitir Ticket Presencial e Ingresar a Espera</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: MÉDICOS EN ESTA SEDE */}
      {activeTab === 'medicos' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 text-lg">
                Cuerpo Médico de {currentUser.sede}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Especialistas asignados para atención presencial y consultorios físicos en esta sede.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-emerald-200">
              {sedeDoctors.length} Médicos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sedeDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="truncate flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base truncate">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-medical-blue font-bold">
                    {doc.specialty}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {doc.cmp}
                  </p>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-md inline-block mt-1">
                    Consultorio Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRO ADMINISTRATIVO DE COBRO */}
      <AnimatePresence>
        {paymentModalApt && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentModalApt(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 font-bold">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">
                      Registro de Cobro
                    </h3>
                    <p className="text-xs text-slate-500">
                      Paciente: {paymentModalApt.patientName} (DNI: {paymentModalApt.patientDni})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentModalApt(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Amount Input */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Importe / Monto (S/.)
                </label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-slate-400">S/.</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="text-3xl font-black text-medical-blue w-28 text-center bg-transparent outline-none border-b-2 border-slate-300 focus:border-medical-blue"
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {paymentModalApt.specialty} • {paymentModalApt.doctorName}
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Efectivo', 'Tarjeta POS', 'Yape / Plin', 'Transferencia'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={clsx(
                        'p-3 rounded-2xl text-xs font-black transition-all cursor-pointer text-center border-2',
                        selectedPaymentMethod === method
                          ? 'bg-medical-blue text-white border-medical-blue shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Estado del Registro:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pagado', 'Pendiente', 'Exonerado'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedPaymentStatus(status)}
                      className={clsx(
                        'p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border',
                        selectedPaymentStatus === status
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalApt(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Registrar Cobro & Emitir Boleta</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: COMPROBANTE SIMBÓLICO DE PAGO */}
      <ReceiptModal
        appointment={receiptModalApt}
        onClose={() => setReceiptModalApt(null)}
      />
    </div>
  );
};
