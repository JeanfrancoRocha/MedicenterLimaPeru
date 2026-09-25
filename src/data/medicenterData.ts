export type UserRole = "paciente" | "medico" | "recepcionista" | "admin";

export interface AuthUser {
  role: UserRole;
  username: string;
  name: string;
  dni?: string;
  phone?: string;
  // Doctor specific
  doctorId?: string;
  specialty?: string;
  cmp?: string;
  hospital?: string;
  district?: string;
  // Receptionist specific
  receptionistId?: string;
  sede?: string;
  shift?: string;
  desk?: string;
}

export interface TimeSlot {
  time: string;
  status: "available" | "occupied";
}

export interface DayAvailability {
  date: string;
  times: TimeSlot[];
}

export interface Doctor {
  id: string;
  username: string;
  password?: string;
  name: string;
  cmp: string;
  specialty: string;
  district: string;
  hospital: string;
  rating: number;
  reviewCount: number;
  image: string;
  availability: DayAvailability[];
}

export interface Receptionist {
  id: string;
  username: string;
  password?: string;
  name: string;
  sede: string;
  district: string;
  shift: string;
  desk: string;
}

export type AppointmentStatus =
  | "Solicitada"
  | "Confirmada"
  | "Reprogramada"
  | "Cancelada"
  | "Pendiente"
  | "Cancelado"
  | "Llegó / En Espera"
  | "En Consulta"
  | "Atendido"
  | "En sala de espera"
  | "En atención"
  | "Atendida"
  | "No Asistió (No-Show)";

export type SlotAvailabilityStatus = "Disponible" | "Reservado" | "No disponible";

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
}

export interface Consultorio {
  id: string;
  code: string;
  sede: string;
  district: string;
  floor: string;
  specialty: string;
  assignedDoctorName?: string;
  status: "Activo" | "Mantenimiento" | "Inactivo";
}

export interface AppointmentRecord {
  id: string;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: string;
  insurance?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  district: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  reprogrammedFrom?: { date: string; time: string };
  consentAccepted?: boolean;
  signatureData?: string;
  signatureTimestamp?: string;
  paymentStatus: "Pendiente" | "Pagado" | "Exonerado";
  paymentMethod: "Efectivo" | "Tarjeta POS" | "Yape / Plin" | "Transferencia" | "Pendiente";
  amount: number;
  receiptNumber?: string;
  receiptIssuedAt?: string;
  diagnosis?: string;
  prescription?: string;
  clinicalObservations?: string;
  medicalHistory?: string;
  vitalSigns?: VitalSigns;
  attendedAt?: string;
  createdAt: string;
  history?: {
    action: string;
    timestamp: string;
    note: string;
  }[];
}

export const isSlotOverlapped = (
  doctorId: string,
  date: string,
  time: string,
  appointments: AppointmentRecord[]
): boolean => {
  return appointments.some(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== "Cancelada"
  );
};

export const getDoctorSlotStatus = (
  doctor: Doctor,
  date: string,
  time: string,
  appointments: AppointmentRecord[]
): SlotAvailabilityStatus => {
  // 1. Check active appointment collision in real-time (Strict 0% overlap rule)
  if (isSlotOverlapped(doctor.id, date, time, appointments)) {
    return "Reservado";
  }

  // 2. Check doctor's defined schedule
  const day = doctor.availability.find((d) => d.date === date);
  if (!day) return "No disponible";

  const slot = day.times.find((t) => t.time === time);
  if (!slot) return "No disponible";

  if (slot.status === "occupied") return "Reservado";

  // Noon lunch break or off-hours as example of "No disponible"
  if (time === "01:00 PM" && (doctor.id.endsWith("5") || doctor.id.endsWith("0"))) {
    return "No disponible";
  }

  return "Disponible";
};

export const generateAvailability = (): DayAvailability[] => {
  const dates = ["Hoy", "Mañana", "19 May", "20 May", "21 May", "22 May", "23 May"];
  const timesList = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];
  return dates.map(date => ({
    date,
    times: timesList.map(time => ({
      time,
      status: Math.random() > 0.35 ? "available" : "occupied"
    }))
  }));
};

export const specialties: string[] = [
  "Cardiología",
  "Pediatría",
  "Ginecología y Obstetricia",
  "Dermatología",
  "Oftalmología",
  "Medicina General",
  "Odontología",
  "Traumatología y Ortopedia",
  "Neurología",
  "Urología",
  "Endocrinología",
  "Gastroenterología",
  "Neumología",
  "Psiquiatría",
  "Psicología",
  "Reumatología",
  "Otorrinolaringología",
  "Nutrición y Dietética",
  "Oncología",
  "Medicina Interna",
  "Nefrología",
  "Infectología"
];

export const sedesList = [
  {
    "name": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María"
  },
  {
    "name": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja"
  },
  {
    "name": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco"
  },
  {
    "name": "Sede Miraflores - Calle Shell",
    "district": "Miraflores"
  },
  {
    "name": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro"
  },
  {
    "name": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina"
  }
];

export const districts = sedesList.map(s => s.district);

const rawDoctors = [
  {
    "id": "medico1",
    "username": "medico1",
    "password": "medico1",
    "name": "Dr. Carlos Rodríguez",
    "cmp": "CMP-40123",
    "specialty": "Cardiología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 103,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico2",
    "username": "medico2",
    "password": "medico2",
    "name": "Dra. María Fernández",
    "cmp": "CMP-40246",
    "specialty": "Cardiología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.9,
    "reviewCount": 126,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico3",
    "username": "medico3",
    "password": "medico3",
    "name": "Dr. Jorge Luis Ramos",
    "cmp": "CMP-40369",
    "specialty": "Cardiología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.7,
    "reviewCount": 149,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico4",
    "username": "medico4",
    "password": "medico4",
    "name": "Dra. Lucía Mendoza",
    "cmp": "CMP-40492",
    "specialty": "Cardiología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 172,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico5",
    "username": "medico5",
    "password": "medico5",
    "name": "Dr. Ricardo Tovar",
    "cmp": "CMP-40615",
    "specialty": "Cardiología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.6,
    "reviewCount": 195,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico6",
    "username": "medico6",
    "password": "medico6",
    "name": "Dra. Andrea Castro",
    "cmp": "CMP-40738",
    "specialty": "Pediatría",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 218,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico7",
    "username": "medico7",
    "password": "medico7",
    "name": "Dra. Elena Ramos",
    "cmp": "CMP-40861",
    "specialty": "Pediatría",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.9,
    "reviewCount": 241,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico8",
    "username": "medico8",
    "password": "medico8",
    "name": "Dr. Alberto Fujii",
    "cmp": "CMP-40984",
    "specialty": "Pediatría",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.7,
    "reviewCount": 264,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico9",
    "username": "medico9",
    "password": "medico9",
    "name": "Dra. Carmen Rosa",
    "cmp": "CMP-41107",
    "specialty": "Pediatría",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 287,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico10",
    "username": "medico10",
    "password": "medico10",
    "name": "Dr. Luis Miguel",
    "cmp": "CMP-41230",
    "specialty": "Pediatría",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.6,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico11",
    "username": "medico11",
    "password": "medico11",
    "name": "Dr. Antonio Guerra",
    "cmp": "CMP-41353",
    "specialty": "Ginecología y Obstetricia",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 333,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico12",
    "username": "medico12",
    "password": "medico12",
    "name": "Dra. Sofía Salas",
    "cmp": "CMP-41476",
    "specialty": "Ginecología y Obstetricia",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.9,
    "reviewCount": 356,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico13",
    "username": "medico13",
    "password": "medico13",
    "name": "Dr. Pablo Neruda",
    "cmp": "CMP-41599",
    "specialty": "Ginecología y Obstetricia",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.7,
    "reviewCount": 379,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico14",
    "username": "medico14",
    "password": "medico14",
    "name": "Dr. César Vallejo",
    "cmp": "CMP-41722",
    "specialty": "Ginecología y Obstetricia",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 402,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico15",
    "username": "medico15",
    "password": "medico15",
    "name": "Dr. Manuel Belgrano",
    "cmp": "CMP-41845",
    "specialty": "Ginecología y Obstetricia",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.6,
    "reviewCount": 425,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico16",
    "username": "medico16",
    "password": "medico16",
    "name": "Dra. Ingrid Bergman",
    "cmp": "CMP-41968",
    "specialty": "Dermatología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 98,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico17",
    "username": "medico17",
    "password": "medico17",
    "name": "Dr. Sebastian Bach",
    "cmp": "CMP-42091",
    "specialty": "Dermatología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico18",
    "username": "medico18",
    "password": "medico18",
    "name": "Dr. Pedro Castillo",
    "cmp": "CMP-42214",
    "specialty": "Dermatología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.7,
    "reviewCount": 144,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico19",
    "username": "medico19",
    "password": "medico19",
    "name": "Dra. Dina Boluarte",
    "cmp": "CMP-42337",
    "specialty": "Dermatología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 167,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico20",
    "username": "medico20",
    "password": "medico20",
    "name": "Dra. Keiko Fujimori",
    "cmp": "CMP-42460",
    "specialty": "Dermatología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.6,
    "reviewCount": 190,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico21",
    "username": "medico21",
    "password": "medico21",
    "name": "Dr. Alan García",
    "cmp": "CMP-42583",
    "specialty": "Oftalmología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 213,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico22",
    "username": "medico22",
    "password": "medico22",
    "name": "Dra. Verónika Mendoza",
    "cmp": "CMP-42706",
    "specialty": "Oftalmología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.9,
    "reviewCount": 236,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico23",
    "username": "medico23",
    "password": "medico23",
    "name": "Dr. Alejandro Toledo",
    "cmp": "CMP-42829",
    "specialty": "Oftalmología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.7,
    "reviewCount": 259,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico24",
    "username": "medico24",
    "password": "medico24",
    "name": "Dra. Susana Villarán",
    "cmp": "CMP-42952",
    "specialty": "Oftalmología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 282,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico25",
    "username": "medico25",
    "password": "medico25",
    "name": "Dr. Ollanta Humala",
    "cmp": "CMP-43075",
    "specialty": "Oftalmología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.6,
    "reviewCount": 305,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico26",
    "username": "medico26",
    "password": "medico26",
    "name": "Dra. Nadine Heredia",
    "cmp": "CMP-43198",
    "specialty": "Medicina General",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 328,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico27",
    "username": "medico27",
    "password": "medico27",
    "name": "Dr. Pedro Pablo K.",
    "cmp": "CMP-43321",
    "specialty": "Medicina General",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.9,
    "reviewCount": 351,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico28",
    "username": "medico28",
    "password": "medico28",
    "name": "Dra. Mercedes Aráoz",
    "cmp": "CMP-43444",
    "specialty": "Medicina General",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.7,
    "reviewCount": 374,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico29",
    "username": "medico29",
    "password": "medico29",
    "name": "Dr. Kenji Fujimori",
    "cmp": "CMP-43567",
    "specialty": "Medicina General",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 397,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico30",
    "username": "medico30",
    "password": "medico30",
    "name": "Dra. Luciana León",
    "cmp": "CMP-43690",
    "specialty": "Medicina General",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.6,
    "reviewCount": 420,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico31",
    "username": "medico31",
    "password": "medico31",
    "name": "Dr. Fernando Belaunde",
    "cmp": "CMP-43813",
    "specialty": "Odontología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 93,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico32",
    "username": "medico32",
    "password": "medico32",
    "name": "Dra. Violeta Correa",
    "cmp": "CMP-43936",
    "specialty": "Odontología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.9,
    "reviewCount": 116,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico33",
    "username": "medico33",
    "password": "medico33",
    "name": "Dr. Valentín Paniagua",
    "cmp": "CMP-44059",
    "specialty": "Odontología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.7,
    "reviewCount": 139,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico34",
    "username": "medico34",
    "password": "medico34",
    "name": "Dra. Beatriz Merino",
    "cmp": "CMP-44182",
    "specialty": "Odontología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 162,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico35",
    "username": "medico35",
    "password": "medico35",
    "name": "Dr. Javier Pérez de Cuéllar",
    "cmp": "CMP-44305",
    "specialty": "Odontología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.6,
    "reviewCount": 185,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico36",
    "username": "medico36",
    "password": "medico36",
    "name": "Dr. Daniel Alcides Carrión",
    "cmp": "CMP-44428",
    "specialty": "Traumatología y Ortopedia",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 208,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico37",
    "username": "medico37",
    "password": "medico37",
    "name": "Dra. Laura Rodríguez",
    "cmp": "CMP-44551",
    "specialty": "Traumatología y Ortopedia",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.9,
    "reviewCount": 231,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico38",
    "username": "medico38",
    "password": "medico38",
    "name": "Dr. Honorio Delgado",
    "cmp": "CMP-44674",
    "specialty": "Traumatología y Ortopedia",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.7,
    "reviewCount": 254,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico39",
    "username": "medico39",
    "password": "medico39",
    "name": "Dr. Cayetano Heredia",
    "cmp": "CMP-44797",
    "specialty": "Traumatología y Ortopedia",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 277,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico40",
    "username": "medico40",
    "password": "medico40",
    "name": "Dra. María Reiche",
    "cmp": "CMP-44920",
    "specialty": "Traumatología y Ortopedia",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.6,
    "reviewCount": 300,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico41",
    "username": "medico41",
    "password": "medico41",
    "name": "Dr. Julio C. Tello",
    "cmp": "CMP-45043",
    "specialty": "Neurología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 323,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico42",
    "username": "medico42",
    "password": "medico42",
    "name": "Dr. Antonio Raimondi",
    "cmp": "CMP-45166",
    "specialty": "Neurología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.9,
    "reviewCount": 346,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico43",
    "username": "medico43",
    "password": "medico43",
    "name": "Dra. Blanca Varela",
    "cmp": "CMP-45289",
    "specialty": "Neurología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.7,
    "reviewCount": 369,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico44",
    "username": "medico44",
    "password": "medico44",
    "name": "Dr. José María Arguedas",
    "cmp": "CMP-45412",
    "specialty": "Neurología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 392,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico45",
    "username": "medico45",
    "password": "medico45",
    "name": "Dr. Ciro Alegría",
    "cmp": "CMP-45535",
    "specialty": "Neurología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.6,
    "reviewCount": 415,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico46",
    "username": "medico46",
    "password": "medico46",
    "name": "Dr. Abraham Valdelomar",
    "cmp": "CMP-45658",
    "specialty": "Urología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 88,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico47",
    "username": "medico47",
    "password": "medico47",
    "name": "Dra. Clorinda Matto",
    "cmp": "CMP-45781",
    "specialty": "Urología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.9,
    "reviewCount": 111,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico48",
    "username": "medico48",
    "password": "medico48",
    "name": "Dr. Ricardo Palma",
    "cmp": "CMP-45904",
    "specialty": "Urología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.7,
    "reviewCount": 134,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico49",
    "username": "medico49",
    "password": "medico49",
    "name": "Dra. Mercedes Cabello",
    "cmp": "CMP-46027",
    "specialty": "Urología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 157,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico50",
    "username": "medico50",
    "password": "medico50",
    "name": "Dr. Manuel González Prada",
    "cmp": "CMP-46150",
    "specialty": "Urología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.6,
    "reviewCount": 180,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico51",
    "username": "medico51",
    "password": "medico51",
    "name": "Dr. José Carlos Mariátegui",
    "cmp": "CMP-46273",
    "specialty": "Endocrinología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 203,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico52",
    "username": "medico52",
    "password": "medico52",
    "name": "Dr. Víctor Raúl Haya",
    "cmp": "CMP-46396",
    "specialty": "Endocrinología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.9,
    "reviewCount": 226,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico53",
    "username": "medico53",
    "password": "medico53",
    "name": "Dra. Flora Tristán",
    "cmp": "CMP-46519",
    "specialty": "Endocrinología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.7,
    "reviewCount": 249,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico54",
    "username": "medico54",
    "password": "medico54",
    "name": "Dr. Felipe Pardo y Aliaga",
    "cmp": "CMP-46642",
    "specialty": "Endocrinología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 272,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico55",
    "username": "medico55",
    "password": "medico55",
    "name": "Dr. Mariano Melgar",
    "cmp": "CMP-46765",
    "specialty": "Endocrinología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.6,
    "reviewCount": 295,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico56",
    "username": "medico56",
    "password": "medico56",
    "name": "Dr. José Santos Chocano",
    "cmp": "CMP-46888",
    "specialty": "Gastroenterología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 318,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico57",
    "username": "medico57",
    "password": "medico57",
    "name": "Dra. Magda Portal",
    "cmp": "CMP-47011",
    "specialty": "Gastroenterología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.9,
    "reviewCount": 341,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico58",
    "username": "medico58",
    "password": "medico58",
    "name": "Dr. Martín Adán",
    "cmp": "CMP-47134",
    "specialty": "Gastroenterología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.7,
    "reviewCount": 364,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico59",
    "username": "medico59",
    "password": "medico59",
    "name": "Dr. Javier Heraud",
    "cmp": "CMP-47257",
    "specialty": "Gastroenterología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 387,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico60",
    "username": "medico60",
    "password": "medico60",
    "name": "Dr. Emilio Adolfo Westphalen",
    "cmp": "CMP-47380",
    "specialty": "Gastroenterología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.6,
    "reviewCount": 410,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico61",
    "username": "medico61",
    "password": "medico61",
    "name": "Dra. Carmen Ollé",
    "cmp": "CMP-47503",
    "specialty": "Neumología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico62",
    "username": "medico62",
    "password": "medico62",
    "name": "Dr. Oswaldo Reynoso",
    "cmp": "CMP-47626",
    "specialty": "Neumología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.9,
    "reviewCount": 106,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico63",
    "username": "medico63",
    "password": "medico63",
    "name": "Dr. Julio Ramón Ribeyro",
    "cmp": "CMP-47749",
    "specialty": "Neumología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.7,
    "reviewCount": 129,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico64",
    "username": "medico64",
    "password": "medico64",
    "name": "Dr. Alfredo Bryce",
    "cmp": "CMP-47872",
    "specialty": "Neumología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 152,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico65",
    "username": "medico65",
    "password": "medico65",
    "name": "Dra. Giovanna Pollarolo",
    "cmp": "CMP-47995",
    "specialty": "Neumología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.6,
    "reviewCount": 175,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico66",
    "username": "medico66",
    "password": "medico66",
    "name": "Dr. Alonso Cueto",
    "cmp": "CMP-48118",
    "specialty": "Psiquiatría",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 198,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico67",
    "username": "medico67",
    "password": "medico67",
    "name": "Dra. Claudia Llosa",
    "cmp": "CMP-48241",
    "specialty": "Psiquiatría",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.9,
    "reviewCount": 221,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico68",
    "username": "medico68",
    "password": "medico68",
    "name": "Dr. Francisco Bolognesi",
    "cmp": "CMP-48364",
    "specialty": "Psiquiatría",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.7,
    "reviewCount": 244,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico69",
    "username": "medico69",
    "password": "medico69",
    "name": "Dr. Miguel Grau",
    "cmp": "CMP-48487",
    "specialty": "Psiquiatría",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 267,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico70",
    "username": "medico70",
    "password": "medico70",
    "name": "Dr. Andrés Avelino Cáceres",
    "cmp": "CMP-48610",
    "specialty": "Psiquiatría",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.6,
    "reviewCount": 290,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico71",
    "username": "medico71",
    "password": "medico71",
    "name": "Dr. Alfonso Ugarte",
    "cmp": "CMP-48733",
    "specialty": "Psicología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 313,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico72",
    "username": "medico72",
    "password": "medico72",
    "name": "Dra. Micaela Bastidas",
    "cmp": "CMP-48856",
    "specialty": "Psicología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.9,
    "reviewCount": 336,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico73",
    "username": "medico73",
    "password": "medico73",
    "name": "Dr. Túpac Amaru",
    "cmp": "CMP-48979",
    "specialty": "Psicología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.7,
    "reviewCount": 359,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico74",
    "username": "medico74",
    "password": "medico74",
    "name": "Dr. Mateo Pumacahua",
    "cmp": "CMP-49102",
    "specialty": "Psicología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 382,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico75",
    "username": "medico75",
    "password": "medico75",
    "name": "Dra. Tomasa Tito Condemayta",
    "cmp": "CMP-49225",
    "specialty": "Psicología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.6,
    "reviewCount": 405,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico76",
    "username": "medico76",
    "password": "medico76",
    "name": "Dr. Juan Santos Atahualpa",
    "cmp": "CMP-49348",
    "specialty": "Reumatología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 428,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico77",
    "username": "medico77",
    "password": "medico77",
    "name": "Dr. Garcilaso de la Vega",
    "cmp": "CMP-49471",
    "specialty": "Reumatología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.9,
    "reviewCount": 101,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico78",
    "username": "medico78",
    "password": "medico78",
    "name": "Dra. Francisca Pizarro",
    "cmp": "CMP-49594",
    "specialty": "Reumatología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.7,
    "reviewCount": 124,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico79",
    "username": "medico79",
    "password": "medico79",
    "name": "Dr. Pedro Cieza de León",
    "cmp": "CMP-49717",
    "specialty": "Reumatología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 147,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico80",
    "username": "medico80",
    "password": "medico80",
    "name": "Dr. Cristóbal de Molina",
    "cmp": "CMP-49840",
    "specialty": "Reumatología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.6,
    "reviewCount": 170,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico81",
    "username": "medico81",
    "password": "medico81",
    "name": "Dr. Blas Valera",
    "cmp": "CMP-49963",
    "specialty": "Otorrinolaringología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 193,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico82",
    "username": "medico82",
    "password": "medico82",
    "name": "Dr. Guamán Poma",
    "cmp": "CMP-50086",
    "specialty": "Otorrinolaringología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.9,
    "reviewCount": 216,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico83",
    "username": "medico83",
    "password": "medico83",
    "name": "Dr. Diego de Almagro",
    "cmp": "CMP-50209",
    "specialty": "Otorrinolaringología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.7,
    "reviewCount": 239,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico84",
    "username": "medico84",
    "password": "medico84",
    "name": "Dr. Gonzalo Pizarro",
    "cmp": "CMP-50332",
    "specialty": "Otorrinolaringología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 262,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico85",
    "username": "medico85",
    "password": "medico85",
    "name": "Dra. Inés Muñoz",
    "cmp": "CMP-50455",
    "specialty": "Otorrinolaringología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.6,
    "reviewCount": 285,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico86",
    "username": "medico86",
    "password": "medico86",
    "name": "Dr. Hipólito Unanue",
    "cmp": "CMP-50578",
    "specialty": "Nutrición y Dietética",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 308,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico87",
    "username": "medico87",
    "password": "medico87",
    "name": "Dr. Toribio Rodríguez",
    "cmp": "CMP-50701",
    "specialty": "Nutrición y Dietética",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.9,
    "reviewCount": 331,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico88",
    "username": "medico88",
    "password": "medico88",
    "name": "Dr. José Baquíjano",
    "cmp": "CMP-50824",
    "specialty": "Nutrición y Dietética",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.7,
    "reviewCount": 354,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico89",
    "username": "medico89",
    "password": "medico89",
    "name": "Dr. Juan Pablo Vizcardo",
    "cmp": "CMP-50947",
    "specialty": "Nutrición y Dietética",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 377,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico90",
    "username": "medico90",
    "password": "medico90",
    "name": "Dra. María Parado de Bellido",
    "cmp": "CMP-51070",
    "specialty": "Nutrición y Dietética",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.6,
    "reviewCount": 400,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico91",
    "username": "medico91",
    "password": "medico91",
    "name": "Dr. José Olaya",
    "cmp": "CMP-51193",
    "specialty": "Oncología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 423,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico92",
    "username": "medico92",
    "password": "medico92",
    "name": "Dr. Faustino Sánchez Carrión",
    "cmp": "CMP-51316",
    "specialty": "Oncología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.9,
    "reviewCount": 96,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico93",
    "username": "medico93",
    "password": "medico93",
    "name": "Dr. Bernardo O'Higgins",
    "cmp": "CMP-51439",
    "specialty": "Oncología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.7,
    "reviewCount": 119,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico94",
    "username": "medico94",
    "password": "medico94",
    "name": "Dr. Simón Bolívar",
    "cmp": "CMP-51562",
    "specialty": "Oncología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 142,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico95",
    "username": "medico95",
    "password": "medico95",
    "name": "Dra. Manuela Sáenz",
    "cmp": "CMP-51685",
    "specialty": "Oncología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.6,
    "reviewCount": 165,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico96",
    "username": "medico96",
    "password": "medico96",
    "name": "Dr. Antonio José de Sucre",
    "cmp": "CMP-51808",
    "specialty": "Medicina Interna",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.8,
    "reviewCount": 188,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico97",
    "username": "medico97",
    "password": "medico97",
    "name": "Dr. José de San Martín",
    "cmp": "CMP-51931",
    "specialty": "Medicina Interna",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.9,
    "reviewCount": 211,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico98",
    "username": "medico98",
    "password": "medico98",
    "name": "Dr. Bartolomé Herrera",
    "cmp": "CMP-52054",
    "specialty": "Medicina Interna",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.7,
    "reviewCount": 234,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico99",
    "username": "medico99",
    "password": "medico99",
    "name": "Dr. Ramón Castilla",
    "cmp": "CMP-52177",
    "specialty": "Medicina Interna",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.8,
    "reviewCount": 257,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico100",
    "username": "medico100",
    "password": "medico100",
    "name": "Dr. Nicolás de Piérola",
    "cmp": "CMP-52300",
    "specialty": "Medicina Interna",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.6,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico101",
    "username": "medico101",
    "password": "medico101",
    "name": "Dr. Augusto B. Leguía",
    "cmp": "CMP-52423",
    "specialty": "Nefrología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.8,
    "reviewCount": 303,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico102",
    "username": "medico102",
    "password": "medico102",
    "name": "Dr. Guillermo Billinghurst",
    "cmp": "CMP-52546",
    "specialty": "Nefrología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.9,
    "reviewCount": 326,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico103",
    "username": "medico103",
    "password": "medico103",
    "name": "Dr. José Pardo y Barreda",
    "cmp": "CMP-52669",
    "specialty": "Nefrología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.7,
    "reviewCount": 349,
    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico104",
    "username": "medico104",
    "password": "medico104",
    "name": "Dr. Manuel Candamo",
    "cmp": "CMP-52792",
    "specialty": "Nefrología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.8,
    "reviewCount": 372,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico105",
    "username": "medico105",
    "password": "medico105",
    "name": "Dr. Eduardo López de Romaña",
    "cmp": "CMP-52915",
    "specialty": "Nefrología",
    "district": "Santiago de Surco",
    "hospital": "Sede El Polo - Av. Encalada",
    "rating": 4.6,
    "reviewCount": 395,
    "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico106",
    "username": "medico106",
    "password": "medico106",
    "name": "Dr. Remigio Morales Bermúdez",
    "cmp": "CMP-53038",
    "specialty": "Infectología",
    "district": "Miraflores",
    "hospital": "Sede Miraflores - Calle Shell",
    "rating": 4.8,
    "reviewCount": 418,
    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico107",
    "username": "medico107",
    "password": "medico107",
    "name": "Dr. Justiniano Borgoño",
    "cmp": "CMP-53161",
    "specialty": "Infectología",
    "district": "San Isidro",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "rating": 4.9,
    "reviewCount": 91,
    "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico108",
    "username": "medico108",
    "password": "medico108",
    "name": "Dr. Lizardo Montero",
    "cmp": "CMP-53284",
    "specialty": "Infectología",
    "district": "La Molina",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "rating": 4.7,
    "reviewCount": 114,
    "image": "https://images.unsplash.com/photo-1599443011913-991f239e5540?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico109",
    "username": "medico109",
    "password": "medico109",
    "name": "Dr. Francisco García Calderón",
    "cmp": "CMP-53407",
    "specialty": "Infectología",
    "district": "Jesús María",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "rating": 4.8,
    "reviewCount": 137,
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "medico110",
    "username": "medico110",
    "password": "medico110",
    "name": "Dr. Mariano Ignacio Prado",
    "cmp": "CMP-53530",
    "specialty": "Infectología",
    "district": "San Borja",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "rating": 4.6,
    "reviewCount": 160,
    "image": "https://images.unsplash.com/photo-1531315630201-bb15b566c2fc?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "tele-1",
    "username": "tele-1",
    "password": "tele1",
    "name": "Dr. Ricardo Palma",
    "cmp": "CMP-48219",
    "specialty": "Medicina Interna",
    "district": "Virtual",
    "hospital": "Sede Virtual - Telemedicina",
    "rating": 4.9,
    "reviewCount": 450,
    "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "tele-2",
    "username": "tele-2",
    "password": "tele2",
    "name": "Dra. Isabel Allende",
    "cmp": "CMP-51294",
    "specialty": "Gastroenterología",
    "district": "Virtual",
    "hospital": "Sede Virtual - Telemedicina",
    "rating": 4.8,
    "reviewCount": 320,
    "image": "https://images.unsplash.com/photo-1559839734-2b71f153673f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    "id": "tele-3",
    "username": "tele-3",
    "password": "tele3",
    "name": "Dr. Mario Vargas",
    "cmp": "CMP-43912",
    "specialty": "Cardiología",
    "district": "Virtual",
    "hospital": "Sede Virtual - Telemedicina",
    "rating": 4.7,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

export const initialDoctors: Doctor[] = rawDoctors.map(doc => ({
  ...doc,
  availability: generateAvailability()
}));

export const initialReceptionists: Receptionist[] = [
  {
    "id": "recepcionista1",
    "username": "recepcionista1",
    "password": "recepcionista1",
    "name": "Carmen Salgado",
    "sede": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista2",
    "username": "recepcionista2",
    "password": "recepcionista2",
    "name": "Lucía Quispe",
    "sede": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  },
  {
    "id": "recepcionista3",
    "username": "recepcionista3",
    "password": "recepcionista3",
    "name": "Daniela Ramos",
    "sede": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista4",
    "username": "recepcionista4",
    "password": "recepcionista4",
    "name": "Valeria Mendoza",
    "sede": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  },
  {
    "id": "recepcionista5",
    "username": "recepcionista5",
    "password": "recepcionista5",
    "name": "Fiorella Castro",
    "sede": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista6",
    "username": "recepcionista6",
    "password": "recepcionista6",
    "name": "Andrea Torres",
    "sede": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  },
  {
    "id": "recepcionista7",
    "username": "recepcionista7",
    "password": "recepcionista7",
    "name": "Gabriela Paredes",
    "sede": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista8",
    "username": "recepcionista8",
    "password": "recepcionista8",
    "name": "Romina Vega",
    "sede": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  },
  {
    "id": "recepcionista9",
    "username": "recepcionista9",
    "password": "recepcionista9",
    "name": "Paola Chávez",
    "sede": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista10",
    "username": "recepcionista10",
    "password": "recepcionista10",
    "name": "Patricia Benavides",
    "sede": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  },
  {
    "id": "recepcionista11",
    "username": "recepcionista11",
    "password": "recepcionista11",
    "name": "Melissa Flores",
    "sede": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "shift": "Turno Mañana (07:00 - 15:00)",
    "desk": "Módulo Admisión 01"
  },
  {
    "id": "recepcionista12",
    "username": "recepcionista12",
    "password": "recepcionista12",
    "name": "Stephanie Navarro",
    "sede": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "shift": "Turno Tarde (14:00 - 22:00)",
    "desk": "Módulo Admisión 02"
  }
];

export const adminCredentials = {
  username: "admin",
  password: "123456",
  name: "Administrador General",
  role: "admin" as const
};

export const defaultAppointments: AppointmentRecord[] = [
  {
    "id": "APT-1001",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "doctorId": "medico1",
    "doctorName": "Dr. Carlos Rodríguez",
    "specialty": "Cardiología",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "08:00 AM",
    "status": "En Consulta",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1002",
    "patientName": "Carlos Morales V.",
    "patientDni": "72194012",
    "patientPhone": "912345678",
    "doctorId": "medico2",
    "doctorName": "Dra. María Fernández",
    "specialty": "Cardiología",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Mañana",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1003",
    "patientName": "María Elena Vega",
    "patientDni": "08451239",
    "patientPhone": "998877665",
    "doctorId": "medico3",
    "doctorName": "Dr. Jorge Luis Ramos",
    "specialty": "Cardiología",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "20 May",
    "time": "10:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1004",
    "patientName": "Jorge Luis Benítez",
    "patientDni": "45123980",
    "patientPhone": "965432109",
    "doctorId": "medico4",
    "doctorName": "Dra. Lucía Mendoza",
    "specialty": "Cardiología",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "Control preventivo satisfactorio. Mantener hidratación y control en 6 meses.",
    "prescription": "Paracetamol 500mg cada 8h por 3 días si hay molestia.",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1005",
    "patientName": "Luciana Salazar G.",
    "patientDni": "70984512",
    "patientPhone": "934567890",
    "doctorId": "medico5",
    "doctorName": "Dr. Ricardo Tovar",
    "specialty": "Cardiología",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Mañana",
    "time": "12:00 PM",
    "status": "En Consulta",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1006",
    "patientName": "Pedro Alvarado M.",
    "patientDni": "10984523",
    "patientPhone": "923456781",
    "doctorId": "medico6",
    "doctorName": "Dra. Andrea Castro",
    "specialty": "Pediatría",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "20 May",
    "time": "01:00 PM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1007",
    "patientName": "Patricia Vera T.",
    "patientDni": "42109845",
    "patientPhone": "987123456",
    "doctorId": "medico7",
    "doctorName": "Dra. Elena Ramos",
    "specialty": "Pediatría",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "02:00 PM",
    "status": "Pendiente",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1008",
    "patientName": "Rosa María Quispe",
    "patientDni": "76543219",
    "patientPhone": "956789012",
    "doctorId": "medico8",
    "doctorName": "Dr. Alberto Fujii",
    "specialty": "Pediatría",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Mañana",
    "time": "03:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "Control preventivo satisfactorio. Mantener hidratación y control en 6 meses.",
    "prescription": "Paracetamol 500mg cada 8h por 3 días si hay molestia.",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1009",
    "patientName": "Fernando Beltrán",
    "patientDni": "09845120",
    "patientPhone": "945678901",
    "doctorId": "medico9",
    "doctorName": "Dra. Carmen Rosa",
    "specialty": "Pediatría",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "20 May",
    "time": "04:00 PM",
    "status": "En Consulta",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1010",
    "patientName": "Ana Lucía Méndez",
    "patientDni": "43210987",
    "patientPhone": "978901234",
    "doctorId": "medico10",
    "doctorName": "Dr. Luis Miguel",
    "specialty": "Pediatría",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "Hoy",
    "time": "05:00 PM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1011",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "doctorId": "medico11",
    "doctorName": "Dr. Antonio Guerra",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Mañana",
    "time": "08:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1012",
    "patientName": "Carlos Morales V.",
    "patientDni": "72194012",
    "patientPhone": "912345678",
    "doctorId": "medico12",
    "doctorName": "Dra. Sofía Salas",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "20 May",
    "time": "09:00 AM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "Control preventivo satisfactorio. Mantener hidratación y control en 6 meses.",
    "prescription": "Paracetamol 500mg cada 8h por 3 días si hay molestia.",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1013",
    "patientName": "María Elena Vega",
    "patientDni": "08451239",
    "patientPhone": "998877665",
    "doctorId": "medico13",
    "doctorName": "Dr. Pablo Neruda",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "10:00 AM",
    "status": "En Consulta",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1014",
    "patientName": "Jorge Luis Benítez",
    "patientDni": "45123980",
    "patientPhone": "965432109",
    "doctorId": "medico14",
    "doctorName": "Dr. César Vallejo",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Mañana",
    "time": "11:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1015",
    "patientName": "Luciana Salazar G.",
    "patientDni": "70984512",
    "patientPhone": "934567890",
    "doctorId": "medico15",
    "doctorName": "Dr. Manuel Belgrano",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "20 May",
    "time": "12:00 PM",
    "status": "Pendiente",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1016",
    "patientName": "Pedro Alvarado M.",
    "patientDni": "10984523",
    "patientPhone": "923456781",
    "doctorId": "medico16",
    "doctorName": "Dra. Ingrid Bergman",
    "specialty": "Dermatología",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "Control preventivo satisfactorio. Mantener hidratación y control en 6 meses.",
    "prescription": "Paracetamol 500mg cada 8h por 3 días si hay molestia.",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1017",
    "patientName": "Patricia Vera T.",
    "patientDni": "42109845",
    "patientPhone": "987123456",
    "doctorId": "medico17",
    "doctorName": "Dr. Sebastian Bach",
    "specialty": "Dermatología",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Mañana",
    "time": "02:00 PM",
    "status": "En Consulta",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1018",
    "patientName": "Rosa María Quispe",
    "patientDni": "76543219",
    "patientPhone": "956789012",
    "doctorId": "medico18",
    "doctorName": "Dr. Pedro Castillo",
    "specialty": "Dermatología",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "20 May",
    "time": "03:00 PM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1019",
    "patientName": "Fernando Beltrán",
    "patientDni": "09845120",
    "patientPhone": "945678901",
    "doctorId": "medico19",
    "doctorName": "Dra. Dina Boluarte",
    "specialty": "Dermatología",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "04:00 PM",
    "status": "Pendiente",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 120,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1020",
    "patientName": "Ana Lucía Méndez",
    "patientDni": "43210987",
    "patientPhone": "978901234",
    "doctorId": "medico20",
    "doctorName": "Dra. Keiko Fujimori",
    "specialty": "Dermatología",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Mañana",
    "time": "05:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 120,
    "diagnosis": "Control preventivo satisfactorio. Mantener hidratación y control en 6 meses.",
    "prescription": "Paracetamol 500mg cada 8h por 3 días si hay molestia.",
    "createdAt": "2026-09-25T08:00:00Z"
  },
  {
    "id": "APT-1021",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "doctorId": "medico1",
    "doctorName": "Dr. Carlos Rodríguez",
    "specialty": "Cardiología",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1022",
    "patientName": "Carlos Morales V.",
    "patientDni": "72194012",
    "patientPhone": "912345678",
    "doctorId": "medico7",
    "doctorName": "Dra. Elena Ramos",
    "specialty": "Pediatría",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1023",
    "patientName": "María Elena Vega",
    "patientDni": "08451239",
    "patientPhone": "998877665",
    "doctorId": "medico13",
    "doctorName": "Dr. Pablo Neruda",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1024",
    "patientName": "Jorge Luis Benítez",
    "patientDni": "45123980",
    "patientPhone": "965432109",
    "doctorId": "medico2",
    "doctorName": "Dra. María Fernández",
    "specialty": "Cardiología",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1025",
    "patientName": "Luciana Salazar G.",
    "patientDni": "70984512",
    "patientPhone": "934567890",
    "doctorId": "medico8",
    "doctorName": "Dr. Alberto Fujii",
    "specialty": "Pediatría",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1026",
    "patientName": "Pedro Alvarado M.",
    "patientDni": "10984523",
    "patientPhone": "923456781",
    "doctorId": "medico14",
    "doctorName": "Dr. César Vallejo",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede San Borja - Av. Guardia Civil",
    "district": "San Borja",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1027",
    "patientName": "Patricia Vera T.",
    "patientDni": "42109845",
    "patientPhone": "987123456",
    "doctorId": "medico3",
    "doctorName": "Dr. Jorge Luis Ramos",
    "specialty": "Cardiología",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1028",
    "patientName": "Rosa María Quispe",
    "patientDni": "76543219",
    "patientPhone": "956789012",
    "doctorId": "medico9",
    "doctorName": "Dra. Carmen Rosa",
    "specialty": "Pediatría",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1029",
    "patientName": "Fernando Beltrán",
    "patientDni": "09845120",
    "patientPhone": "945678901",
    "doctorId": "medico15",
    "doctorName": "Dr. Manuel Belgrano",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede El Polo - Av. Encalada",
    "district": "Santiago de Surco",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1030",
    "patientName": "Ana Lucía Méndez",
    "patientDni": "43210987",
    "patientPhone": "978901234",
    "doctorId": "medico4",
    "doctorName": "Dra. Lucía Mendoza",
    "specialty": "Cardiología",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1031",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "patientEmail": "stefania.rocha@gmail.com",
    "insurance": "Rímac EPS",
    "doctorId": "medico1",
    "doctorName": "Dr. Carlos Rodríguez",
    "specialty": "Cardiología",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Hoy",
    "time": "10:00 AM",
    "status": "Confirmada",
    "consentAccepted": true,
    "signatureTimestamp": "2026-09-25T08:15:00Z",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta POS",
    "amount": 100,
    "createdAt": "2026-09-24T18:20:00Z"
  },
  {
    "id": "APT-1040",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "patientEmail": "stefania.rocha@gmail.com",
    "insurance": "Rímac EPS",
    "doctorId": "medico7",
    "doctorName": "Dra. Elena Ramos",
    "specialty": "Pediatría",
    "hospital": "Sede Lima - Av. Petit Thouars",
    "district": "Jesús María",
    "date": "Mañana",
    "time": "11:00 AM",
    "status": "Solicitada",
    "consentAccepted": true,
    "signatureTimestamp": "2026-09-25T09:00:00Z",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "createdAt": "2026-09-25T09:00:00Z"
  },
  {
    "id": "APT-1041",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "patientEmail": "stefania.rocha@gmail.com",
    "insurance": "Rímac EPS",
    "doctorId": "medico16",
    "doctorName": "Dra. Ingrid Bergman",
    "specialty": "Dermatología",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "20 May",
    "time": "03:00 PM",
    "status": "Reprogramada",
    "reprogrammedFrom": {
      "date": "18 May",
      "time": "09:00 AM"
    },
    "consentAccepted": true,
    "signatureTimestamp": "2026-09-23T14:30:00Z",
    "paymentStatus": "Pagado",
    "paymentMethod": "Yape / Plin",
    "amount": 100,
    "createdAt": "2026-09-23T14:30:00Z"
  },
  {
    "id": "APT-1042",
    "patientName": "Stefania Rocha A.",
    "patientDni": "44892104",
    "patientPhone": "987654321",
    "patientEmail": "stefania.rocha@gmail.com",
    "insurance": "Particular",
    "doctorId": "medico22",
    "doctorName": "Dr. Fernando Ortiz",
    "specialty": "Oftalmología",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "19 May",
    "time": "02:00 PM",
    "status": "Cancelada",
    "cancellationReason": "Cruce de horario con jornada laboral",
    "consentAccepted": true,
    "signatureTimestamp": "2026-09-22T10:00:00Z",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "createdAt": "2026-09-22T10:00:00Z"
  },
  {
    "id": "APT-1032",
    "patientName": "Carlos Morales V.",
    "patientDni": "72194012",
    "patientPhone": "912345678",
    "doctorId": "medico16",
    "doctorName": "Dra. Ingrid Bergman",
    "specialty": "Dermatología",
    "hospital": "Sede Miraflores - Calle Shell",
    "district": "Miraflores",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1033",
    "patientName": "María Elena Vega",
    "patientDni": "08451239",
    "patientPhone": "998877665",
    "doctorId": "medico5",
    "doctorName": "Dr. Ricardo Tovar",
    "specialty": "Cardiología",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1034",
    "patientName": "Jorge Luis Benítez",
    "patientDni": "45123980",
    "patientPhone": "965432109",
    "doctorId": "medico11",
    "doctorName": "Dr. Antonio Guerra",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1035",
    "patientName": "Luciana Salazar G.",
    "patientDni": "70984512",
    "patientPhone": "934567890",
    "doctorId": "medico17",
    "doctorName": "Dr. Sebastian Bach",
    "specialty": "Dermatología",
    "hospital": "Sede San Isidro - Av. Arequipa",
    "district": "San Isidro",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1036",
    "patientName": "Pedro Alvarado M.",
    "patientDni": "10984523",
    "patientPhone": "923456781",
    "doctorId": "medico6",
    "doctorName": "Dra. Andrea Castro",
    "specialty": "Pediatría",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "Hoy",
    "time": "09:00 AM",
    "status": "Llegó / En Espera",
    "paymentStatus": "Pagado",
    "paymentMethod": "Efectivo",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1037",
    "patientName": "Patricia Vera T.",
    "patientDni": "42109845",
    "patientPhone": "987123456",
    "doctorId": "medico12",
    "doctorName": "Dra. Sofía Salas",
    "specialty": "Ginecología y Obstetricia",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "Hoy",
    "time": "11:00 AM",
    "status": "Pendiente",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  {
    "id": "APT-1038",
    "patientName": "Rosa María Quispe",
    "patientDni": "76543219",
    "patientPhone": "956789012",
    "doctorId": "medico18",
    "doctorName": "Dr. Pedro Castillo",
    "specialty": "Dermatología",
    "hospital": "Sede La Molina - Av. Raúl Ferrero",
    "district": "La Molina",
    "date": "Hoy",
    "time": "01:00 PM",
    "status": "Atendido",
    "paymentStatus": "Pendiente",
    "paymentMethod": "Pendiente",
    "amount": 100,
    "diagnosis": "",
    "prescription": "",
    "createdAt": "2026-09-25T08:30:00Z"
  }
];

export const timeEfficiencyData = [
  { name: "Tradicional", time: 45, fill: "#cbd5e1" },
  { name: "Medicenter", time: 3, fill: "#0ea5e9" }
];

export const accessibilityStats = [
  { name: "Con Accesibilidad", value: 98, fill: "#10b981" },
  { name: "Otros", value: 2, fill: "#f1f5f9" }
];

export const testimonials = [
  {
    name: "Patricia Vera",
    comment: "Excelente atención en la sede San Borja. El sistema de reserva es rapidísimo.",
    rating: 5,
    date: "Hace 2 días"
  },
  {
    name: "Juan Carlos M.",
    comment: "La teleconsulta me salvó tiempo. Muy profesional el Dr. Rodríguez.",
    rating: 5,
    date: "Hace 1 semana"
  },
  {
    name: "Luciana G.",
    comment: "Cuidado integral para mis hijos. Pediatría 10/10.",
    rating: 4,
    date: "Hace 3 días"
  }
];

// Session & Storage Management
const SESSION_KEY = "medicenter_session_v2";
const APPOINTMENTS_KEY = "medicenter_appointments_v4";
const DOCTORS_KEY = "medicenter_doctors_v2";

export const getStoredSession = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.error("Error setting session:", err);
  }
};

export const getStoredAppointments = (): AppointmentRecord[] => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(defaultAppointments));
    return defaultAppointments;
  } catch {
    return defaultAppointments;
  }
};

export const saveStoredAppointments = (appointments: AppointmentRecord[]) => {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error("Error saving appointments:", err);
  }
};

export const getStoredDoctors = (): Doctor[] => {
  try {
    const raw = localStorage.getItem(DOCTORS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(initialDoctors));
    return initialDoctors;
  } catch {
    return initialDoctors;
  }
};

export const saveStoredDoctors = (docs: Doctor[]) => {
  try {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error("Error saving doctors:", err);
  }
};

const CONSULTORIOS_KEY = "medicenter_consultorios_v1";
const SPECIALTIES_KEY = "medicenter_specialties_v1";

export const initialConsultorios: Consultorio[] = [
  {
    id: "cons-1",
    code: "CONS-101",
    sede: "Sede Lima - Av. Petit Thouars",
    district: "Jesús María",
    floor: "Piso 1 - Pabellón A",
    specialty: "Medicina General",
    assignedDoctorName: "Dr. Carlos Rodríguez",
    status: "Activo"
  },
  {
    id: "cons-2",
    code: "CONS-202",
    sede: "Sede Lima - Av. Petit Thouars",
    district: "Jesús María",
    floor: "Piso 2 - Pabellón A",
    specialty: "Pediatría",
    assignedDoctorName: "Dra. Elena Ramos",
    status: "Activo"
  },
  {
    id: "cons-3",
    code: "CONS-303",
    sede: "Sede San Borja - Av. Guardia Civil",
    district: "San Borja",
    floor: "Piso 3 - Torre Médica",
    specialty: "Cardiología",
    assignedDoctorName: "Dra. María Fernández",
    status: "Activo"
  },
  {
    id: "cons-4",
    code: "CONS-404",
    sede: "Sede Miraflores - Calle Shell",
    district: "Miraflores",
    floor: "Piso 4 - Pabellón B",
    specialty: "Dermatología",
    assignedDoctorName: "Dra. Ingrid Bergman",
    status: "Activo"
  },
  {
    id: "cons-5",
    code: "CONS-505",
    sede: "Sede San Isidro - Av. Arequipa",
    district: "San Isidro",
    floor: "Piso 5 - Especialidades",
    specialty: "Ginecología y Obstetricia",
    assignedDoctorName: "Dr. Antonio Guerra",
    status: "Activo"
  },
  {
    id: "cons-6",
    code: "CONS-606",
    sede: "Sede La Molina - Av. Raúl Ferrero",
    district: "La Molina",
    floor: "Piso 2 - Pabellón Este",
    specialty: "Oftalmología",
    assignedDoctorName: "Dra. Lucía Mendoza",
    status: "Activo"
  },
  {
    id: "cons-7",
    code: "CONS-105",
    sede: "Sede El Polo - Av. Encalada",
    district: "Santiago de Surco",
    floor: "Piso 1 - Módulo Quirúrgico",
    specialty: "Traumatología y Ortopedia",
    assignedDoctorName: "Dr. Jorge Luis Ramos",
    status: "Mantenimiento"
  }
];

export const getStoredConsultorios = (): Consultorio[] => {
  try {
    const raw = localStorage.getItem(CONSULTORIOS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(CONSULTORIOS_KEY, JSON.stringify(initialConsultorios));
    return initialConsultorios;
  } catch {
    return initialConsultorios;
  }
};

export const saveStoredConsultorios = (items: Consultorio[]) => {
  try {
    localStorage.setItem(CONSULTORIOS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving consultorios:", err);
  }
};

export const getStoredSpecialties = (): string[] => {
  try {
    const raw = localStorage.getItem(SPECIALTIES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties));
    return specialties;
  } catch {
    return specialties;
  }
};

export const saveStoredSpecialties = (items: string[]) => {
  try {
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving specialties:", err);
  }
};

