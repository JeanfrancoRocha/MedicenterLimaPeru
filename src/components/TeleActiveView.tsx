import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  Info,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Captions,
  PhoneOff,
  MessageSquare,
  X,
  Paperclip,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import { Doctor } from '../data/medicenterData';

interface TeleActiveViewProps {
  doctor: Doctor;
  onEnd: () => void;
}

export const TeleActiveView: React.FC<TeleActiveViewProps> = ({ doctor, onEnd }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<
    { sender: 'doctor' | 'patient'; text: string; time: string }[]
  >([
    {
      sender: 'doctor',
      text: 'Hola Stefania, ya estoy revisando los análisis de sangre que enviaste. ¿Cómo sigue la fiebre?',
      time: '15:01',
    },
    {
      sender: 'patient',
      text: 'Hola doctora, amaneció mucho mejor, ya sin fiebre desde hace 4 horas.',
      time: '15:02',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'patient',
        text: inputMsg,
        time: '15:03',
      },
    ]);
    setInputMsg('');

    // Simulate doctor reply after a short delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doctor',
          text: 'Perfecto Stefania, mantengamos el reposo e hidratación según lo indicado.',
          time: '15:03',
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Video Canvas Area */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Remote Doctor Video Simulation */}
        <img
          src={doctor.image}
          alt={`Video de ${doctor.name}`}
          className="w-full h-full object-cover opacity-90 blur-[2px] scale-105"
        />

        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-medical-green overflow-hidden shadow-md">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{doctor.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Wifi size={12} className="text-medical-green" />
                <span className="text-[10px] font-bold text-medical-green uppercase tracking-wider">
                  Conexión excelente
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Abrir panel de información y chat"
          >
            <Info size={24} />
          </button>
        </div>

        {/* Self PIP View in top right */}
        <div className="absolute top-20 right-4 w-28 lg:w-40 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
          {isVideoOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-white/40" />
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider text-center px-2">
                Cámara Desactivada
              </span>
            </div>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=300"
              alt="Tu Video"
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              Stefania (Tú)
            </span>
            {isMuted && <MicOff size={12} className="text-red-500" />}
          </div>
        </div>

        {/* Live Subtitles overlay */}
        <AnimatePresence>
          {showCaptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-8 right-8 text-center z-10"
            >
              <p className="bg-black/60 backdrop-blur-md text-white text-lg font-medium px-4 py-2 rounded-xl inline-block border border-white/10 shadow-lg">
                &ldquo;Buenos días Stefania, ¿cómo se ha sentido el niño el día de hoy?&rdquo;
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Call Controls Bar */}
      <div className="bg-[#0A0A0A] px-6 py-10 border-t border-white/10 safe-area-bottom z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Mic */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={clsx(
                'w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all min-h-[72px] min-w-[72px] shadow-lg cursor-pointer',
                isMuted
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-medical-blue hover:bg-slate-100'
              )}
              aria-label={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
            >
              {isMuted ? <MicOff size={44} strokeWidth={2.5} /> : <Mic size={44} strokeWidth={2.5} />}
            </button>
            <span className="text-xs font-black text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md">
              {isMuted ? 'ACTIVAR' : 'SILENCIAR'}
            </span>
          </div>

          {/* Camera */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={clsx(
                'w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all min-h-[72px] min-w-[72px] shadow-lg cursor-pointer',
                isVideoOff
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-medical-blue hover:bg-slate-100'
              )}
              aria-label={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
            >
              {isVideoOff ? (
                <VideoOff size={44} strokeWidth={2.5} />
              ) : (
                <Video size={44} strokeWidth={2.5} />
              )}
            </button>
            <span className="text-xs font-black text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md">
              CÁMARA
            </span>
          </div>

          {/* Captions */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={clsx(
                'w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all min-h-[72px] min-w-[72px] shadow-lg cursor-pointer',
                showCaptions
                  ? 'bg-medical-green text-white'
                  : 'bg-white text-medical-blue hover:bg-slate-100'
              )}
              aria-label={
                showCaptions
                  ? 'Desactivar subtítulos'
                  : 'Activar subtítulos en tiempo real'
              }
            >
              <Captions size={44} strokeWidth={2.5} />
            </button>
            <span className="text-xs font-black text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md text-center">
              SUBTÍTULOS
            </span>
          </div>

          {/* End Call */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onEnd}
              className="w-[84px] h-[84px] bg-[#DE350B] text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40 min-h-[84px] min-w-[84px] cursor-pointer"
              aria-label="Finalizar llamada"
            >
              <PhoneOff size={48} strokeWidth={2.5} />
            </button>
            <span className="text-xs font-black text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md">
              FINALIZAR
            </span>
          </div>
        </div>
      </div>

      {/* Slide-up Chat and Files Drawer */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[120] max-h-[80%] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-medical-blue">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Chat y Archivos</h3>
                    <p className="text-xs text-slate-500">
                      Comparte fotos y dudas con la doctora
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-medical-blue outline-none cursor-pointer"
                  aria-label="Cerrar panel de chat"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[400px]"
                role="log"
                aria-live="polite"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'p-4 rounded-2xl text-sm max-w-[80%]',
                      msg.sender === 'doctor'
                        ? 'bg-slate-50 text-slate-600'
                        : 'bg-medical-blue text-white ml-auto self-end'
                    )}
                  >
                    <p className="font-semibold text-[10px] opacity-75 mb-1">
                      {msg.sender === 'doctor' ? doctor.name : 'Tú'} • {msg.time}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => alert('Adjuntar archivo: imágenes o resultados de laboratorio')}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-medical-blue border border-slate-200 shadow-sm hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] cursor-pointer"
                  aria-label="Adjuntar archivo"
                >
                  <Paperclip size={24} />
                </button>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-medical-blue transition-all text-sm"
                />
                <button
                  type="submit"
                  className="w-12 h-12 bg-medical-blue rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-blue-800 transition-all cursor-pointer"
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
