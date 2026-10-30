/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Brain, Activity, Heart, Shield, Sparkles, BookOpen } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAFAFA] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E3D5CA] shadow-2xl p-6 text-[#3D3A37]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E3D5CA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E07A5F]/15 flex items-center justify-center text-[#E07A5F]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3D3A37]">
                Fundamentos Neurocientíficos y DSP
              </h3>
              <p className="text-xs text-[#6B645C]">
                Neuro-Access BCI • Hacktoberfest Hack Day La Paz 2026
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

        {/* Modal Body */}
        <div className="space-y-4 py-4 text-xs sm:text-sm leading-relaxed text-[#4A4238]">
          
          <div className="bg-[#F5EBE0] p-4 rounded-xl border border-[#E3D5CA]">
            <h4 className="font-bold text-[#E07A5F] flex items-center gap-1.5 mb-1.5">
              <Activity className="w-4 h-4" />
              1. Ritmo Rolándico Mu (8-12 Hz) y Reposo (Estado A)
            </h4>
            <p className="text-xs text-[#6B645C]">
              En reposo motor y relajación, las neuronas piramidales de la corteza sensoriomotora primaria (M1/S1) oscilan en sincronía rítmica a aproximadamente 10 Hz. Esto genera un potencial eléctrico de alta amplitud (40-60 µV) captable en el cuero cabelludo mediante electrodos de superficie.
            </p>
          </div>

          <div className="bg-[#F5EBE0] p-4 rounded-xl border border-[#E3D5CA]">
            <h4 className="font-bold text-[#81B29A] flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4" />
              2. Desincronización Relacionada con Eventos (ERD - Estado B)
            </h4>
            <p className="text-xs text-[#6B645C]">
              Cuando una persona imagina mover su mano derecha (Motor Imagery), las redes neuronales del giro precentral izquierdo (electrodo C3) rompen su patrón sincrónico. La potencia de la onda Mu desciende drásticamente (típicamente entre -50% y -80%), mientras emerge una oscilación rápida en la banda Beta (~20 Hz). Este cambio es la "firma neural" que nuestro algoritmo DSP cuantifica como el índice ERD.
            </p>
          </div>

          <div className="bg-[#F5EBE0] p-4 rounded-xl border border-[#E3D5CA]">
            <h4 className="font-bold text-[#E07A5F] flex items-center gap-1.5 mb-1.5">
              <Heart className="w-4 h-4" />
              3. El Rol de Gemma 4: Human-Centric AI para la Autonomía
            </h4>
            <p className="text-xs text-[#6B645C]">
              Los sistemas BCI tradicionales suelen arrojar alertas frías como "Error de umbral" o "Comando 0x01 ejecutado". Gemma 4 humaniza la tecnología: reconoce la intención con empatía, alienta al usuario con movilidad reducida reconociendo su concentración mental, y ejecuta comandos tangibles como avanzar diapositivas, modular una silla de ruedas o emitir voz sintetizada.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E3D5CA] text-xs text-[#8C7A6B]">
            <div className="font-semibold text-[#3D3A37] flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#81B29A]" />
              Compromiso Ético y Transparencia
            </div>
            <p>
              Este prototipo está diseñado con fines educativos y de investigación para el Hacktoberfest Hack Day La Paz 2026. La simulación utiliza modelos matemáticos validados en literatura científica de BCI no invasivo (Pfurtscheller & da Silva, 1999).
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#E3D5CA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E07A5F] hover:bg-[#d06d52] transition-colors cursor-pointer"
          >
            Entendido, volver a la aplicación
          </button>
        </div>

      </div>
    </div>
  );
};
