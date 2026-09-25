import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

export type BookingStep = 'especialista' | 'horario' | 'confirmar';

interface StepIndicatorProps {
  currentStep: BookingStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'especialista', label: 'Especialista' },
    { id: 'horario', label: 'Horario' },
    { id: 'confirmar', label: 'Confirmar' },
  ];

  const currentIndex = steps.findIndex((r) => r.id === currentStep);

  return (
    <div className="w-full max-w-md mx-auto px-6 py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
        
        {/* Active progress fill line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          className="absolute top-1/2 left-0 h-[2px] bg-medical-blue -translate-y-1/2 z-0 transition-all duration-500"
        />

        {steps.map((step, idx) => {
          const isPassedOrCurrent = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isPassedOrCurrent ? 'var(--color-medical-blue)' : '#ffffff',
                  borderColor: isPassedOrCurrent ? 'var(--color-medical-blue)' : '#E2E8F0',
                }}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shadow-sm'
                )}
              >
                {isPassedOrCurrent && idx < currentIndex ? (
                  <Check size={14} className="text-white" strokeWidth={3.5} />
                ) : (
                  <span
                    className={clsx(
                      'text-xs font-black',
                      isPassedOrCurrent ? 'text-white' : 'text-slate-400'
                    )}
                  >
                    {idx + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={clsx(
                  'text-[10px] font-black uppercase tracking-widest',
                  isPassedOrCurrent ? 'text-medical-blue' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
