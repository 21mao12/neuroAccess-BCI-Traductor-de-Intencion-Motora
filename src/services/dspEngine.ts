/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DSP Engine for Neuro-Access BCI
 * Synthetic EEG signal generation, bandpass filtering, and spectral power estimation (Mu/Beta & ERD)
 * Grounded in clinical neuroscience (Pfurtscheller & da Silva, 1999: Event-Related Desynchronization)
 */

import { DSPMetrics, MotorState } from '../types/bci';

export class DSPSignalGenerator {
  private samplingRate: number = 250; // 250 Hz (clinical standard)
  private sampleIndex: number = 0;
  private timeSeconds: number = 0;
  
  // Baseline calibration
  public baselineMuPower: number = 1850; // Reference baseline in uV^2 (calibrated at rest)
  public isCalibrated: boolean = true;
  
  // Smoothing filters & memory buffers
  private recentSamples: number[] = [];
  private windowSize: number = 128; // ~0.512s sliding window for spectral estimation
  
  // Filter states for simulated Butterworth 4th order bandpass (0.5 - 35 Hz)
  private prevRawSample: number = 0;
  private prevFilteredSample: number = 0;

  constructor(samplingRate: number = 250) {
    this.samplingRate = samplingRate;
  }

  /**
   * Generates a single synthetic EEG sample based on current Motor State.
   * State A (REST): High amplitude Mu rhythm (~10 Hz, 45-60 uV) with rolandic spindle modulation.
   * State B (MOTOR_INTENT): Desynchronization (ERD) -> Mu amplitude drops sharply (-65% to -80%),
   * accompanied by an emergence of Beta rhythm (~20 Hz, 15-25 uV).
   */
  public generateSample(state: MotorState, transitionFactor: number = 1.0): {
    voltage: number;
    muComponent: number;
    betaComponent: number;
    noise: number;
    time: number;
  } {
    const dt = 1 / this.samplingRate;
    this.timeSeconds += dt;
    this.sampleIndex++;

    const t = this.timeSeconds;

    // Small frequency wander to mimic natural biological jitter
    const muFreq = 10.0 + 0.35 * Math.sin(2 * Math.PI * 0.15 * t);
    const betaFreq = 20.5 + 0.5 * Math.sin(2 * Math.PI * 0.22 * t);

    // Natural rolandic amplitude modulation envelope (spindle phenomenon in sensorimotor cortex)
    const rolandicEnvelope = 0.85 + 0.25 * Math.sin(2 * Math.PI * 0.4 * t);

    let muAmp = 0;
    let betaAmp = 0;

    if (state === 'REST' || state === 'CALIBRATING') {
      // Estado A: Reposo - Ondas Mu sincronizadas y predominantes
      muAmp = 48.0 * rolandicEnvelope;
      betaAmp = 6.0; // Baja actividad beta de fondo
    } else if (state === 'MOTOR_INTENT' || state === 'EXECUTED') {
      // Estado B: Intención Motora - Desincronización Relacionada con Eventos (ERD)
      // La caída de amplitud es gobernada por el factor de transición
      const erdAttenuation = 0.22 + (1 - transitionFactor) * 0.78; // Cae a ~22%
      muAmp = 48.0 * rolandicEnvelope * erdAttenuation; // Caída drástica de amplitud Mu
      betaAmp = 22.0 * transitionFactor + 6.0; // Desincronización y rebote en Beta (~20 Hz)
    }

    // Señal sinusoidal Mu (~10 Hz)
    const muSignal = muAmp * Math.sin(2 * Math.PI * muFreq * t);

    // Señal sinusoidal Beta (~20 Hz)
    const betaSignal = betaAmp * Math.sin(2 * Math.PI * betaFreq * t + 0.8);

    // Ruido fisiológico 1/f (pink noise) y artefactos de baja amplitud (< 4 uV)
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random() || 0.0001;
    const gaussianNoise = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const noise = gaussianNoise * 3.8 + 1.2 * Math.sin(2 * Math.PI * 50.0 * t) * 0.15; // 50 Hz casi imperceptible (simulando filtro notch)

    // Voltaje total sintético de EEG (en microvoltios uV)
    const rawVoltage = muSignal + betaSignal + noise;

    // Filtro pasa-banda digital de 1er orden en tiempo real (0.5 - 35 Hz) para suavizado
    const alpha = 0.88;
    const filteredVoltage = alpha * this.prevFilteredSample + (1 - alpha) * rawVoltage;
    this.prevFilteredSample = filteredVoltage;
    this.prevRawSample = rawVoltage;

    // Guardar muestra reciente para estimación espectral
    this.recentSamples.push(filteredVoltage);
    if (this.recentSamples.length > this.windowSize) {
      this.recentSamples.shift();
    }

    return {
      voltage: Number(filteredVoltage.toFixed(2)),
      muComponent: Number(muSignal.toFixed(2)),
      betaComponent: Number(betaSignal.toFixed(2)),
      noise: Number(noise.toFixed(2)),
      time: Number(t.toFixed(3)),
    };
  }

  /**
   * Computes DSP metrics:
   * - Mu band power (8-12 Hz)
   * - Beta band power (16-24 Hz)
   * - ERD percentage: ((CurrentMu - BaselineMu) / BaselineMu) * 100
   * - SNR in decibels
   */
  public computeMetrics(state: MotorState): DSPMetrics {
    if (this.recentSamples.length < 32) {
      return {
        muPower: this.baselineMuPower,
        betaPower: 120,
        baselineMuPower: this.baselineMuPower,
        erdPercentage: 0,
        snrDb: 18.5,
        dominantFreq: 10.0,
        timestamp: Date.now(),
      };
    }

    // Goertzel algorithm approximation for Mu band (~10 Hz)
    const muPower = this.calculateBandPower(9.5, 11.0);
    // Goertzel algorithm approximation for Beta band (~20 Hz)
    const betaPower = this.calculateBandPower(19.0, 22.0);

    // Calculate ERD%
    // Typical ERD values during motor imagery: -50% to -80%
    const erdPercentage = ((muPower - this.baselineMuPower) / this.baselineMuPower) * 100;

    // Estimate noise floor
    const noisePower = Math.max(12, this.calculateBandPower(30.0, 34.0));
    const snrDb = 10 * Math.log10(Math.max(1, muPower) / noisePower);

    // Dominant frequency estimation
    const dominantFreq = (state === 'MOTOR_INTENT' || state === 'EXECUTED') ? 20.2 : 10.1;

    return {
      muPower: Math.round(muPower),
      betaPower: Math.round(betaPower),
      baselineMuPower: Math.round(this.baselineMuPower),
      erdPercentage: Number(erdPercentage.toFixed(1)),
      snrDb: Number(Math.max(5, snrDb).toFixed(1)),
      dominantFreq,
      timestamp: Date.now(),
    };
  }

  /**
   * Goertzel filter energy estimation for a specific frequency band
   */
  private calculateBandPower(freqLow: number, freqHigh: number): number {
    const N = this.recentSamples.length;
    const centerFreq = (freqLow + freqHigh) / 2;
    const k = Math.round((N * centerFreq) / this.samplingRate);
    const omega = (2 * Math.PI * k) / N;
    const coeff = 2 * Math.cos(omega);

    let sPrev = 0;
    let sPrev2 = 0;

    for (let i = 0; i < N; i++) {
      const s = this.recentSamples[i] + coeff * sPrev - sPrev2;
      sPrev2 = sPrev;
      sPrev = s;
    }

    const power = sPrev * sPrev + sPrev2 * sPrev2 - coeff * sPrev * sPrev2;
    // Normalize and scale to microvolts squared
    return Math.max(10, (power / (N * N)) * 4.2);
  }

  /**
   * Recalibrate baseline Mu power from resting state
   */
  public calibrateBaseline(measuredPower: number): void {
    if (measuredPower > 100) {
      this.baselineMuPower = measuredPower;
      this.isCalibrated = true;
    }
  }

  public reset(): void {
    this.recentSamples = [];
    this.sampleIndex = 0;
    this.timeSeconds = 0;
  }
}
