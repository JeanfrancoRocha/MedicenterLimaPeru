import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarCheck,
  Calendar,
  Video,
  Hospital,
  ChevronRight,
  Clock,
  Accessibility,
  CheckCircle2,
  MessageSquare,
  Search,
  CreditCard,
  ChevronUp,
  Star,
  User,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
} from 'recharts';
import {
  timeEfficiencyData,
  accessibilityStats,
  testimonials,
  specialties,
} from '../data/medicenterData';

interface HomeViewProps {
  onStartBooking: () => void;
  onStartTeleconsult: () => void;
  onSelectDistrict?: (district: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartBooking,
  onStartTeleconsult,
  onSelectDistrict,
}) => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const sedes = [
    { name: 'Sede Lima - Av. Petit Thouars', district: 'Jesús María' },
    { name: 'Sede San Borja - Av. Guardia Civil', district: 'San Borja' },
    { name: 'Sede El Polo - Av. Encalada', district: 'Santiago de Surco' },
    { name: 'Sede Miraflores - Calle Shell', district: 'Miraflores' },
    { name: 'Sede San Isidro - Av. Arequipa', district: 'San Isidro' },
    { name: 'Sede La Molina - Av. Raúl Ferrero', district: 'La Molina' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 bg-slate-50/30"
    >
      {/* Hero Section */}
      <div className="relative h-[500px] lg:h-[650px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600"
          alt="Edificio moderno de la clínica Medicenter con arquitectura vidriada en Lima"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-medical-blue via-medical-blue/80 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-2xl text-white">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-block bg-medical-green px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-md"
              >
                Líderes en Salud Digital - Lima, Perú
              </motion.div>
              <motion.h1
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight"
              >
                Cuidado que se adapta a tu vida
              </motion.h1>
              <p className="text-white/90 text-xl lg:text-2xl mb-10 leading-relaxed font-light">
                Diseñado para ser inclusivo, rápido y humano. Desde citas pediátricas hasta controles preventivos en más de 20 especialidades.
              </p>
              <div className="flex flex-wrap gap-6">
                <button
                  onClick={onStartBooking}
                  className="bg-medical-green text-white font-bold px-10 py-5 rounded-2xl text-lg shadow-2xl hover:scale-105 focus-visible:ring-4 focus-visible:ring-medical-green/50 outline-none transform transition-all cursor-pointer"
                >
                  Reservar Cita Local
                </button>
                <button
                  onClick={onStartTeleconsult}
                  className="bg-white/10 backdrop-blur-md text-white border-2 border-white/60 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-white/20 focus-visible:ring-4 focus-visible:ring-white/50 outline-none transition-all cursor-pointer"
                >
                  Teleconsulta Inmediata
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* 3 Main Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Agenda Autónoma */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-medical-blue mb-6 shadow-sm">
                <Calendar size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Agenda Autónoma</h2>
              <p className="text-slate-500 leading-relaxed">
                Sin colas telefónicas. Reserva, reprograma y consulta horarios disponibles en segundos desde tu smartphone.
              </p>
            </div>
            <button
              onClick={onStartBooking}
              className="mt-8 text-medical-blue font-bold flex items-center gap-2 group focus-visible:underline outline-none cursor-pointer"
              aria-label="Empezar reserva de cita autónoma"
            >
              <span>Sacar cita ahora</span>
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Card 2: Teleconsulta 24/7 */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-medical-green mb-6 shadow-sm">
                <Video size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Teleconsulta 24/7</h2>
              <p className="text-slate-500 leading-relaxed">
                Conexión directa con especialistas sin salir de casa. Incluye subtítulos en tiempo real para mayor accesibilidad.
              </p>
            </div>
            <button
              onClick={onStartTeleconsult}
              className="mt-8 text-medical-blue font-bold flex items-center gap-2 group focus-visible:underline outline-none cursor-pointer"
              aria-label="Hablar con un médico por teleconsulta"
            >
              <span>Hablar con un médico</span>
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Card 3: Red Multisede Lima */}
          <div className="bg-medical-blue p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-medical-blue/20">
            <div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Hospital size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Red Multisede Lima</h2>
              <p className="text-white/80 leading-relaxed">
                6 sedes hospitalarias equipadas con más de 20 especialidades y más de 110 médicos certificados.
              </p>
            </div>
            <button
              onClick={onStartBooking}
              className="mt-8 text-white font-bold flex items-center gap-2 group focus-visible:underline outline-none cursor-pointer"
            >
              <span>Ver médicos y sedes</span>
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </section>

        {/* Feature Banner: Cascada & Gestión de Citas */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={14} /> Sistema de Disponibilidad en Tiempo Real
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Reserva en Cascada y Gestión Total de tus Citas
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Filtra en 3 pasos: <strong className="text-white">Especialidad → Médico → Horario</strong> con restricción de 0% citas solapadas. Además, reprograma o cancela tus citas según el diagrama de estados oficial.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 shrink-0">
              <button
                onClick={onStartBooking}
                className="px-6 py-4 bg-medical-green text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-medical-green/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>Reserva en Cascada</span>
              </button>
            </div>
          </div>
        </section>

        {/* Efficiency in Numbers */}
        <section className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-800">
              Eficiencia Medicenter en Cifras
            </h2>
            <p className="text-lg text-slate-500">
              Transformamos la experiencia del paciente mediante tecnología y diseño centrado en el ser humano.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Chart 1 */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-medical-blue">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Gestión de Tiempo</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Minutos promedio para agendar una cita
                  </p>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeEfficiencyData}
                    layout="vertical"
                    margin={{ left: 20, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 14, fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(val: any) => [`${val} minutos`, 'Tiempo']}
                    />
                    <Bar dataKey="time" radius={[0, 10, 10, 0]} barSize={40}>
                      {timeEfficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <p className="text-medical-blue text-sm font-bold leading-relaxed">
                  Reducimos el tiempo administrativo en un 93% comparado con sistemas tradicionales presenciales o telefónicos.
                </p>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Accessibility size={120} />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-medical-green">
                  <Accessibility size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Modo Accesibilidad</h3>
                  <p className="text-sm text-white/50 font-medium">
                    Cumplimiento de estándares WCAG 2.1 AA
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 relative z-10">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accessibilityStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {accessibilityStats.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          color: '#000',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-medical-green shrink-0" size={20} />
                    <span className="text-sm font-medium">
                      Lectores de pantalla optimizados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-medical-green shrink-0" size={20} />
                    <span className="text-sm font-medium">
                      Contraste de alto desempeño
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-medical-green shrink-0" size={20} />
                    <span className="text-sm font-medium">
                      Navegación por teclado 100%
                    </span>
                  </div>
                  <p className="text-xs text-white/40 pt-4 italic">
                    Plataforma diseñada para ser usada por todos sin exclusión.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 text-center space-y-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">
                <MessageSquare size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Sencillez UX</h4>
              <p className="text-4xl font-black text-slate-900">4.9/5</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                Nivel de facilidad percibida por adultos mayores.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600">
                <Search size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Eficiencia en Búsqueda</h4>
              <p className="text-4xl font-black text-slate-900">95%</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                De pacientes encuentran a su especialista en &lt; 30 seg.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-medical-green">
                <CreditCard size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Pagos Online</h4>
              <p className="text-4xl font-black text-slate-900">88%</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                Adopción de pagos digitales vía Niubiz y Yape.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-extrabold text-slate-800">Voces de la comunidad</h2>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev > 0 ? prev - 1 : testimonials.length - 1
                  )
                }
                className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-medical-blue cursor-pointer transition-colors"
                aria-label="Testimonio anterior"
              >
                <ChevronUp className="-rotate-90" size={24} />
              </button>
              <button
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev < testimonials.length - 1 ? prev + 1 : 0
                  )
                }
                className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-medical-blue cursor-pointer transition-colors"
                aria-label="Siguiente testimonio"
              >
                <ChevronUp className="rotate-90" size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex text-yellow-400">
                    {Array(t.rating)
                      .fill(0)
                      .map((_, starI) => (
                        <Star key={starI} size={18} fill="currentColor" />
                      ))}
                  </div>
                  <p className="text-slate-700 italic text-lg font-medium leading-relaxed">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {t.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer / Sedes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-20 border-t border-slate-100">
          {/* Sedes */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800">MEDICENTER Sedes</h4>
            <ul className="space-y-4">
              {sedes.map((s) => (
                <li
                  key={s.name}
                  onClick={() => onSelectDistrict?.(s.district)}
                  className="flex items-center gap-3 text-slate-500 hover:text-medical-blue cursor-pointer group transition-colors"
                >
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-medical-blue transition-colors" />
                  <span className="text-sm font-medium">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hot Specialties */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800">Especialidades ({specialties.length})</h4>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={onStartBooking}
                  className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-medical-blue hover:text-white transition-colors cursor-pointer"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Contacto Urgencias */}
          <div className="bg-medical-blue/5 p-8 rounded-[3rem] border border-medical-blue/10 space-y-4">
            <h4 className="text-xl font-bold text-medical-blue">Contacto Urgencias</h4>
            <p className="text-slate-600 text-sm font-medium">
              Atención telefónica de emergencia las 24 horas del día en todas nuestras sedes de Lima.
            </p>
            <div className="text-2xl font-black text-medical-blue tracking-tight">
              (01) 411-8000
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
