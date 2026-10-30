/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Neuro-Access BCI: Traductor de Intención Motora & Simulador de Persona Virtual
 * Hacktoberfest Hack Day La Paz 2026 - Prototipo Educativo y Experimental
 * 
 * Arquitectura:
 * - Capa de Adquisición Desacoplada: IEEGDataSource (SimuladorEEG | DispositivoEEGReal)
 * - Muestreo: 250 Hz continuo en canales C3, Cz y C4
 * - Modelo sintético: EEG(t) = ritmo cerebral + variación aleatoria + ruido + efecto estado + deriva lenta
 * - Protocolo Automatizado: Reposo (5s) -> Mano Der (5s) -> Reposo (5s) -> Mano Izq (5s) -> Sensorial (5s)
 * - Extracción de Características: Mu C3/Cz/C4, Beta, ERD/ERS, latencia, SNR, repetibilidad
 * 
 * IMPORTANTE:
 * Estos datos son completamente sintéticos y simulados. NO deben presentarse como datos médicos reales
 * ni utilizarse para diagnosticar ELA u otra patología neuromuscular.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBanner } from './components/TopBanner';
import { BrainMap } from './components/BrainMap';
import { OscilloscopeChart } from './components/OscilloscopeChart';
import { ExtractedFeaturesPanel } from './components/ExtractedFeaturesPanel';
import { GemmaConsole } from './components/GemmaConsole';
import { InfoModal } from './components/InfoModal';
import { VirtualSubjectModal } from './components/VirtualSubjectModal';
import {
  SimuladorEEG,
  generateVirtualProfile,
  calculateRepeatability,
} from './services/eegDataSource';
import {
  interpretMotorIntentWithGemma,
  speakEmpatheticFeedback,
} from './services/geminiService';
import {
  ExperimentalState,
  ElectrodeId,
  ExtractedEEGFeatures,
  VirtualSubjectProfile,
  TrialRecord,
  RepeatabilityMetrics,
  ProtocolStep,
  AutonomyAction,
  InterpretationLog,
  DSPMetrics,
} from './types/bci';
import confetti from 'canvas-confetti';
import { Chart } from 'chart.js';
import { User, Sliders, Play, RotateCcw, ShieldAlert, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

// Protocolo Experimental Automatizado
const EXPERIMENT_PROTOCOL: ProtocolStep[] = [
  {
    id: 'step_rest_1',
    stepNumber: 1,
    title: 'REPOSO',
    state: 'REST',
    durationSeconds: 5,
    instruction: 'Relájate en reposo mental. Registrando línea base de ritmo Mu (~10 Hz).',
    cortexTarget: 'Ambos hemisferios sincronizados',
  },
  {
    id: 'step_right_hand',
    stepNumber: 2,
    title: 'IMAGINA MOVER MANO DERECHA',
    state: 'MOTOR_IMAGERY_RIGHT',
    durationSeconds: 5,
    instruction: 'Imagina cinestésicamente apretar o mover tu mano derecha (ERD en C3).',
    cortexTarget: 'Corteza motora izquierda (Electrodo C3)',
  },
  {
    id: 'step_rest_2',
    stepNumber: 3,
    title: 'REPOSO',
    state: 'REST',
    durationSeconds: 5,
    instruction: 'Retorna al reposo basal. Recuperación del ritmo Mu.',
    cortexTarget: 'Recuperación post-ERD (ERS / Rebound)',
  },
  {
    id: 'step_left_hand',
    stepNumber: 4,
    title: 'IMAGINA MOVER MANO IZQUIERDA',
    state: 'MOTOR_IMAGERY_LEFT',
    durationSeconds: 5,
    instruction: 'Imagina cinestésicamente apretar o mover tu mano izquierda (ERD en C4).',
    cortexTarget: 'Corteza motora derecha (Electrodo C4)',
  },
  {
    id: 'step_sensory',
    stepNumber: 5,
    title: 'ESTÍMULO SENSORIAL',
    state: 'SENSORY_STIMULUS',
    durationSeconds: 5,
    instruction: 'Respuesta somatosensorial en vertex (Cz). Potencial evocado simulado.',
    cortexTarget: 'Vertex somatosensorial (Electrodo Cz)',
  },
];

const AUTONOMY_ACTIONS: AutonomyAction[] = [
  {
    id: 'slide_next',
    title: 'Avanzar presentación',
    category: 'productividad',
    icon: 'MonitorPlay',
    description: 'Pasa a la siguiente lámina en una exposición o lector de libros.',
    feedbackVoice: 'Avanzando diapositiva de la presentación.',
    statusBadge: 'Diapositiva Siguiente',
  },
  {
    id: 'wheelchair_right',
    title: 'Silla de ruedas: girar derecha',
    category: 'movilidad',
    icon: 'Compass',
    description: 'Envía señal de orientación motora hacia el actuador derecho.',
    feedbackVoice: 'Girando silla de ruedas a la derecha.',
    statusBadge: 'Giro Motor Activo',
  },
  {
    id: 'nurse_call',
    title: 'Llamar a enfermería / asistente',
    category: 'asistencia',
    icon: 'BellRing',
    description: 'Activa timbre de asistencia en la consola del cuidador.',
    feedbackVoice: 'Alerta enviada a enfermería.',
    statusBadge: 'Llamada Enviada',
  },
  {
    id: 'lamp_toggle',
    title: 'Encender lámpara de lectura',
    category: 'comunicacion',
    icon: 'Lightbulb',
    description: 'Control domótico para iluminación asistida.',
    feedbackVoice: 'Lámpara de lectura encendida.',
    statusBadge: 'Luz Activada',
  },
];

export default function App() {
  // Virtual Subject Profile State
  const [subjectCounter, setSubjectCounter] = useState<number>(1);
  const [profile, setProfile] = useState<VirtualSubjectProfile>(() => generateVirtualProfile(1));
  const [isParamModalOpen, setIsParamModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

  // Decoupled EEG Data Source instance
  const eegSourceRef = useRef<SimuladorEEG>(new SimuladorEEG(profile));

  // Current Experimental State
  const [experimentalState, setExperimentalState] = useState<ExperimentalState>('REST');
  const [selectedElectrode, setSelectedElectrode] = useState<ElectrodeId>('C3');
  const [activeAction, setActiveAction] = useState<AutonomyAction>(AUTONOMY_ACTIONS[0]);
  const [slideIndex, setSlideIndex] = useState<number>(1);

  // Automated Protocol State
  const [isExperimentRunning, setIsExperimentRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepCountdown, setStepCountdown] = useState<number>(5);

  // Extracted Features & Repeatability Records
  const [features, setFeatures] = useState<ExtractedEEGFeatures>({
    c3MuPower: profile.baselineMuPower,
    czMuPower: profile.baselineMuPower,
    c4MuPower: profile.baselineMuPower,
    betaPower: profile.baselineBetaPower,
    erdC3: 0,
    erdC4: 0,
    dominantFreq: profile.dominantMuFreq,
    snrDb: 18.5,
    simulatedLatencyMs: profile.simulatedLatencyMs,
    activeChannel: 'C3',
    timestamp: Date.now(),
  });

  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [repeatability, setRepeatability] = useState<RepeatabilityMetrics>(() => calculateRepeatability([]));

  // Gemma AI State
  const [currentResponse, setCurrentResponse] = useState<string | null>(
    'Simulador listo con la Persona virtual #001. Puedes iniciar el experimento automatizado de 5 etapas o cambiar estados manualmente para probar la decodificación de ondas sintéticas.'
  );
  const [clinicalNote, setClinicalNote] = useState<string | null>(
    'Datos sintéticos a 250 Hz generados por modelo estocástico: Ritmo Mu + Variación + Ruido + Estado + Deriva. No diagnósticos.'
  );
  const [logs, setLogs] = useState<InterpretationLog[]>([]);

  // Buffers for 3 channels (C3, Cz, C4)
  // Buffers for 3 channels (C3, Cz, C4) with 160 samples (~2.0 seconds window)
  const c3BufferRef = useRef<number[]>([]);
  const czBufferRef = useRef<number[]>([]);
  const c4BufferRef = useRef<number[]>([]);
  const lastChartUpdateRef = useRef<number>(0);
  const sampleCounterRef = useRef<number>(0);

  // Initialize rolling buffers for 160 samples
  useEffect(() => {
    const bufferSize = 160;
    c3BufferRef.current = Array.from({ length: bufferSize }, () => 30);
    czBufferRef.current = Array.from({ length: bufferSize }, () => 0);
    c4BufferRef.current = Array.from({ length: bufferSize }, () => -30);
  }, []);

  // Update data source profile when profile changes
  useEffect(() => {
    eegSourceRef.current.updateProfile(profile);
  }, [profile]);

  // Start continuous streaming from the decoupled EEG source
  useEffect(() => {
    const source = eegSourceRef.current;
    source.start();

    // Subscribe to multi-channel data stream (250 Hz)
    const unsubscribe = source.subscribe((sample) => {
      // Decimate by factor of 3 for display (250 Hz / 3 ≈ 83.3 Hz screen rate)
      // 160 points / 83.33 Hz = 1.92 seconds of smooth, rhythmic wave flow!
      sampleCounterRef.current++;
      if (sampleCounterRef.current % 3 !== 0) {
        return;
      }

      const montageMode = (window as any).__BCI_MONTAGE_MODE__ || 'separated';
      const gain = (window as any).__BCI_GAIN_SCALE__ !== undefined ? (window as any).__BCI_GAIN_SCALE__ : 0.75;

      let c3Val = sample.c3 * gain;
      let czVal = sample.cz * gain;
      let c4Val = sample.c4 * gain;

      // Clinical separated montage: offsets channels into their own clean baseline tracks
      if (montageMode === 'separated') {
        c3Val += 30; // C3 in upper third (+30 uV baseline)
        czVal += 0;  // Cz in center (0 uV baseline)
        c4Val -= 30; // C4 in lower third (-30 uV baseline)
      }

      c3BufferRef.current.push(Number(c3Val.toFixed(2)));
      if (c3BufferRef.current.length > 160) c3BufferRef.current.shift();

      czBufferRef.current.push(Number(czVal.toFixed(2)));
      if (czBufferRef.current.length > 160) czBufferRef.current.shift();

      c4BufferRef.current.push(Number(c4Val.toFixed(2)));
      if (c4BufferRef.current.length > 160) c4BufferRef.current.shift();

      // Refresh Chart.js at ~30 FPS
      const now = performance.now();
      if (now - lastChartUpdateRef.current > 33) {
        lastChartUpdateRef.current = now;

        const canvas = document.getElementById('bci-oscilloscope-canvas') as HTMLCanvasElement | null;
        if (canvas) {
          const chart = Chart.getChart(canvas);
          if (chart && chart.data.datasets.length >= 3) {
            chart.data.datasets[0].data = [...c3BufferRef.current];
            chart.data.datasets[1].data = [...czBufferRef.current];
            chart.data.datasets[2].data = [...c4BufferRef.current];
            chart.update('none');
          }
        }

        // Periodically extract DSP features
        const updatedFeatures = source.extractFeatures();
        setFeatures(updatedFeatures);
      }
    });

    return () => {
      unsubscribe();
      source.stop();
    };
  }, []);

  // Handle manual state changes
  const handleManualStateChange = useCallback((newState: ExperimentalState) => {
    setExperimentalState(newState);
    eegSourceRef.current.setExperimentalState(newState);

    if (newState === 'MOTOR_IMAGERY_RIGHT') {
      setCurrentResponse(
        `Detectando desincronización motora (ERD) en C3 para la ${profile.id}. Se atenúa la onda Mu y emerge ritmo Beta.`
      );
    } else if (newState === 'MOTOR_IMAGERY_LEFT') {
      setCurrentResponse(
        `Detectando desincronización motora (ERD) en C4 para la ${profile.id} (mano izquierda contralateral).`
      );
    } else if (newState === 'SENSORY_STIMULUS') {
      setCurrentResponse(
        `Estímulo sensorial registrado en vertex Cz. Modulación de potencial somatosensorial en curso.`
      );
    } else if (newState === 'ARTIFACT_NOISE') {
      setCurrentResponse(
        `Artefacto detectado: ráfagas electromiográficas y deflexión por parpadeo simuladas.`
      );
    } else {
      setCurrentResponse(
        `Señal en reposo basal. Ritmo Mu de ~${profile.dominantMuFreq} Hz sincronizado en la corteza rolándica.`
      );
    }
  }, [profile]);

  // Handle "INICIAR EXPERIMENTO" - Automated 5-stage protocol
  const handleStartExperiment = useCallback(async () => {
    if (isExperimentRunning) return;
    setIsExperimentRunning(true);
    setCurrentStepIndex(0);

    for (let stepIdx = 0; stepIdx < EXPERIMENT_PROTOCOL.length; stepIdx++) {
      const step = EXPERIMENT_PROTOCOL[stepIdx];
      setCurrentStepIndex(stepIdx);
      setExperimentalState(step.state);
      eegSourceRef.current.setExperimentalState(step.state);

      setCurrentResponse(`[Etapa ${step.stepNumber}/5] ${step.title}: ${step.instruction}`);

      // 5-second countdown loop
      for (let sec = step.durationSeconds; sec > 0; sec--) {
        setStepCountdown(sec);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Protocol Completed -> Finalize & Extract Features
    setExperimentalState('REST');
    eegSourceRef.current.setExperimentalState('REST');
    setIsExperimentRunning(false);

    // Compute final trial features
    const finalFeatures = eegSourceRef.current.extractFeatures();
    setFeatures(finalFeatures);

    const trialNumber = trials.length + 1;
    const newTrial: TrialRecord = {
      trialNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      subjectId: profile.id,
      features: finalFeatures,
      durationSec: 25,
      notes: `Protocolo completado con ${profile.id}. ERD C3: ${finalFeatures.erdC3}%, ERD C4: ${finalFeatures.erdC4}%.`,
    };

    const updatedTrials = [newTrial, ...trials];
    setTrials(updatedTrials);
    setRepeatability(calculateRepeatability(updatedTrials));

    // Gemma AI interpretation of the completed trial
    const dspBridge: DSPMetrics = {
      muPower: finalFeatures.c3MuPower,
      betaPower: finalFeatures.betaPower,
      baselineMuPower: profile.baselineMuPower,
      erdPercentage: finalFeatures.erdC3,
      snrDb: finalFeatures.snrDb,
      dominantFreq: finalFeatures.dominantFreq,
      timestamp: Date.now(),
    };

    try {
      const gemmaResult = await interpretMotorIntentWithGemma(dspBridge, 'C3', activeAction);
      setCurrentResponse(gemmaResult.message);
      setClinicalNote(
        `Prueba finalizada (Ensayo #${trialNumber}). Características extraídas: Potencia Mu C3: ${finalFeatures.c3MuPower} µV², Cz: ${finalFeatures.czMuPower} µV², C4: ${finalFeatures.c4MuPower} µV², Beta: ${finalFeatures.betaPower} µV², ERD C3: ${finalFeatures.erdC3}%, ERD C4: ${finalFeatures.erdC4}%, Latencia: ${finalFeatures.simulatedLatencyMs} ms.`
      );

      // Execute simulated action
      if (activeAction.id === 'slide_next') {
        setSlideIndex((prev) => (prev >= 8 ? 1 : prev + 1));
      }

      // Celebratory confetti
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#E07A5F', '#81B29A', '#D5A6BD', '#F5EBE0'],
      });

      speakEmpatheticFeedback(gemmaResult.message);

      const logEntry: InterpretationLog = {
        id: `LOG-${Date.now()}`,
        timestamp: gemmaResult.timestamp,
        actionId: activeAction.id,
        actionTitle: activeAction.title,
        erdValue: finalFeatures.erdC3,
        confidence: gemmaResult.confidenceScore,
        muPower: finalFeatures.c3MuPower,
        betaPower: finalFeatures.betaPower,
        gemmaSpeech: gemmaResult.message,
        clinicalNote: gemmaResult.clinicalExplanation,
        channel: 'C3',
      };
      setLogs((prev) => [logEntry, ...prev]);
    } catch (err) {
      console.error(err);
    }
  }, [isExperimentRunning, profile, trials, activeAction]);

  // Handle "Nueva persona" button
  const handleGenerateNewPerson = useCallback(() => {
    const nextNum = subjectCounter + 1;
    setSubjectCounter(nextNum);
    const newProfile = generateVirtualProfile(nextNum);
    setProfile(newProfile);
    eegSourceRef.current.updateProfile(newProfile);
    eegSourceRef.current.setExperimentalState('REST');
    setExperimentalState('REST');
    setTrials([]); // Clear trials for new individual or start fresh
    setRepeatability(calculateRepeatability([]));
    setCurrentResponse(
      `Generado nuevo perfil: ${newProfile.id}. Frecuencia Mu: ${newProfile.dominantMuFreq} Hz, Potencia basal: ${newProfile.baselineMuPower} µV², Ruido: ${newProfile.noiseLevel} µV. Lista para nuevos ensayos.`
    );
  }, [subjectCounter]);

  // Download comprehensive scientific session report
  const handleDownloadFullReport = useCallback(() => {
    const dateStr = new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' });
    const content = `========================================================================================
           NEURO-ACCESS BCI: REPORTE DE SIMULACIÓN Y EXTRACCIÓN DE CARACTERÍSTICAS
           Hacktoberfest Hack Day La Paz 2026 - Prototipo Educativo
========================================================================================

AVISO CIENTÍFICO Y ÉTICO:
Este reporte proviene de un SIMULADOR COMPUTACIONAL DE EEG SINTÉTICO (250 Hz).
NO CONTIENE DATOS MÉDICOS DE PACIENTES REALES NI DEBE SER UTILIZADO PARA DIAGNOSTICAR
ESCLEROSIS LATERAL AMIOTRÓFICA (ELA) NI NINGUNA OTRA CONDICIÓN NEUROMUSCULAR.

OBJETIVO EXPERIMENTAL:
"Simular, detectar y cuantificar cambios en actividad EEG sensoriomotora durante diferentes tareas controladas."

----------------------------------------------------------------------------------------
1. PERFIL DE LA PERSONA VIRTUAL:
----------------------------------------------------------------------------------------
- Identificador: ${profile.id}
- Frecuencia Mu Dominante: ${profile.dominantMuFreq} Hz
- Frecuencia Beta Dominante: ${profile.dominantBetaFreq} Hz
- Potencia Mu Basal en Reposo: ${profile.baselineMuPower} uV²
- Potencia Beta Basal: ${profile.baselineBetaPower} uV²
- Nivel de Ruido Gaussiano: ${profile.noiseLevel} uV
- Respuesta Motora Simulada (Atenuación ERD objetivo): ${profile.motorResponseStrength}%
- Deriva Lenta: ${profile.slowDriftFreq} Hz (${profile.slowDriftAmp} uV)
- Latencia Simulada de Respuesta: ${profile.simulatedLatencyMs} ms
- Asimetría Ganancia Canales: C3=${profile.channelVariability.c3Gain}, Cz=${profile.channelVariability.czGain}, C4=${profile.channelVariability.c4Gain}

----------------------------------------------------------------------------------------
2. CARACTERÍSTICAS EEG EXTRAÍDAS EN TIEMPO REAL:
----------------------------------------------------------------------------------------
- Potencia Mu C3 (Mano Derecha): ${features.c3MuPower} uV²
- Potencia Mu Cz (Vertex Medial): ${features.czMuPower} uV²
- Potencia Mu C4 (Mano Izquierda): ${features.c4MuPower} uV²
- Potencia Beta: ${features.betaPower} uV²
- Cambio ERD C3: ${features.erdC3}%
- Cambio ERD C4: ${features.erdC4}%
- Relación Señal/Ruido (SNR): ${features.snrDb} dB
- Frecuencia Dominante Activa: ${features.dominantFreq} Hz
- Latencia Estimada: ${features.simulatedLatencyMs} ms

----------------------------------------------------------------------------------------
3. ESTABILIDAD Y REPETIBILIDAD ENTRE ENSAYOS:
----------------------------------------------------------------------------------------
- Total de Ensayos Realizados: ${repeatability.totalTrials}
- Promedio ERD en C3: ${repeatability.meanErdC3}% (Desviación Estándar: ±${repeatability.stdDevErdC3}%)
- Promedio ERD en C4: ${repeatability.meanErdC4}% (Desviación Estándar: ±${repeatability.stdDevErdC4}%)
- Coeficiente de Variación (CV): ${repeatability.cvPercentage}%
- Evaluación de Estabilidad: ${repeatability.stabilityLevel}

Historial Detallado de Ensayos:
${trials.length === 0 ? 'No se ejecutaron ensayos automatizados completos aún.' : trials.map((t) => `
  [Ensayo #${t.trialNumber}] Hora: ${t.timestamp} | C3: ${t.features.c3MuPower} uV² (ERD: ${t.features.erdC3}%) | C4: ${t.features.c4MuPower} uV² (ERD: ${t.features.erdC4}%) | SNR: ${t.features.snrDb} dB
`).join('')}

----------------------------------------------------------------------------------------
4. ARQUITECTURA DE DATOS:
----------------------------------------------------------------------------------------
El sistema implementa la interfaz desacoplada IEEGDataSource:
[Fuente EEG: SimuladorEEG (250 Hz)] -> [Filtros DSP] -> [Extracción de Características] -> [Análisis] -> [UI]
Preparado para sustitución modular futura por DispositivoEEGReal (OpenBCI / Web Bluetooth).
========================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${profile.id.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [profile, features, repeatability, trials]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#3D3A37] flex flex-col font-['Quicksand','Nunito',sans-serif]">
      
      {/* 1. Top Educational & Transparency Banner */}
      <TopBanner onOpenInfoModal={() => setIsInfoModalOpen(true)} />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        
        {/* App Title & Persona Virtual Selector Header */}
        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#E07A5F]">
                Simulador de Persona Virtual • Canales C3, Cz, C4 (250 Hz)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D3A37] tracking-tight">
              Neuro-Access BCI: <span className="text-[#E07A5F]">Traductor de Intención Motora</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6B645C] max-w-3xl mt-1 leading-relaxed">
              Generador de EEG sintético para probar la interfaz y el algoritmo BCI sin datasets pesados.
              <span className="font-semibold text-[#4A4238]"> Datos totalmente simulados: no diagnósticos.</span>
            </p>
          </div>

          {/* Quick Virtual Person Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateNewPerson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#E07A5F] hover:bg-[#d06d52] shadow-xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Nueva persona</span>
            </button>
            <button
              onClick={() => setIsParamModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4A4238] bg-[#F5EBE0] hover:bg-white border border-[#E3D5CA] shadow-2xs transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Parámetros</span>
            </button>
          </div>
        </div>

        {/* 3-Panel Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
          
          {/* PANEL IZQUIERDO: Mapa Topográfico Cerebral (Col 1-3.5) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <BrainMap
              experimentalState={experimentalState}
              selectedElectrode={selectedElectrode}
              onSelectElectrode={(id) => setSelectedElectrode(id)}
              features={features}
              profile={profile}
              onGenerateNewPerson={handleGenerateNewPerson}
            />
          </div>

          {/* PANEL CENTRAL: Osciloscopio Multicanal C3, Cz, C4 (Col 4-8.5) */}
          <div className="lg:col-span-8 xl:col-span-5">
            <OscilloscopeChart
              experimentalState={experimentalState}
              features={features}
              profile={profile}
              isExperimentRunning={isExperimentRunning}
              currentStepIndex={currentStepIndex}
              totalSteps={EXPERIMENT_PROTOCOL.length}
              stepCountdown={stepCountdown}
              onStartExperiment={handleStartExperiment}
              onManualStateChange={handleManualStateChange}
              onOpenParamModal={() => setIsParamModalOpen(true)}
            />
          </div>

          {/* PANEL DERECHO: Características EEG Extraídas & Consola Gemma 4 (Col 9-12) */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-5">
            
            {/* Panel de Características EEG Extraídas */}
            <ExtractedFeaturesPanel
              features={features}
              profile={profile}
              trials={trials}
              repeatability={repeatability}
              onClearTrials={() => {
                setTrials([]);
                setRepeatability(calculateRepeatability([]));
              }}
              onDownloadReport={handleDownloadFullReport}
            />

            {/* Consola de Interpretación Gemma 4 */}
            <GemmaConsole
              motorState={experimentalState === 'REST' ? 'REST' : 'MOTOR_INTENT'}
              metrics={{
                muPower: features.c3MuPower,
                betaPower: features.betaPower,
                baselineMuPower: profile.baselineMuPower,
                erdPercentage: features.erdC3,
                snrDb: features.snrDb,
                dominantFreq: features.dominantFreq,
                timestamp: features.timestamp,
              }}
              selectedElectrode={selectedElectrode}
              activeAction={activeAction}
              onSelectAction={(action) => setActiveAction(action)}
              availableActions={AUTONOMY_ACTIONS}
              logs={logs}
              currentResponse={currentResponse}
              clinicalNote={clinicalNote}
              isProcessing={isExperimentRunning}
              slideIndex={slideIndex}
            />

          </div>

        </div>

        {/* Footer with Scientific & Hackathon Disclaimers */}
        <footer className="pt-4 border-t border-[#E3D5CA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B645C] gap-3">
          <div className="flex items-center gap-2">
            <span>© 2026 Neuro-Access BCI</span>
            <span>•</span>
            <span className="font-semibold text-[#3D3A37]">{profile.id}</span>
            <span>•</span>
            <span className="text-[#81B29A] font-semibold">Fuente: SimuladorEEG (250 Hz)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#E07A5F] font-semibold">
              DATOS EEG SINTÉTICOS — SIMULACIÓN
            </span>
            <span>•</span>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="text-[#E07A5F] hover:underline font-semibold cursor-pointer"
            >
              Arquitectura & Ética
            </button>
          </div>
        </footer>

      </main>

      {/* Virtual Subject Parameter Tuning Modal */}
      <VirtualSubjectModal
        isOpen={isParamModalOpen}
        onClose={() => setIsParamModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          eegSourceRef.current.updateProfile(updated);
        }}
        onGenerateNewPerson={handleGenerateNewPerson}
      />

      {/* Clinical Foundations & Ethics Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

    </div>
  );
}
