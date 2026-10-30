/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ElectrodeId, ElectrodeInfo, ExperimentalState, ExtractedEEGFeatures, VirtualSubjectProfile } from '../types/bci';
import { Activity, CheckCircle2, User, Sparkles } from 'lucide-react';

interface BrainMapProps {
  experimentalState: ExperimentalState;
  selectedElectrode: ElectrodeId;
  onSelectElectrode: (id: ElectrodeId) => void;
  features: ExtractedEEGFeatures;
  profile: VirtualSubjectProfile;
  onGenerateNewPerson: () => void;
}

const ELECTRODES_10_20: ElectrodeInfo[] = [
  { id: 'F3', name: 'Frontal Izquierdo (F3)', hemisphere: 'left', cortexRegion: 'Prefrontal / Planificación', x: 34, y: 30, impedance: 2.4, primaryFor: 'Atención e intención' },
  { id: 'F4', name: 'Frontal Derecho (F4)', hemisphere: 'right', cortexRegion: 'Prefrontal / Inhibición', x: 66, y: 30, impedance: 2.1, primaryFor: 'Monitoreo cognitivo' },
  { id: 'C3', name: 'Central Izquierdo (C3)', hemisphere: 'left', cortexRegion: 'Corteza Sensoriomotora M1/S1', x: 26, y: 50, impedance: 1.8, primaryFor: 'Imaginación Mano Derecha (ERD)' },
  { id: 'Cz', name: 'Central Vertex (Cz)', hemisphere: 'center', cortexRegion: 'Sensoriomotor Medial', x: 50, y: 50, impedance: 2.0, primaryFor: 'Estímulo Sensorial / Vertex' },
  { id: 'C4', name: 'Central Derecho (C4)', hemisphere: 'right', cortexRegion: 'Corteza Sensoriomotora M1/S1', x: 74, y: 50, impedance: 2.2, primaryFor: 'Imaginación Mano Izquierda (ERD)' },
  { id: 'P3', name: 'Parietal Izquierdo (P3)', hemisphere: 'left', cortexRegion: 'Asociación Somatosensorial', x: 34, y: 70, impedance: 2.8, primaryFor: 'Propiocepción táctil' },
  { id: 'P4', name: 'Parietal Derecho (P4)', hemisphere: 'right', cortexRegion: 'Asociación Somatosensorial', x: 66, y: 70, impedance: 2.7, primaryFor: 'Espacialidad' },
  { id: 'O1', name: 'Occipital Izquierdo (O1)', hemisphere: 'left', cortexRegion: 'Corteza Visual Primaria', x: 40, y: 86, impedance: 3.1, primaryFor: 'Ritmo Alfa con ojos cerrados' },
  { id: 'O2', name: 'Occipital Derecho (O2)', hemisphere: 'right', cortexRegion: 'Corteza Visual Primaria', x: 60, y: 86, impedance: 2.9, primaryFor: 'Ritmo Alfa occipital' },
];

export const BrainMap: React.FC<BrainMapProps> = ({
  experimentalState,
  selectedElectrode,
  onSelectElectrode,
  features,
  profile,
  onGenerateNewPerson,
}) => {
  const isC3Active = experimentalState === 'MOTOR_IMAGERY_RIGHT';
  const isC4Active = experimentalState === 'MOTOR_IMAGERY_LEFT';
  const isCzActive = experimentalState === 'SENSORY_STIMULUS';

  const currentElectrodeData = ELECTRODES_10_20.find((e) => e.id === selectedElectrode) || ELECTRODES_10_20[2];

  return (
    <div className="bg-[#F5EBE0] rounded-2xl p-5 border border-[#E3D5CA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Panel Header & Virtual Person Chip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isC3Active || isC4Active || isCzActive ? 'bg-[#81B29A] animate-ping' : 'bg-[#E07A5F]'}`} />
            <h2 className="text-base font-bold text-[#3D3A37] tracking-tight">
              Topografía Sensoriomotora
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#6B645C] bg-[#E3D5CA]/60 px-2 py-0.5 rounded-full">
            Canales C3 • Cz • C4
          </span>
        </div>

        {/* Persona Virtual Profile Pill */}
        <div className="flex items-center justify-between bg-white/75 p-2 rounded-xl border border-[#E3D5CA] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#3D3A37]">
                {profile.id}
              </div>
              <div className="text-[10px] text-[#6B645C]">
                Mu: {profile.dominantMuFreq} Hz • Basal: {profile.baselineMuPower} µV²
              </div>
            </div>
          </div>

          <button
            onClick={onGenerateNewPerson}
            className="text-[11px] font-bold text-[#E07A5F] hover:text-[#d06d52] bg-[#FAF5F0] hover:bg-white px-2.5 py-1 rounded-lg border border-[#E3D5CA] transition-all cursor-pointer shadow-2xs"
            title="Generar nueva persona virtual con variabilidad fisiológica"
          >
            Nueva persona
          </button>
        </div>
      </div>

      {/* SVG Brain Map Canvas */}
      <div className="relative w-full aspect-square max-w-[270px] sm:max-w-[290px] mx-auto my-1 flex items-center justify-center">
        
        {/* Warm Ambient Aura */}
        <div 
          className={`absolute inset-4 rounded-full transition-all duration-700 pointer-events-none ${
            isC3Active || isC4Active || isCzActive
              ? 'bg-[#E07A5F]/15 blur-xl animate-brain-active' 
              : 'bg-[#E3D5CA]/30 blur-lg'
          }`} 
        />

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full relative z-10 drop-shadow-xs select-none"
        >
          <defs>
            <radialGradient id="headGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F5EBE0" />
              <stop offset="100%" stopColor="#E3D5CA" />
            </radialGradient>

            <linearGradient id="motorStripGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E07A5F" stopOpacity={isC3Active ? "0.45" : "0.15"} />
              <stop offset="50%" stopColor="#81B29A" stopOpacity={isCzActive ? "0.45" : "0.15"} />
              <stop offset="100%" stopColor="#D5A6BD" stopOpacity={isC4Active ? "0.45" : "0.15"} />
            </linearGradient>
          </defs>

          {/* Left Ear A1 */}
          <path d="M 17,90 C 10,95 10,110 17,115" fill="none" stroke="#CDB4A3" strokeWidth="3" strokeLinecap="round" />
          <text x="7" y="104" fontSize="6.5" fill="#8C7A6B" fontWeight="600">A1</text>

          {/* Right Ear A2 */}
          <path d="M 183,90 C 190,95 190,110 183,115" fill="none" stroke="#CDB4A3" strokeWidth="3" strokeLinecap="round" />
          <text x="187" y="104" fontSize="6.5" fill="#8C7A6B" fontWeight="600">A2</text>

          {/* Nasion */}
          <path d="M 94,15 L 100,5 L 106,15" fill="none" stroke="#CDB4A3" strokeWidth="3" strokeLinejoin="round" />
          <text x="100" y="4" fontSize="6" fill="#8C7A6B" fontWeight="700" textAnchor="middle">NASION (Frente)</text>

          {/* Cranial Contour */}
          <circle cx="100" cy="102" r="82" fill="url(#headGrad2)" stroke="#CDB4A3" strokeWidth="2.5" />
          <line x1="100" y1="20" x2="100" y2="184" stroke="#E3D5CA" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Motor Strip (Rolandic Gyrus) */}
          <path
            d="M 28,102 Q 100,88 172,102"
            fill="none"
            stroke="url(#motorStripGrad2)"
            strokeWidth={isC3Active || isC4Active || isCzActive ? "16" : "11"}
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          <text x="56" y="27" fontSize="6.5" fill="#8C7A6B" fontWeight="600" textAnchor="middle">
            Hemisferio Izq (C3)
          </text>
          <text x="144" y="27" fontSize="6.5" fill="#8C7A6B" fontWeight="600" textAnchor="middle">
            Hemisferio Der (C4)
          </text>

          {/* C3 Animated Ripple Ring on Right Hand Imagery */}
          {isC3Active && (
            <circle cx="52" cy="100" r="16" fill="none" stroke="#E07A5F" strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="10;28;36" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* C4 Animated Ripple Ring on Left Hand Imagery */}
          {isC4Active && (
            <circle cx="148" cy="100" r="16" fill="none" stroke="#D5A6BD" strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="10;28;36" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Cz Animated Ripple Ring on Sensory Stimulus */}
          {isCzActive && (
            <circle cx="100" cy="100" r="16" fill="none" stroke="#81B29A" strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="10;28;36" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Render 10-20 Electrodes */}
          {ELECTRODES_10_20.map((elec) => {
            const isSelected = selectedElectrode === elec.id;
            const cx = 200 * (elec.x / 100);
            const cy = 200 * (elec.y / 100);

            let circleFill = '#FFFFFF';
            let strokeColor = '#A8998C';
            let textColor = '#4A4238';

            if (elec.id === 'C3') {
              if (isC3Active) {
                circleFill = '#E07A5F';
                strokeColor = '#81B29A';
                textColor = '#FFFFFF';
              } else {
                strokeColor = '#E07A5F';
                textColor = '#E07A5F';
              }
            } else if (elec.id === 'C4') {
              if (isC4Active) {
                circleFill = '#D5A6BD';
                strokeColor = '#E07A5F';
                textColor = '#FFFFFF';
              } else {
                strokeColor = '#D5A6BD';
                textColor = '#6B4A5C';
              }
            } else if (elec.id === 'Cz') {
              if (isCzActive) {
                circleFill = '#81B29A';
                strokeColor = '#FFFFFF';
                textColor = '#FFFFFF';
              } else {
                strokeColor = '#81B29A';
                textColor = '#2D5A46';
              }
            } else if (isSelected) {
              circleFill = '#FAF0E6';
              strokeColor = '#E07A5F';
            }

            const isPrimarySensoriMotor = elec.id === 'C3' || elec.id === 'Cz' || elec.id === 'C4';

            return (
              <g
                key={elec.id}
                onClick={() => onSelectElectrode(elec.id)}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isPrimarySensoriMotor ? 10.5 : 8.5}
                  fill={circleFill}
                  stroke={strokeColor}
                  strokeWidth={isPrimarySensoriMotor ? 2.5 : 1.8}
                />
                <text
                  x={cx}
                  y={cy + 3}
                  fontSize={isPrimarySensoriMotor ? "7.5" : "7"}
                  fontWeight="700"
                  fill={textColor}
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {elec.id}
                </text>
              </g>
            );
          })}
        </svg>

      </div>

      {/* Selected Electrode Quick Info */}
      <div className="mt-2 bg-white/80 rounded-xl p-3 border border-[#E3D5CA] text-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 font-bold text-[#3D3A37]">
            <Activity className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Canal {currentElectrodeData.name}</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-[#81B29A] text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            {currentElectrodeData.impedance} kΩ
          </span>
        </div>
        <p className="text-[11px] text-[#6B645C]">
          {currentElectrodeData.cortexRegion} • {currentElectrodeData.primaryFor}
        </p>
      </div>

    </div>
  );
};
