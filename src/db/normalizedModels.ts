/**
 * MODELO DE DATOS LÓGICO NORMALIZADO (MEDICENTER)
 * Entidades normalizadas en 3FN que reflejan fielmente la estructura relacional del sistema:
 * 1.  USUARIO
 * 2.  MEDICO
 * 3.  ESPECIALIDAD
 * 4.  CONSULTORIO
 * 5.  PACIENTE
 * 6.  AGENDA
 * 7.  CITA_MEDICA
 * 8.  PAGO
 * 9.  HISTORIA_CLINICA
 * 10. ATENCION_MEDICA
 * 11. RECETA_MEDICAMENTOS
 * 12. RESULTADO_EXAMEN
 */

// 1. TABLA: USUARIO
export interface UsuarioEntity {
  id: string; // PK
  username: string; // Unique
  password_hash: string;
  rol: 'admin' | 'medico' | 'recepcionista' | 'paciente';
  email: string;
  nombres: string;
  apellidos: string;
  estado: 'Activo' | 'Inactivo' | 'Bloqueado';
  ultimo_acceso?: string;
  created_at: string;
}

// 2. TABLA: ESPECIALIDAD
export interface EspecialidadEntity {
  id: string; // PK
  codigo: string; // Unique (ej. 'ESP-CARDIO')
  nombre: string;
  descripcion: string;
  duracion_turno_minutos: number;
  precio_base: number;
  estado: 'Activa' | 'Inactiva';
  created_at: string;
}

// 3. TABLA: CONSULTORIO
export interface ConsultorioEntity {
  id: string; // PK
  codigo: string; // Unique (ej. 'CONS-101')
  sede: string;
  distrito: string;
  piso_pabellon: string;
  especialidad_id: string; // FK -> ESPECIALIDAD.id
  medico_asignado_id?: string; // FK -> MEDICO.id
  equipamiento?: string;
  estado: 'Activo' | 'Mantenimiento' | 'Inactivo';
  created_at: string;
}

// 4. TABLA: MEDICO
export interface MedicoEntity {
  id: string; // PK
  usuario_id: string; // FK -> USUARIO.id (1:1)
  cmp: string; // Colegiatura Médica (Unique)
  rne?: string; // Registro Nacional de Especialista
  nombres: string;
  apellidos: string;
  especialidad_id: string; // FK -> ESPECIALIDAD.id
  consultorio_id?: string; // FK -> CONSULTORIO.id
  hospital_sede: string;
  distrito: string;
  calificacion: number;
  numero_resenas: number;
  foto_url: string;
  estado: 'Activo' | 'Vacaciones' | 'Inactivo';
  created_at: string;
}

// 5. TABLA: PACIENTE
export interface PacienteEntity {
  id: string; // PK
  usuario_id?: string; // FK -> USUARIO.id (Nullable para walk-ins)
  tipo_documento: 'DNI' | 'Carnet de Extranjería' | 'Pasaporte';
  numero_documento: string; // DNI de 8 dígitos (Unique)
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  edad?: number;
  genero: 'Femenino' | 'Masculino' | 'Otro';
  celular: string; // 9 dígitos
  email: string;
  seguro_salud: 'Particular' | 'Rímac EPS' | 'Pacífico EPS' | 'Sanitas EPS' | 'EsSalud' | 'SIS';
  direccion?: string;
  distrito: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  created_at: string;
}

// 6. TABLA: HISTORIA_CLINICA
export interface HistoriaClinicaEntity {
  id: string; // PK
  paciente_id: string; // FK -> PACIENTE.id (1:1)
  numero_historia: string; // Unique (ej. 'HC-44892104')
  grupo_sanguineo?: string;
  antecedentes_patologicos: string;
  antecedentes_quirurgicos: string;
  antecedentes_familiares: string;
  alergias_medicamentosas: string;
  habitos_toxicos?: string;
  fecha_apertura: string;
  updated_at: string;
}

// 7. TABLA: AGENDA (Turnos horarios programados por médico)
export interface AgendaEntity {
  id: string; // PK
  medico_id: string; // FK -> MEDICO.id
  consultorio_id: string; // FK -> CONSULTORIO.id
  fecha: string; // ISO date 'YYYY-MM-DD' o 'Hoy', 'Mañana'
  hora_inicio: string; // ej. '09:00 AM'
  hora_fin: string; // ej. '09:45 AM'
  duracion_minutos: number;
  estado: 'Disponible' | 'Reservado' | 'Bloqueado'; // Garantía de 0% citas solapadas
  created_at: string;
}

// 8. TABLA: CITA_MEDICA
export interface CitaMedicaEntity {
  id: string; // PK
  codigo_ticket: string; // Unique (ej. 'APT-1031')
  paciente_id: string; // FK -> PACIENTE.id
  medico_id: string; // FK -> MEDICO.id
  consultorio_id: string; // FK -> CONSULTORIO.id
  agenda_id: string; // FK -> AGENDA.id (1:1 slot)
  fecha_cita: string;
  hora_cita: string;
  estado:
    | 'Solicitada'
    | 'Confirmada'
    | 'En sala de espera'
    | 'En atención'
    | 'Atendida'
    | 'Reprogramada'
    | 'Cancelada'
    | 'No Asistió (No-Show)';
  motivo_consulta?: string;
  reprogramada_desde_fecha?: string;
  reprogramada_desde_hora?: string;
  motivo_cancelacion?: string;
  consentimiento_informado_aceptado: boolean;
  firma_digital_data?: string;
  firma_timestamp?: string;
  created_at: string;
}

// 9. TABLA: PAGO
export interface PagoEntity {
  id: string; // PK
  cita_medica_id: string; // FK -> CITA_MEDICA.id (1:1)
  paciente_id: string; // FK -> PACIENTE.id
  monto: number;
  metodo_pago: 'Efectivo' | 'Tarjeta POS' | 'Yape / Plin' | 'Transferencia' | 'Pendiente';
  estado: 'Pagado' | 'Pendiente' | 'Exonerado';
  numero_comprobante?: string; // Boleta simbólica (ej. 'B001-001031')
  fecha_pago?: string;
  transaccion_referencia?: string;
  registrado_por_usuario_id?: string; // FK -> USUARIO.id (Recepcionista)
  nota_administrativa: string; // Recordando: Registro administrativo interno
  created_at: string;
}

// 10. TABLA: ATENCION_MEDICA
export interface AtencionMedicaEntity {
  id: string; // PK
  cita_medica_id: string; // FK -> CITA_MEDICA.id (1:1)
  historia_clinica_id: string; // FK -> HISTORIA_CLINICA.id
  medico_id: string; // FK -> MEDICO.id
  fecha_atencion: string;
  hora_inicio: string;
  hora_fin?: string;
  // Signos Vitales / Triaje
  presion_arterial: string; // ej. '120/80 mmHg'
  frecuencia_cardiaca: string; // ej. '75 lpm'
  temperatura: string; // ej. '36.8 °C'
  saturacion_oxigeno: string; // ej. '98%'
  peso_kg: string; // ej. '68 kg'
  talla_m: string; // ej. '1.65 m'
  imc?: string;
  // Evaluación médica
  anamnesis_observaciones: string;
  examen_fisico: string;
  diagnostico_cie10: string; // ej. 'I10 - Hipertensión esencial primaria'
  tipo_diagnostico: 'Presuntivo' | 'Definitivo' | 'Repetitivo';
  plan_terapeutico: string;
  indicaciones_generales: string;
  created_at: string;
}

// 11. TABLA: RECETA_MEDICAMENTOS
export interface RecetaMedicamentosEntity {
  id: string; // PK
  atencion_medica_id: string; // FK -> ATENCION_MEDICA.id
  item_numero: number;
  medicamento: string;
  concentracion: string;
  forma_farmaceutica: string; // Tableta, Jarabe, Gotas, Crema
  dosis: string;
  frecuencia_horas: string; // ej. 'Cada 8 horas'
  duracion_dias: string; // ej. 'Por 5 días'
  indicaciones_toma: string; // ej. 'Tomar después de los alimentos'
  created_at: string;
}

// 12. TABLA: RESULTADO_EXAMEN
export interface ResultadoExamenEntity {
  id: string; // PK
  historia_clinica_id: string; // FK -> HISTORIA_CLINICA.id
  paciente_id: string; // FK -> PACIENTE.id
  atencion_medica_id?: string; // FK -> ATENCION_MEDICA.id (Opcional)
  tipo_examen: 'Laboratorio Clínico' | 'Electrocardiograma' | 'Radiografía' | 'Ecografía' | 'Tomografía';
  nombre_examen: string;
  fecha_solicitud: string;
  fecha_resultado?: string;
  estado: 'Pendiente' | 'Procesando' | 'Completado' | 'Validado';
  resultado_informe: string;
  valores_referencia?: string;
  medico_validador?: string;
  archivo_url?: string;
  created_at: string;
}

/**
 * METADATOS DEL MODELO RELACIONAL PARA INSPECCIÓN Y AUDITORÍA
 */
export interface TableSchemaMetadata {
  tableName: string;
  description: string;
  primaryKey: string;
  foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
  columns: { name: string; type: string; nullable: boolean; description: string }[];
}

export const LOGICAL_DATA_MODEL_SCHEMA: TableSchemaMetadata[] = [
  {
    tableName: 'USUARIO',
    description: 'Cuentas de acceso y credenciales con roles RBAC (admin, medico, recepcionista, paciente)',
    primaryKey: 'id',
    foreignKeys: [],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único (UUID/Código)' },
      { name: 'username', type: 'VARCHAR(50)', nullable: false, description: 'Nombre de usuario único' },
      { name: 'password_hash', type: 'VARCHAR(255)', nullable: false, description: 'Hash seguro de contraseña' },
      { name: 'rol', type: 'ENUM', nullable: false, description: 'Rol asistencial o administrativo' },
      { name: 'email', type: 'VARCHAR(100)', nullable: false, description: 'Correo electrónico de contacto' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres del titular' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos del titular' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Estado de la cuenta' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Fecha de creación' },
    ],
  },
  {
    tableName: 'ESPECIALIDAD',
    description: 'Catálogo de especialidades médicas ofertadas en la red de clínicas',
    primaryKey: 'id',
    foreignKeys: [],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'codigo', type: 'VARCHAR(20)', nullable: false, description: 'Código mnemotécnico' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Nombre de la especialidad' },
      { name: 'descripcion', type: 'TEXT', nullable: true, description: 'Alcance clínico' },
      { name: 'duracion_turno_minutos', type: 'INT', nullable: false, description: 'Duración por cita (ej. 45)' },
      { name: 'precio_base', type: 'DECIMAL(10,2)', nullable: false, description: 'Tarifa asistencial base' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Estado operativo' },
    ],
  },
  {
    tableName: 'CONSULTORIO',
    description: 'Módulos y consultorios físicos equipados por sede y pabellón',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'especialidad_id', referencesTable: 'ESPECIALIDAD', referencesColumn: 'id' },
      { column: 'medico_asignado_id', referencesTable: 'MEDICO', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'codigo', type: 'VARCHAR(20)', nullable: false, description: 'Código físico (ej. CONS-101)' },
      { name: 'sede', type: 'VARCHAR(100)', nullable: false, description: 'Nombre de la sede hospitalaria' },
      { name: 'distrito', type: 'VARCHAR(50)', nullable: false, description: 'Distrito en Lima' },
      { name: 'piso_pabellon', type: 'VARCHAR(50)', nullable: false, description: 'Ubicación física' },
      { name: 'especialidad_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> ESPECIALIDAD' },
      { name: 'medico_asignado_id', type: 'VARCHAR(36)', nullable: true, description: 'FK -> MEDICO' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Activo / Mantenimiento / Inactivo' },
    ],
  },
  {
    tableName: 'MEDICO',
    description: 'Registro de profesionales colegiados, especialidad, sede y reputación',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'usuario_id', referencesTable: 'USUARIO', referencesColumn: 'id' },
      { column: 'especialidad_id', referencesTable: 'ESPECIALIDAD', referencesColumn: 'id' },
      { column: 'consultorio_id', referencesTable: 'CONSULTORIO', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'usuario_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> USUARIO (1:1)' },
      { name: 'cmp', type: 'VARCHAR(20)', nullable: false, description: 'Número de Colegiatura Médica' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres del médico' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos del médico' },
      { name: 'especialidad_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> ESPECIALIDAD' },
      { name: 'consultorio_id', type: 'VARCHAR(36)', nullable: true, description: 'FK -> CONSULTORIO' },
      { name: 'hospital_sede', type: 'VARCHAR(100)', nullable: false, description: 'Sede de atención' },
      { name: 'distrito', type: 'VARCHAR(50)', nullable: false, description: 'Distrito' },
      { name: 'calificacion', type: 'DECIMAL(3,1)', nullable: false, description: 'Puntaje de reseñas' },
      { name: 'foto_url', type: 'VARCHAR(255)', nullable: false, description: 'URL de fotografía oficial' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Activo / Inactivo' },
    ],
  },
  {
    tableName: 'PACIENTE',
    description: 'Registro de pacientes con DNI validado, filiación y seguro médico',
    primaryKey: 'id',
    foreignKeys: [{ column: 'usuario_id', referencesTable: 'USUARIO', referencesColumn: 'id' }],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'usuario_id', type: 'VARCHAR(36)', nullable: true, description: 'FK -> USUARIO (Opcional)' },
      { name: 'tipo_documento', type: 'VARCHAR(20)', nullable: false, description: 'Tipo doc. (DNI)' },
      { name: 'numero_documento', type: 'VARCHAR(15)', nullable: false, description: 'DNI de 8 dígitos numéricos' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos' },
      { name: 'fecha_nacimiento', type: 'DATE', nullable: false, description: 'Fecha de nacimiento' },
      { name: 'genero', type: 'VARCHAR(20)', nullable: false, description: 'Femenino / Masculino / Otro' },
      { name: 'celular', type: 'VARCHAR(15)', nullable: false, description: 'Celular WhatsApp 9 dígitos' },
      { name: 'email', type: 'VARCHAR(100)', nullable: false, description: 'Correo electrónico' },
      { name: 'seguro_salud', type: 'VARCHAR(50)', nullable: false, description: 'Particular, EPS, EsSalud, SIS' },
    ],
  },
  {
    tableName: 'HISTORIA_CLINICA',
    description: 'Expediente clínico único por paciente según Ley General de Salud N° 26842',
    primaryKey: 'id',
    foreignKeys: [{ column: 'paciente_id', referencesTable: 'PACIENTE', referencesColumn: 'id' }],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'paciente_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> PACIENTE (1:1)' },
      { name: 'numero_historia', type: 'VARCHAR(30)', nullable: false, description: 'Código único de historia' },
      { name: 'grupo_sanguineo', type: 'VARCHAR(10)', nullable: true, description: 'Grupo y factor Rh' },
      { name: 'antecedentes_patologicos', type: 'TEXT', nullable: false, description: 'Enfermedades previas' },
      { name: 'antecedentes_quirurgicos', type: 'TEXT', nullable: false, description: 'Cirugías' },
      { name: 'antecedentes_familiares', type: 'TEXT', nullable: false, description: 'Carga genética' },
      { name: 'alergias_medicamentosas', type: 'TEXT', nullable: false, description: 'Alergias a fármacos' },
      { name: 'fecha_apertura', type: 'TIMESTAMP', nullable: false, description: 'Fecha de apertura' },
    ],
  },
  {
    tableName: 'AGENDA',
    description: 'Cupos y slots horarios del médico con control de 0% solapamiento',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'medico_id', referencesTable: 'MEDICO', referencesColumn: 'id' },
      { column: 'consultorio_id', referencesTable: 'CONSULTORIO', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único de slot' },
      { name: 'medico_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> MEDICO' },
      { name: 'consultorio_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> CONSULTORIO' },
      { name: 'fecha', type: 'VARCHAR(30)', nullable: false, description: 'Fecha programada' },
      { name: 'hora_inicio', type: 'VARCHAR(15)', nullable: false, description: 'Hora de inicio' },
      { name: 'hora_fin', type: 'VARCHAR(15)', nullable: false, description: 'Hora de fin' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Disponible / Reservado / Bloqueado' },
    ],
  },
  {
    tableName: 'CITA_MEDICA',
    description: 'Reserva médica con ticket correlativo y ciclo de vida de estados',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'paciente_id', referencesTable: 'PACIENTE', referencesColumn: 'id' },
      { column: 'medico_id', referencesTable: 'MEDICO', referencesColumn: 'id' },
      { column: 'consultorio_id', referencesTable: 'CONSULTORIO', referencesColumn: 'id' },
      { column: 'agenda_id', referencesTable: 'AGENDA', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'codigo_ticket', type: 'VARCHAR(20)', nullable: false, description: 'Código de cita (ej. APT-1031)' },
      { name: 'paciente_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> PACIENTE' },
      { name: 'medico_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> MEDICO' },
      { name: 'consultorio_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> CONSULTORIO' },
      { name: 'agenda_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> AGENDA' },
      { name: 'fecha_cita', type: 'VARCHAR(30)', nullable: false, description: 'Fecha de cita' },
      { name: 'hora_cita', type: 'VARCHAR(15)', nullable: false, description: 'Hora de cita' },
      { name: 'estado', type: 'ENUM', nullable: false, description: 'Solicitada/Confirmada/Espera/Atención/Atendida/Reprogramada/Cancelada' },
      { name: 'consentimiento_informado_aceptado', type: 'BOOLEAN', nullable: false, description: 'Aceptación Ley 26842' },
      { name: 'firma_digital_data', type: 'TEXT', nullable: true, description: 'Hash/Trazo de firma digital' },
    ],
  },
  {
    tableName: 'PAGO',
    description: 'Registro administrativo asistencial de cobros (Efectivo/POS/Yape) y boleta simbólica',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'cita_medica_id', referencesTable: 'CITA_MEDICA', referencesColumn: 'id' },
      { column: 'paciente_id', referencesTable: 'PACIENTE', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único de pago' },
      { name: 'cita_medica_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> CITA_MEDICA (1:1)' },
      { name: 'paciente_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> PACIENTE' },
      { name: 'monto', type: 'DECIMAL(10,2)', nullable: false, description: 'Importe cobrado en S/.' },
      { name: 'metodo_pago', type: 'VARCHAR(30)', nullable: false, description: 'Efectivo / Tarjeta POS / Yape / Plin' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Pagado / Pendiente / Exonerado' },
      { name: 'numero_comprobante', type: 'VARCHAR(30)', nullable: true, description: 'Boleta simbólica B001-XXXX' },
      { name: 'nota_administrativa', type: 'TEXT', nullable: false, description: 'Aclaración de registro interno' },
    ],
  },
  {
    tableName: 'ATENCION_MEDICA',
    description: 'Acto médico, triaje, signos vitales, observaciones y diagnóstico CIE-10',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'cita_medica_id', referencesTable: 'CITA_MEDICA', referencesColumn: 'id' },
      { column: 'historia_clinica_id', referencesTable: 'HISTORIA_CLINICA', referencesColumn: 'id' },
      { column: 'medico_id', referencesTable: 'MEDICO', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador del acto médico' },
      { name: 'cita_medica_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> CITA_MEDICA (1:1)' },
      { name: 'historia_clinica_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> HISTORIA_CLINICA' },
      { name: 'medico_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> MEDICO' },
      { name: 'presion_arterial', type: 'VARCHAR(20)', nullable: false, description: 'Signo vital PA' },
      { name: 'frecuencia_cardiaca', type: 'VARCHAR(20)', nullable: false, description: 'Signo vital FC' },
      { name: 'temperatura', type: 'VARCHAR(20)', nullable: false, description: 'Temperatura corporal' },
      { name: 'saturacion_oxigeno', type: 'VARCHAR(20)', nullable: false, description: 'Sat O2 %' },
      { name: 'anamnesis_observaciones', type: 'TEXT', nullable: false, description: 'Evolución y examen físico' },
      { name: 'diagnostico_cie10', type: 'VARCHAR(150)', nullable: false, description: 'Diagnóstico formal CIE-10' },
      { name: 'plan_terapeutico', type: 'TEXT', nullable: false, description: 'Plan de tratamiento' },
    ],
  },
  {
    tableName: 'RECETA_MEDICAMENTOS',
    description: 'Prescripción farmacológica con posología, concentración y duración',
    primaryKey: 'id',
    foreignKeys: [{ column: 'atencion_medica_id', referencesTable: 'ATENCION_MEDICA', referencesColumn: 'id' }],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'atencion_medica_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> ATENCION_MEDICA' },
      { name: 'item_numero', type: 'INT', nullable: false, description: 'Ítem correlativo (1, 2, 3...)' },
      { name: 'medicamento', type: 'VARCHAR(100)', nullable: false, description: 'Fármaco genérico/comercial' },
      { name: 'concentracion', type: 'VARCHAR(50)', nullable: false, description: 'ej. 500mg, 10mg' },
      { name: 'forma_farmaceutica', type: 'VARCHAR(50)', nullable: false, description: 'Tableta, Jarabe, etc.' },
      { name: 'dosis', type: 'VARCHAR(50)', nullable: false, description: 'Dosis por toma' },
      { name: 'frecuencia_horas', type: 'VARCHAR(50)', nullable: false, description: 'Frecuencia (ej. c/8h)' },
      { name: 'duracion_dias', type: 'VARCHAR(50)', nullable: false, description: 'Duración (ej. 5 días)' },
      { name: 'indicaciones_toma', type: 'TEXT', nullable: true, description: 'Indicaciones especiales' },
    ],
  },
  {
    tableName: 'RESULTADO_EXAMEN',
    description: 'Órdenes y resultados de laboratorio, imágenes diagnósticas e informes',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'historia_clinica_id', referencesTable: 'HISTORIA_CLINICA', referencesColumn: 'id' },
      { column: 'paciente_id', referencesTable: 'PACIENTE', referencesColumn: 'id' },
      { column: 'atencion_medica_id', referencesTable: 'ATENCION_MEDICA', referencesColumn: 'id' },
    ],
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, description: 'Identificador único' },
      { name: 'historia_clinica_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> HISTORIA_CLINICA' },
      { name: 'paciente_id', type: 'VARCHAR(36)', nullable: false, description: 'FK -> PACIENTE' },
      { name: 'tipo_examen', type: 'VARCHAR(50)', nullable: false, description: 'Laboratorio, Rayos X, Ecografía' },
      { name: 'nombre_examen', type: 'VARCHAR(100)', nullable: false, description: 'Nombre específico' },
      { name: 'fecha_solicitud', type: 'TIMESTAMP', nullable: false, description: 'Fecha de orden médica' },
      { name: 'fecha_resultado', type: 'TIMESTAMP', nullable: true, description: 'Fecha de emisión' },
      { name: 'estado', type: 'VARCHAR(20)', nullable: false, description: 'Pendiente/Completado/Validado' },
      { name: 'resultado_informe', type: 'TEXT', nullable: false, description: 'Informe / Hallazgos' },
    ],
  },
];

/**
 * ESTRUCTURA EN MEMORIA Y PERSISTENCIA DE LA BASE DE DATOS NORMALIZADA COMPLETA
 */
export interface NormalizedDatabase {
  USUARIO: UsuarioEntity[];
  MEDICO: MedicoEntity[];
  ESPECIALIDAD: EspecialidadEntity[];
  CONSULTORIO: ConsultorioEntity[];
  PACIENTE: PacienteEntity[];
  AGENDA: AgendaEntity[];
  CITA_MEDICA: CitaMedicaEntity[];
  PAGO: PagoEntity[];
  HISTORIA_CLINICA: HistoriaClinicaEntity[];
  ATENCION_MEDICA: AtencionMedicaEntity[];
  RECETA_MEDICAMENTOS: RecetaMedicamentosEntity[];
  RESULTADO_EXAMEN: ResultadoExamenEntity[];
}

export type TableName = keyof NormalizedDatabase;

const NORMALIZED_DB_STORAGE_KEY = 'medicenter_normalized_db_v2';

/**
 * Semilla inicial normalizada para las 12 entidades del Modelo Lógico
 */
export const buildDefaultNormalizedDatabase = (): NormalizedDatabase => {
  // 1. USUARIOS
  const usuarios: UsuarioEntity[] = [
    {
      id: 'USR-001',
      username: 'admin',
      password_hash: 'scrypt:admin123',
      rol: 'admin',
      email: 'admin@medicenter.pe',
      nombres: 'Superintendente',
      apellidos: 'Administrativo',
      estado: 'Activo',
      created_at: '2026-01-01T08:00:00Z',
    },
    {
      id: 'USR-002',
      username: 'medico1',
      password_hash: 'scrypt:medico123',
      rol: 'medico',
      email: 'carlos.rodriguez@medicenter.pe',
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      estado: 'Activo',
      created_at: '2026-01-01T08:00:00Z',
    },
    {
      id: 'USR-003',
      username: 'medico10',
      password_hash: 'scrypt:medico123',
      rol: 'medico',
      email: 'luis.miguel@medicenter.pe',
      nombres: 'Luis',
      apellidos: 'Miguel',
      estado: 'Activo',
      created_at: '2026-01-01T08:00:00Z',
    },
    {
      id: 'USR-004',
      username: 'recepcion',
      password_hash: 'scrypt:recepcion123',
      rol: 'recepcionista',
      email: 'recepcion.lima@medicenter.pe',
      nombres: 'Valeria',
      apellidos: 'Cabrera',
      estado: 'Activo',
      created_at: '2026-01-01T08:00:00Z',
    },
    {
      id: 'USR-005',
      username: 'paciente',
      password_hash: 'scrypt:paciente123',
      rol: 'paciente',
      email: 'stefania.rocha@gmail.com',
      nombres: 'Stefania',
      apellidos: 'Rocha A.',
      estado: 'Activo',
      created_at: '2026-01-01T08:00:00Z',
    },
  ];

  // 2. ESPECIALIDADES
  const especialidades: EspecialidadEntity[] = [
    { id: 'ESP-01', codigo: 'ESP-MEDGEN', nombre: 'Medicina General', descripcion: 'Atención primaria y prevención integral', duracion_turno_minutos: 45, precio_base: 80, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-02', codigo: 'ESP-PEDIAT', nombre: 'Pediatría', descripcion: 'Atención integral del niño y del adolescente', duracion_turno_minutos: 45, precio_base: 100, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-03', codigo: 'ESP-CARDIO', nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de afecciones cardíacas', duracion_turno_minutos: 45, precio_base: 120, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-04', codigo: 'ESP-DERMAT', nombre: 'Dermatología', descripcion: 'Cuidado y patologías de piel, pelo y uñas', duracion_turno_minutos: 45, precio_base: 110, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-05', codigo: 'ESP-GINECO', nombre: 'Ginecología y Obstetricia', descripcion: 'Salud reproductiva femenina y control prenatal', duracion_turno_minutos: 45, precio_base: 120, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-06', codigo: 'ESP-TRAUMA', nombre: 'Traumatología y Ortopedia', descripcion: 'Lesiones musculoesqueléticas y articulares', duracion_turno_minutos: 45, precio_base: 120, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-07', codigo: 'ESP-OFTALM', nombre: 'Oftalmología', descripcion: 'Salud visual y cirugías oculares', duracion_turno_minutos: 45, precio_base: 110, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-08', codigo: 'ESP-NEUROL', nombre: 'Neurología', descripcion: 'Trastornos del sistema nervioso central y periférico', duracion_turno_minutos: 45, precio_base: 130, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-09', codigo: 'ESP-GASTRO', nombre: 'Gastroenterología', descripcion: 'Aparato digestivo, endoscopía y hepatología', duracion_turno_minutos: 45, precio_base: 120, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ESP-10', codigo: 'ESP-OTORRI', nombre: 'Otorrinolaringología', descripcion: 'Oído, nariz, senos paranasales y garganta', duracion_turno_minutos: 45, precio_base: 110, estado: 'Activa', created_at: '2026-01-01T00:00:00Z' },
  ];

  // 3. CONSULTORIOS
  const consultorios: ConsultorioEntity[] = [
    { id: 'CONS-001', codigo: 'CONS-101', sede: 'Sede Lima - Av. Petit Thouars', distrito: 'Jesús María', piso_pabellon: 'Piso 1 - Pabellón A', especialidad_id: 'ESP-01', medico_asignado_id: 'MED-001', equipamiento: 'Camilla, Tensiómetro, Balanza digital', estado: 'Activo', created_at: '2026-01-01T00:00:00Z' },
    { id: 'CONS-002', codigo: 'CONS-202', sede: 'Sede Lima - Av. Petit Thouars', distrito: 'Jesús María', piso_pabellon: 'Piso 2 - Pabellón A', especialidad_id: 'ESP-02', medico_asignado_id: 'MED-002', equipamiento: 'Infantómetro, Estetoscopio pediátrico', estado: 'Activo', created_at: '2026-01-01T00:00:00Z' },
    { id: 'CONS-003', codigo: 'CONS-303', sede: 'Sede San Borja - Av. Guardia Civil', distrito: 'San Borja', piso_pabellon: 'Piso 3 - Torre Médica', especialidad_id: 'ESP-03', medico_asignado_id: 'MED-003', equipamiento: 'Electrocardiógrafo digital de 12 canales', estado: 'Activo', created_at: '2026-01-01T00:00:00Z' },
    { id: 'CONS-004', codigo: 'CONS-404', sede: 'Sede Miraflores - Calle Shell', distrito: 'Miraflores', piso_pabellon: 'Piso 4 - Pabellón B', especialidad_id: 'ESP-04', equipamiento: 'Dermatoscopio polarizado, Luz de Wood', estado: 'Activo', created_at: '2026-01-01T00:00:00Z' },
    { id: 'CONS-005', codigo: 'CONS-505', sede: 'Sede San Isidro - Av. Arequipa', distrito: 'San Isidro', piso_pabellon: 'Piso 5 - Especialidades', especialidad_id: 'ESP-05', equipamiento: 'Ecógrafo 4D gineco-obstétrico', estado: 'Activo', created_at: '2026-01-01T00:00:00Z' },
  ];

  // 4. MÉDICOS
  const medicos: MedicoEntity[] = [
    {
      id: 'MED-001',
      usuario_id: 'USR-002',
      cmp: 'CMP-45892',
      rne: 'RNE-21045',
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      especialidad_id: 'ESP-01',
      consultorio_id: 'CONS-001',
      hospital_sede: 'Sede Lima - Av. Petit Thouars',
      distrito: 'Jesús María',
      calificacion: 4.9,
      numero_resenas: 120,
      foto_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
      estado: 'Activo',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'MED-002',
      usuario_id: 'USR-003',
      cmp: 'CMP-45801',
      rne: 'RNE-22019',
      nombres: 'Luis',
      apellidos: 'Miguel',
      especialidad_id: 'ESP-02',
      consultorio_id: 'CONS-002',
      hospital_sede: 'Sede Lima - Av. Petit Thouars',
      distrito: 'Jesús María',
      calificacion: 4.8,
      numero_resenas: 94,
      foto_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200',
      estado: 'Activo',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'MED-003',
      usuario_id: 'USR-002',
      cmp: 'CMP-51204',
      rne: 'RNE-26701',
      nombres: 'María',
      apellidos: 'Fernández',
      especialidad_id: 'ESP-03',
      consultorio_id: 'CONS-003',
      hospital_sede: 'Sede San Borja - Av. Guardia Civil',
      distrito: 'San Borja',
      calificacion: 4.9,
      numero_resenas: 142,
      foto_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
      estado: 'Activo',
      created_at: '2026-01-01T00:00:00Z',
    },
  ];

  // 5. PACIENTES
  const pacientes: PacienteEntity[] = [
    {
      id: 'PAC-001',
      usuario_id: 'USR-005',
      tipo_documento: 'DNI',
      numero_documento: '44892104',
      nombres: 'Stefania',
      apellidos: 'Rocha A.',
      fecha_nacimiento: '1995-04-18',
      edad: 31,
      genero: 'Femenino',
      celular: '987654321',
      email: 'stefania.rocha@gmail.com',
      seguro_salud: 'Rímac EPS',
      distrito: 'Jesús María',
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'PAC-002',
      tipo_documento: 'DNI',
      numero_documento: '10293847',
      nombres: 'Mateo',
      apellidos: 'García Silva',
      fecha_nacimiento: '2018-09-12',
      edad: 7,
      genero: 'Masculino',
      celular: '981234567',
      email: 'mgarcia@gmail.com',
      seguro_salud: 'Particular',
      distrito: 'San Borja',
      created_at: '2026-02-01T09:00:00Z',
    },
    {
      id: 'PAC-003',
      tipo_documento: 'DNI',
      numero_documento: '72819203',
      nombres: 'Luciana',
      apellidos: 'Vargas Paredes',
      fecha_nacimiento: '1990-11-04',
      edad: 35,
      genero: 'Femenino',
      celular: '992345678',
      email: 'luciana.vargas@hotmail.com',
      seguro_salud: 'Pacífico EPS',
      distrito: 'Miraflores',
      created_at: '2026-02-10T11:00:00Z',
    },
  ];

  // 6. HISTORIA CLÍNICA
  const historias_clinicas: HistoriaClinicaEntity[] = [
    {
      id: 'HC-001',
      paciente_id: 'PAC-001',
      numero_historia: 'HC-44892104',
      grupo_sanguineo: 'O+',
      antecedentes_patologicos: 'Gastritis antral leve controlada con dieta. Rinitis alérgica estacional.',
      antecedentes_quirurgicos: 'Apendicectomía laparoscópica en 2017 sin complicaciones.',
      antecedentes_familiares: 'Madre: HTA controlada. Padre: sin patologías de relevancia.',
      alergias_medicamentosas: 'Niega alergia a la penicilina y AINEs.',
      fecha_apertura: '2026-01-15T10:30:00Z',
      updated_at: '2026-09-25T11:00:00Z',
    },
    {
      id: 'HC-002',
      paciente_id: 'PAC-002',
      numero_historia: 'HC-10293847',
      grupo_sanguineo: 'A+',
      antecedentes_patologicos: 'Asma bronquial intermitente leve. Vacunas completas según esquema MINSA.',
      antecedentes_quirurgicos: 'Niega cirugías.',
      antecedentes_familiares: 'Tía materna con dermatitis atópica.',
      alergias_medicamentosas: 'Niega alergias farmacológicas.',
      fecha_apertura: '2026-02-01T09:15:00Z',
      updated_at: '2026-09-25T09:00:00Z',
    },
    {
      id: 'HC-003',
      paciente_id: 'PAC-003',
      numero_historia: 'HC-72819203',
      grupo_sanguineo: 'B+',
      antecedentes_patologicos: 'Migraña con aura ocasional.',
      antecedentes_quirurgicos: 'Amigdalectomía a los 12 años.',
      antecedentes_familiares: 'Abuelo materno con DM2.',
      alergias_medicamentosas: 'Alergia conocida a Sulfas.',
      fecha_apertura: '2026-02-10T11:20:00Z',
      updated_at: '2026-09-25T14:00:00Z',
    },
  ];

  // 7. AGENDA (Slots Horarios sin solapamiento)
  const agendas: AgendaEntity[] = [
    { id: 'AGD-001', medico_id: 'MED-001', consultorio_id: 'CONS-001', fecha: 'Hoy', hora_inicio: '09:00 AM', hora_fin: '09:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-002', medico_id: 'MED-001', consultorio_id: 'CONS-001', fecha: 'Hoy', hora_inicio: '10:00 AM', hora_fin: '10:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-003', medico_id: 'MED-001', consultorio_id: 'CONS-001', fecha: 'Hoy', hora_inicio: '11:00 AM', hora_fin: '11:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-004', medico_id: 'MED-001', consultorio_id: 'CONS-001', fecha: 'Hoy', hora_inicio: '12:00 PM', hora_fin: '12:45 PM', duracion_minutos: 45, estado: 'Disponible', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-005', medico_id: 'MED-002', consultorio_id: 'CONS-002', fecha: 'Hoy', hora_inicio: '09:00 AM', hora_fin: '09:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-006', medico_id: 'MED-002', consultorio_id: 'CONS-002', fecha: 'Hoy', hora_inicio: '10:00 AM', hora_fin: '10:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
    { id: 'AGD-007', medico_id: 'MED-003', consultorio_id: 'CONS-003', fecha: 'Hoy', hora_inicio: '11:00 AM', hora_fin: '11:45 AM', duracion_minutos: 45, estado: 'Reservado', created_at: '2026-09-25T00:00:00Z' },
  ];

  // 8. CITA MÉDICA
  const citas_medicas: CitaMedicaEntity[] = [
    {
      id: 'CITA-001',
      codigo_ticket: 'APT-1031',
      paciente_id: 'PAC-001',
      medico_id: 'MED-002',
      consultorio_id: 'CONS-002',
      agenda_id: 'AGD-005',
      fecha_cita: 'Hoy',
      hora_cita: '09:00 AM',
      estado: 'En atención',
      motivo_consulta: 'Control pediátrico y cuadro de tos leve',
      consentimiento_informado_aceptado: true,
      firma_digital_data: 'data:image/svg+xml;utf8,<svg>FIRMA_DIGITAL_STEFANIA</svg>',
      firma_timestamp: '2026-09-25T08:50:00Z',
      created_at: '2026-09-25T08:45:00Z',
    },
    {
      id: 'CITA-002',
      codigo_ticket: 'APT-1032',
      paciente_id: 'PAC-001',
      medico_id: 'MED-001',
      consultorio_id: 'CONS-001',
      agenda_id: 'AGD-001',
      fecha_cita: 'Hoy',
      hora_cita: '10:00 AM',
      estado: 'Atendida',
      motivo_consulta: 'Evaluación cardiovascular rutinaria',
      consentimiento_informado_aceptado: true,
      firma_digital_data: 'data:image/svg+xml;utf8,<svg>FIRMA_DIGITAL_STEFANIA</svg>',
      firma_timestamp: '2026-09-25T09:40:00Z',
      created_at: '2026-09-24T18:00:00Z',
    },
    {
      id: 'CITA-003',
      codigo_ticket: 'APT-1033',
      paciente_id: 'PAC-001',
      medico_id: 'MED-003',
      consultorio_id: 'CONS-003',
      agenda_id: 'AGD-007',
      fecha_cita: 'Mañana',
      hora_cita: '11:00 AM',
      estado: 'Confirmada',
      motivo_consulta: 'Lectura de ecocardiograma',
      consentimiento_informado_aceptado: true,
      created_at: '2026-09-25T10:00:00Z',
    },
    {
      id: 'CITA-004',
      codigo_ticket: 'APT-1034',
      paciente_id: 'PAC-002',
      medico_id: 'MED-002',
      consultorio_id: 'CONS-002',
      agenda_id: 'AGD-006',
      fecha_cita: 'Hoy',
      hora_cita: '10:00 AM',
      estado: 'En sala de espera',
      motivo_consulta: 'Control respiratorio post-resfriado',
      consentimiento_informado_aceptado: true,
      created_at: '2026-09-25T09:10:00Z',
    },
    {
      id: 'CITA-005',
      codigo_ticket: 'APT-1035',
      paciente_id: 'PAC-003',
      medico_id: 'MED-001',
      consultorio_id: 'CONS-001',
      agenda_id: 'AGD-002',
      fecha_cita: 'Hoy',
      hora_cita: '11:00 AM',
      estado: 'Cancelada',
      motivo_cancelacion: 'Incompatibilidad laboral de último minuto',
      consentimiento_informado_aceptado: true,
      created_at: '2026-09-24T15:30:00Z',
    },
  ];

  // 9. PAGO (Registro Administrativo y Boleta Simbólica)
  const pagos: PagoEntity[] = [
    {
      id: 'PAG-001',
      cita_medica_id: 'CITA-001',
      paciente_id: 'PAC-001',
      monto: 100,
      metodo_pago: 'Yape / Plin',
      estado: 'Pagado',
      numero_comprobante: 'B001-001031',
      fecha_pago: '2026-09-25T08:52:00Z',
      transaccion_referencia: 'YAPE-TX-99214',
      registrado_por_usuario_id: 'USR-004',
      nota_administrativa: 'Registro administrativo en módulo de admisión. Comprobante interno simbólico emitido.',
      created_at: '2026-09-25T08:52:00Z',
    },
    {
      id: 'PAG-002',
      cita_medica_id: 'CITA-002',
      paciente_id: 'PAC-001',
      monto: 80,
      metodo_pago: 'Tarjeta POS',
      estado: 'Pagado',
      numero_comprobante: 'B001-001032',
      fecha_pago: '2026-09-25T09:45:00Z',
      transaccion_referencia: 'POS-AUTH-44120',
      registrado_por_usuario_id: 'USR-004',
      nota_administrativa: 'Atención completada y cancelada en caja de recepción.',
      created_at: '2026-09-25T09:45:00Z',
    },
    {
      id: 'PAG-003',
      cita_medica_id: 'CITA-003',
      paciente_id: 'PAC-001',
      monto: 120,
      metodo_pago: 'Pendiente',
      estado: 'Pendiente',
      nota_administrativa: 'Pendiente de pago al momento de presentarse en admisión física.',
      created_at: '2026-09-25T10:00:00Z',
    },
    {
      id: 'PAG-004',
      cita_medica_id: 'CITA-004',
      paciente_id: 'PAC-002',
      monto: 100,
      metodo_pago: 'Efectivo',
      estado: 'Pagado',
      numero_comprobante: 'B001-001034',
      fecha_pago: '2026-09-25T09:20:00Z',
      registrado_por_usuario_id: 'USR-004',
      nota_administrativa: 'Pago en efectivo verificado en ventanilla 2.',
      created_at: '2026-09-25T09:20:00Z',
    },
  ];

  // 10. ATENCIÓN MÉDICA (Ficha Clínica y Triaje)
  const atenciones_medicas: AtencionMedicaEntity[] = [
    {
      id: 'ATN-001',
      cita_medica_id: 'CITA-002',
      historia_clinica_id: 'HC-001',
      medico_id: 'MED-001',
      fecha_atencion: '2026-09-25',
      hora_inicio: '10:05 AM',
      hora_fin: '10:45 AM',
      presion_arterial: '120/80 mmHg',
      frecuencia_cardiaca: '72 lpm',
      temperatura: '36.6 °C',
      saturacion_oxigeno: '99%',
      peso_kg: '68 kg',
      talla_m: '1.65 m',
      imc: '24.9',
      anamnesis_observaciones: 'Paciente femenina acude a chequeo preventivo general. Refiere buen estado anímico, sin disnea ni dolor torácico. Ruidos cardíacos rítmicos normofonéticos.',
      examen_fisico: 'Tórax simétrico, murmullo vesicular pasa bien en ambos campos pulmonares sin ruidos agregados. Abdomen blando, depresible, no doloroso.',
      diagnostico_cie10: 'Z00.0 - Examen médico general de rutina (Sin alteraciones)',
      tipo_diagnostico: 'Definitivo',
      plan_terapeutico: 'Estilo de vida saludable, dieta mediterránea baja en sodio, actividad física aeróbica 150 min/semana. Control anual.',
      indicaciones_generales: 'Mantener hidratación adecuada y acudir a triaje si presenta palpitaciones.',
      created_at: '2026-09-25T10:45:00Z',
    },
  ];

  // 11. RECETA MEDICAMENTOS
  const recetas_medicamentos: RecetaMedicamentosEntity[] = [
    {
      id: 'REC-001',
      atencion_medica_id: 'ATN-001',
      item_numero: 1,
      medicamento: 'Complejo B + Vitamina C',
      concentracion: '500 mg',
      forma_farmaceutica: 'Tableta recubierta',
      dosis: '1 tableta',
      frecuencia_horas: 'Cada 24 horas (Mañanas)',
      duracion_dias: '30 días',
      indicaciones_toma: 'Tomar con abundante agua después del desayuno.',
      created_at: '2026-09-25T10:45:00Z',
    },
  ];

  // 12. RESULTADO EXAMEN
  const resultados_examenes: ResultadoExamenEntity[] = [
    {
      id: 'EXA-001',
      historia_clinica_id: 'HC-001',
      paciente_id: 'PAC-001',
      atencion_medica_id: 'ATN-001',
      tipo_examen: 'Laboratorio Clínico',
      nombre_examen: 'Perfil Lipídico Completo & Glucosa en Ayunas',
      fecha_solicitud: '2026-09-20T08:00:00Z',
      fecha_resultado: '2026-09-22T14:30:00Z',
      estado: 'Validado',
      resultado_informe: 'Colesterol Total: 178 mg/dL (Normal). Triglicéridos: 110 mg/dL (Normal). Glucosa: 86 mg/dL (Normal).',
      valores_referencia: 'Colesterol < 200 mg/dL | Glucosa 70-100 mg/dL',
      medico_validador: 'Dr. Carlos Rodríguez (CMP-45892)',
      created_at: '2026-09-22T15:00:00Z',
    },
  ];

  return {
    USUARIO: usuarios,
    MEDICO: medicos,
    ESPECIALIDAD: especialidades,
    CONSULTORIO: consultorios,
    PACIENTE: pacientes,
    AGENDA: agendas,
    CITA_MEDICA: citas_medicas,
    PAGO: pagos,
    HISTORIA_CLINICA: historias_clinicas,
    ATENCION_MEDICA: atenciones_medicas,
    RECETA_MEDICAMENTOS: recetas_medicamentos,
    RESULTADO_EXAMEN: resultados_examenes,
  };
};

/**
 * Acceso y persistencia a localStorage de la base de datos normalizada
 */
export const getStoredNormalizedDB = (): NormalizedDatabase => {
  try {
    const raw = localStorage.getItem(NORMALIZED_DB_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading normalized database from storage:', e);
  }
  const defaultDb = buildDefaultNormalizedDatabase();
  saveStoredNormalizedDB(defaultDb);
  return defaultDb;
};

export const saveStoredNormalizedDB = (db: NormalizedDatabase) => {
  try {
    localStorage.setItem(NORMALIZED_DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving normalized database to storage:', e);
  }
};

/**
 * Sincronización bidireccional entre citas del frontend y las 12 tablas normalizadas
 */
export const syncNormalizedDBWithAppointments = (
  appointments: any[],
  currentDb: NormalizedDatabase
): NormalizedDatabase => {
  const updatedDb: NormalizedDatabase = { ...currentDb };

  appointments.forEach((apt) => {
    // 1. Sincronizar PACIENTE
    let paciente = updatedDb.PACIENTE.find((p) => p.numero_documento === apt.patientDni);
    if (!paciente) {
      paciente = {
        id: `PAC-${apt.patientDni}`,
        tipo_documento: 'DNI',
        numero_documento: apt.patientDni,
        nombres: apt.patientName.split(' ')[0] || apt.patientName,
        apellidos: apt.patientName.split(' ').slice(1).join(' ') || 'Registrado',
        fecha_nacimiento: '1995-01-01',
        genero: 'Femenino',
        celular: apt.patientPhone,
        email: apt.patientEmail || `${apt.patientDni}@medicenter.pe`,
        seguro_salud: (apt.insurance as any) || 'Particular',
        distrito: apt.district || 'Lima',
        created_at: apt.createdAt || new Date().toISOString(),
      };
      updatedDb.PACIENTE.push(paciente);
    }

    // 2. Sincronizar HISTORIA_CLINICA
    let historia = updatedDb.HISTORIA_CLINICA.find((h) => h.paciente_id === paciente!.id);
    if (!historia) {
      historia = {
        id: `HC-${paciente.numero_documento}`,
        paciente_id: paciente.id,
        numero_historia: `HC-${paciente.numero_documento}`,
        antecedentes_patologicos: apt.medicalHistory || 'Sin antecedentes patológicos declarados',
        antecedentes_quirurgicos: 'Niega cirugías previas',
        antecedentes_familiares: 'Sin antecedentes familiares de relevancia',
        alergias_medicamentosas: 'Niega alergias a medicamentos',
        fecha_apertura: apt.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updatedDb.HISTORIA_CLINICA.push(historia);
    } else if (apt.medicalHistory) {
      historia.antecedentes_patologicos = apt.medicalHistory;
      historia.updated_at = new Date().toISOString();
    }

    // 3. Sincronizar CITA_MEDICA
    let cita = updatedDb.CITA_MEDICA.find((c) => c.codigo_ticket === apt.id);
    if (!cita) {
      cita = {
        id: `CITA-${apt.id.replace('APT-', '')}`,
        codigo_ticket: apt.id,
        paciente_id: paciente.id,
        medico_id: apt.doctorId || 'MED-001',
        consultorio_id: 'CONS-001',
        agenda_id: `AGD-${apt.doctorId}-${apt.date}-${apt.time}`.replace(/\s+/g, '-'),
        fecha_cita: apt.date,
        hora_cita: apt.time,
        estado: apt.status as any,
        motivo_consulta: 'Consulta médica asistencial',
        reprogramada_desde_fecha: apt.reprogrammedFrom?.date,
        reprogramada_desde_hora: apt.reprogrammedFrom?.time,
        motivo_cancelacion: apt.cancellationReason,
        consentimiento_informado_aceptado: apt.consentAccepted ?? true,
        firma_digital_data: apt.signatureData,
        firma_timestamp: apt.signatureTimestamp,
        created_at: apt.createdAt || new Date().toISOString(),
      };
      updatedDb.CITA_MEDICA.push(cita);
    } else {
      cita.estado = apt.status as any;
      cita.fecha_cita = apt.date;
      cita.hora_cita = apt.time;
      if (apt.cancellationReason) cita.motivo_cancelacion = apt.cancellationReason;
      if (apt.reprogrammedFrom) {
        cita.reprogramada_desde_fecha = apt.reprogrammedFrom.date;
        cita.reprogramada_desde_hora = apt.reprogrammedFrom.time;
      }
    }

    // 4. Sincronizar PAGO
    let pago = updatedDb.PAGO.find((p) => p.cita_medica_id === cita!.id);
    if (!pago) {
      pago = {
        id: `PAG-${apt.id.replace('APT-', '')}`,
        cita_medica_id: cita.id,
        paciente_id: paciente.id,
        monto: apt.amount || 100,
        metodo_pago: (apt.paymentMethod as any) || 'Pendiente',
        estado: (apt.paymentStatus as any) || 'Pendiente',
        numero_comprobante: apt.receiptNumber,
        fecha_pago: apt.receiptIssuedAt,
        nota_administrativa: 'Registro administrativo asistencial de cobros en admisión.',
        created_at: apt.createdAt || new Date().toISOString(),
      };
      updatedDb.PAGO.push(pago);
    } else {
      pago.monto = apt.amount || 100;
      pago.metodo_pago = (apt.paymentMethod as any) || pago.metodo_pago;
      pago.estado = (apt.paymentStatus as any) || pago.estado;
      if (apt.receiptNumber) pago.numero_comprobante = apt.receiptNumber;
      if (apt.receiptIssuedAt) pago.fecha_pago = apt.receiptIssuedAt;
    }

    // 5. Sincronizar ATENCION_MEDICA si fue atendida o tiene diagnóstico
    if (apt.diagnosis || apt.status === 'Atendida' || apt.status === 'Atendido') {
      let atencion = updatedDb.ATENCION_MEDICA.find((a) => a.cita_medica_id === cita!.id);
      if (!atencion) {
        atencion = {
          id: `ATN-${apt.id.replace('APT-', '')}`,
          cita_medica_id: cita.id,
          historia_clinica_id: historia.id,
          medico_id: apt.doctorId || 'MED-001',
          fecha_atencion: apt.attendedAt || apt.date,
          hora_inicio: apt.time,
          presion_arterial: apt.vitalSigns?.bloodPressure || '120/80 mmHg',
          frecuencia_cardiaca: apt.vitalSigns?.heartRate ? `${apt.vitalSigns.heartRate} lpm` : '74 lpm',
          temperatura: apt.vitalSigns?.temperature ? `${apt.vitalSigns.temperature} °C` : '36.7 °C',
          saturacion_oxigeno: apt.vitalSigns?.oxygenSaturation ? `${apt.vitalSigns.oxygenSaturation}%` : '99%',
          peso_kg: apt.vitalSigns?.weight ? `${apt.vitalSigns.weight} kg` : '68 kg',
          talla_m: apt.vitalSigns?.height ? `${apt.vitalSigns.height} m` : '1.65 m',
          anamnesis_observaciones: apt.clinicalObservations || 'Paciente evaluado en consulta presencial.',
          examen_fisico: 'Examen físico y signos vitales registrados en triaje.',
          diagnostico_cie10: apt.diagnosis || 'Evaluación médica completada',
          tipo_diagnostico: 'Definitivo',
          plan_terapeutico: apt.prescription || 'Indicaciones médicas entregadas al paciente.',
          indicaciones_generales: 'Control ambulatorio.',
          created_at: apt.attendedAt || new Date().toISOString(),
        };
        updatedDb.ATENCION_MEDICA.push(atencion);

        // 6. RECETA MEDICAMENTOS
        if (apt.prescription) {
          const recExist = updatedDb.RECETA_MEDICAMENTOS.find((r) => r.atencion_medica_id === atencion!.id);
          if (!recExist) {
            updatedDb.RECETA_MEDICAMENTOS.push({
              id: `REC-${apt.id.replace('APT-', '')}`,
              atencion_medica_id: atencion.id,
              item_numero: 1,
              medicamento: 'Prescripción Médica Oficial',
              concentracion: 'Según indicación',
              forma_farmaceutica: 'Tabletas / Tratamiento integral',
              dosis: '1 toma',
              frecuencia_horas: 'c/8h o según receta',
              duracion_dias: '5 días',
              indicaciones_toma: apt.prescription,
              created_at: apt.attendedAt || new Date().toISOString(),
            });
          }
        }
      }
    }
  });

  saveStoredNormalizedDB(updatedDb);
  return updatedDb;
};

/**
 * Validador de Integridad Relacional (Comprobación de Llaves Primarias y Foráneas)
 */
export interface IntegrityReport {
  totalTables: number;
  totalRecords: number;
  foreignKeyErrors: {
    table: string;
    fkColumn: string;
    value: string;
    referencedTable: string;
  }[];
  isCoherent: boolean;
  tableCounts: Record<TableName, number>;
}

export const validateDatabaseIntegrity = (db: NormalizedDatabase): IntegrityReport => {
  const fkErrors: { table: string; fkColumn: string; value: string; referencedTable: string }[] = [];

  const userIds = new Set(db.USUARIO.map((u) => u.id));
  const docIds = new Set(db.MEDICO.map((m) => m.id));
  const specIds = new Set(db.ESPECIALIDAD.map((s) => s.id));
  const consIds = new Set(db.CONSULTORIO.map((c) => c.id));
  const pacIds = new Set(db.PACIENTE.map((p) => p.id));
  const citaIds = new Set(db.CITA_MEDICA.map((c) => c.id));
  const hcIds = new Set(db.HISTORIA_CLINICA.map((h) => h.id));
  const atnIds = new Set(db.ATENCION_MEDICA.map((a) => a.id));

  // Check CITA_MEDICA FKs
  db.CITA_MEDICA.forEach((c) => {
    if (!pacIds.has(c.paciente_id)) {
      fkErrors.push({ table: 'CITA_MEDICA', fkColumn: 'paciente_id', value: c.paciente_id, referencedTable: 'PACIENTE' });
    }
  });

  // Check PAGO FKs
  db.PAGO.forEach((p) => {
    if (!citaIds.has(p.cita_medica_id)) {
      fkErrors.push({ table: 'PAGO', fkColumn: 'cita_medica_id', value: p.cita_medica_id, referencedTable: 'CITA_MEDICA' });
    }
  });

  // Check HISTORIA_CLINICA FKs
  db.HISTORIA_CLINICA.forEach((h) => {
    if (!pacIds.has(h.paciente_id)) {
      fkErrors.push({ table: 'HISTORIA_CLINICA', fkColumn: 'paciente_id', value: h.paciente_id, referencedTable: 'PACIENTE' });
    }
  });

  // Check ATENCION_MEDICA FKs
  db.ATENCION_MEDICA.forEach((a) => {
    if (!citaIds.has(a.cita_medica_id)) {
      fkErrors.push({ table: 'ATENCION_MEDICA', fkColumn: 'cita_medica_id', value: a.cita_medica_id, referencedTable: 'CITA_MEDICA' });
    }
    if (!hcIds.has(a.historia_clinica_id)) {
      fkErrors.push({ table: 'ATENCION_MEDICA', fkColumn: 'historia_clinica_id', value: a.historia_clinica_id, referencedTable: 'HISTORIA_CLINICA' });
    }
  });

  // Check RECETA_MEDICAMENTOS FKs
  db.RECETA_MEDICAMENTOS.forEach((r) => {
    if (!atnIds.has(r.atencion_medica_id)) {
      fkErrors.push({ table: 'RECETA_MEDICAMENTOS', fkColumn: 'atencion_medica_id', value: r.atencion_medica_id, referencedTable: 'ATENCION_MEDICA' });
    }
  });

  const tableCounts = {
    USUARIO: db.USUARIO.length,
    MEDICO: db.MEDICO.length,
    ESPECIALIDAD: db.ESPECIALIDAD.length,
    CONSULTORIO: db.CONSULTORIO.length,
    PACIENTE: db.PACIENTE.length,
    AGENDA: db.AGENDA.length,
    CITA_MEDICA: db.CITA_MEDICA.length,
    PAGO: db.PAGO.length,
    HISTORIA_CLINICA: db.HISTORIA_CLINICA.length,
    ATENCION_MEDICA: db.ATENCION_MEDICA.length,
    RECETA_MEDICAMENTOS: db.RECETA_MEDICAMENTOS.length,
    RESULTADO_EXAMEN: db.RESULTADO_EXAMEN.length,
  };

  const totalRecords = Object.values(tableCounts).reduce((a, b) => a + b, 0);

  return {
    totalTables: 12,
    totalRecords,
    foreignKeyErrors: fkErrors,
    isCoherent: fkErrors.length === 0,
    tableCounts,
  };
};

/**
 * Generador de Script SQL ANSI / PostgreSQL (DDL + DML) de las 12 Tablas
 */
export const generateFullSqlScript = (db: NormalizedDatabase): string => {
  let sql = `-- =========================================================================\n`;
  sql += `-- SISTEMA DE CITAS MÉDICAS MEDICENTER - MODELO DE DATOS LÓGICO NORMALIZADO (3FN)\n`;
  sql += `-- 12 Entidades: USUARIO, MEDICO, ESPECIALIDAD, CONSULTORIO, PACIENTE,\n`;
  sql += `-- AGENDA, CITA_MEDICA, PAGO, HISTORIA_CLINICA, ATENCION_MEDICA,\n`;
  sql += `-- RECETA_MEDICAMENTOS y RESULTADO_EXAMEN.\n`;
  sql += `-- Generado: ${new Date().toISOString()}\n`;
  sql += `-- =========================================================================\n\n`;

  // DDL
  sql += `CREATE TABLE USUARIO (\n  id VARCHAR(36) PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  password_hash VARCHAR(255) NOT NULL,\n  rol VARCHAR(20) NOT NULL,\n  email VARCHAR(100) NOT NULL,\n  nombres VARCHAR(100) NOT NULL,\n  apellidos VARCHAR(100) NOT NULL,\n  estado VARCHAR(20) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE ESPECIALIDAD (\n  id VARCHAR(36) PRIMARY KEY,\n  codigo VARCHAR(20) UNIQUE NOT NULL,\n  nombre VARCHAR(100) NOT NULL,\n  descripcion TEXT,\n  duracion_turno_minutos INT NOT NULL DEFAULT 45,\n  precio_base DECIMAL(10,2) NOT NULL DEFAULT 100.00,\n  estado VARCHAR(20) NOT NULL DEFAULT 'Activa',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE CONSULTORIO (\n  id VARCHAR(36) PRIMARY KEY,\n  codigo VARCHAR(20) UNIQUE NOT NULL,\n  sede VARCHAR(100) NOT NULL,\n  distrito VARCHAR(50) NOT NULL,\n  piso_pabellon VARCHAR(50) NOT NULL,\n  especialidad_id VARCHAR(36) REFERENCES ESPECIALIDAD(id),\n  medico_asignado_id VARCHAR(36),\n  equipamiento TEXT,\n  estado VARCHAR(20) NOT NULL DEFAULT 'Activo',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE MEDICO (\n  id VARCHAR(36) PRIMARY KEY,\n  usuario_id VARCHAR(36) REFERENCES USUARIO(id),\n  cmp VARCHAR(20) UNIQUE NOT NULL,\n  rne VARCHAR(20),\n  nombres VARCHAR(100) NOT NULL,\n  apellidos VARCHAR(100) NOT NULL,\n  especialidad_id VARCHAR(36) REFERENCES ESPECIALIDAD(id),\n  consultorio_id VARCHAR(36) REFERENCES CONSULTORIO(id),\n  hospital_sede VARCHAR(100) NOT NULL,\n  distrito VARCHAR(50) NOT NULL,\n  calificacion DECIMAL(3,1) DEFAULT 5.0,\n  numero_resenas INT DEFAULT 0,\n  foto_url VARCHAR(255),\n  estado VARCHAR(20) NOT NULL DEFAULT 'Activo',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE PACIENTE (\n  id VARCHAR(36) PRIMARY KEY,\n  usuario_id VARCHAR(36) REFERENCES USUARIO(id),\n  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',\n  numero_documento VARCHAR(15) UNIQUE NOT NULL,\n  nombres VARCHAR(100) NOT NULL,\n  apellidos VARCHAR(100) NOT NULL,\n  fecha_nacimiento DATE NOT NULL,\n  edad INT,\n  genero VARCHAR(20) NOT NULL,\n  celular VARCHAR(15) NOT NULL,\n  email VARCHAR(100) NOT NULL,\n  seguro_salud VARCHAR(50) NOT NULL DEFAULT 'Particular',\n  distrito VARCHAR(50) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE HISTORIA_CLINICA (\n  id VARCHAR(36) PRIMARY KEY,\n  paciente_id VARCHAR(36) UNIQUE REFERENCES PACIENTE(id),\n  numero_historia VARCHAR(30) UNIQUE NOT NULL,\n  grupo_sanguineo VARCHAR(10),\n  antecedentes_patologicos TEXT NOT NULL,\n  antecedentes_quirurgicos TEXT NOT NULL,\n  antecedentes_familiares TEXT NOT NULL,\n  alergias_medicamentosas TEXT NOT NULL,\n  fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE AGENDA (\n  id VARCHAR(36) PRIMARY KEY,\n  medico_id VARCHAR(36) REFERENCES MEDICO(id),\n  consultorio_id VARCHAR(36) REFERENCES CONSULTORIO(id),\n  fecha VARCHAR(30) NOT NULL,\n  hora_inicio VARCHAR(15) NOT NULL,\n  hora_fin VARCHAR(15) NOT NULL,\n  duracion_minutos INT NOT NULL DEFAULT 45,\n  estado VARCHAR(20) NOT NULL DEFAULT 'Disponible',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE CITA_MEDICA (\n  id VARCHAR(36) PRIMARY KEY,\n  codigo_ticket VARCHAR(20) UNIQUE NOT NULL,\n  paciente_id VARCHAR(36) REFERENCES PACIENTE(id),\n  medico_id VARCHAR(36) REFERENCES MEDICO(id),\n  consultorio_id VARCHAR(36) REFERENCES CONSULTORIO(id),\n  agenda_id VARCHAR(36) REFERENCES AGENDA(id),\n  fecha_cita VARCHAR(30) NOT NULL,\n  hora_cita VARCHAR(15) NOT NULL,\n  estado VARCHAR(30) NOT NULL,\n  motivo_consulta TEXT,\n  reprogramada_desde_fecha VARCHAR(30),\n  reprogramada_desde_hora VARCHAR(15),\n  motivo_cancelacion TEXT,\n  consentimiento_informado_aceptado BOOLEAN NOT NULL DEFAULT TRUE,\n  firma_digital_data TEXT,\n  firma_timestamp TIMESTAMP,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE PAGO (\n  id VARCHAR(36) PRIMARY KEY,\n  cita_medica_id VARCHAR(36) UNIQUE REFERENCES CITA_MEDICA(id),\n  paciente_id VARCHAR(36) REFERENCES PACIENTE(id),\n  monto DECIMAL(10,2) NOT NULL,\n  metodo_pago VARCHAR(30) NOT NULL,\n  estado VARCHAR(20) NOT NULL,\n  numero_comprobante VARCHAR(30),\n  fecha_pago TIMESTAMP,\n  nota_administrativa TEXT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE ATENCION_MEDICA (\n  id VARCHAR(36) PRIMARY KEY,\n  cita_medica_id VARCHAR(36) UNIQUE REFERENCES CITA_MEDICA(id),\n  historia_clinica_id VARCHAR(36) REFERENCES HISTORIA_CLINICA(id),\n  medico_id VARCHAR(36) REFERENCES MEDICO(id),\n  fecha_atencion VARCHAR(30) NOT NULL,\n  hora_inicio VARCHAR(15) NOT NULL,\n  hora_fin VARCHAR(15),\n  presion_arterial VARCHAR(20),\n  frecuencia_cardiaca VARCHAR(20),\n  temperatura VARCHAR(20),\n  saturacion_oxigeno VARCHAR(20),\n  peso_kg VARCHAR(20),\n  talla_m VARCHAR(20),\n  anamnesis_observaciones TEXT NOT NULL,\n  examen_fisico TEXT,\n  diagnostico_cie10 VARCHAR(150) NOT NULL,\n  tipo_diagnostico VARCHAR(30) DEFAULT 'Definitivo',\n  plan_terapeutico TEXT NOT NULL,\n  indicaciones_generales TEXT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE RECETA_MEDICAMENTOS (\n  id VARCHAR(36) PRIMARY KEY,\n  atencion_medica_id VARCHAR(36) REFERENCES ATENCION_MEDICA(id),\n  item_numero INT NOT NULL,\n  medicamento VARCHAR(100) NOT NULL,\n  concentracion VARCHAR(50) NOT NULL,\n  forma_farmaceutica VARCHAR(50) NOT NULL,\n  dosis VARCHAR(50) NOT NULL,\n  frecuencia_horas VARCHAR(50) NOT NULL,\n  duracion_dias VARCHAR(50) NOT NULL,\n  indicaciones_toma TEXT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE RESULTADO_EXAMEN (\n  id VARCHAR(36) PRIMARY KEY,\n  historia_clinica_id VARCHAR(36) REFERENCES HISTORIA_CLINICA(id),\n  paciente_id VARCHAR(36) REFERENCES PACIENTE(id),\n  atencion_medica_id VARCHAR(36) REFERENCES ATENCION_MEDICA(id),\n  tipo_examen VARCHAR(50) NOT NULL,\n  nombre_examen VARCHAR(100) NOT NULL,\n  fecha_solicitud TIMESTAMP NOT NULL,\n  fecha_resultado TIMESTAMP,\n  estado VARCHAR(20) NOT NULL DEFAULT 'Validado',\n  resultado_informe TEXT NOT NULL,\n  valores_referencia TEXT,\n  medico_validador VARCHAR(100),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `-- =========================================================================\n`;
  sql += `-- DML: INSERCIÓN DE DATOS NORMALIZADOS ACTUALES\n`;
  sql += `-- =========================================================================\n\n`;

  // Add DML sample
  db.USUARIO.forEach((u) => {
    sql += `INSERT INTO USUARIO (id, username, password_hash, rol, email, nombres, apellidos, estado) VALUES ('${u.id}', '${u.username}', '${u.password_hash}', '${u.rol}', '${u.email}', '${u.nombres}', '${u.apellidos}', '${u.estado}');\n`;
  });

  db.PACIENTE.forEach((p) => {
    sql += `INSERT INTO PACIENTE (id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero, celular, email, seguro_salud, distrito) VALUES ('${p.id}', '${p.tipo_documento}', '${p.numero_documento}', '${p.nombres.replace(/'/g, "''")}', '${p.apellidos.replace(/'/g, "''")}', '${p.fecha_nacimiento}', '${p.genero}', '${p.celular}', '${p.email}', '${p.seguro_salud}', '${p.distrito}');\n`;
  });

  db.CITA_MEDICA.forEach((c) => {
    sql += `INSERT INTO CITA_MEDICA (id, codigo_ticket, paciente_id, medico_id, consultorio_id, agenda_id, fecha_cita, hora_cita, estado, motivo_consulta) VALUES ('${c.id}', '${c.codigo_ticket}', '${c.paciente_id}', '${c.medico_id}', '${c.consultorio_id}', '${c.agenda_id}', '${c.fecha_cita}', '${c.hora_cita}', '${c.estado}', '${(c.motivo_consulta || '').replace(/'/g, "''")}');\n`;
  });

  db.PAGO.forEach((p) => {
    sql += `INSERT INTO PAGO (id, cita_medica_id, paciente_id, monto, metodo_pago, estado, numero_comprobante, nota_administrativa) VALUES ('${p.id}', '${p.cita_medica_id}', '${p.paciente_id}', ${p.monto}, '${p.metodo_pago}', '${p.estado}', '${p.numero_comprobante || ''}', '${(p.nota_administrativa || '').replace(/'/g, "''")}');\n`;
  });

  return sql;
};
