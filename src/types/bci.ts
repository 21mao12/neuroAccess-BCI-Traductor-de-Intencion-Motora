/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Types for Neuro-Access BCI: Motor Intent & Virtual Subject EEG Simulator
 * Complies with educational and engineering prototyping guidelines.
 * 
 * IMPORTANTE:
 * Estos datos son completamente sintéticos y simulados matemáticamente.
 * NO representan datos médicos de pacientes reales ni deben usarse para diagnosticar ELA u otras patologías.
 */

export type ExperimentalState = 
  | 'REST'                     // Reposo basal
  | 'MOTOR_IMAGERY_RIGHT'      // Imaginación de movimiento de mano derecha (ERD en C3)
  | 'MOTOR_IMAGERY_LEFT'       // Imaginación de movimiento de mano izquierda (ERD en C4)
  | 'SENSORY_STIMULUS'         // Estímulo sensorial (modulación somatosensorial en Cz/parietal)
  | 'ARTIFACT_NOISE';          // Ruido / artefacto (parpadeo o electromiografía)

export type MotorState = 'REST' | 'CALIBRATING' | 'MOTOR_INTENT' | 'EXECUTED';

export interface DSPMetrics {
  muPower: number; // uV^2
  betaPower: number; // uV^2
  baselineMuPower: number; // baseline reference
  erdPercentage: number; // ((Mu - Baseline) / Baseline) * 100
  snrDb: number; // Signal to Noise Ratio
  dominantFreq: number; // in Hz
  timestamp: number;
}

export interface InterpretationLog {
  id: string;
  timestamp: string;
  actionId: string;
  actionTitle: string;
  erdValue: number;
  confidence: number;
  muPower: number;
  betaPower: number;
  gemmaSpeech: string;
  clinicalNote: string;
  channel: ElectrodeId;
}

export type ElectrodeId = 'F3' | 'F4' | 'C3' | 'Cz' | 'C4' | 'P3' | 'P4' | 'O1' | 'O2';

export interface ElectrodeInfo {
  id: ElectrodeId;
  name: string;
  hemisphere: 'left' | 'right' | 'center';
  cortexRegion: string;
  x: number;
  y: number;
  impedance: number; // in kOhm
  primaryFor: string;
}

/**
 * Perfil Biométrico Virtual (Sujeto Sintético)
 * Representa la variabilidad fisiológica inter-individual en BCI
 */
export interface VirtualSubjectProfile {
  id: string; // Ej: "Persona virtual #001"
  subjectNumber: number;
  dominantMuFreq: number;       // Hz (8.5 - 12.0 Hz)
  dominantBetaFreq: number;     // Hz (17.0 - 24.0 Hz)
  baselineMuPower: number;      // uV^2 (1100 - 2500)
  baselineBetaPower: number;    // uV^2 (100 - 320)
  noiseLevel: number;           // uV (2.0 - 5.5)
  motorResponseStrength: number; // % ERD de desincronización (-50% a -80%)
  sensoryResponseStrength: number; // Factor de modulación sensorial
  slowDriftFreq: number;        // Hz (0.05 - 0.25 Hz)
  slowDriftAmp: number;         // uV (2.0 - 8.0 uV)
  simulatedLatencyMs: number;   // ms (240 - 420 ms)
  channelVariability: {
    c3Gain: number;             // Factor de escala (ej. 0.95 - 1.05)
    czGain: number;
    c4Gain: number;
  };
}

/**
 * Muestra simultánea multicanal generada a 250 Hz
 */
export interface MultiChannelSample {
  timestamp: number;
  timeSec: number;
  c3: number; // uV en C3 (mano derecha)
  cz: number; // uV en Cz (vertex)
  c4: number; // uV en C4 (mano izquierda)
  state: ExperimentalState;
  components: {
    muWave: number;
    betaWave: number;
    noise: number;
    drift: number;
    artifact: number;
  };
}

/**
 * Métricas DSP extraídas en tiempo real
 */
export interface ExtractedEEGFeatures {
  c3MuPower: number;           // uV^2 en C3
  czMuPower: number;           // uV^2 en Cz
  c4MuPower: number;           // uV^2 en C4
  betaPower: number;           // uV^2 (Banda Beta 13-30 Hz)
  erdC3: number;               // % cambio relativo en C3 ((Mu - Baseline)/Baseline * 100)
  erdC4: number;               // % cambio relativo en C4
  dominantFreq: number;        // Hz
  snrDb: number;               // Relación señal/ruido en decibeles
  simulatedLatencyMs: number;  // Latencia simulada de respuesta (ms)
  activeChannel: 'C3' | 'Cz' | 'C4';
  timestamp: number;
}

/**
 * Protocolo Experimental Automatizado
 */
export interface ProtocolStep {
  id: string;
  stepNumber: number;
  title: string;
  state: ExperimentalState;
  durationSeconds: number;
  instruction: string;
  cortexTarget: string;
}

/**
 * Registro de un ensayo experimental completado
 */
export interface TrialRecord {
  trialNumber: number;
  timestamp: string;
  subjectId: string;
  features: ExtractedEEGFeatures;
  durationSec: number;
  notes: string;
}

/**
 * Métricas de repetibilidad y estabilidad entre ensayos
 */
export interface RepeatabilityMetrics {
  totalTrials: number;
  meanErdC3: number;
  stdDevErdC3: number;
  meanErdC4: number;
  stdDevErdC4: number;
  cvPercentage: number; // Coeficiente de Variación (CV = stdDev / mean * 100)
  stabilityLevel: 'Excelente' | 'Alta' | 'Moderada' | 'En calibración';
}

/**
 * Interfaz desacoplada de la fuente de adquisición EEG.
 * Permite cambiar conceptualmente de SimuladorEEG a DispositivoEEGReal sin alterar la UI.
 */
export interface IEEGDataSource {
  name: string;
  isSimulated: boolean;
  samplingRate: number;
  start(): void;
  stop(): void;
  subscribe(callback: (sample: MultiChannelSample) => void): () => void;
  setExperimentalState(state: ExperimentalState): void;
  updateProfile(profile: VirtualSubjectProfile): void;
  getProfile(): VirtualSubjectProfile;
  getCurrentState(): ExperimentalState;
}

export interface AutonomyAction {
  id: string;
  title: string;
  category: 'productividad' | 'movilidad' | 'asistencia' | 'comunicacion';
  icon: string;
  description: string;
  feedbackVoice: string;
  statusBadge: string;
}
