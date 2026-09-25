import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  Clock,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Mail,
  HeartPulse,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import clsx from 'clsx';
import { Doctor } from '../data/medicenterData';
import { AlertBanner } from './AlertBanner';

interface PreConfirmationViewProps {
  doctor: Doctor;
  time: string;
  date: string;
  onConfirm: (patientData: {
    dni: string;
    phone: string;
    name: string;
    email: string;
    insurance: string;
    consentAccepted: boolean;
    signatureData?: string;
  }) => void;
  onBack: () => void;
  defaultDni?: string;
  defaultPhone?: string;
  defaultName?: string;
  defaultEmail?: string;
}

export const PreConfirmationView: React.FC<PreConfirmationViewProps> = ({
  doctor,
  time,
  date,
  onConfirm,
  onBack,
  defaultDni = '',
  defaultPhone = '',
  defaultName = '',
  defaultEmail = '',
}) => {
  // Form State - Starts completely clean for new clients
  const [name, setName] = useState<string>(defaultName);
  const [dni, setDni] = useState<string>(defaultDni);
  const [phone, setPhone] = useState<string>(defaultPhone);
  const [email, setEmail] = useState<string>(defaultEmail);
  const [insurance, setInsurance] = useState<string>('Particular');
  const [gender, setGender] = useState<string>('Femenino');
  const [age, setAge] = useState<string>('');

  // Digital Informed Consent State
  const [consentMedical, setConsentMedical] = useState<boolean>(true);
  const [consentDataProtection, setConsentDataProtection] = useState<boolean>(true);
  const [showFullTerms, setShowFullTerms] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  // DNI Validation: strictly 8 digits
  const isDniValid = /^\d{8}$/.test(dni);

  // Phone Validation: 9 digits
  const isPhoneValid = /^\d{9}$/.test(phone);

  // Name Validation
  const isNameValid = name.trim().length >= 3;

  // Email Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Consent Validation
  const isConsentValid = consentMedical && consentDataProtection;

  const handleDniChange = (val: string) => {
    // Only numbers, max 8 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    setDni(cleaned);
  };

  const handlePhoneChange = (val: string) => {
    // Only numbers, max 9 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 9);
    setPhone(cleaned);
  };

  const handleSubmit = () => {
    if (!isNameValid) {
      setError('Por favor, ingresa el nombre y apellido completos del paciente.');
      return;
    }
    if (!isDniValid) {
      setError('El Documento de Identidad (DNI) debe contener exactamente 8 dígitos numéricos.');
      return;
    }
    if (!isPhoneValid) {
      setError('El número de celular debe contener exactamente 9 dígitos.');
      return;
    }
    if (!isEmailValid) {
      setError('Por favor, ingresa un correo electrónico válido para recibir tu comprobante.');
      return;
    }
    if (!isConsentValid) {
      setError('Debes aceptar los términos obligatorios de Consentimiento Informado Digital.');
      return;
    }

    setError(null);

    onConfirm({
      name,
      dni,
      phone,
      email,
      insurance,
      consentAccepted: true,
    });
  };

  const formattedDate =
    date === 'Hoy' ? 'Hoy, 25 Sep' : date === 'Mañana' ? 'Mañana, 26 Sep' : date;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto"
    >
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-500 hover:text-medical-blue transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-medical-blue rounded-full px-2 outline-none cursor-pointer"
          aria-label="Volver a la selección de horario"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-medical-blue/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-black text-xs uppercase tracking-[0.2em]">
            Volver a Horarios
          </span>
        </button>
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FileCheck size={14} /> Admisión & Consentimiento Digital
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Registro / Admisión de Paciente
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Completa los datos de identificación oficial con DNI y acepta el consentimiento informado de atención médica.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 sm:p-10 space-y-10">
          {/* Doctor Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-5">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shrink-0 shadow-sm"
              />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Médico Especialista
                </span>
                <h3 className="text-xl font-black text-slate-800 leading-tight">
                  {doctor.name}
                </h3>
                <p className="text-medical-blue font-bold text-xs uppercase tracking-wider mt-0.5">
                  {doctor.specialty} • {doctor.cmp}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Building2 size={13} /> {doctor.hospital}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 space-y-1 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Turno Asignado
              </span>
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                <Calendar size={14} className="text-medical-blue" />
                <span>{formattedDate}</span>
                <span>•</span>
                <Clock size={14} className="text-medical-blue" />
                <span>{time}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                0% Solapamiento Asegurado
              </span>
            </div>
          </div>

          {/* SECTION 1: FORMULARIO DE ADMISIÓN CON DNI */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-medical-blue flex items-center justify-center font-black text-xs">
                1
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Datos de Identidad y Filiación del Paciente
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-medical-blue" />
                  Nombre Completo del Paciente
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombres y Apellidos"
                  className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                />
              </div>

              {/* DNI con Validación Estricta de 8 Dígitos */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-medical-blue" />
                    Documento de Identidad (DNI)
                  </label>
                  {/* Real-time Badge */}
                  <span
                    className={clsx(
                      'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1',
                      isDniValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : dni.length === 0
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-rose-100 text-rose-700'
                    )}
                  >
                    {isDniValid ? (
                      <>
                        <CheckCircle2 size={11} /> DNI Válido (8 dígitos)
                      </>
                    ) : (
                      <>
                        <AlertCircle size={11} /> {dni.length}/8 dígitos
                      </>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                  placeholder="8 dígitos numéricos"
                  className={clsx(
                    'w-full bg-slate-50 border-2 rounded-2xl p-4 text-base font-black text-slate-700 outline-none transition-all tracking-widest',
                    isDniValid
                      ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/20'
                      : dni.length > 0
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200/70 focus:border-medical-blue'
                  )}
                />
              </div>

              {/* Celular WhatsApp (9 dígitos) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} className="text-medical-blue" />
                    Celular WhatsApp (9 dígitos)
                  </label>
                  <span
                    className={clsx(
                      'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                      isPhoneValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {isPhoneValid ? '✓ Correcto' : `${phone.length}/9 dígitos`}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all tracking-wider"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-medical-blue" />
                  Correo Electrónico (Notificaciones)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                />
              </div>

              {/* Seguro de Salud */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse size={14} className="text-medical-blue" />
                  Cobertura / Seguro de Salud
                </label>
                <select
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
                >
                  <option value="Particular">Particular / Sin Seguro</option>
                  <option value="Rímac EPS">Rímac Seguros & EPS</option>
                  <option value="Pacífico EPS">Pacífico Seguros EPS</option>
                  <option value="Sanitas EPS">Sanitas EPS Perú</option>
                  <option value="EsSalud">EsSalud (Acreditado)</option>
                  <option value="SIS">SIS (Seguro Integral de Salud)</option>
                </select>
              </div>

              {/* Género y Edad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Género
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Edad
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200/70 focus:border-medical-blue focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONSENTIMIENTO INFORMADO DIGITAL */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Consentimiento Informado Digital
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Cumplimiento normativo Ley General de Salud N° 26842 y Ley N° 29733 de Protección de Datos Personales
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullTerms(!showFullTerms)}
                className="text-xs font-black text-medical-blue flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{showFullTerms ? 'Ocultar cláusulas' : 'Leer cláusulas completas'}</span>
                {showFullTerms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Expandable Legal Terms */}
            {showFullTerms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3 leading-relaxed"
              >
                <p className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  Términos y Declaración Jurada Digital:
                </p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    <strong>Autonomía y Acto Médico:</strong> Declaro de manera voluntaria haber sido informado/a sobre el alcance de la consulta presencial y/o teleconsulta médica, comprendiendo que el profesional colegiado actuará bajo los principios de la ética médica peruana.
                  </li>
                  <li>
                    <strong>Historia Clínica Electrónica:</strong> Autorizo la incorporación y resguardo seguro de mis antecedentes clínicos, diagnósticos y recetas en el repositorio digital confidencial de MEDICENTER.
                  </li>
                  <li>
                    <strong>Tratamiento de Datos Sensibles:</strong> De acuerdo con la Ley N° 29733, autorizo el tratamiento de mis datos de contacto para la gestión asistencial, recordatorios de citas y seguimiento preventivo.
                  </li>
                </ol>
              </motion.div>
            )}

            {/* Mandatory Checkboxes */}
            <div className="space-y-3.5">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={consentMedical}
                  onChange={(e) => setConsentMedical(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded text-medical-blue focus:ring-medical-blue border-slate-300 cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold text-slate-700 leading-snug">
                  <strong className="text-slate-900 block mb-0.5">
                    Consentimiento para el Acto Médico Asistencial (Obligatorio)
                  </strong>
                  Otorgo mi consentimiento informado para la evaluación médica presencial o teleorientación por parte del especialista asignado conforme a los protocolos del Ministerio de Salud (MINSA).
                </span>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={consentDataProtection}
                  onChange={(e) => setConsentDataProtection(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded text-medical-blue focus:ring-medical-blue border-slate-300 cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold text-slate-700 leading-snug">
                  <strong className="text-slate-900 block mb-0.5">
                    Tratamiento de Datos Personales en Salud (Obligatorio)
                  </strong>
                  Autorizo el almacenamiento en Historia Clínica y el envío del ticket, confirmación de cita y recetas médicas a mi número de WhatsApp y correo consignados.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && <AlertBanner message={error} onClear={() => setError(null)} />}
          </div>

          {/* Confirm Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={!isDniValid || !isConsentValid || !isPhoneValid}
              className={clsx(
                'w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer',
                isDniValid && isConsentValid && isPhoneValid
                  ? 'bg-medical-green text-white shadow-medical-green/30 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <span>Confirmar y Agendar Cita</span>
              <ShieldCheck size={20} />
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              Restricción activa: 0% citas solapadas • Notificación inmediata vía WhatsApp
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
