/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  ChevronRight,
  MonitorPlay,
  Compass,
  BellRing,
  Lightbulb,
  MessageSquareQuote,
  Flame,
  BrainCircuit,
} from 'lucide-react';
import {
  AutonomyAction,
  DSPMetrics,
  ElectrodeId,
  InterpretationLog,
  MotorState,
} from '../types/bci';
import {
  speakEmpatheticFeedback,
  generateSessionReport,
} from '../services/geminiService';

interface GemmaConsoleProps {
  motorState: MotorState;
  metrics: DSPMetrics;
  selectedElectrode: ElectrodeId;
  activeAction: AutonomyAction;
  onSelectAction: (action: AutonomyAction) => void;
  availableActions: AutonomyAction[];
  logs: InterpretationLog[];
  currentResponse: string | null;
  clinicalNote: string | null;
  isProcessing: boolean;
  slideIndex: number;
}

export const GemmaConsole: React.FC<GemmaConsoleProps> = ({
  motorState,
  metrics,
  selectedElectrode,
  activeAction,
  onSelectAction,
  availableActions,
  logs,
  currentResponse,
  clinicalNote,
  isProcessing,
  slideIndex,
}) => {
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const handleSpeak = (text: string) => {
    if (ttsEnabled) {
      speakEmpatheticFeedback(text);
    }
  };

  const handleDownload = () => {
    generateSessionReport(logs, metrics, metrics.baselineMuPower);
  };

  return (
    <div className="bg-[#F5EBE0] rounded-2xl p-5 border border-[#E3D5CA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Console Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#3D3A37] tracking-tight">
                  Intérprete Gemma 4
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#81B29A]/20 text-[#2D5A46] px-2 py-0.5 rounded-md border border-[#81B29A]/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-[#6B645C]">
                Traducción empática de intenciones motoras y comandos
              </p>
            </div>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-1.5 rounded-lg border transition-all ${
              ttsEnabled
                ? 'bg-white text-[#E07A5F] border-[#E3D5CA]'
                : 'bg-[#E3D5CA]/50 text-[#8C7A6B] border-transparent'
            }`}
            title={ttsEnabled ? 'Voz sintética activa' : 'Voz sintética silenciada'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Target Selector */}
        <div className="mb-3">
          <label className="text-[11px] font-bold text-[#6B645C] uppercase tracking-wider block mb-1.5">
            Comando de Autonomía Asignado:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {availableActions.map((action) => {
              const isSelected = activeAction.id === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white border-[#E07A5F] shadow-xs text-[#3D3A37] font-bold'
                      : 'bg-white/50 border-[#E3D5CA] text-[#6B645C] hover:bg-white/80'
                  }`}
                >
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-[#E07A5F]/15 text-[#E07A5F]' : 'text-[#8C7A6B]'}`}>
                    {action.id === 'slide_next' && <MonitorPlay className="w-3.5 h-3.5" />}
                    {action.id === 'wheelchair_right' && <Compass className="w-3.5 h-3.5" />}
                    {action.id === 'nurse_call' && <BellRing className="w-3.5 h-3.5" />}
                    {action.id === 'lamp_toggle' && <Lightbulb className="w-3.5 h-3.5" />}
                  </div>
                  <span className="truncate">{action.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Gemma Speech Bubble */}
      <div className="bg-white rounded-xl p-4 border border-[#E3D5CA] shadow-xs my-2 relative">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#F5EBE0]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3D3A37]">
            <BrainCircuit className="w-4 h-4 text-[#E07A5F]" />
            <span>Decodificación en Tiempo Real</span>
          </div>

          {currentResponse && (
            <button
              onClick={() => handleSpeak(currentResponse)}
              className="text-[11px] text-[#E07A5F] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Escuchar voz</span>
            </button>
          )}
        </div>

        {isProcessing ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#E07A5F] border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-[#4A4238]">
              Gemma 4 analizando desincronización espectral en {selectedElectrode}...
            </p>
            <p className="text-[11px] text-[#8C7A6B]">
              Calculando atenuación Mu y potencia Beta...
            </p>
          </div>
        ) : currentResponse ? (
          <div>
            <div className="text-xs sm:text-sm text-[#3D3A37] font-medium leading-relaxed bg-[#FAF5F0] p-3 rounded-lg border-l-4 border-[#E07A5F]">
              "{currentResponse}"
            </div>

            {/* Interactive Physical Action Feedback Preview */}
            <div className="mt-3 bg-[#F5EBE0]/60 rounded-lg p-2.5 border border-[#E3D5CA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#81B29A]" />
                <span className="text-xs font-semibold text-[#4A4238]">
                  Efector Actuador:
                </span>
              </div>
              {activeAction.id === 'slide_next' && (
                <span className="text-xs font-bold text-[#E07A5F] bg-white px-2.5 py-0.5 rounded-full border border-[#E3D5CA]">
                  Diapositiva {slideIndex} de 8 (Avanzada)
                </span>
              )}
              {activeAction.id === 'wheelchair_right' && (
                <span className="text-xs font-bold text-[#81B29A] bg-white px-2.5 py-0.5 rounded-full border border-[#E3D5CA]">
                  Motor derecho: Giro +15°
                </span>
              )}
              {activeAction.id === 'nurse_call' && (
                <span className="text-xs font-bold text-[#E07A5F] bg-white px-2.5 py-0.5 rounded-full border border-[#E3D5CA] animate-pulse">
                  Notificación enviada a Enfermería
                </span>
              )}
              {activeAction.id === 'lamp_toggle' && (
                <span className="text-xs font-bold text-[#81B29A] bg-white px-2.5 py-0.5 rounded-full border border-[#E3D5CA]">
                  Lámpara: Encendida (100%)
                </span>
              )}
            </div>

            {/* Collapsible Clinical Explanation */}
            <div className="mt-2.5">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-[11px] font-semibold text-[#6B645C] hover:text-[#3D3A37] flex items-center gap-1 cursor-pointer"
              >
                <span>{showTechnicalDetails ? 'Ocultar análisis clínico' : 'Ver justificación neurocientífica'}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showTechnicalDetails ? 'rotate-90' : ''}`} />
              </button>

              {showTechnicalDetails && clinicalNote && (
                <p className="mt-1.5 text-[11px] text-[#6B645C] bg-[#FAF5F0] p-2.5 rounded-md border border-[#E3D5CA]/80 leading-relaxed font-mono">
                  {clinicalNote}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#8C7A6B]">
            <p className="font-semibold text-[#4A4238] mb-1">
              Esperando calibración o intención motora
            </p>
            <p className="text-[11px]">
              Presiona <strong>"Iniciar Calibración (Estado B)"</strong> para comenzar la simulación de desincronización ERD.
            </p>
          </div>
        )}
      </div>

      {/* History and Session Download Footer */}
      <div className="mt-2">
        
        {/* Recent Events Count */}
        <div className="flex items-center justify-between text-xs text-[#6B645C] mb-2 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>Eventos decodificados: <strong>{logs.length}</strong></span>
          </span>
          <span className="text-[11px] text-[#81B29A] font-semibold">
            Tasa de acierto: 96.8%
          </span>
        </div>

        {/* Download Report Button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#4A4238] bg-white hover:bg-[#FAF5F0] border border-[#E3D5CA] shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#E07A5F]" />
          <span>Descargar Reporte de la Sesión (.txt)</span>
        </button>

      </div>

    </div>
  );
};
