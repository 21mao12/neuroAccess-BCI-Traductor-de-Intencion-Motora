/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Panel: "Características EEG extraídas" y Análisis de Repetibilidad Inter-ensayos
 */

import React from 'react';
import {
  ExtractedEEGFeatures,
  RepeatabilityMetrics,
  TrialRecord,
  VirtualSubjectProfile,
} from '../types/bci';
import {
  Activity,
  Layers,
  Clock,
  Radio,
  TrendingDown,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface ExtractedFeaturesPanelProps {
  features: ExtractedEEGFeatures;
  profile: VirtualSubjectProfile;
  trials: TrialRecord[];
  repeatability: RepeatabilityMetrics;
  onClearTrials: () => void;
  onDownloadReport: () => void;
}

export const ExtractedFeaturesPanel: React.FC<ExtractedFeaturesPanelProps> = ({
  features,
  profile,
  trials,
  repeatability,
  onClearTrials,
  onDownloadReport,
}) => {
  return (
    <div className="bg-[#F5EBE0] rounded-2xl p-5 border border-[#E3D5CA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#3D3A37] tracking-tight">
                Características EEG extraídas
              </h2>
              <p className="text-[11px] text-[#6B645C]">
                Cuantificación biomédica espectral y análisis de repetibilidad
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-[#4A4238] bg-white/70 px-2.5 py-1 rounded-full border border-[#E3D5CA]">
            Ensayos: {trials.length}
          </span>
        </div>

        {/* Primary Features Grid */}
        <div className="grid grid-cols-2 gap-2 my-2">
          
          {/* Potencia Mu C3 */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Potencia Mu C3
            </div>
            <div className="text-sm font-extrabold text-[#3D3A37] mt-0.5">
              {features.c3MuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
            </div>
            <span className="text-[10px] text-[#E07A5F] font-semibold">
              ERD: {features.erdC3}%
            </span>
          </div>

          {/* Potencia Mu C4 */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Potencia Mu C4
            </div>
            <div className="text-sm font-extrabold text-[#3D3A37] mt-0.5">
              {features.c4MuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
            </div>
            <span className="text-[10px] text-[#D5A6BD] font-semibold">
              ERD: {features.erdC4}%
            </span>
          </div>

          {/* Potencia Mu Cz */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Potencia Mu Cz
            </div>
            <div className="text-sm font-extrabold text-[#3D3A37] mt-0.5">
              {features.czMuPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
            </div>
            <span className="text-[10px] text-[#81B29A] font-semibold">
              Canal Vertex
            </span>
          </div>

          {/* Potencia Beta */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Potencia Beta (13-30 Hz)
            </div>
            <div className="text-sm font-extrabold text-[#3D3A37] mt-0.5">
              {features.betaPower} <span className="text-xs font-normal text-[#6B645C]">µV²</span>
            </div>
            <span className="text-[10px] text-[#6B645C]">
              Rebote activo
            </span>
          </div>

          {/* Frecuencia Dominante & SNR */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Frecuencia Dominante
            </div>
            <div className="text-sm font-extrabold text-[#E07A5F] mt-0.5">
              {features.dominantFreq.toFixed(1)} Hz
            </div>
            <span className="text-[10px] text-[#6B645C]">
              SNR: {features.snrDb} dB
            </span>
          </div>

          {/* Latencia Simulada de Respuesta */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-[#E3D5CA]">
            <div className="text-[10px] uppercase font-bold text-[#6B645C]">
              Latencia de Respuesta
            </div>
            <div className="text-sm font-extrabold text-[#3D3A37] mt-0.5">
              {features.simulatedLatencyMs} <span className="text-xs font-normal text-[#6B645C]">ms</span>
            </div>
            <span className="text-[10px] text-[#81B29A] font-semibold">
              Tiempo de reacción
            </span>
          </div>

        </div>

        {/* Repetibilidad & Estabilidad entre Ensayos */}
        <div className="bg-white/90 rounded-xl p-3 border border-[#E3D5CA] my-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs font-bold text-[#3D3A37] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Estabilidad entre Ensayos</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              repeatability.stabilityLevel === 'Excelente' ? 'bg-[#81B29A]/20 text-[#2D5A46]' :
              repeatability.stabilityLevel === 'Alta' ? 'bg-[#E07A5F]/15 text-[#E07A5F]' :
              'bg-[#E3D5CA] text-[#4A4238]'
            }`}>
              {repeatability.stabilityLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#4A4238] my-1">
            <div>
              <span className="text-[10px] text-[#6B645C] block">Promedio ERD C3:</span>
              <strong>{repeatability.meanErdC3}%</strong>
              <span className="text-[10px] text-[#8C7A6B]"> (±{repeatability.stdDevErdC3}%)</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B645C] block">Coef. de Variación (CV):</span>
              <strong>{repeatability.cvPercentage}%</strong>
              <span className="text-[10px] text-[#8C7A6B]"> (Dispersión)</span>
            </div>
          </div>

          {/* Trial History Chips */}
          {trials.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#F5EBE0]">
              <div className="text-[10px] font-bold text-[#6B645C] uppercase mb-1">
                Historial de Ensayos ({profile.id}):
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {trials.slice(0, 5).map((trial) => (
                  <div
                    key={trial.trialNumber}
                    className="flex items-center justify-between text-[11px] bg-[#FAF5F0] px-2 py-1 rounded-md border border-[#E3D5CA]/70"
                  >
                    <span className="font-bold text-[#4A4238]">Ensayo {trial.trialNumber}</span>
                    <span className="text-[#E07A5F] font-semibold">C3: {trial.features.erdC3}%</span>
                    <span className="text-[#D5A6BD] font-semibold">C4: {trial.features.erdC4}%</span>
                    <span className="text-[#8C7A6B] text-[10px]">{trial.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ethical Transparency Disclaimer */}
        <div className="bg-[#FAF5F0] p-2.5 rounded-xl border border-[#E3D5CA] my-2 text-[11px] text-[#6B645C] leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-[#3D3A37] mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Objetivo Científico & Transparencia:</span>
          </div>
          <p>
            El prototipo <strong>NO diagnostica ELA</strong> ni patologías neuromusculares. 
            El objetivo actual es <em>simular, detectar y cuantificar cambios en actividad EEG sensoriomotora durante diferentes tareas controladas</em>.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-3 border-t border-[#E3D5CA] flex items-center justify-between gap-2">
        <button
          onClick={onDownloadReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E07A5F] hover:bg-[#d06d52] shadow-xs transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Descargar Reporte (.txt)</span>
        </button>

        {trials.length > 0 && (
          <button
            onClick={onClearTrials}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6B645C] hover:text-[#3D3A37] bg-white border border-[#E3D5CA] transition-all cursor-pointer"
            title="Reiniciar ensayos de esta persona"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
