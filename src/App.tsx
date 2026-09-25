import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  AuthUser,
  Doctor,
  AppointmentRecord,
  getStoredSession,
  setStoredSession,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredDoctors,
  saveStoredDoctors,
  isSlotOverlapped,
} from './data/medicenterData';
import {
  getStoredNormalizedDB,
  syncNormalizedDBWithAppointments,
} from './db/normalizedModels';
import { Header } from './components/Header';
import { StepIndicator, BookingStep } from './components/StepIndicator';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { DoctorListView } from './components/DoctorListView';
import { PreConfirmationView } from './components/PreConfirmationView';
import { ConfirmationView } from './components/ConfirmationView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { TeleWaitingView } from './components/TeleWaitingView';
import { TeleActiveView } from './components/TeleActiveView';
import { DoctorPortal } from './components/DoctorPortal';
import { ReceptionistPortal } from './components/ReceptionistPortal';
import { AdminPortal } from './components/AdminPortal';
import { LoginModal } from './components/LoginModal';
import { BottomNav, AppStep } from './components/BottomNav';

interface AppState {
  step: AppStep;
  selectedDoctor: Doctor | null;
  selectedTeleDoctor: Doctor | null;
  selectedTime: string | null;
  selectedDate: string | null;
  selectedDistrict: string;
  selectedSpecialty: string;
  highContrast: boolean;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const session = getStoredSession();
    if (session?.username === 'paciente_stefania') return null;
    return session;
  });
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() =>
    getStoredAppointments()
  );
  const [doctors, setDoctors] = useState<Doctor[]>(() => getStoredDoctors());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleUpdateDoctors = (newDocs: Doctor[]) => {
    setDoctors(newDocs);
    saveStoredDoctors(newDocs);
  };

  // Initial step based on current saved session
  const getInitialStep = (): AppStep => {
    const session = getStoredSession();
    if (session?.role === 'medico') return 'DOCTOR_PORTAL';
    if (session?.role === 'recepcionista') return 'RECEPTIONIST_PORTAL';
    if (session?.role === 'admin') return 'ADMIN_PORTAL';
    return 'HOME';
  };

  const [state, setState] = useState<AppState>({
    step: getInitialStep(),
    selectedDoctor: null,
    selectedTeleDoctor: null,
    selectedTime: null,
    selectedDate: null,
    selectedDistrict: 'Jesús María',
    selectedSpecialty: '',
    highContrast: false,
  });

  // Keep session in localStorage
  useEffect(() => {
    setStoredSession(currentUser);
  }, [currentUser]);

  // Keep appointments in localStorage and sync with normalized 12-table DB
  useEffect(() => {
    saveStoredAppointments(appointments);
    const db = getStoredNormalizedDB();
    syncNormalizedDBWithAppointments(appointments, db);
  }, [appointments]);

  // Protected route guard
  useEffect(() => {
    if (state.step === 'DOCTOR_PORTAL' && currentUser?.role !== 'medico') {
      setState((prev) => ({ ...prev, step: 'HOME' }));
    } else if (
      state.step === 'RECEPTIONIST_PORTAL' &&
      currentUser?.role !== 'recepcionista'
    ) {
      setState((prev) => ({ ...prev, step: 'HOME' }));
    } else if (state.step === 'ADMIN_PORTAL' && currentUser?.role !== 'admin') {
      setState((prev) => ({ ...prev, step: 'HOME' }));
    }
  }, [state.step, currentUser]);

  // Handle Login Event with Role Redirection
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'paciente') {
      // Paciente goes directly to appointment booking flow!
      setState((prev) => ({ ...prev, step: 'SEARCH' }));
    } else if (user.role === 'medico') {
      setState((prev) => ({ ...prev, step: 'DOCTOR_PORTAL' }));
    } else if (user.role === 'recepcionista') {
      setState((prev) => ({ ...prev, step: 'RECEPTIONIST_PORTAL' }));
    } else if (user.role === 'admin') {
      setState((prev) => ({ ...prev, step: 'ADMIN_PORTAL' }));
    }
  };

  // Handle Logout Event
  const handleLogout = () => {
    setCurrentUser(null);
    setState((prev) => ({ ...prev, step: 'HOME' }));
  };

  // Flow handlers
  const handleSearch = (district: string, specialty?: string) => {
    setState((prev) => ({
      ...prev,
      selectedDistrict: district,
      selectedSpecialty: specialty || '',
      step: 'DOCTOR_LIST',
    }));
  };

  const handleSelectSlot = (doctor: Doctor, time: string, date: string) => {
    setState((prev) => ({
      ...prev,
      selectedDoctor: doctor,
      selectedTime: time,
      selectedDate: date,
      step: 'PRE_CONFIRMATION',
    }));
  };

  const handleConfirm = (patientData: {
    dni: string;
    phone: string;
    name: string;
    email?: string;
    insurance?: string;
    consentAccepted?: boolean;
    signatureData?: string;
  }) => {
    if (!state.selectedDoctor || !state.selectedTime || !state.selectedDate) return;

    // Strict 0% overlap validation before creating
    const isOverlapped = isSlotOverlapped(
      state.selectedDoctor.id,
      state.selectedDate,
      state.selectedTime,
      appointments
    );

    if (isOverlapped) {
      alert(
        'El horario seleccionado acaba de ser reservado por otro paciente. Por favor, selecciona otro horario.'
      );
      setState((prev) => ({ ...prev, step: 'DOCTOR_LIST' }));
      return;
    }

    // Create real Appointment Record into shared system with initial state "Solicitada"
    const newAppointment: AppointmentRecord = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientData.name || currentUser?.name || 'Paciente',
      patientDni: patientData.dni || currentUser?.dni || '',
      patientPhone: patientData.phone || currentUser?.phone || '',
      patientEmail: patientData.email || '',
      insurance: patientData.insurance || 'Particular',
      doctorId: state.selectedDoctor.id,
      doctorName: state.selectedDoctor.name,
      specialty: state.selectedDoctor.specialty,
      hospital: state.selectedDoctor.hospital,
      district: state.selectedDoctor.district,
      date: state.selectedDate,
      time: state.selectedTime,
      status: 'Solicitada', // First state in requested diagram
      consentAccepted: patientData.consentAccepted ?? true,
      signatureData: patientData.signatureData,
      signatureTimestamp: new Date().toISOString(),
      paymentStatus: 'Pendiente',
      paymentMethod: 'Pendiente',
      amount: 100,
      createdAt: new Date().toISOString(),
      history: [
        {
          action: 'Solicitud Registrada',
          timestamp: new Date().toISOString(),
          note: 'Cita reservada mediante admisión web con DNI y consentimiento informado digital.',
        },
      ],
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setState((prev) => ({ ...prev, step: 'CONFIRMATION' }));
  };

  // Patient Actions: Cancel Appointment
  const handleCancelAppointment = (appointmentId: string, reason: string) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status: 'Cancelada',
            cancellationReason: reason,
            history: [
              ...(apt.history || []),
              {
                action: 'Cancelación',
                timestamp: new Date().toISOString(),
                note: `Cancelada por el paciente. Motivo: ${reason}. Horario liberado en agenda.`,
              },
            ],
          };
        }
        return apt;
      })
    );
  };

  // Patient Actions: Reprogram Appointment
  const handleReprogramAppointment = (
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          const prevDate = apt.date;
          const prevTime = apt.time;
          return {
            ...apt,
            date: newDate,
            time: newTime,
            status: 'Reprogramada',
            reprogrammedFrom: {
              date: prevDate,
              time: prevTime,
            },
            history: [
              ...(apt.history || []),
              {
                action: 'Reprogramación',
                timestamp: new Date().toISOString(),
                note: `Reprogramada de ${prevDate} ${prevTime} a ${newDate} ${newTime}. Horario anterior liberado.`,
              },
            ],
          };
        }
        return apt;
      })
    );
  };

  const handleStartTele = () => {
    setState((prev) => ({
      ...prev,
      step: 'TELE_WAITING',
      selectedTeleDoctor: null,
    }));
  };

  const handleSelectTeleDoctor = (doctor: Doctor) => {
    setState((prev) => ({ ...prev, selectedTeleDoctor: doctor }));
  };

  const handleFinish = () => {
    setState((prev) => ({
      ...prev,
      step: 'HOME',
      selectedDoctor: null,
      selectedTime: null,
      selectedDate: null,
    }));
  };

  // Appointment updates from portals
  const handleUpdateAppointment = (updated: AppointmentRecord) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === updated.id ? updated : apt))
    );
  };

  const handleAddAppointment = (newApt: AppointmentRecord) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const isBookingFlow = [
    'SEARCH',
    'DOCTOR_LIST',
    'PRE_CONFIRMATION',
    'CONFIRMATION',
  ].includes(state.step);

  const bookingStepName: BookingStep =
    state.step === 'SEARCH'
      ? 'especialista'
      : state.step === 'DOCTOR_LIST'
      ? 'horario'
      : 'confirmar';

  return (
    <div
      className={clsx(
        'min-h-screen transition-colors duration-300 bg-slate-50',
        state.highContrast ? 'high-contrast' : ''
      )}
    >
      {/* Header with Accessibility and LOGIN */}
      {state.step !== 'TELE_ACTIVE' && (
        <Header
          highContrast={state.highContrast}
          onToggleContrast={() =>
            setState((prev) => ({ ...prev, highContrast: !prev.highContrast }))
          }
          onLogoClick={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Step Indicator on booking flow */}
      {isBookingFlow && (
        <div className="bg-white border-b border-slate-50">
          <StepIndicator currentStep={bookingStepName} />
        </div>
      )}

      {/* Main Container */}
      <main
        className={clsx(
          'max-w-7xl mx-auto bg-white min-h-[calc(100vh-140px)] shadow-xl shadow-slate-200/50',
          state.step === 'TELE_ACTIVE' ? 'max-w-none p-0 bg-black' : 'pb-20'
        )}
      >
        {/* VIEW: HOME */}
        {state.step === 'HOME' && (
          <HomeView
            onStartBooking={() => setState((prev) => ({ ...prev, step: 'SEARCH' }))}
            onStartTeleconsult={handleStartTele}
            onSelectDistrict={(dist) => {
              setState((prev) => ({
                ...prev,
                selectedDistrict: dist,
                selectedSpecialty: '',
                step: 'DOCTOR_LIST',
              }));
            }}
          />
        )}

        <div
          className={clsx(
            'mx-auto w-full px-4 md:px-0',
            state.step === 'TELE_ACTIVE' ? 'max-w-none' : 'max-w-6xl'
          )}
        >
          {/* VIEW: SEARCH / CASCADE WIZARD (SACAR CITA) */}
          {state.step === 'SEARCH' && (
            <SearchView
              doctors={doctors}
              appointments={appointments}
              onSelectSlot={handleSelectSlot}
              onSearch={handleSearch}
            />
          )}

          {/* VIEW: DOCTOR LIST */}
          {state.step === 'DOCTOR_LIST' && (
            <DoctorListView
              doctors={doctors}
              district={state.selectedDistrict}
              initialSpecialty={state.selectedSpecialty}
              appointments={appointments}
              onSelect={handleSelectSlot}
              onBack={() => setState((prev) => ({ ...prev, step: 'SEARCH' }))}
            />
          )}

          {/* VIEW: PRE-CONFIRMATION (REGISTRO / ADMISIÓN CON DNI Y CONSENTIMIENTO DIGITAL) */}
          {state.step === 'PRE_CONFIRMATION' &&
            state.selectedDoctor &&
            state.selectedTime &&
            state.selectedDate && (
              <PreConfirmationView
                doctor={state.selectedDoctor}
                time={state.selectedTime}
                date={state.selectedDate}
                onConfirm={handleConfirm}
                onBack={() => setState((prev) => ({ ...prev, step: 'DOCTOR_LIST' }))}
                defaultName={currentUser?.name || ''}
                defaultDni={currentUser?.dni || ''}
                defaultPhone={currentUser?.phone || ''}
              />
            )}

          {/* VIEW: CONFIRMATION */}
          {state.step === 'CONFIRMATION' &&
            state.selectedDoctor &&
            state.selectedTime &&
            state.selectedDate && (
              <ConfirmationView
                doctor={state.selectedDoctor}
                time={state.selectedTime}
                date={state.selectedDate}
                onFinish={handleFinish}
              />
            )}

          {/* VIEW: MIS CITAS (GESTIÓN DE CITAS REGISTRADAS: CANCELAR O REPROGRAMAR) */}
          {state.step === 'MY_APPOINTMENTS' && (
            <MyAppointmentsView
              appointments={appointments}
              doctors={doctors}
              patientDni={currentUser?.dni || '44892104'}
              onCancelAppointment={handleCancelAppointment}
              onReprogramAppointment={handleReprogramAppointment}
              onGoToBooking={() => setState((prev) => ({ ...prev, step: 'SEARCH' }))}
            />
          )}

          {/* VIEW: TELECONSULTATION WAITING ROOM */}
          {state.step === 'TELE_WAITING' && (
            <TeleWaitingView
              doctors={doctors.filter((m) => m.id.startsWith('tele-'))}
              selectedDoctor={state.selectedTeleDoctor}
              onSelectDoctor={handleSelectTeleDoctor}
              onStart={() => setState((prev) => ({ ...prev, step: 'TELE_ACTIVE' }))}
              onCancel={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
            />
          )}

          {/* VIEW: TELECONSULTATION ACTIVE CALL */}
          {state.step === 'TELE_ACTIVE' && (
            <TeleActiveView
              doctor={
                state.selectedTeleDoctor ||
                doctors.find((m) => m.id === 'tele-1') ||
                doctors[0]
              }
              onEnd={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
            />
          )}

          {/* VIEW: DOCTOR PORTAL (PROTECTED) */}
          {state.step === 'DOCTOR_PORTAL' && currentUser && currentUser.role === 'medico' && (
            <DoctorPortal
              currentUser={currentUser}
              appointments={appointments}
              onUpdateAppointment={handleUpdateAppointment}
              onGoToHome={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
            />
          )}

          {/* VIEW: RECEPTIONIST PORTAL (PROTECTED) */}
          {state.step === 'RECEPTIONIST_PORTAL' &&
            currentUser &&
            currentUser.role === 'recepcionista' && (
              <ReceptionistPortal
                currentUser={currentUser}
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
                onUpdateAppointment={handleUpdateAppointment}
                onGoToHome={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
              />
            )}

          {/* VIEW: ADMIN PORTAL (PROTECTED) */}
          {state.step === 'ADMIN_PORTAL' && currentUser && currentUser.role === 'admin' && (
            <AdminPortal
              currentUser={currentUser}
              appointments={appointments}
              doctors={doctors}
              onUpdateDoctors={handleUpdateDoctors}
              onUpdateAppointment={handleUpdateAppointment}
              onGoToHome={() => setState((prev) => ({ ...prev, step: 'HOME' }))}
            />
          )}
        </div>
      </main>

      {/* Bottom Nav: Inicio, Sacar Cita, Mis Citas, and Portal shortcut if role active */}
      {state.step !== 'TELE_ACTIVE' && (
        <BottomNav
          currentStep={state.step}
          onNavigate={(targetStep) =>
            setState((prev) => ({ ...prev, step: targetStep }))
          }
          currentUser={currentUser}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
