
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Ship, Anchor, Ruler, Activity, ArrowRightLeft, 
  Scale, AlertTriangle, CheckCircle2, XCircle, 
  Info, Waves, Wind, BookOpen, Calculator,
  Maximize2, Minimize2
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts';

// --- Mock Data ---

const SHIP_MODELS = [
  { 
    id: 'S-3000', 
    name: '3000吨级内河货船', 
    type: 'General Cargo',
    loa: 98.0, 
    beam: 16.2, 
    designDraft: 4.2, 
    airDraft: 8.5,
    blockCoeff: 0.82 
  },
  { 
    id: 'S-10000', 
    name: '10000吨级江海直达船', 
    type: 'Bulk Carrier',
    loa: 135.0, 
    beam: 22.8, 
    designDraft: 6.8, 
    airDraft: 12.0,
    blockCoeff: 0.85
  },
  { 
    id: 'S-CONTAINER', 
    name: '500TEU 集装箱船', 
    type: 'Container',
    loa: 110.0, 
    beam: 19.2, 
    designDraft: 5.5, 
    airDraft: 18.0, // High air draft
    blockCoeff: 0.70
  }
];

const CHANNEL_SEGMENTS = [
  { 
    id: 'C-STRAIGHT', 
    name: 'A航段-标准直线段', 
    width: 120, // Bottom width
    depth: 8.5, 
    sideSlope: 3, // 1:3 slope
    bridgeHeight: 999, // No bridge
    current: 1.2 
  },
  { 
    id: 'C-BRIDGE', 
    name: 'B航段-大桥通航孔', 
    width: 90, 
    depth: 9.0, 
    sideSlope: 0, // Vertical walls (piers)
    bridgeHeight: 15.0, // Restriction
    current: 1.8 
  },
  { 
    id: 'C-BEND', 
    name: 'C航段-急弯扩宽段', 
    width: 150, 
    depth: 7.5, 
    sideSlope: 4, 
    bridgeHeight: 999,
    current: 0.8 
  }
];

const RULES_DB = [
  { id: 'R-W01', name: '双向通航宽度准则', logic: 'Width > 2 * (Beam + Drift) + SafetyGap' },
  { id: 'R-D02', name: '富余水深 (UKC) 规范', logic: 'Depth - Draft - Squat > 0.5m' },
  { id: 'R-H03', name: '桥梁净空高度限制', logic: 'BridgeHeight - AirDraft - Tide > 2.0m' },
  { id: 'R-B04', name: '阻塞比 (Blockage Factor)', logic: 'CrossSectionShip / CrossSectionChannel < 0.2' },
];

export const ShipChannelAdaptKbView: React.FC = () => {
  const [selectedShipId, setSelectedShipId] = useState('S-10000');
  const [selectedChannelId, setSelectedChannelId] = useState('C-STRAIGHT');
  
  // Dynamic Simulation Parameters
  const [tideLevel, setTideLevel] = useState(1.5); // m
  const [shipSpeed, setShipSpeed] = useState(8); // knots

  // --- Calculations ---
  const ship = SHIP_MODELS.find(s => s.id === selectedShipId) || SHIP_MODELS[0];
  const channel = CHANNEL_SEGMENTS.find(c => c.id === selectedChannelId) || CHANNEL_SEGMENTS[0];

  // 1. Calculate Squat (Simplified formula: Cb * V^2 / 100)
  const squat = (ship.blockCoeff * Math.pow(shipSpeed * 0.5144, 2)) / 5; // Rough approximation
  const actualDraft = ship.designDraft + squat;
  const availableDepth = channel.depth + tideLevel;
  const ukc = availableDepth - actualDraft;

  // 2. Calculate Air Draft Clearance
  const actualAirDraft = ship.airDraft; // Simplified (usually reduced by draft increase)
  const availableHeight = channel.bridgeHeight; 
  const overheadClearance = availableHeight - actualAirDraft;

  // 3. Blockage Factor
  const channelSectionArea = (channel.width + (channel.width + 2 * channel.depth * channel.sideSlope)) / 2 * channel.depth; // Trapezoid
  const shipSectionArea = ship.beam * ship.designDraft * 0.98; // Midship section
  const blockageFactor = shipSectionArea / (channelSectionArea + (channel.width * tideLevel)); // Add tide area

  // 4. Width Suitability (Simplified 1-way)
  const requiredWidth = ship.beam * 1.5 + ship.loa * Math.sin(5 * Math.PI/180); // Beam + drift allowance
  const widthMargin = channel.width - requiredWidth;

  // Pass/Fail Logic
  const checks = [
    { name: '水深适配 (Depth)', status: ukc >= 0.5 ? 'PASS' : 'FAIL', val: `${ukc.toFixed(2)}m`, limit: '>0.5m' },
    { name: '净空高度 (Height)', status: overheadClearance >= 1.0 ? 'PASS' : (channel.bridgeHeight > 100 ? 'N/A' : 'FAIL'), val: channel.bridgeHeight > 100 ? '∞' : `${overheadClearance.toFixed(1)}m`, limit: '>1.0m' },
    { name: '阻塞比 (Blockage)', status: blockageFactor <= 0.2 ? 'PASS' : 'WARNING', val: `${(blockageFactor*100).toFixed(1)}%`, limit: '<20%' },
    { name: '航道宽度 (Width)', status: widthMargin >= 20 ? 'PASS' : 'WARNING', val: `${widthMargin.toFixed(1)}m`, limit: '>20m' },
  ];

  const overallStatus = checks.some(c => c.status === 'FAIL') ? 'PROHIBITED' 
                      : checks.some(c => c.status === 'WARNING') ? 'RESTRICTED' 
                      : 'ALLOWED';

  // Radar Data
  const radarData = [
    { subject: 'Depth Margin', A: Math.min(100, (ukc / 3) * 100), fullMark: 100 },
    { subject: 'Width Margin', A: Math.min(100, (widthMargin / 50) * 100), fullMark: 100 },
    { subject: 'Hydrodynamics', A: Math.max(0, 100 - blockageFactor * 400), fullMark: 100 },
    { subject: 'Height Margin', A: channel.bridgeHeight > 100 ? 100 : Math.min(100, overheadClearance * 10), fullMark: 100 },
    { subject: 'Speed Limit', A: Math.max(0, 100 - squat * 50), fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0f172a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Scale size={14} /> Compatibility Engine
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船型与航道 <span className="text-cyan-500">智能适配分析</span>
          </h1>
        </div>
        <div className="flex gap-4">
            <div className={`px-4 py-2 rounded border-2 font-bold text-lg flex items-center gap-2
                ${overallStatus === 'ALLOWED' ? 'border-green-500 bg-green-900/20 text-green-400' : 
                  overallStatus === 'RESTRICTED' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-400' : 'border-red-500 bg-red-900/20 text-red-400'}
            `}>
                {overallStatus === 'ALLOWED' && <CheckCircle2 />}
                {overallStatus === 'RESTRICTED' && <AlertTriangle />}
                {overallStatus === 'PROHIBITED' && <XCircle />}
                {overallStatus === 'ALLOWED' ? '适航 (SAFE)' : overallStatus === 'RESTRICTED' ? '受限 (RESTRICTED)' : '禁航 (NO GO)'}
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Selectors */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-y-auto pr-1">
           
           {/* Ship Selector */}
           <SciFiCard title="船舶模型库" subtitle="DESIGN SHIP" className="border-cyan-900/50">
               <div className="flex flex-col gap-2">
                   {SHIP_MODELS.map(s => (
                       <div 
                         key={s.id} 
                         onClick={() => setSelectedShipId(s.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-1
                            ${selectedShipId === s.id ? 'bg-cyan-900/30 border-cyan-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-slate-800'}
                         `}
                       >
                           <div className="flex justify-between items-center">
                               <span className="font-bold text-sm">{s.name}</span>
                               {selectedShipId === s.id && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div>}
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] font-mono opacity-80">
                               <span>L: {s.loa}m</span>
                               <span>B: {s.beam}m</span>
                               <span>T: {s.designDraft}m</span>
                               <span>Air: {s.airDraft}m</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Channel Selector */}
           <SciFiCard title="航道段模型库" subtitle="CHANNEL SEGMENT" className="border-cyan-900/50">
               <div className="flex flex-col gap-2">
                   {CHANNEL_SEGMENTS.map(c => (
                       <div 
                         key={c.id} 
                         onClick={() => setSelectedChannelId(c.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-1
                            ${selectedChannelId === c.id ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-slate-800'}
                         `}
                       >
                           <div className="flex justify-between items-center">
                               <span className="font-bold text-sm">{c.name}</span>
                               {selectedChannelId === c.id && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_blue]"></div>}
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] font-mono opacity-80">
                               <span>W: {c.width}m</span>
                               <span>D: {c.depth}m</span>
                               <span>H: {c.bridgeHeight > 100 ? '-' : c.bridgeHeight}m</span>
                               <span>Cur: {c.current}kn</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Visualization Engine */}
        <div className="flex-1 flex flex-col gap-6">
           
           {/* Cross Section Visualizer */}
           <SciFiCard title="适配断面仿真" subtitle="CROSS-SECTION VIEW" className="flex-1 border-cyan-900/50 bg-[#080c14]" noPadding>
               <div className="w-full h-full relative overflow-hidden flex flex-col">
                   <div className="flex-1 relative">
                       {/* Simplified SVG Visualization */}
                       <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                           <defs>
                               <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1">
                                   <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4"/>
                                   <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8"/>
                               </linearGradient>
                               <pattern id="groundPat" width="10" height="10" patternUnits="userSpaceOnUse">
                                   <rect width="10" height="10" fill="#1e293b"/>
                                   <path d="M0 10L10 0" stroke="#334155" strokeWidth="1"/>
                               </pattern>
                           </defs>

                           {/* Ground / Channel Bed */}
                           {/* Calculating points based on selected channel width/slope */}
                           {(() => {
                               const scale = 1.5; // Visual scale
                               const midX = 200;
                               const bottomY = 180;
                               const bedW = channel.width * scale; // Scaled width
                               const depth = (channel.depth + tideLevel) * scale * 4; // Vertical exaggeration
                               const slope = channel.sideSlope * scale * 4; // Simplified slope width
                               
                               const waterY = bottomY - depth;
                               
                               return (
                                   <>
                                       {/* Channel Bed */}
                                       <path d={`
                                           M0,${bottomY} 
                                           L${midX - bedW/2 - slope * 10},${bottomY - 50} 
                                           L${midX - bedW/2},${bottomY} 
                                           L${midX + bedW/2},${bottomY} 
                                           L${midX + bedW/2 + slope * 10},${bottomY - 50}
                                           L400,${bottomY}
                                           L400,200 L0,200 Z
                                       `} fill="url(#groundPat)" />

                                       {/* Water */}
                                       <path d={`
                                           M${midX - bedW/2 - slope * depth/5},${waterY} 
                                           L${midX - bedW/2},${bottomY} 
                                           L${midX + bedW/2},${bottomY} 
                                           L${midX + bedW/2 + slope * depth/5},${waterY} 
                                           Z
                                       `} fill="url(#waterGrad)" />
                                       
                                       {/* Water Surface Line */}
                                       <line x1="0" y1={waterY} x2="400" y2={waterY} stroke="#38bdf8" strokeDasharray="5 2" opacity="0.5" />
                                       <text x="10" y={waterY - 5} fill="#38bdf8" fontSize="8">Tide: +{tideLevel}m</text>

                                       {/* Bridge (If exists) */}
                                       {channel.bridgeHeight < 100 && (
                                           <g>
                                               <rect x="0" y={waterY - (channel.bridgeHeight * scale * 4) + depth} width="400" height="10" fill="#64748b" />
                                               <text x="350" y={waterY - (channel.bridgeHeight * scale * 4) + depth - 5} fill="#94a3b8" fontSize="8" textAnchor="end">Bridge Clearance</text>
                                               {/* Vertical clearance line */}
                                               <line x1={midX} y1={waterY} x2={midX} y2={waterY - (channel.bridgeHeight * scale * 4) + depth} stroke="#ef4444" strokeDasharray="2 2" />
                                           </g>
                                       )}

                                       {/* Ship Hull */}
                                       <g transform={`translate(${midX}, ${waterY + actualDraft * scale * 4 - (ship.designDraft * scale * 4)})`}>
                                           {/* Hull Body */}
                                           <path d={`
                                               M${-ship.beam * scale / 2},${-ship.airDraft * scale * 2} 
                                               L${ship.beam * scale / 2},${-ship.airDraft * scale * 2} 
                                               L${ship.beam * scale / 2},${ship.designDraft * scale * 4} 
                                               L${-ship.beam * scale / 2},${ship.designDraft * scale * 4} 
                                               Z
                                           `} fill="#475569" stroke="white" strokeWidth="1" />
                                           
                                           {/* Squat Indicator */}
                                           {squat > 0.1 && (
                                               <rect x={-ship.beam * scale / 2} y={ship.designDraft * scale * 4} width={ship.beam * scale} height={squat * scale * 4} fill="#ef4444" opacity="0.5" />
                                           )}

                                           {/* Centerline */}
                                           <line x1="0" y1={-ship.airDraft * scale * 2} x2="0" y2={ship.designDraft * scale * 4 + 10} stroke="#f59e0b" strokeDasharray="4 1" />
                                       </g>
                                       
                                       {/* UKC Arrow */}
                                       <g>
                                           <line x1={midX + 20} y1={waterY + actualDraft * scale * 4} x2={midX + 20} y2={bottomY} stroke={ukc < 0.5 ? '#ef4444' : '#22c55e'} markerEnd="url(#arrow)" />
                                           <text x={midX + 25} y={bottomY - 5} fill={ukc < 0.5 ? '#ef4444' : '#22c55e'} fontSize="10" fontWeight="bold">UKC: {ukc.toFixed(2)}m</text>
                                       </g>
                                   </>
                               );
                           })()}
                       </svg>
                   </div>

                   {/* Simulation Controls */}
                   <div className="h-24 bg-slate-900/80 border-t border-cyan-900/50 p-4 grid grid-cols-2 gap-8 items-center">
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs text-cyan-300">
                               <span className="flex items-center gap-1"><Waves size={12}/> 潮位 Tide Level</span>
                               <span className="font-mono">{tideLevel} m</span>
                           </div>
                           <input 
                             type="range" min="0" max="5" step="0.1" 
                             value={tideLevel} onChange={(e) => setTideLevel(parseFloat(e.target.value))}
                             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                       </div>
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs text-orange-300">
                               <span className="flex items-center gap-1"><Wind size={12}/> 船速 Ship Speed</span>
                               <span className="font-mono">{shipSpeed} kn</span>
                           </div>
                           <input 
                             type="range" min="0" max="15" step="0.5" 
                             value={shipSpeed} onChange={(e) => setShipSpeed(parseFloat(e.target.value))}
                             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                           />
                           <div className="text-[10px] text-right text-slate-500">Squat Effect: {squat.toFixed(2)}m</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Knowledge & Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* Adaptation Report */}
           <SciFiCard title="适配性分析报告" subtitle="COMPLIANCE" className="border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   {checks.map((check, i) => (
                       <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                           <div>
                               <div className="text-xs text-slate-400">{check.name}</div>
                               <div className="text-[10px] text-slate-600">Req: {check.limit}</div>
                           </div>
                           <div className="text-right">
                               <div className="text-sm font-mono font-bold text-white">{check.val}</div>
                               <span className={`text-[10px] px-1.5 rounded font-bold
                                   ${check.status === 'PASS' ? 'bg-green-900/30 text-green-400' : 
                                     check.status === 'WARNING' ? 'bg-yellow-900/30 text-yellow-400' : 
                                     check.status === 'N/A' ? 'bg-slate-800 text-slate-500' : 'bg-red-900/30 text-red-400'}
                               `}>
                                   {check.status}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Risk Radar */}
           <SciFiCard title="综合风险评估" className="flex-1 border-cyan-900/50">
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Safety Margin" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '12px'}} />
                      </RadarChart>
                   </ResponsiveContainer>
               </div>
               
               {/* Triggered Rules */}
               <div className="mt-4">
                   <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                       <BookOpen size={12} /> Active Constraints
                   </div>
                   <ul className="space-y-1">
                       {RULES_DB.map(r => (
                           <li key={r.id} className="text-[10px] text-slate-400 flex gap-2">
                               <span className="text-cyan-600 font-bold">{r.id}</span>
                               <span className="truncate">{r.name}</span>
                           </li>
                       ))}
                   </ul>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
