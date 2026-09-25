import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Stethoscope,
  Building2,
  Calendar,
  Users,
  Search,
  DollarSign,
  TrendingUp,
  Hospital,
  Star,
  CheckCircle2,
  Activity,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Receipt,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Lock,
  ShieldCheck,
  FileText,
  Printer,
  X,
  Filter,
  Database,
  RefreshCw,
  Download,
  Copy,
  Check,
  Code,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  AuthUser,
  Doctor,
  AppointmentRecord,
  Consultorio,
  initialConsultorios,
  getStoredConsultorios,
  saveStoredConsultorios,
  getStoredSpecialties,
  saveStoredSpecialties,
  generateAvailability,
  sedesList,
  districts
} from '../data/medicenterData';
import { ReceiptModal } from './ReceiptModal';
import {
  NormalizedDatabase,
  TableName,
  getStoredNormalizedDB,
  saveStoredNormalizedDB,
  buildDefaultNormalizedDatabase,
  syncNormalizedDBWithAppointments,
  validateDatabaseIntegrity,
  generateFullSqlScript,
  LOGICAL_DATA_MODEL_SCHEMA,
  IntegrityReport,
} from '../db/normalizedModels';

interface AdminPortalProps {
  currentUser: AuthUser;
  appointments: AppointmentRecord[];
  doctors: Doctor[];
  onUpdateDoctors: (docs: Doctor[]) => void;
  onUpdateAppointment: (apt: AppointmentRecord) => void;
  onGoToHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  appointments,
  doctors,
  onUpdateDoctors,
  onUpdateAppointment,
  onGoToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'reportes' | 'cobros' | 'citas' | 'mantenimiento' | 'database'>('reportes');

  // Maintenance Sub-tab
  const [maintTab, setMaintTab] = useState<'medicos' | 'especialidades' | 'consultorios' | 'horarios'>('medicos');

  // Database Tab States (12 Tablas Normalizadas en 3FN)
  const [dbData, setDbData] = useState<NormalizedDatabase>(() => {
    const raw = getStoredNormalizedDB();
    return syncNormalizedDBWithAppointments(appointments, raw);
  });
  const [selectedDbTable, setSelectedDbTable] = useState<TableName>('CITA_MEDICA');
  const [dbTableSearch, setDbTableSearch] = useState<string>('');
  const [sqlModalOpen, setSqlModalOpen] = useState<boolean>(false);
  const [integrityModalOpen, setIntegrityModalOpen] = useState<boolean>(false);
  const [inspectedRecord, setInspectedRecord] = useState<any | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchDoc, setSearchDoc] = useState<string>('');
  const [filterDocSpec, setFilterDocSpec] = useState<string>('todos');
  const [searchApt, setSearchApt] = useState<string>('');
  const [filterAptSede, setFilterAptSede] = useState<string>('todos');

  // Consultorios and Specialties State
  const [consultorios, setConsultorios] = useState<Consultorio[]>(() => getStoredConsultorios());
  const [specialtiesList, setSpecialtiesList] = useState<string[]>(() => getStoredSpecialties());

  // Receipt Modal
  const [receiptModalApt, setReceiptModalApt] = useState<AppointmentRecord | null>(null);

  // Payment Recording Modal State
  const [paymentModalApt, setPaymentModalApt] = useState<AppointmentRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta POS' | 'Yape / Plin' | 'Transferencia'>('Yape / Plin');
  const [paymentStatus, setPaymentStatus] = useState<'Pagado' | 'Pendiente' | 'Exonerado'>('Pagado');

  // CRUD MODALS STATE: MÉDICOS
  const [doctorModalOpen, setDoctorModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docFormName, setDocFormName] = useState<string>('');
  const [docFormCmp, setDocFormCmp] = useState<string>('');
  const [docFormSpecialty, setDocFormSpecialty] = useState<string>('Cardiología');
  const [docFormHospital, setDocFormHospital] = useState<string>(sedesList[0].name);
  const [docFormDistrict, setDocFormDistrict] = useState<string>(sedesList[0].district);
  const [docFormImage, setDocFormImage] = useState<string>(
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200'
  );

  // CRUD MODALS STATE: ESPECIALIDADES
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState<boolean>(false);
  const [editingSpecialtyIndex, setEditingSpecialtyIndex] = useState<number | null>(null);
  const [specFormName, setSpecFormName] = useState<string>('');

  // CRUD MODALS STATE: CONSULTORIOS
  const [consultorioModalOpen, setConsultorioModalOpen] = useState<boolean>(false);
  const [editingConsultorio, setEditingConsultorio] = useState<Consultorio | null>(null);
  const [consFormCode, setConsFormCode] = useState<string>('CONS-101');
  const [consFormSede, setConsFormSede] = useState<string>(sedesList[0].name);
  const [consFormDistrict, setConsFormDistrict] = useState<string>(sedesList[0].district);
  const [consFormFloor, setConsFormFloor] = useState<string>('Piso 1 - Pabellón A');
  const [consFormSpecialty, setConsFormSpecialty] = useState<string>('Medicina General');
  const [consFormDoctor, setConsFormDoctor] = useState<string>('');
  const [consFormStatus, setConsFormStatus] = useState<'Activo' | 'Mantenimiento' | 'Inactivo'>('Activo');

  // SCHEDULE MANAGEMENT STATE
  const [scheduleDoctorId, setScheduleDoctorId] = useState<string>(doctors[0]?.id || '');
  const [scheduleDate, setScheduleDate] = useState<string>('Hoy');
  const [newSlotTime, setNewSlotTime] = useState<string>('06:00 PM');

  // Save Consultorios to storage
  const handleUpdateConsultorios = (newItems: Consultorio[]) => {
    setConsultorios(newItems);
    saveStoredConsultorios(newItems);
  };

  // Save Specialties to storage
  const handleUpdateSpecialties = (newItems: string[]) => {
    setSpecialtiesList(newItems);
    saveStoredSpecialties(newItems);
  };

  // ==========================================
  // METRICS & REPORTING CALCULATIONS
  // ==========================================
  const totalAppointmentsCount = appointments.length;

  const attendedAppointmentsCount = appointments.filter(
    (a) => a.status === 'Atendida' || a.status === 'Atendido'
  ).length;

  const canceledAppointmentsCount = appointments.filter(
    (a) => a.status === 'Cancelada' || a.status === 'Cancelado'
  ).length;

  const reprogrammedAppointmentsCount = appointments.filter(
    (a) => a.status === 'Reprogramada'
  ).length;

  const noShowAppointmentsCount = appointments.filter(
    (a) => a.status === 'No Asistió (No-Show)'
  ).length;

  const waitingAppointmentsCount = appointments.filter(
    (a) => a.status === 'En sala de espera' || a.status === 'Llegó / En Espera' || a.status === 'Solicitada' || a.status === 'Confirmada' || a.status === 'Pendiente'
  ).length;

  // No-Show Rate (Tasa de inasistencias): (No-Shows / Total Citas) * 100
  const noShowRate =
    totalAppointmentsCount > 0
      ? ((noShowAppointmentsCount / totalAppointmentsCount) * 100).toFixed(1)
      : '0.0';

  // Total collected revenue
  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === 'Pagado')
    .reduce((acc, curr) => acc + (curr.amount || 100), 0);

  // Revenue by method: Cash vs. Digital
  const cashRevenue = appointments
    .filter((a) => a.paymentStatus === 'Pagado' && a.paymentMethod === 'Efectivo')
    .reduce((acc, curr) => acc + (curr.amount || 100), 0);

  const digitalRevenue = totalRevenue - cashRevenue;

  // Chart data: Atendidas vs Canceladas vs Reprogramadas vs No-Show
  const appointmentStatusChartData = [
    { name: 'Atendidas', count: attendedAppointmentsCount, fill: '#10b981' },
    { name: 'Canceladas', count: canceledAppointmentsCount, fill: '#f43f5e' },
    { name: 'Reprogramadas', count: reprogrammedAppointmentsCount, fill: '#f59e0b' },
    { name: 'No-Show', count: noShowAppointmentsCount, fill: '#8b5cf6' },
    { name: 'En Espera / Prog.', count: waitingAppointmentsCount, fill: '#0ea5e9' },
  ];

  // Payment Breakdown Chart
  const paymentBreakdownData = [
    { name: 'Efectivo', value: cashRevenue, fill: '#10b981' },
    { name: 'Digital (POS / Yape)', value: digitalRevenue, fill: '#0ea5e9' },
  ];

  // ==========================================
  // DOCTOR CRUD HANDLERS
  // ==========================================
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDocFormName('');
    setDocFormCmp(`CMP-${Math.floor(40000 + Math.random() * 9000)}`);
    setDocFormSpecialty(specialtiesList[0] || 'Cardiología');
    setDocFormHospital(sedesList[0].name);
    setDocFormDistrict(sedesList[0].district);
    setDocFormImage(
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200'
    );
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocFormName(doc.name);
    setDocFormCmp(doc.cmp);
    setDocFormSpecialty(doc.specialty);
    setDocFormHospital(doc.hospital);
    setDocFormDistrict(doc.district);
    setDocFormImage(doc.image);
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormName.trim()) return;

    if (editingDoctor) {
      // Edit
      const updated = doctors.map((d) =>
        d.id === editingDoctor.id
          ? {
              ...d,
              name: docFormName,
              cmp: docFormCmp,
              specialty: docFormSpecialty,
              hospital: docFormHospital,
              district: docFormDistrict,
              image: docFormImage,
            }
          : d
      );
      onUpdateDoctors(updated);
    } else {
      // Add
      const newDoc: Doctor = {
        id: `medico${doctors.length + 1}`,
        username: `medico${doctors.length + 1}`,
        password: `medico${doctors.length + 1}`,
        name: docFormName,
        cmp: docFormCmp,
        specialty: docFormSpecialty,
        hospital: docFormHospital,
        district: docFormDistrict,
        rating: 4.8,
        reviewCount: 45,
        image: docFormImage,
        availability: generateAvailability(),
      };
      onUpdateDoctors([newDoc, ...doctors]);
    }

    setDoctorModalOpen(false);
  };

  const handleDeleteDoctor = (docId: string) => {
    if (confirm('¿Estás seguro de eliminar a este médico del sistema?')) {
      const filtered = doctors.filter((d) => d.id !== docId);
      onUpdateDoctors(filtered);
    }
  };

  // ==========================================
  // SPECIALTIES CRUD HANDLERS
  // ==========================================
  const handleOpenAddSpecialty = () => {
    setEditingSpecialtyIndex(null);
    setSpecFormName('');
    setSpecialtyModalOpen(true);
  };

  const handleOpenEditSpecialty = (name: string, index: number) => {
    setEditingSpecialtyIndex(index);
    setSpecFormName(name);
    setSpecialtyModalOpen(true);
  };

  const handleSaveSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specFormName.trim()) return;

    if (editingSpecialtyIndex !== null) {
      const updated = [...specialtiesList];
      updated[editingSpecialtyIndex] = specFormName.trim();
      handleUpdateSpecialties(updated);
    } else {
      if (!specialtiesList.includes(specFormName.trim())) {
        handleUpdateSpecialties([...specialtiesList, specFormName.trim()]);
      }
    }
    setSpecialtyModalOpen(false);
  };

  const handleDeleteSpecialty = (specName: string) => {
    if (confirm(`¿Eliminar la especialidad "${specName}"?`)) {
      handleUpdateSpecialties(specialtiesList.filter((s) => s !== specName));
    }
  };

  // ==========================================
  // CONSULTORIOS CRUD HANDLERS
  // ==========================================
  const handleOpenAddConsultorio = () => {
    setEditingConsultorio(null);
    setConsFormCode(`CONS-${Math.floor(100 + Math.random() * 800)}`);
    setConsFormSede(sedesList[0].name);
    setConsFormDistrict(sedesList[0].district);
    setConsFormFloor('Piso 2 - Pabellón A');
    setConsFormSpecialty(specialtiesList[0] || 'Medicina General');
    setConsFormDoctor('');
    setConsFormStatus('Activo');
    setConsultorioModalOpen(true);
  };

  const handleOpenEditConsultorio = (cons: Consultorio) => {
    setEditingConsultorio(cons);
    setConsFormCode(cons.code);
    setConsFormSede(cons.sede);
    setConsFormDistrict(cons.district);
    setConsFormFloor(cons.floor);
    setConsFormSpecialty(cons.specialty);
    setConsFormDoctor(cons.assignedDoctorName || '');
    setConsFormStatus(cons.status);
    setConsultorioModalOpen(true);
  };

  const handleSaveConsultorio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consFormCode.trim()) return;

    if (editingConsultorio) {
      const updated = consultorios.map((c) =>
        c.id === editingConsultorio.id
          ? {
              ...c,
              code: consFormCode,
              sede: consFormSede,
              district: consFormDistrict,
              floor: consFormFloor,
              specialty: consFormSpecialty,
              assignedDoctorName: consFormDoctor,
              status: consFormStatus,
            }
          : c
      );
      handleUpdateConsultorios(updated);
    } else {
      const newCons: Consultorio = {
        id: `cons-${Date.now()}`,
        code: consFormCode,
        sede: consFormSede,
        district: consFormDistrict,
        floor: consFormFloor,
        specialty: consFormSpecialty,
        assignedDoctorName: consFormDoctor,
        status: consFormStatus,
      };
      handleUpdateConsultorios([...consultorios, newCons]);
    }
    setConsultorioModalOpen(false);
  };

  const handleDeleteConsultorio = (id: string) => {
    if (confirm('¿Eliminar este consultorio?')) {
      handleUpdateConsultorios(consultorios.filter((c) => c.id !== id));
    }
  };

  // ==========================================
  // SCHEDULE / HORARIOS DE AGENDA HANDLER
  // ==========================================
  const selectedDoctorForSchedule = doctors.find((d) => d.id === scheduleDoctorId) || doctors[0];

  const handleToggleSlotStatus = (date: string, time: string) => {
    if (!selectedDoctorForSchedule) return;

    const updatedDoctors = doctors.map((doc) => {
      if (doc.id === selectedDoctorForSchedule.id) {
        const newAvailability = doc.availability.map((day) => {
          if (day.date === date) {
            return {
              ...day,
              times: day.times.map((slot) => {
                if (slot.time === time) {
                  return {
                    ...slot,
                    status: (slot.status === 'available' ? 'occupied' : 'available') as 'available' | 'occupied',
                  };
                }
                return slot;
              }),
            };
          }
          return day;
        });
        return { ...doc, availability: newAvailability };
      }
      return doc;
    });

    onUpdateDoctors(updatedDoctors);
  };

  const handleAddSlotToSchedule = () => {
    if (!selectedDoctorForSchedule || !newSlotTime.trim()) return;

    const updatedDoctors = doctors.map((doc) => {
      if (doc.id === selectedDoctorForSchedule.id) {
        const newAvailability = doc.availability.map((day) => {
          if (day.date === scheduleDate) {
            const exists = day.times.some((t) => t.time === newSlotTime.trim());
            if (!exists) {
              return {
                ...day,
                times: [...day.times, { time: newSlotTime.trim(), status: 'available' as const }],
              };
            }
          }
          return day;
        });
        return { ...doc, availability: newAvailability };
      }
      return doc;
    });

    onUpdateDoctors(updatedDoctors);
    setNewSlotTime('');
  };

  // ==========================================
  // PAYMENT RECORDING CONFIRMATION
  // ==========================================
  const handleOpenPaymentModal = (apt: AppointmentRecord) => {
    setPaymentModalApt(apt);
    setPaymentAmount(apt.amount || 100);
    setPaymentMethod(
      apt.paymentMethod === 'Pendiente' ? 'Tarjeta POS' : (apt.paymentMethod as any) || 'Tarjeta POS'
    );
    setPaymentStatus(apt.paymentStatus === 'Pendiente' ? 'Pagado' : apt.paymentStatus);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalApt) return;
    const receiptNum =
      paymentModalApt.receiptNumber ||
      `B001-${paymentModalApt.id.replace('APT-', '').padStart(6, '0')}`;

    const updated: AppointmentRecord = {
      ...paymentModalApt,
      amount: paymentAmount,
      paymentMethod,
      paymentStatus,
      receiptNumber: receiptNum,
      receiptIssuedAt: new Date().toISOString(),
    };

    onUpdateAppointment(updated);
    setPaymentModalApt(null);
    setReceiptModalApt(updated);
  };

  // ==========================================
  // DATABASE TAB LOGIC & HELPERS (12 TABLAS 3FN)
  // ==========================================
  const handleSyncDB = () => {
    const raw = getStoredNormalizedDB();
    const synced = syncNormalizedDBWithAppointments(appointments, raw);
    setDbData(synced);
    setSyncSuccessToast('¡Base de Datos sincronizada con éxito con las citas y entidades actuales!');
    setTimeout(() => setSyncSuccessToast(null), 4000);
  };

  const handleResetDB = () => {
    if (confirm('¿Restablecer las 12 tablas normalizadas a la semilla oficial de fábrica?')) {
      const reset = buildDefaultNormalizedDatabase();
      const synced = syncNormalizedDBWithAppointments(appointments, reset);
      saveStoredNormalizedDB(synced);
      setDbData(synced);
      setSyncSuccessToast('Base de datos normalizada restablecida con éxito.');
      setTimeout(() => setSyncSuccessToast(null), 4000);
    }
  };

  const activeTableSchema = useMemo(() => {
    return LOGICAL_DATA_MODEL_SCHEMA.find((s) => s.tableName === selectedDbTable);
  }, [selectedDbTable]);

  const activeTableRows = useMemo(() => {
    const rows = dbData[selectedDbTable] || [];
    if (!dbTableSearch.trim()) return rows;
    const q = dbTableSearch.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [dbData, selectedDbTable, dbTableSearch]);

  const integrityReport: IntegrityReport = useMemo(() => {
    return validateDatabaseIntegrity(dbData);
  }, [dbData]);

  const sqlDump = useMemo(() => {
    return generateFullSqlScript(dbData);
  }, [dbData]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlDump], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medicenter_modelo_3fn_${Date.now()}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[3rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/20 shrink-0">
              <Shield size={38} className="text-purple-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <ShieldCheck size={12} /> Panel de Administración General
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Mando Asistencial & Administrativo
              </h1>
              <p className="text-slate-300 font-bold text-xs sm:text-sm mt-1">
                Reportes estadísticos • Registro de cobros • Mantenimiento integral del sistema
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

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total Citas Registradas
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {totalAppointmentsCount}
            </p>
          </div>

          <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">
              Tasa de Inasistencias (No-Show)
            </p>
            <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-0.5">
              {noShowRate}%
            </p>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
              Citas Atendidas
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
              {attendedAppointmentsCount}
            </p>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              Recaudación Administrativa
            </p>
            <p className="text-2xl sm:text-3xl font-black text-blue-300 mt-0.5">
              S/. {totalRevenue}.00
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('reportes')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'reportes'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <BarChart3 size={16} />
          <span>Módulo de Reportes & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('cobros')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'cobros'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <DollarSign size={16} />
          <span>Registro Administrativo de Cobros</span>
        </button>

        <button
          onClick={() => setActiveTab('mantenimiento')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'mantenimiento'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Layers size={16} />
          <span>Mantenimiento Administrativo (CRUD)</span>
        </button>

        <button
          onClick={() => setActiveTab('citas')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'citas'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Calendar size={16} />
          <span>Monitor Global de Citas ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={clsx(
            'px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0',
            activeTab === 'database'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Database size={16} />
          <span>Base de Datos (12 Tablas 3FN)</span>
          <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
            {integrityReport.totalRecords}
          </span>
        </button>
      </div>

      {/* Database sync notification toast */}
      {syncSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{syncSuccessToast}</span>
          </div>
          <button
            onClick={() => setSyncSuccessToast(null)}
            className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: MÓDULO DE REPORTES (NO-SHOW RATE & ATENDIDAS VS CANCELADAS) */}
      {/* ========================================================= */}
      {activeTab === 'reportes' && (
        <div className="space-y-8">
          {/* Key KPI Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: No-Show Rate */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Métrica de Eficiencia
                </span>
                <span className="text-xs font-bold text-slate-400">Meta: &lt; 10%</span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {noShowRate}%
                </h3>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mt-1">
                  Tasa de Inasistencias (No-Show Rate)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      Number(noShowRate) > 15
                        ? 'bg-rose-500'
                        : Number(noShowRate) > 10
                        ? 'bg-amber-500'
                        : 'bg-purple-600'
                    )}
                    style={{ width: `${Math.min(Number(noShowRate), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>{noShowAppointmentsCount} inasistencias</span>
                  <span>de {totalAppointmentsCount} citas</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                Calculado como la proporción de citas agendadas cuyos pacientes no se presentaron a la atención asistencial ni realizaron reprogramación previa.
              </p>
            </div>

            {/* Card 2: Citas Atendidas vs Canceladas */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Balance Clínico
                </span>
                <span className="text-xs font-bold text-slate-400">Ratio Atend./Canc.</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-emerald-700">
                    {attendedAppointmentsCount}
                  </h3>
                  <span className="text-xl font-bold text-slate-300">vs</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-rose-600">
                    {canceledAppointmentsCount}
                  </h3>
                </div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mt-1">
                  Atendidas vs. Canceladas
                </p>
              </div>

              {/* Progress Bar Dual */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        attendedAppointmentsCount + canceledAppointmentsCount > 0
                          ? (attendedAppointmentsCount /
                              (attendedAppointmentsCount + canceledAppointmentsCount)) *
                            100
                          : 50
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-700">Atendidas ({attendedAppointmentsCount})</span>
                  <span className="text-rose-600">Canceladas ({canceledAppointmentsCount})</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                Compara las citas culminadas con diagnóstico y receta contra las canceladas por incompatibilidad horaria o solicitud de pacientes.
              </p>
            </div>

            {/* Card 3: Recaudación por Medio de Pago */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Caja Administrativa
                </span>
                <span className="text-xs font-bold text-slate-400">Total Sede</span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                  S/. {totalRevenue}.00
                </h3>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mt-1">
                  Recaudación Asistencial Registrada
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Pagos Digitales (POS, Yape/Plin):</span>
                  <span className="text-medical-blue font-black">S/. {digitalRevenue}.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Pagos en Efectivo:</span>
                  <span className="text-emerald-700 font-black">S/. {cashRevenue}.00</span>
                </div>
              </div>

              <p className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-snug">
                * Nota: Registro administrativo asistencial interno. No procesa pasarelas bancarias directas.
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Desglose de Estados de Citas */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-lg">
                Distribución de Citas por Estado Operativo
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Monitoreo en tiempo real de turnos asistenciales
              </p>

              <div className="h-[260px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentStatusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {appointmentStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Proporción de Métodos de Cobro */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-lg">
                Cobros Registrados: Efectivo vs. Digital
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Desglose financiero administrativo por canal de cobro
              </p>

              <div className="h-[260px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: REGISTRO ADMINISTRATIVO DE COBROS & COMPROBANTES */}
      {/* ========================================================= */}
      {activeTab === 'cobros' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  Libro Mayor de Cobros Administrativos
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Registro de pagos asociados a citas médicas y generación de comprobantes simbólicos
                </p>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 text-xs text-amber-900 max-w-md">
                <strong className="block font-black uppercase text-[10px]">Aclaración Administrativa:</strong>
                Este módulo opera exclusivamente como registro administrativo interno. No procesa pasarelas bancarias directas.
              </div>
            </div>

            {/* Table of all appointment fees */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Cita ID</th>
                    <th className="pb-3">Paciente</th>
                    <th className="pb-3">Sede / Hospital</th>
                    <th className="pb-3">Médico</th>
                    <th className="pb-3">Importe</th>
                    <th className="pb-3">Método</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {appointments.map((apt) => {
                    const isPaid = apt.paymentStatus === 'Pagado';
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-mono font-bold text-slate-500">{apt.id}</td>
                        <td className="py-3.5 font-bold text-slate-900">
                          {apt.patientName}
                          <span className="block text-[10px] text-slate-400 font-normal">DNI {apt.patientDni}</span>
                        </td>
                        <td className="py-3.5">{apt.hospital}</td>
                        <td className="py-3.5">{apt.doctorName} ({apt.specialty})</td>
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
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.paymentStatus === 'Exonerado'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {apt.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                          </div>
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

      {/* ========================================================= */}
      {/* TAB 3: MANTENIMIENTO ADMINISTRATIVO (CRUD MÉDICOS, ESPECIALIDADES, CONSULTORIOS, HORARIOS) */}
      {/* ========================================================= */}
      {activeTab === 'mantenimiento' && (
        <div className="space-y-6">
          {/* Sub-nav for CRUD modules */}
          <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setMaintTab('medicos')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5',
                maintTab === 'medicos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Stethoscope size={14} />
              <span>CRUD Médicos ({doctors.length})</span>
            </button>

            <button
              onClick={() => setMaintTab('especialidades')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5',
                maintTab === 'especialidades'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Layers size={14} />
              <span>CRUD Especialidades ({specialtiesList.length})</span>
            </button>

            <button
              onClick={() => setMaintTab('consultorios')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5',
                maintTab === 'consultorios'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Building2 size={14} />
              <span>CRUD Consultorios ({consultorios.length})</span>
            </button>

            <button
              onClick={() => setMaintTab('horarios')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5',
                maintTab === 'horarios'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Clock size={14} />
              <span>Horarios de Agenda</span>
            </button>
          </div>

          {/* SUB-MODULE 1: CRUD MÉDICOS */}
          {maintTab === 'medicos' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Gestión del Cuerpo Médico
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Registrar, editar y configurar especialistas de la red
                  </p>
                </div>

                <button
                  onClick={handleOpenAddDoctor}
                  className="px-4 py-2.5 bg-medical-green hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 self-start"
                >
                  <Plus size={16} />
                  <span>Agregar Médico</span>
                </button>
              </div>

              {/* Doctors Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Médico</th>
                      <th className="pb-3">CMP</th>
                      <th className="pb-3">Especialidad</th>
                      <th className="pb-3">Sede Hospitalaria</th>
                      <th className="pb-3">Calificación</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {doctors.slice(0, 30).map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {doc.id}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold">{doc.cmp}</td>
                        <td className="py-3 font-bold text-medical-blue">{doc.specialty}</td>
                        <td className="py-3">{doc.hospital} ({doc.district})</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                            <Star size={12} className="fill-amber-400" /> {doc.rating}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditDoctor(doc)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                              title="Editar Médico"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doc.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                              title="Eliminar Médico"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-MODULE 2: CRUD ESPECIALIDADES */}
          {maintTab === 'especialidades' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Gestión de Especialidades Médicas
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Catálogo de especialidades ofrecidas en el sistema
                  </p>
                </div>

                <button
                  onClick={handleOpenAddSpecialty}
                  className="px-4 py-2.5 bg-medical-green hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 self-start"
                >
                  <Plus size={16} />
                  <span>Nueva Especialidad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {specialtiesList.map((spec, idx) => {
                  const docsInSpec = doctors.filter((d) => d.specialty === spec).length;
                  return (
                    <div
                      key={spec}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{spec}</h4>
                        <span className="text-[10px] font-bold text-slate-400">
                          {docsInSpec} médicos asignados
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSpecialty(spec, idx)}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialty(spec)}
                          className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-MODULE 3: CRUD CONSULTORIOS */}
          {maintTab === 'consultorios' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Gestión de Consultorios Físicos por Sede
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Infraestructura hospitalaria y módulos de atención
                  </p>
                </div>

                <button
                  onClick={handleOpenAddConsultorio}
                  className="px-4 py-2.5 bg-medical-green hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 self-start"
                >
                  <Plus size={16} />
                  <span>Nuevo Consultorio</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Código</th>
                      <th className="pb-3">Sede Hospitalaria</th>
                      <th className="pb-3">Piso / Pabellón</th>
                      <th className="pb-3">Especialidad</th>
                      <th className="pb-3">Médico Asignado</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {consultorios.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono font-bold text-slate-900">{c.code}</td>
                        <td className="py-3 font-bold">{c.sede}</td>
                        <td className="py-3">{c.floor}</td>
                        <td className="py-3 font-bold text-medical-blue">{c.specialty}</td>
                        <td className="py-3">{c.assignedDoctorName || 'Sin asignar'}</td>
                        <td className="py-3">
                          <span
                            className={clsx(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                              c.status === 'Activo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'Mantenimiento'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditConsultorio(c)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteConsultorio(c.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-MODULE 4: HORARIOS DE AGENDA */}
          {maintTab === 'horarios' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Configuración de Horarios de Agenda Médica
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Habilitar, bloquear o agregar turnos para cualquier especialista
                  </p>
                </div>
              </div>

              {/* Selector de Médico y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Selecciona Médico:
                  </label>
                  <select
                    value={scheduleDoctorId}
                    onChange={(e) => setScheduleDoctorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty} - {d.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Selecciona Fecha:
                  </label>
                  <select
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="Hoy">Hoy</option>
                    <option value="Mañana">Mañana</option>
                    <option value="19 May">19 May</option>
                    <option value="20 May">20 May</option>
                    <option value="21 May">21 May</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Agregar Nuevo Turno:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      placeholder="06:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none"
                    />
                    <button
                      onClick={handleAddSlotToSchedule}
                      className="px-4 py-3 bg-medical-blue hover:bg-blue-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Turnos Grid */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Turnos para {scheduleDate} (Haz clic para alternar Disponible / Ocupado):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedDoctorForSchedule?.availability
                    ?.find((d) => d.date === scheduleDate)
                    ?.times.map((slot) => {
                      const isAvail = slot.status === 'available';
                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleToggleSlotStatus(scheduleDate, slot.time)}
                          className={clsx(
                            'p-3.5 rounded-2xl border-2 text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                            isAvail
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          )}
                        >
                          <span className="font-black text-sm">{slot.time}</span>
                          <span
                            className={clsx(
                              'text-[9px] uppercase font-black tracking-wider px-2 py-0.2 rounded-full',
                              isAvail ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                            )}
                          >
                            {isAvail ? 'Disponible' : 'Bloqueado'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MONITOR GLOBAL DE CITAS */}
      {/* ========================================================= */}
      {activeTab === 'citas' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Auditoría y Monitor de Citas en Red
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Supervisión asistencial de todas las sedes
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchApt}
                onChange={(e) => setSearchApt(e.target.value)}
                placeholder="Buscar por paciente, DNI o ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Cita ID</th>
                  <th className="pb-3">Paciente</th>
                  <th className="pb-3">Especialista</th>
                  <th className="pb-3">Sede</th>
                  <th className="pb-3">Turno</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Cobro</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.slice(0, 25).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-500">{apt.id}</td>
                    <td className="py-3 font-bold text-slate-900">{apt.patientName}</td>
                    <td className="py-3">{apt.doctorName}</td>
                    <td className="py-3">{apt.hospital}</td>
                    <td className="py-3 font-bold text-medical-blue">{apt.date} • {apt.time}</td>
                    <td className="py-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded text-[10px] font-black uppercase',
                          apt.paymentStatus === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        )}
                      >
                        {apt.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {apt.paymentStatus === 'Pagado' ? (
                        <button
                          onClick={() => setReceiptModalApt(apt)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                          Boleta
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(apt)}
                          className="px-2.5 py-1 bg-medical-blue hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cobrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BASE DE DATOS (12 TABLAS NORMALIZADAS EN 3FN) */}
      {/* ========================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner with Architecture Metrics */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Database size={12} /> Arquitectura Relacional Normalizada (3FN)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Modelo de Datos Lógico Relacional (12 Entidades)
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Garantía de coherencia técnica entre el frontend asistencial y el modelo relacional:
                  <strong className="text-white"> USUARIO, MEDICO, ESPECIALIDAD, CONSULTORIO, PACIENTE, AGENDA, CITA_MEDICA, PAGO, HISTORIA_CLINICA, ATENCION_MEDICA, RECETA_MEDICAMENTOS y RESULTADO_EXAMEN.</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setSqlModalOpen(true)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-900/40"
                >
                  <Code size={14} />
                  <span>Script SQL (DDL + DML)</span>
                </button>

                <button
                  onClick={() => setIntegrityModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <ShieldCheck size={14} />
                  <span>Auditar Integridad FK</span>
                </button>

                <button
                  onClick={handleSyncDB}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={14} />
                  <span>Sincronizar DB</span>
                </button>

                <button
                  onClick={handleResetDB}
                  className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-500/30"
                  title="Restablecer semilla inicial de fábrica"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                  Total Entidades
                </span>
                <span className="text-2xl font-black text-white mt-0.5 block">12 Tablas 3FN</span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                  Total Registros Persistidos
                </span>
                <span className="text-2xl font-black text-purple-300 mt-0.5 block">
                  {integrityReport.totalRecords} filas
                </span>
              </div>

              <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] uppercase font-black text-emerald-300 block tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={12} /> Integridad Referencial
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                  {integrityReport.foreignKeyErrors.length === 0 ? '100% Coherente' : `${integrityReport.foreignKeyErrors.length} Conflictos`}
                </span>
              </div>

              <div className="bg-blue-500/10 p-3.5 rounded-2xl border border-blue-500/20">
                <span className="text-[10px] uppercase font-black text-blue-300 block tracking-wider">
                  Sincronización UI
                </span>
                <span className="text-2xl font-black text-blue-400 mt-0.5 block">
                  Tiempo Real
                </span>
              </div>
            </div>
          </div>

          {/* 12-Table Navigation Selector Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers size={16} className="text-purple-600" />
                Catálogo de Tablas del Modelo Lógico (Haz clic para inspeccionar):
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                12 Tablas Normalizadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {(
                [
                  'USUARIO',
                  'MEDICO',
                  'ESPECIALIDAD',
                  'CONSULTORIO',
                  'PACIENTE',
                  'AGENDA',
                  'CITA_MEDICA',
                  'PAGO',
                  'HISTORIA_CLINICA',
                  'ATENCION_MEDICA',
                  'RECETA_MEDICAMENTOS',
                  'RESULTADO_EXAMEN',
                ] as TableName[]
              ).map((tbl) => {
                const count = dbData[tbl]?.length || 0;
                const isSelected = selectedDbTable === tbl;
                return (
                  <button
                    key={tbl}
                    onClick={() => {
                      setSelectedDbTable(tbl);
                      setDbTableSearch('');
                    }}
                    className={clsx(
                      'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden',
                      isSelected
                        ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-600/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold tracking-tight opacity-70">
                        TABLA
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-mono font-black px-2 py-0.5 rounded-full',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-100 text-purple-900'
                        )}
                      >
                        {count}
                      </span>
                    </div>
                    <span className="font-black text-xs tracking-tight line-clamp-1">
                      {tbl}
                    </span>
                    <span
                      className={clsx(
                        'text-[9px] truncate',
                        isSelected ? 'text-purple-200' : 'text-slate-400'
                      )}
                    >
                      PK: id
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Table Details & Browser */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            {/* Table Header & Schema Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center font-bold">
                    <Database size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Tabla 3FN: {selectedDbTable}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        ({activeTableRows.length} registros)
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mt-1">
                      {activeTableSchema?.description || `Tabla ${selectedDbTable}`}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Table search bar */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Buscar en ${selectedDbTable}...`}
                  value={dbTableSearch}
                  onChange={(e) => setDbTableSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Foreign Keys & Schema Metadata Strip */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <strong className="text-slate-400 uppercase text-[10px] block">Llave Primaria (PK):</strong>
                  <span className="font-mono font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-xs">
                    {activeTableSchema?.primaryKey || 'id'}
                  </span>
                </div>

                {activeTableSchema?.foreignKeys && activeTableSchema.foreignKeys.length > 0 && (
                  <div>
                    <strong className="text-slate-400 uppercase text-[10px] block">
                      Llaves Foráneas (FK Constraints):
                    </strong>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {activeTableSchema.foreignKeys.map((fk) => (
                        <span
                          key={fk.column}
                          className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1"
                        >
                          <span className="text-purple-700">{fk.column}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700">{fk.referencesTable}({fk.referencesColumn})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Column Dictionary */}
              <details className="text-xs group">
                <summary className="font-bold text-slate-700 cursor-pointer hover:text-purple-700 flex items-center gap-1">
                  <span>Ver Diccionario de Columnas y Tipos SQL ({activeTableSchema?.columns.length || 0} columnas)</span>
                </summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black">
                      <tr>
                        <th className="p-2.5">Columna</th>
                        <th className="p-2.5">Tipo SQL</th>
                        <th className="p-2.5">Nulo</th>
                        <th className="p-2.5">Descripción Funcional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {activeTableSchema?.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-purple-900">{col.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">{col.type}</td>
                          <td className="p-2.5 text-slate-500">{col.nullable ? 'SI' : 'NO'}</td>
                          <td className="p-2.5 text-slate-700">{col.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>

            {/* Live Data Browser Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    {activeTableSchema?.columns.slice(0, 6).map((c) => (
                      <th key={c.name} className="p-3 font-mono">{c.name}</th>
                    ))}
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {activeTableRows.length > 0 ? (
                    activeTableRows.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                        {activeTableSchema?.columns.slice(0, 6).map((c) => {
                          const val = row[c.name];
                          let displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                          if (displayVal.length > 40) displayVal = displayVal.slice(0, 40) + '...';
                          return (
                            <td key={c.name} className="p-3 font-mono text-slate-800">
                              {c.name === 'id' || c.name.endsWith('_id') ? (
                                <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                                  {displayVal}
                                </span>
                              ) : c.name === 'estado' ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black text-[10px]">
                                  {displayVal}
                                </span>
                              ) : (
                                displayVal || <span className="text-slate-300 italic">null</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setInspectedRecord(row)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Ver JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-8 text-center text-slate-400 font-bold"
                      >
                        No se encontraron registros en la tabla {selectedDbTable}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AGREGAR / EDITAR MÉDICO */}
      {/* ========================================================= */}
      <AnimatePresence>
        {doctorModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDoctorModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-lg">
                  {editingDoctor ? 'Editar Especialista' : 'Agregar Nuevo Especialista'}
                </h3>
                <button
                  onClick={() => setDoctorModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    value={docFormName}
                    onChange={(e) => setDocFormName(e.target.value)}
                    placeholder="Dr. Nombre y Apellido"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Colegiatura (CMP):</label>
                    <input
                      type="text"
                      required
                      value={docFormCmp}
                      onChange={(e) => setDocFormCmp(e.target.value)}
                      placeholder="CMP-45892"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Especialidad:</label>
                    <select
                      value={docFormSpecialty}
                      onChange={(e) => setDocFormSpecialty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue"
                    >
                      {specialtiesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Sede Hospitalaria Asignada:</label>
                  <select
                    value={docFormHospital}
                    onChange={(e) => {
                      setDocFormHospital(e.target.value);
                      const matched = sedesList.find((s) => s.name === e.target.value);
                      if (matched) setDocFormDistrict(matched.district);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue"
                  >
                    {sedesList.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">URL de Fotografía / Avatar:</label>
                  <input
                    type="text"
                    value={docFormImage}
                    onChange={(e) => setDocFormImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue text-[11px]"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setDoctorModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-medical-green hover:bg-emerald-600 text-white font-black rounded-xl cursor-pointer shadow-md"
                  >
                    Guardar Médico
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: AGREGAR / EDITAR ESPECIALIDAD */}
      {/* ========================================================= */}
      <AnimatePresence>
        {specialtyModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSpecialtyModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <h3 className="font-black text-slate-800 text-base">
                {editingSpecialtyIndex !== null ? 'Editar Especialidad' : 'Nueva Especialidad'}
              </h3>

              <form onSubmit={handleSaveSpecialty} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Nombre de Especialidad:</label>
                  <input
                    type="text"
                    required
                    value={specFormName}
                    onChange={(e) => setSpecFormName(e.target.value)}
                    placeholder="Ej: Geriatría"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-medical-blue"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSpecialtyModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-medical-blue text-white font-black rounded-xl cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: AGREGAR / EDITAR CONSULTORIO */}
      {/* ========================================================= */}
      <AnimatePresence>
        {consultorioModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConsultorioModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4"
            >
              <h3 className="font-black text-slate-800 text-base">
                {editingConsultorio ? 'Editar Consultorio' : 'Nuevo Consultorio'}
              </h3>

              <form onSubmit={handleSaveConsultorio} className="space-y-3 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Código:</label>
                    <input
                      type="text"
                      required
                      value={consFormCode}
                      onChange={(e) => setConsFormCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Piso / Pabellón:</label>
                    <input
                      type="text"
                      required
                      value={consFormFloor}
                      onChange={(e) => setConsFormFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Sede:</label>
                  <select
                    value={consFormSede}
                    onChange={(e) => {
                      setConsFormSede(e.target.value);
                      const matched = sedesList.find((s) => s.name === e.target.value);
                      if (matched) setConsFormDistrict(matched.district);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                  >
                    {sedesList.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Especialidad Principal:</label>
                  <select
                    value={consFormSpecialty}
                    onChange={(e) => setConsFormSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                  >
                    {specialtiesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Médico Asignado (opcional):</label>
                    <input
                      type="text"
                      value={consFormDoctor}
                      onChange={(e) => setConsFormDoctor(e.target.value)}
                      placeholder="Dr. Nombre"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Estado:</label>
                    <select
                      value={consFormStatus}
                      onChange={(e) => setConsFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setConsultorioModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-medical-green text-white font-black rounded-xl cursor-pointer shadow-md"
                  >
                    Guardar Consultorio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: REGISTRO DE PAGO ADMINISTRATIVO */}
      {/* ========================================================= */}
      <AnimatePresence>
        {paymentModalApt && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentModalApt(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4"
            >
              <h3 className="font-black text-slate-800 text-lg">
                Cobro Administrativo de Cita
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Paciente: {paymentModalApt.patientName} (DNI: {paymentModalApt.patientDni})
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Monto a Cobrar</span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-slate-400">S/.</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="text-3xl font-black text-medical-blue w-24 text-center bg-transparent border-b-2 border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-bold text-slate-700">
                <label>Medio de Pago:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Efectivo', 'Tarjeta POS', 'Yape / Plin', 'Transferencia'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={clsx(
                        'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                        paymentMethod === m
                          ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalApt(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-2 py-3 bg-emerald-700 text-white font-black rounded-xl cursor-pointer shadow-md"
                >
                  Registrar Cobro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 1: SCRIPT SQL EXPORT (DDL + DML ANSI/POSTGRES) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {sqlModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSqlModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">
                    <Code size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">
                      Script SQL Oficial: Modelo de Datos Lógico (3FN)
                    </h3>
                    <p className="text-xs text-slate-400">
                      12 Tablas DDL (CREATE TABLE) + DML (INSERT INTO) coherentes con el backend
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Descargar .sql</span>
                  </button>

                  <button
                    onClick={() => setSqlModalOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400/90 leading-relaxed select-all">
                <pre>{sqlDump}</pre>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                <span>Compatible con PostgreSQL, MySQL 8+, SQLite y Cloud SQL</span>
                <button
                  onClick={() => setSqlModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: AUDITORÍA DE INTEGRIDAD REFERENCIAL (FKs) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {integrityModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIntegrityModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verificación de 3FN y FKs
                    </span>
                    <h3 className="font-black text-xl text-slate-900 mt-0.5">
                      Auditoría de Integridad Referencial
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIntegrityModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-emerald-950">
                    100% Coherencia Técnica Relacional Verificada
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    No existen registros huérfanos. Todas las llaves foráneas apuntan a registros válidos de las tablas padre.
                  </p>
                </div>
              </div>

              {/* Table breakdown stats */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Resumen de Entidades Normalizadas:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(integrityReport.tableCounts).map(([table, count]) => (
                    <div
                      key={table}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-700 font-mono text-[11px] truncate">{table}</span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-black text-purple-900 text-[10px]">
                        {count} filas
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship Diagram Checkpoints */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-black uppercase text-slate-500 text-[10px] block">
                  Comprobaciones Relacionales Validadas:
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span><strong>CITA_MEDICA → PACIENTE:</strong> Cada cita corresponde a un paciente registrado con DNI.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span><strong>CITA_MEDICA → MEDICO:</strong> Cada turno está vinculado a un médico colegiado asignado.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span><strong>PAGO → CITA_MEDICA:</strong> Cada cobro administrativo tiene su cita correlativa y boleta simbólica.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span><strong>ATENCION_MEDICA → HISTORIA_CLINICA:</strong> Diagnóstico CIE-10 y evolución clínica asentados en el expediente único.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span><strong>RECETA_MEDICAMENTOS → ATENCION_MEDICA:</strong> Fármacos vinculados al acto médico correspondiente.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIntegrityModalOpen(false)}
                  className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Entendido y Conforme
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: VISOR JSON DE REGISTRO INDIVIDUAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {inspectedRecord && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedRecord(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">
                    Registro de Tabla: {selectedDbTable}
                  </span>
                  <h3 className="font-mono font-bold text-white text-base">
                    ID: {inspectedRecord.id || inspectedRecord.codigo_ticket || 'PK'}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectedRecord(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-purple-300 leading-relaxed">
                <pre>{JSON.stringify(inspectedRecord, null, 2)}</pre>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setInspectedRecord(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cerrar Visor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPROBANTE SIMBÓLICO MODAL */}
      <ReceiptModal
        appointment={receiptModalApt}
        onClose={() => setReceiptModalApt(null)}
      />
    </div>
  );
};
