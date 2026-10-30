/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Brain, Award, Info, HeartHandshake } from 'lucide-react';

interface TopBannerProps {
  onOpenInfoModal: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onOpenInfoModal }) => {
  return (
    <header className="w-full bg-[#F5EBE0] border-b border-[#E3D5CA] shadow-xs px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Banner Title & Hackathon Attribution */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E07A5F]/15 flex items-center justify-center text-[#E07A5F] shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#E07A5F] text-white">
                Prototipo Educativo
              </span>
              <span className="text-xs font-semibold text-[#6B645C]">
                Hacktoberfest Hack Day La Paz 2026
              </span>
            </div>
            <p className="text-[11px] text-[#6B645C]/90 mt-0.5 flex items-center gap-1.5">
              <span>Neurotecnología Inclusiva & BCI Asistivo</span>
              <span>•</span>
              <span className="text-[#81B29A] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A] animate-ping" />
                DSP en Tiempo Real 250 Hz
              </span>
            </p>
          </div>
        </div>

        {/* Action and Transparency Details */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B645C] bg-[#FAF5F0] px-3 py-1.5 rounded-full border border-[#E3D5CA]/70">
            <HeartHandshake className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Diseñado para Personas con Movilidad Reducida</span>
          </div>

          <button
            onClick={onOpenInfoModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4238] hover:text-[#E07A5F] bg-[#FAF5F0] hover:bg-white px-3 py-1.5 rounded-full border border-[#E3D5CA] transition-all shadow-xs"
            title="Ver fundamentos neurocientíficos y manual de uso"
          >
            <Info className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Fundamentos Clínicos</span>
          </button>
        </div>

      </div>
    </header>
  );
};
