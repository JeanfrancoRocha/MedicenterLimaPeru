import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';
import { AppointmentRecord } from '../data/medicenterData';

interface ReceiptModalProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) return null;

  const receiptNumber =
    appointment.receiptNumber ||
    `B001-${appointment.id.replace('APT-', '').padStart(6, '0')}`;

  const issueDate = appointment.receiptIssuedAt
    ? new Date(appointment.receiptIssuedAt).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto my-6 print:m-0 print:p-4 print:shadow-none"
      >
        {/* Modal Close Button (hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Registro Administrativo de Cobro
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* VOUCHER / COMPROBANTE SIMBÓLICO BODY */}
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 sm:p-7 space-y-6 bg-slate-50/50 relative overflow-hidden">
          {/* Watermark Notice */}
          <div className="absolute -right-8 -top-8 rotate-12 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-8 py-1.5 shadow-sm border border-emerald-300">
            Registro Administrativo
          </div>

          {/* Business Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-medical-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-medical-blue/20">
              <Building2 size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              MEDICENTER SALUD S.A.C.
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              RUC: 20608945123 • Red de Clínicas Lima
            </p>
            <p className="text-[11px] text-slate-400">
              {appointment.hospital} • {appointment.district}, Lima
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Boleta de Venta Electrónica Simbólica
            </p>
            <p className="text-base font-black text-medical-blue font-mono">
              {receiptNumber}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Emisión Administrativa: {issueDate}
            </p>
          </div>

          {/* Patient Details */}
          <div className="space-y-2 text-xs border-t border-b border-slate-200 py-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Paciente:</span>
              <span className="font-extrabold text-slate-800">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Doc. Identidad:</span>
              <span className="font-mono font-bold text-slate-800">DNI {appointment.patientDni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Celular:</span>
              <span className="font-bold text-slate-800">{appointment.patientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Especialista:</span>
              <span className="font-bold text-medical-blue">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Especialidad:</span>
              <span className="font-bold text-slate-700">{appointment.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Turno Cita:</span>
              <span className="font-bold text-slate-700">{appointment.date} a las {appointment.time}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Consulta Médica Ambulatoria</span>
              <span>S/. {Number(appointment.amount || 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-400 text-[11px]">
              <span>IGV (18% - Asistencial)</span>
              <span>S/. 0.00</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>IMPORTE TOTAL:</span>
              <span className="text-emerald-700">
                S/. {Number(appointment.amount || 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
              <span className="text-[11px] font-bold text-slate-500">Método de Pago:</span>
              <span className="text-xs font-black uppercase text-medical-blue bg-blue-50 px-2 py-0.5 rounded">
                {appointment.paymentMethod || 'Efectivo'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500">Estado de Caja:</span>
              <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 size={12} /> {appointment.paymentStatus || 'Pagado'}
              </span>
            </div>
          </div>

          {/* Legal Note explicitly stating administrative registration */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[10px] text-amber-900 space-y-1">
            <p className="font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} /> Constancia de Registro Administrativo:
            </p>
            <p className="leading-snug">
              Este comprobante certifica el cobro administrativo interno de la cita médica. Se deja constancia de que el sistema realiza únicamente el registro administrativo institucional de pagos y no procesa pasarelas bancarias directas ni intermediación con entidades financieras.
            </p>
          </div>

          {/* Symbolic QR code and Hash */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-400">
            <div className="space-y-0.5 font-mono">
              <p>HASH: 8f4a-9b21-medicenter-citas-v2</p>
              <p>AUTORIZACIÓN SEDE: {appointment.hospital}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-mono text-[9px]">
              [ QR ]
            </div>
          </div>
        </div>

        {/* Modal Action Controls (hidden in print) */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-medical-blue hover:bg-blue-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-medical-blue/20 flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            <span>Imprimir / Descargar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
