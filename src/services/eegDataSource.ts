/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Capa de Adquisición y Simulador de Persona Virtual EEG (250 Hz)
 * Arquitectura desacoplada: IEEGDataSource -> SimuladorEEG | DispositivoEEGReal [Futuro]
 * 
 * IMPORTANTE:
 * Estos datos son completamente simulados y NO deben presentarse como datos médicos reales
 * ni utilizarse para diagnosticar ELA u otra condición clínica.
 */

import {
  IEEGDataSource,
  VirtualSubjectProfile,
  ExperimentalState,
  MultiChannelSample,
  ExtractedEEGFeatures,
  TrialRecord,
  RepeatabilityMetrics,
} from '../types/bci';

/**
 * Generador de perfiles de Personas Virtuales con variabilidad biométrica razonable
 */
export function generateVirtualProfile(subjectNumber: number): VirtualSubjectProfile {
  // Generación determinista con variación controlada
  const padNum = String(subjectNumber).padStart(3, '0');
  
  // Rango Mu: 8.8 - 11.8 Hz
  const dominantMuFreq = Number((9.2 + Math.random() * 2.2).toFixed(1));
  // Rango Beta: 17.5 - 23.5 Hz
  const dominantBetaFreq = Number((18.0 + Math.random() * 4.5).toFixed(1));
  
  // Potencia Mu basal (uV^2): 1200 - 2400
  const baselineMuPower = Math.round(1400 + Math.random() * 950);
  // Potencia Beta basal (uV^2): 110 - 280
  const baselineBetaPower = Math.round(130 + Math.random() * 140);
  
  // Nivel de ruido basal (uV): 2.2 - 4.8
  const noiseLevel = Number((2.4 + Math.random() * 2.0).toFixed(1));
  
  // Respuesta motora simulada (ERD): atenuación de -55% a -78%
  const motorResponseStrength = Number((-55 - Math.random() * 22).toFixed(1));
  
  // Respuesta sensorial: factor de modulación
  const sensoryResponseStrength = Number((1.2 + Math.random() * 0.5).toFixed(2));
  
  // Deriva lenta: frecuencia (0.1 - 0.22 Hz) y amplitud (3 - 7 uV)
  const slowDriftFreq = Number((0.08 + Math.random() * 0.12).toFixed(2));
  const slowDriftAmp = Number((3.5 + Math.random() * 3.5).toFixed(1));
  
  // Latencia de respuesta simulada (ms): 260 - 390 ms
  const simulatedLatencyMs = Math.round(270 + Math.random() * 110);
  
  // Asimetría inter-canal ligera (< 6%)
  const channelVariability = {
    c3Gain: Number((0.97 + Math.random() * 0.06).toFixed(3)),
    czGain: Number((0.98 + Math.random() * 0.05).toFixed(3)),
    c4Gain: Number((0.96 + Math.random() * 0.07).toFixed(3)),
  };

  return {
    id: `Persona virtual #${padNum}`,
    subjectNumber,
    dominantMuFreq,
    dominantBetaFreq,
    baselineMuPower,
    baselineBetaPower,
    noiseLevel,
    motorResponseStrength,
    sensoryResponseStrength,
    slowDriftFreq,
    slowDriftAmp,
    simulatedLatencyMs,
    channelVariability,
  };
}

/**
 * SIMULADOR DE EEG: Implementación concreta de IEEGDataSource
 * Modela: EEG(t) = ritmo cerebral + variación aleatoria + ruido + efecto del estado experimental + deriva lenta
 */
export class SimuladorEEG implements IEEGDataSource {
  public name: string = 'Simulador de Persona Virtual (Sintético)';
  public isSimulated: boolean = true;
  public samplingRate: number = 250; // 250 Hz

  private profile: VirtualSubjectProfile;
  private currentState: ExperimentalState = 'REST';
  private subscribers: Set<(sample: MultiChannelSample) => void> = new Set();
  
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private timeSeconds: number = 0;
  
  // Factores dinámicos de transición suave entre estados (filtro de transición biológica)
  private c3Transition: number = 0; // 0 = reposo, 1 = ERD total
  private c4Transition: number = 0;
  private sensoryTransition: number = 0;
  private artifactTransition: number = 0;

  // Buffer deslizante para extracción espectral en tiempo real
  private recentC3Samples: number[] = [];
  private recentCzSamples: number[] = [];
  private recentC4Samples: number[] = [];
  private readonly windowSize: number = 128; // ~0.512 segundos a 250 Hz

  // Estados de filtro pasa-bajas para suavizado biológico sereno
  private prevFilteredC3: number = 0;
  private prevFilteredCz: number = 0;
  private prevFilteredC4: number = 0;

  constructor(initialProfile?: VirtualSubjectProfile) {
    this.profile = initialProfile || generateVirtualProfile(1);
  }

  public getProfile(): VirtualSubjectProfile {
    return this.profile;
  }

  public updateProfile(newProfile: VirtualSubjectProfile): void {
    this.profile = { ...newProfile };
  }

  public getCurrentState(): ExperimentalState {
    return this.currentState;
  }

  public setExperimentalState(state: ExperimentalState): void {
    this.currentState = state;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Emisión en ráfagas a ~30-40 ms para emular el flujo de paquetes de hardware EEG
    let lastTime = performance.now();
    
    this.intervalId = window.setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - lastTime) / 1000;
      lastTime = now;

      // Calcular número de muestras correspondientes a 250 Hz
      const samplesToGenerate = Math.max(1, Math.round(this.samplingRate * elapsedSeconds));

      for (let i = 0; i < samplesToGenerate; i++) {
        const sample = this.stepSample();
        this.subscribers.forEach((cb) => cb(sample));
      }
    }, 32);
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public subscribe(callback: (sample: MultiChannelSample) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Genera una muestra unitaria siguiendo el modelo matemático:
   * EEG(t) = ritmo cerebral + variación aleatoria + ruido + efecto del estado experimental + deriva lenta
   */
  private stepSample(): MultiChannelSample {
    const dt = 1 / this.samplingRate;
    this.timeSeconds += dt;
    const t = this.timeSeconds;

    // 1. Suavizado fisiológico de las transiciones de estado (inercia biológica)
    const targetC3 = this.currentState === 'MOTOR_IMAGERY_RIGHT' ? 1 : 0;
    const targetC4 = this.currentState === 'MOTOR_IMAGERY_LEFT' ? 1 : 0;
    const targetSensory = this.currentState === 'SENSORY_STIMULUS' ? 1 : 0;
    const targetArtifact = this.currentState === 'ARTIFACT_NOISE' ? 1 : 0;

    const smoothSpeed = 0.05;
    this.c3Transition += (targetC3 - this.c3Transition) * smoothSpeed;
    this.c4Transition += (targetC4 - this.c4Transition) * smoothSpeed;
    this.sensoryTransition += (targetSensory - this.sensoryTransition) * smoothSpeed;
    this.artifactTransition += (targetArtifact - this.artifactTransition) * 0.12;

    // 2. Componentes espectrales basales de la persona virtual
    const muFreq = this.profile.dominantMuFreq + 0.25 * Math.sin(2 * Math.PI * 0.18 * t);
    const betaFreq = this.profile.dominantBetaFreq + 0.4 * Math.sin(2 * Math.PI * 0.28 * t);

    // Envolvente de husos rolándicos (oscilación intrínseca de sincronización neuronal)
    const spindleEnvelope = 0.85 + 0.25 * Math.sin(2 * Math.PI * 0.45 * t);

    // Amplitud base (aproximación en microvoltios a partir de la potencia)
    const baseMuAmp = Math.sqrt(this.profile.baselineMuPower) * 1.1 * spindleEnvelope;
    const baseBetaAmp = Math.sqrt(this.profile.baselineBetaPower) * 0.8;

    // 3. Efecto del estado experimental sobre canales contralaterales (ERD/ERS)
    // C3: Atenuación durante intención motora de mano derecha (desincronización)
    const c3ErdFactor = 1 - (Math.abs(this.profile.motorResponseStrength) / 100) * this.c3Transition;
    const c3MuAmp = baseMuAmp * Math.max(0.18, c3ErdFactor);
    const c3BetaAmp = baseBetaAmp + 16 * this.c3Transition; // Rebote Beta contralateral

    // C4: Atenuación durante intención motora de mano izquierda
    const c4ErdFactor = 1 - (Math.abs(this.profile.motorResponseStrength) / 100) * this.c4Transition;
    const c4MuAmp = baseMuAmp * Math.max(0.18, c4ErdFactor);
    const c4BetaAmp = baseBetaAmp + 16 * this.c4Transition;

    // Cz: Canal medial en el vertex
    const czMuAmp = baseMuAmp * (1 - 0.15 * (this.c3Transition + this.c4Transition));
    const czBetaAmp = baseBetaAmp;

    // 4. Modulación por estímulo sensorial
    // Genera un potencial evocado transitorio somatosensorial en Cz y modulación rítmica
    const sensoryModulation = this.sensoryTransition * Math.sin(2 * Math.PI * 7.5 * t) * 18.0;

    // 5. Ruido gaussiano pequeño (Box-Muller)
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const gaussianZ0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const gaussianZ1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

    const noiseC3 = gaussianZ0 * this.profile.noiseLevel;
    const noiseCz = ((gaussianZ0 + gaussianZ1) / 2) * this.profile.noiseLevel;
    const noiseC4 = gaussianZ1 * this.profile.noiseLevel;

    // 6. Deriva lenta de la señal (Slow baseline drift: ~0.1 - 0.25 Hz)
    const driftSignal = this.profile.slowDriftAmp * Math.sin(2 * Math.PI * this.profile.slowDriftFreq * t);

    // 7. Artefacto de ruido (ej. parpadeo de baja frecuencia + tensión muscular de alta frecuencia)
    const blinkArtifact = this.artifactTransition * 45.0 * Math.sin(2 * Math.PI * 1.8 * t);
    const muscleArtifact = this.artifactTransition * (Math.random() - 0.5) * 35.0;
    const totalArtifact = blinkArtifact + muscleArtifact;

    // 8. Síntesis y acoplamiento multicanal con pequeñas diferencias biométricas
    const c3Raw = (c3MuAmp * Math.sin(2 * Math.PI * muFreq * t) +
                   c3BetaAmp * Math.sin(2 * Math.PI * betaFreq * t + 0.3) +
                   noiseC3 + driftSignal + totalArtifact) * this.profile.channelVariability.c3Gain;

    const czRaw = (czMuAmp * Math.sin(2 * Math.PI * muFreq * t + 0.4) +
                   czBetaAmp * Math.sin(2 * Math.PI * betaFreq * t + 0.6) +
                   sensoryModulation + noiseCz + driftSignal * 0.9 + totalArtifact * 0.7) * this.profile.channelVariability.czGain;

    const c4Raw = (c4MuAmp * Math.sin(2 * Math.PI * muFreq * t + 0.8) +
                   c4BetaAmp * Math.sin(2 * Math.PI * betaFreq * t + 0.9) +
                   noiseC4 + driftSignal * 1.05 + totalArtifact) * this.profile.channelVariability.c4Gain;

    // Filtro pasa-bajas analógico suave (~30 Hz) para eliminar vibraciones o picos bruscos
    this.prevFilteredC3 = 0.82 * this.prevFilteredC3 + 0.18 * c3Raw;
    this.prevFilteredCz = 0.82 * this.prevFilteredCz + 0.18 * czRaw;
    this.prevFilteredC4 = 0.82 * this.prevFilteredC4 + 0.18 * c4Raw;

    const c3Final = this.prevFilteredC3;
    const czFinal = this.prevFilteredCz;
    const c4Final = this.prevFilteredC4;

    // Guardar en buffers para análisis
    this.recentC3Samples.push(c3Final);
    this.recentCzSamples.push(czFinal);
    this.recentC4Samples.push(c4Final);

    if (this.recentC3Samples.length > this.windowSize) {
      this.recentC3Samples.shift();
      this.recentCzSamples.shift();
      this.recentC4Samples.shift();
    }

    return {
      timestamp: Date.now(),
      timeSec: Number(t.toFixed(3)),
      c3: Number(c3Raw.toFixed(2)),
      cz: Number(czRaw.toFixed(2)),
      c4: Number(c4Raw.toFixed(2)),
      state: this.currentState,
      components: {
        muWave: Number((c3MuAmp * Math.sin(2 * Math.PI * muFreq * t)).toFixed(2)),
        betaWave: Number((c3BetaAmp * Math.sin(2 * Math.PI * betaFreq * t)).toFixed(2)),
        noise: Number(noiseC3.toFixed(2)),
        drift: Number(driftSignal.toFixed(2)),
        artifact: Number(totalArtifact.toFixed(2)),
      },
    };
  }

  /**
   * Extrae características biomédicas completas de las ventanas actuales (C3, Cz, C4, Mu, Beta, ERD)
   */
  public extractFeatures(): ExtractedEEGFeatures {
    const c3Power = this.calculateRMSPower(this.recentC3Samples);
    const czPower = this.calculateRMSPower(this.recentCzSamples);
    const c4Power = this.calculateRMSPower(this.recentC4Samples);

    const base = Math.max(100, this.profile.baselineMuPower);
    const erdC3 = Number((((c3Power - base) / base) * 100).toFixed(1));
    const erdC4 = Number((((c4Power - base) / base) * 100).toFixed(1));

    // Estimar SNR en dB
    const noiseEst = Math.max(1, this.profile.noiseLevel * this.profile.noiseLevel * 4);
    const snrDb = Number((10 * Math.log10(Math.max(1, c3Power) / noiseEst)).toFixed(1));

    let activeChannel: 'C3' | 'Cz' | 'C4' = 'C3';
    if (this.currentState === 'MOTOR_IMAGERY_LEFT') {
      activeChannel = 'C4';
    } else if (this.currentState === 'SENSORY_STIMULUS') {
      activeChannel = 'Cz';
    }

    return {
      c3MuPower: Math.round(c3Power),
      czMuPower: Math.round(czPower),
      c4MuPower: Math.round(c4Power),
      betaPower: Math.round(this.profile.baselineBetaPower + (this.c3Transition + this.c4Transition) * 110),
      erdC3,
      erdC4,
      dominantFreq: this.profile.dominantMuFreq,
      snrDb: Math.max(4, snrDb),
      simulatedLatencyMs: this.profile.simulatedLatencyMs,
      activeChannel,
      timestamp: Date.now(),
    };
  }

  private calculateRMSPower(samples: number[]): number {
    if (samples.length === 0) return this.profile.baselineMuPower;
    let sumSq = 0;
    for (let i = 0; i < samples.length; i++) {
      sumSq += samples[i] * samples[i];
    }
    const variance = sumSq / samples.length;
    // Escalamiento aproximado a banda espectral de interés
    return Math.max(10, variance * 1.85);
  }
}

/**
 * ADAPTADOR DE HARDWARE REAL (DispositivoEEGReal)
 * Stub de arquitectura que implementa la misma interfaz IEEGDataSource.
 * Permite en el futuro conectar OpenBCI, BrainFlow o Web Bluetooth sin modificar la UI.
 */
export class DispositivoEEGReal implements IEEGDataSource {
  public name: string = 'Dispositivo EEG Real (OpenBCI / Web-Bluetooth)';
  public isSimulated: boolean = false;
  public samplingRate: number = 250;
  private profile: VirtualSubjectProfile;
  private state: ExperimentalState = 'REST';

  constructor() {
    this.profile = generateVirtualProfile(999);
  }

  public start(): void {
    console.info('[DispositivoEEGReal] Listo para recibir stream de hardware físico.');
  }

  public stop(): void {}

  public subscribe(_callback: (sample: MultiChannelSample) => void): () => void {
    return () => {};
  }

  public setExperimentalState(state: ExperimentalState): void {
    this.state = state;
  }

  public updateProfile(profile: VirtualSubjectProfile): void {
    this.profile = profile;
  }

  public getProfile(): VirtualSubjectProfile {
    return this.profile;
  }

  public getCurrentState(): ExperimentalState {
    return this.state;
  }
}

/**
 * Calculador de Repetibilidad y Estabilidad entre Ensayos
 */
export function calculateRepeatability(records: TrialRecord[]): RepeatabilityMetrics {
  if (records.length === 0) {
    return {
      totalTrials: 0,
      meanErdC3: 0,
      stdDevErdC3: 0,
      meanErdC4: 0,
      stdDevErdC4: 0,
      cvPercentage: 0,
      stabilityLevel: 'En calibración',
    };
  }

  const c3Values = records.map((r) => r.features.erdC3);
  const c4Values = records.map((r) => r.features.erdC4);

  const meanC3 = c3Values.reduce((a, b) => a + b, 0) / c3Values.length;
  const meanC4 = c4Values.reduce((a, b) => a + b, 0) / c4Values.length;

  const varianceC3 = c3Values.reduce((sum, val) => sum + Math.pow(val - meanC3, 2), 0) / c3Values.length;
  const stdDevC3 = Math.sqrt(varianceC3);

  const varianceC4 = c4Values.reduce((sum, val) => sum + Math.pow(val - meanC4, 2), 0) / c4Values.length;
  const stdDevC4 = Math.sqrt(varianceC4);

  // Coeficiente de variación (CV) porcentual sobre la magnitud del cambio
  const cv = Math.abs(meanC3) > 0 ? (stdDevC3 / Math.abs(meanC3)) * 100 : 0;

  let stabilityLevel: 'Excelente' | 'Alta' | 'Moderada' | 'En calibración' = 'Alta';
  if (records.length === 1) {
    stabilityLevel = 'En calibración';
  } else if (cv < 12) {
    stabilityLevel = 'Excelente';
  } else if (cv < 25) {
    stabilityLevel = 'Alta';
  } else {
    stabilityLevel = 'Moderada';
  }

  return {
    totalTrials: records.length,
    meanErdC3: Number(meanC3.toFixed(1)),
    stdDevErdC3: Number(stdDevC3.toFixed(1)),
    meanErdC4: Number(meanC4.toFixed(1)),
    stdDevErdC4: Number(stdDevC4.toFixed(1)),
    cvPercentage: Number(cv.toFixed(1)),
    stabilityLevel,
  };
}
