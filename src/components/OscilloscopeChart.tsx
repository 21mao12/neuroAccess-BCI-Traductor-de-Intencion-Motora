/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Osciloscopio Multicanal C3, Cz, C4 con Modos de Montaje Clínico
 * Diseñado para visualización biológica fluida y serena (sin vibración caótica ni saltos).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  ExperimentalState,
  ExtractedEEGFeatures,
  VirtualSubjectProfile,
} from '../types/bci';
import {
  Activity,
  Play,
  RotateCcw,
  Zap,
  Sliders,
  ShieldAlert,
  Layers,
  Hand,
  Eye,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface OscilloscopeChartProps {
  experimentalState: ExperimentalState;
  features: ExtractedEEGFeatures;
  profile: VirtualSubjectProfile;
  isExperimentRunning: boolean;
  currentStepIndex: number;
  totalSteps: number;
  stepCountdown: number;
  onStartExperiment: () => void;
  onManualStateChange: (state: ExperimentalState) => void;
  onOpenParamModal: () => void;
}

export type MontageMode = 'separated' | 'superimposed' | 'C3' | 'Cz' | 'C4';

export const OscilloscopeChart: React.FC<OscilloscopeChartProps> = ({
  experimentalState,
  features,
  profile,
  isExperimentRunning,
  currentStepIndex,
  totalSteps,
  stepCountdown,
  onStartExperiment,
  onManualStateChange,
  onOpenParamModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Display Configuration State
  const [montageMode, setMontageMode] = useState<MontageMode>('separated');
  const [gainScale, setGainScale] = useState<number>(0.75); // 0.5x, 0.75x, 1x (prevents overcrowding)
  const [showRestExplainer, setShowRestExplainer] = useState<boolean>(true);

  // Initialize multi-channel Chart.js instance with 160 samples (~2.0 seconds clinical window)
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const bufferSize = 160; // 160 samples at 250 Hz ≈ 2.0s time window (smooth rhythmic flow)
    const initialLabels = Array.from({ length: bufferSize }, (_, i) => `${(i * 0.0125).toFixed(2)}s`);
    const zeros = Array.from({ length: bufferSize }, () => 0);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [
          {
            label: 'C3 (Mano Derecha)',
            data: [...zeros],
            borderColor: '#E07A5F', // Terracota cálido
            borderWidth: 2.2,
            tension: 0.35, // Curva orgánica suave y armónica
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: 'Cz (Vertex Medial)',
            data: [...zeros],
            borderColor: '#81B29A', // Verde salvia sereno
            borderWidth: 2.0,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: 'C4 (Mano Izquierda)',
            data: [...zeros],
            borderColor: '#D5A6BD', // Malva cálido
            borderWidth: 2.0,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // CRITICAL: Disable animation interpolation to prevent erratic jitter/jumping
        animation: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
          },
          y: {
            min: -75,
            max: 75,
            grid: {
              color: 'rgba(227, 213, 202, 0.45)',
            },
            ticks: {
              color: '#8C7A6B',
              font: { family: 'Quicksand', size: 10 },
              stepSize: 25,
              callback: (val) => `${val} µV`,
            },
            border: {
              dash: [4, 4],
              color: '#D5C4B4',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { family: 'Quicksand', size: 11, weight: 'bold' },
              color: '#4A4238',
              padding: 10,
            },
          },
          tooltip: {
            enabled: false, // Disabled on high-frequency streaming for maximum render performance
          },
        },
      },
    });

    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  // Update dataset visibility based on montage mode
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (montageMode === 'separated' || montageMode === 'superimposed') {
      chart.setDatasetVisibility(0, true);
      chart.setDatasetVisibility(1, true);
      chart.setDatasetVisibility(2, true);
    } else if (montageMode === 'C3') {
      chart.setDatasetVisibility(0, true);
      chart.setDatasetVisibility(1, false);
      chart.setDatasetVisibility(2, false);
    } else if (montageMode === 'Cz') {
      chart.setDatasetVisibility(0, false);
      chart.setDatasetVisibility(1, true);
      chart.setDatasetVisibility(2, false);
    } else if (montageMode === 'C4') {
      chart.setDatasetVisibility(0, false);
      chart.setDatasetVisibility(1, false);
      chart.setDatasetVisibility(2, true);
    }
    chart.update('none');
  }, [montageMode]);

  // Expose montage mode and gain scale to window/data-flow
  useEffect(() => {
    (window as any).__BCI_MONTAGE_MODE__ = montageMode;
    (window as any).__BCI_GAIN_SCALE__ = gainScale;
  }, [montageMode, gainScale]);

  // Compute percentage changes
  const baseMu = profile.baselineMuPower;
  const c3Diff = ((features.c3MuPower - baseMu) / baseMu) * 100;
  const c4Diff = ((features.c4MuPower - baseMu) / baseMu) * 100;

  return (
    <div className="bg-[#F5EBE0] rounded-2xl p-5 border border-[#E3D5CA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Header and Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E07A5F]/15 flex items-center justify-center text-[#E07A5F]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#3D3A37] tracking-tight">
                  Osciloscopio Multicanal C3, Cz, C4
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E07A5F]/15 text-[#E07A5F] px-2 py-0.5 rounded-full border border-[#E07A5F]/20">
                  DATOS EEG SINTÉTICOS — SIMULACIÓN
                </span>
              </div>
              <p className="text-[11px] text-[#6B645C]">
                Ventana temporal de 2.0 segundos • Ritmo armónico continuo (250 Hz)
              </p>
            </div>
          </div>

          {/* Montage Mode & Gain Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Gain Scale Selector */}
            <div className="flex items-center bg-white/70 border border-[#E3D5CA] rounded-xl px-2 py-0.5 text-xs gap-1">
              <span className="text-[10px] font-bold text-[#6B645C]">Ganancia:</span>
              <button
                onClick={() => setGainScale(0.5)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  gainScale === 0.5 ? 'bg-[#E07A5F] text-white' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
                }`}
                title="Ganancia baja (ondas más pequeñas y suaves)"
              >
                0.5x
              </button>
              <button
                onClick={() => setGainScale(0.75)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  gainScale === 0.75 ? 'bg-[#E07A5F] text-white' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
                }`}
                title="Ganancia recomendada para visualización clínica"
              >
                0.75x
              </button>
              <button
                onClick={() => setGainScale(1.0)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  gainScale === 1.0 ? 'bg-[#E07A5F] text-white' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
                }`}
                title="Ganancia 1.0x estándar"
              >
                1.0x
              </button>
            </div>

            {/* Montage Mode Toggle */}
            <div className="flex items-center bg-white/70 border border-[#E3D5CA] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setMontageMode('separated')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  montageMode === 'separated' ? 'bg-[#E07A5F] text-white shadow-xs' : 'text-[#6B645C] hover:text-[#3D3A37]'
                }`}
                title="Montaje clínico: Canales separados verticalmente para no chocar entre sí"
              >
                Separados (Clínico)
              </button>
              <button
                onClick={() => setMontageMode('superimposed')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  montageMode === 'superimposed' ? 'bg-[#E07A5F] text-white shadow-xs' : 'text-[#6B645C] hover:text-[#3D3A37]'
                }`}
                title="Montaje superpuesto sobre el mismo eje central"
              >
                Superpuestos
              </button>
              <button
                onClick={() => setMontageMode('C3')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  montageMode === 'C3' ? 'bg-[#E07A5F] text-white shadow-xs' : 'text-[#6B645C] hover:text-[#3D3A37]'
                }`}
                title="Ver únicamente canal C3 (Mano Derecha)"
              >
                Solo C3
              </button>
            </div>

          </div>
        </div>

        {/* State Indicators & Countdown Bar */}
        <div className="flex items-center justify-between gap-2 bg-white/60 p-2.5 rounded-xl border border-[#E3D5CA]/70 my-2">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B645C] uppercase mr-1">
              Estado:
            </span>

            {/* Reposo */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                experimentalState === 'REST'
                  ? 'bg-[#E3D5CA] text-[#3D3A37] border border-[#CDB4A3] shadow-xs'
                  : 'bg-transparent text-[#8C7A6B]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${experimentalState === 'REST' ? 'bg-[#E07A5F]' : 'bg-[#CDB4A3]'}`} />
              REPOSO (Ondas Mu rítmicas ~10 Hz)
            </span>

            {/* Mano Derecha */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                experimentalState === 'MOTOR_IMAGERY_RIGHT'
                  ? 'bg-[#E07A5F] text-white shadow-xs'
                  : 'bg-transparent text-[#8C7A6B]'
              }`}
            >
              <Hand className="w-3 h-3" />
              MANO DERECHA (ERD C3)
            </span>

            {/* Mano Izquierda */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                experimentalState === 'MOTOR_IMAGERY_LEFT'
                  ? 'bg-[#D5A6BD] text-[#4A4238] shadow-xs'
                  : 'bg-transparent text-[#8C7A6B]'
              }`}
            >
              <Hand className="w-3 h-3 rotate-180" />
              MANO IZQ (ERD C4)
            </span>

            {/* Estímulo Sensorial */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                experimentalState === 'SENSORY_STIMULUS'
                  ? 'bg-[#81B29A] text-white shadow-xs'
                  : 'bg-transparent text-[#8C7A6B]'
              }`}
            >
              <Eye className="w-3 h-3" />
              SENSORIAL (Cz)
            </span>
          </div>

          {/* Experiment Countdown Timer */}
          {isExperimentRunning && (
            <div className="flex items-center gap-2 bg-[#FAF5F0] px-3 py-1 rounded-lg border border-[#E07A5F]/30 animate-pulse">
              <span className="text-[11px] font-bold text-[#E07A5F]">
                Paso {currentStepIndex + 1}/{totalSteps}
              </span>
              <span className="text-sm font-black text-[#E07A5F]">
                {stepCountdown}s
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[255px] sm:h-[280px] bg-white/75 rounded-xl p-3 border border-[#E3D5CA] my-2 overflow-hidden">
        
        {/* Baseline Labels for Separated Clinical Montage */}
        {montageMode === 'separated' && (
          <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between pointer-events-none z-10 text-[9px] font-bold">
            <span className="text-[#E07A5F] bg-white/80 px-1 rounded shadow-2xs">C3 (Mano Der) ↑</span>
            <span className="text-[#81B29A] bg-white/80 px-1 rounded shadow-2xs">Cz (Vertex) •</span>
            <span className="text-[#D5A6BD] bg-white/80 px-1 rounded shadow-2xs">C4 (Mano Izq) ↓</span>
          </div>
        )}

        {/* Subtle Horizontal Reference Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#E3D5CA]/50 pointer-events-none" />

        <canvas id="bci-oscilloscope-canvas" ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Educational Banner answering the user's question directly */}
      {showRestExplainer && (
        <div className="bg-[#FAF5F0] rounded-xl p-2.5 border border-[#E3D5CA] my-1 text-xs text-[#6B645C] flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-[#3D3A37]">¿Por qué la gráfica oscila en Reposo?</strong> En un cerebro vivo y despierto, las neuronas de la corteza sensoriomotora <strong>nunca se apagan</strong>. En reposo oscilan al unísono a ~10 Hz (el <em>Ritmo Mu rolándico</em>), viéndose como una ola armónica continua. Al imaginar un movimiento, la oscilación Mu se desincroniza y se hace pequeña (ERD).
            </div>
          </div>
          <button
            onClick={() => setShowRestExplainer(false)}
            className="text-[10px] text-[#8C7A6B] hover:text-[#3D3A37] font-bold cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-time DSP Comparison Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-1">
        
        {/* Potencia Basal de Referencia */}
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E3D5CA]">
          <div className="text-[10px] uppercase font-bold text-[#6B645C]">
            Potencia Mu Basal
          </div>
          <div className="text-base font-bold text-[#3D3A37] mt-0.5">
            {profile.baselineMuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
          </div>
          <span className="text-[10px] text-[#6B645C] block truncate">
            Mu: {profile.dominantMuFreq} Hz (Reposo)
          </span>
        </div>

        {/* Potencia Actual en C3 (Mano Derecha) */}
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E3D5CA]">
          <div className="text-[10px] uppercase font-bold text-[#6B645C] flex items-center justify-between">
            <span>Potencia C3</span>
            <span className="text-[9px] text-[#E07A5F] font-bold">Mano Der</span>
          </div>
          <div className="text-base font-bold text-[#3D3A37] mt-0.5">
            {features.c3MuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
          </div>
          <div className={`text-[11px] font-bold ${c3Diff < -30 ? 'text-[#81B29A]' : 'text-[#6B645C]'}`}>
            Cambio: {c3Diff > 0 ? `+${c3Diff.toFixed(1)}%` : `${c3Diff.toFixed(1)}%`}
          </div>
        </div>

        {/* Potencia Actual en C4 (Mano Izquierda) */}
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E3D5CA]">
          <div className="text-[10px] uppercase font-bold text-[#6B645C] flex items-center justify-between">
            <span>Potencia C4</span>
            <span className="text-[9px] text-[#D5A6BD] font-bold">Mano Izq</span>
          </div>
          <div className="text-base font-bold text-[#3D3A37] mt-0.5">
            {features.c4MuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
          </div>
          <div className={`text-[11px] font-bold ${c4Diff < -30 ? 'text-[#81B29A]' : 'text-[#6B645C]'}`}>
            Cambio: {c4Diff > 0 ? `+${c4Diff.toFixed(1)}%` : `${c4Diff.toFixed(1)}%`}
          </div>
        </div>

        {/* Potencia Cz / SNR */}
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E3D5CA]">
          <div className="text-[10px] uppercase font-bold text-[#6B645C] flex items-center justify-between">
            <span>Potencia Cz</span>
            <span className="text-[9px] text-[#81B29A] font-bold">Vertex</span>
          </div>
          <div className="text-base font-bold text-[#3D3A37] mt-0.5">
            {features.czMuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
          </div>
          <div className="text-[11px] text-[#81B29A] font-semibold">
            SNR: {features.snrDb} dB
          </div>
        </div>

      </div>

      {/* Main Interactive Controls & Protocol Starter */}
      <div className="mt-3 pt-3 border-t border-[#E3D5CA] flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Automated Protocol Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartExperiment}
            disabled={isExperimentRunning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer ${
              isExperimentRunning
                ? 'bg-[#E07A5F]/60 cursor-wait'
                : 'bg-[#E07A5F] hover:bg-[#d06d52] active:scale-95 shadow-[#E07A5F]/30'
            }`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isExperimentRunning ? `Ejecutando Prueba (${stepCountdown}s)...` : 'INICIAR EXPERIMENTO'}</span>
          </button>

          {/* Quick Manual State Switches */}
          <div className="hidden sm:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-[#E3D5CA]">
            <button
              onClick={() => onManualStateChange('REST')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                experimentalState === 'REST' ? 'bg-[#E3D5CA] text-[#3D3A37]' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
              }`}
            >
              Reposo
            </button>
            <button
              onClick={() => onManualStateChange('MOTOR_IMAGERY_RIGHT')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                experimentalState === 'MOTOR_IMAGERY_RIGHT' ? 'bg-[#E07A5F] text-white' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
              }`}
            >
              Mano Der (C3)
            </button>
            <button
              onClick={() => onManualStateChange('MOTOR_IMAGERY_LEFT')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                experimentalState === 'MOTOR_IMAGERY_LEFT' ? 'bg-[#D5A6BD] text-[#3D3A37]' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
              }`}
            >
              Mano Izq (C4)
            </button>
            <button
              onClick={() => onManualStateChange('SENSORY_STIMULUS')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                experimentalState === 'SENSORY_STIMULUS' ? 'bg-[#81B29A] text-white' : 'text-[#6B645C] hover:bg-[#F5EBE0]'
              }`}
            >
              Sensorial
            </button>
          </div>
        </div>

        {/* Customize Virtual Subject Parameters */}
        <button
          onClick={onOpenParamModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#4A4238] bg-white hover:bg-[#FAF5F0] border border-[#E3D5CA] shadow-2xs transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>Ajustar Parámetros</span>
        </button>

      </div>

    </div>
  );
};
