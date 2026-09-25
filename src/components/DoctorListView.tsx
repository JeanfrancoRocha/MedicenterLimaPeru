import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Doctor, specialties, AppointmentRecord } from '../data/medicenterData';
import { DoctorCard } from './DoctorCard';

interface DoctorListViewProps {
  doctors: Doctor[];
  district: string;
  initialSpecialty?: string;
  appointments?: AppointmentRecord[];
  onSelect: (doctor: Doctor, time: string, date: string) => void;
  onBack: () => void;
}

export const DoctorListView: React.FC<DoctorListViewProps> = ({
  doctors,
  district,
  initialSpecialty = '',
  appointments = [],
  onSelect,
  onBack,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const normalizeStr = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const filteredDoctors = doctors.filter((doc) => {
    if (!district) return false;
    const docDist = normalizeStr(doc.district);
    const targetDist = normalizeStr(district);
    const matchesDistrict = docDist === targetDist;

    const matchesSpecialty =
      !selectedSpecialty || doc.specialty === selectedSpecialty;

    const matchesSearch =
      !searchTerm ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDistrict && matchesSpecialty && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 md:p-8 space-y-8"
    >
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-500 hover:text-medical-blue transition-all min-h-[44px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-medical-blue rounded-full px-2"
          aria-label="Volver"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-medical-blue/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-black text-xs uppercase tracking-[0.2em]">
            Volver a Distritos
          </span>
        </button>
      </div>

      {/* Header and Filter Info */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Especialistas en {district}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-medical-green animate-pulse" />
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              {filteredDoctors.length} médicos disponibles
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar doctor o especialidad..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-medical-blue shadow-sm"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="">Todas las Especialidades ({specialties.length})</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-8">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              appointments={appointments}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center space-y-4">
            <p className="text-slate-500 font-bold text-lg">
              No encontramos doctores con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSelectedSpecialty('');
                setSearchTerm('');
              }}
              className="px-6 py-2.5 bg-medical-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Ver todos los médicos de {district}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
