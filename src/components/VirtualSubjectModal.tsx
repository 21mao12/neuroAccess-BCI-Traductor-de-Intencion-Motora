/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal para Configurar y Personalizar los Parámetros de la Persona Virtual
 */

import React, { useState } from 'react';
import { VirtualSubjectProfile } from '../types/bci';
import { X, UserPlus, Sliders, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface VirtualSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VirtualSubjectProfile;
  onUpdateProfile: (updated: VirtualSubjectProfile) => void;
  onGenerateNewPerson: () => void;
}

export const VirtualSubjectModal: React.FC<VirtualSubjectModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onGenerateNewPerson,
}) => {
  if (!isOpen) return null;

  const [formValues, setFormValues] = useState<VirtualSubjectProfile>({ ...profile });

  const handleSave = () => {
    onUpdateProfile(formValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAFAFA] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E3D5CA] shadow-2xl p-6 text-[#3D3A37]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E3D5CA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E07A5F]/15 flex items-center justify-center text-[#E07A5F]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3D3A37]">
                Parámetros de la {formValues.id}
              </h3>
              <p className="text-xs text-[#6B645C]">
                Configuración del modelo de señal EEG sintética (250 Hz)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5EBE0] text-[#6B645C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Generator Button */}
        <div className="my-4 p-3 bg-[#F5EBE0] rounded-xl border border-[#E3D5CA] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#3D3A37]">
              Variabilidad Inter-Individual
            </div>
            <div className="text-[11px] text-[#6B645C]">
              Genera un nuevo perfil fisiológico sintético aleatorio dentro de rangos normales de simulación.
            </div>
          </div>
          <button
            onClick={() => {
              onGenerateNewPerson();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#E07A5F] hover:bg-[#d06d52] transition-all cursor-pointer shadow-xs shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nueva Persona</span>
          </button>
        </div>

        {/* Sliders Form */}
        <div className="space-y-4 text-xs">
          
          {/* Frecuencia Mu Dominante */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Frecuencia Mu Dominante (Ritmo Rolándico):</span>
              <span className="text-[#E07A5F]">{formValues.dominantMuFreq} Hz</span>
            </div>
            <input
              type="range"
              min="8.5"
              max="12.5"
              step="0.1"
              value={formValues.dominantMuFreq}
              onChange={(e) => setFormValues({ ...formValues, dominantMuFreq: parseFloat(e.target.value) })}
              className="w-full accent-[#E07A5F]"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]">
              <span>8.5 Hz (Lento)</span>
              <span>10.0 Hz (Estándar)</span>
              <span>12.5 Hz (Rápido)</span>
            </div>
          </div>

          {/* Potencia Mu Basal */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Potencia Mu Basal en Reposo:</span>
              <span className="text-[#E07A5F]">{formValues.baselineMuPower} µV²</span>
            </div>
            <input
              type="range"
              min="1000"
              max="2800"
              step="50"
              value={formValues.baselineMuPower}
              onChange={(e) => setFormValues({ ...formValues, baselineMuPower: parseInt(e.target.value) })}
              className="w-full accent-[#E07A5F]"
            />
          </div>

          {/* Potencia Beta Basal */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Potencia Beta Basal (13-30 Hz):</span>
              <span className="text-[#81B29A]">{formValues.baselineBetaPower} µV²</span>
            </div>
            <input
              type="range"
              min="80"
              max="350"
              step="10"
              value={formValues.baselineBetaPower}
              onChange={(e) => setFormValues({ ...formValues, baselineBetaPower: parseInt(e.target.value) })}
              className="w-full accent-[#81B29A]"
            />
          </div>

          {/* Respuesta Motora (Desincronización ERD) */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Atenuación ERD durante Imaginación Motora:</span>
              <span className="text-[#E07A5F]">{formValues.motorResponseStrength}%</span>
            </div>
            <input
              type="range"
              min="-85"
              max="-45"
              step="1"
              value={formValues.motorResponseStrength}
              onChange={(e) => setFormValues({ ...formValues, motorResponseStrength: parseFloat(e.target.value) })}
              className="w-full accent-[#E07A5F]"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]">
              <span>-45% (Atenuación suave)</span>
              <span>-85% (Desincronización pronunciada)</span>
            </div>
          </div>

          {/* Nivel de Ruido */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Nivel de Ruido Gaussiano Fisiológico:</span>
              <span className="text-[#6B645C]">{formValues.noiseLevel} µV</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.1"
              value={formValues.noiseLevel}
              onChange={(e) => setFormValues({ ...formValues, noiseLevel: parseFloat(e.target.value) })}
              className="w-full accent-[#6B645C]"
            />
          </div>

          {/* Latencia de Respuesta */}
          <div>
            <div className="flex justify-between font-bold text-[#4A4238] mb-1">
              <span>Latencia Simulada de Respuesta Motora:</span>
              <span className="text-[#81B29A]">{formValues.simulatedLatencyMs} ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="450"
              step="10"
              value={formValues.simulatedLatencyMs}
              onChange={(e) => setFormValues({ ...formValues, simulatedLatencyMs: parseInt(e.target.value) })}
              className="w-full accent-[#81B29A]"
            />
          </div>

        </div>

        {/* Disclaimer */}
        <div className="my-4 p-3 bg-[#FAF5F0] rounded-xl border border-[#E3D5CA] text-[11px] text-[#6B645C] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
          <span>
            Los rangos son exclusivamente para fines de <strong>modelado computacional y simulación</strong>, y no constituyen valores de referencia diagnóstica.
          </span>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E3D5CA] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B645C] hover:bg-[#F5EBE0] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E07A5F] hover:bg-[#d06d52] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar a la Simulación</span>
          </button>
        </div>

      </div>
    </div>
  );
};
