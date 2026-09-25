import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Mic, MapPin, ChevronRight, Stethoscope, Sparkles, Building2 } from 'lucide-react';
import clsx from 'clsx';
import { districts as defaultDistricts, specialties, Doctor, AppointmentRecord } from '../data/medicenterData';
import { CascadeBookingWizard } from './CascadeBookingWizard';

interface SearchViewProps {
  doctors?: Doctor[];
  appointments?: AppointmentRecord[];
  onSelectSlot?: (doctor: Doctor, time: string, date: string) => void;
  onSearch: (district: string, specialty?: string) => void;
  onSearchQuery?: (query: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  doctors = [],
  appointments = [],
  onSelectSlot,
  onSearch,
  onSearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'cascade' | 'districts'>('cascade');
  const [districtsList, setDistrictsList] = useState<string[]>(defaultDistricts);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedSpec, setSelectedSpec] = useState<string>('');

  useEffect(() => {
    fetch('/api/districts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDistrictsList(data.filter((u: string) => u !== 'Virtual'));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching districts, using defaults:', err);
        setLoading(false);
      });
  }, []);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-PE';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearchQuery?.(transcript);

        // Check if matches a district
        const matched = districtsList.find((d) =>
          d.toLowerCase().includes(transcript.toLowerCase())
        );
        if (matched) {
          onSearch(matched, selectedSpec);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const filteredDistricts = districtsList.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 space-y-8"
    >
      {/* Top View Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight">
            Reserva de Citas Médicas
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Disponibilidad en tiempo real sin esperas y 0% citas solapadas
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('cascade')}
            className={clsx(
              'px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'cascade'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Sparkles size={14} className={activeTab === 'cascade' ? 'text-medical-blue' : ''} />
            <span>Filtro en Cascada</span>
          </button>

          <button
            onClick={() => setActiveTab('districts')}
            className={clsx(
              'px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'districts'
                ? 'bg-white text-medical-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Building2 size={14} className={activeTab === 'districts' ? 'text-medical-blue' : ''} />
            <span>Sedes & Distritos</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CASCADE WIZARD (ESPECIALIDAD -> MÉDICO -> HORARIO DISPONIBLE) */}
      {activeTab === 'cascade' && onSelectSlot && (
        <CascadeBookingWizard
          doctors={doctors}
          appointments={appointments}
          onSelectSlot={onSelectSlot}
        />
      )}

      {/* VIEW 2: DISTRITOS Y SEDES */}
      {activeTab === 'districts' && (
        <div className="space-y-8">
          {/* Search Input with Voice button */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-medical-blue transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearchQuery?.(e.target.value);
              }}
              placeholder="Buscar por distrito o sede..."
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-14 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 outline-none transition-all text-base min-h-[58px]"
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute inset-y-0 right-2 flex items-center px-4 transition-colors min-h-[44px] min-w-[44px] cursor-pointer ${
                isListening ? 'text-medical-green animate-pulse' : 'text-slate-400 hover:text-medical-blue'
              }`}
              aria-label="Búsqueda por voz"
              title="Búsqueda por voz"
            >
              <Mic size={22} />
            </button>
          </div>

          {/* Specialties filter strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                <Stethoscope size={16} className="text-medical-blue" />
                Filtrar por Especialidad ({specialties.length})
              </h2>
              {selectedSpec && (
                <button
                  onClick={() => setSelectedSpec('')}
                  className="text-xs text-medical-blue font-bold hover:underline cursor-pointer"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => {
                    const next = selectedSpec === spec ? '' : spec;
                    setSelectedSpec(next);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedSpec === spec
                      ? 'bg-medical-blue text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Districts Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                Distritos y Sedes en Lima
              </h2>
              <button
                onClick={() => setQuery('')}
                className="text-sm text-medical-blue font-medium cursor-pointer hover:underline"
              >
                Ver todos
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-10">
                <div className="w-8 h-8 border-2 border-medical-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredDistricts.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => onSearch(dist, selectedSpec)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-medical-blue hover:shadow-md transition-all group min-h-[64px] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-medical-blue transition-colors shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 group-hover:text-medical-blue block">
                          {dist}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Ver médicos disponibles
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-medical-blue shrink-0 transition-colors"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
