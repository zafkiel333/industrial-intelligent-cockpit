import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { BomThreeScene } from '../../components/maintenance_bom/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-bom-check]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-bom-check';
import { BomPart } from '../../components/maintenance_bom/three-types';
import { 
  Scan, 
  Search, 
  Box, 
  Database,
  FileCheck,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

// Mock Data
const BOM_PARTS: BomPart[] = [
  { id: 'P-01', name: 'Main Housing', type: 'housing', status: 'matched', position: [0, 0, 0] },
  { id: 'P-02', name: 'Drive Shaft', type: 'shaft', status: 'matched', position: [0, 0, 0], rotation: [0, 0, 1.57] },
  { id: 'P-03', name: 'Bearing Front', type: 'bearing', status: 'mismatch', position: [0, 0, 3.5] },
  { id: 'P-04', name: 'Bearing Rear', type: 'bearing', status: 'matched', position: [0, 0, -3.5] },
  { id: 'P-05', name: 'Input Gear', type: 'gear', status: 'matched', position: [0, 1.5, 0] },
  { id: 'P-06', name: 'Fastener Set A', type: 'fastener', status: 'missing', position: [1.5, 1.5, 1.5] },
  { id: 'P-07', name: 'Fastener Set B', type: 'fastener', status: 'surplus', position: [-1.5, -1.5, -1.5] },
];

const STATS_DATA = [
  { name: 'Matched', value: 4, color: '#10b981' },
  { name: 'Mismatch', value: 1, color: '#f59e0b' },
  { name: 'Missing', value: 1, color: '#ef4444' },
  { name: 'Surplus', value: 1, color: '#8b5cf6' },
];

export const BomCheckView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [explodeLevel, setExplodeLevel] = useState(0.5);

  const selectedPart = BOM_PARTS.find(p => p.id === selectedPartId);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              <Scan size={32} className="text-cyan-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 BOM Consistency Verification
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 维修 BOM <span className="text-cyan-500 italic">一致性校验</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">匹配率</div>
              <div className="text-xl font-mono font-bold text-white">85.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">异常项</div>
              <div className="text-xl font-mono font-bold text-red-500">2 Items</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left: Part List */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="物料清单对比" subtitle="COMPARE_LIST" highlight className="border-cyan-500/30 flex-1 overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden">
                 <div className="flex items-center gap-2 mb-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                    <Search size={14} className="text-slate-500" />
                    <input type="text" placeholder="Search Part ID..." className="bg-transparent border-none text-xs w-full outline-none text-white" />
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {BOM_PARTS.map(part => (
                       <div 
                         key={part.id}
                         onClick={() => setSelectedPartId(part.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group
                            ${selectedPartId === part.id 
                               ? 'bg-cyan-900/30 border-cyan-500' 
                               : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                          <div>
                             <div className="text-xs font-bold text-slate-200 group-hover:text-white">{part.name}</div>
                             <div className="text-[10px] text-slate-500 font-mono">{part.id}</div>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border
                             ${part.status === 'matched' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                               part.status === 'missing' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
                               part.status === 'mismatch' ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' :
                               'bg-purple-900/20 text-purple-400 border-purple-900/50'}
                          `}>
                             {part.status}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: 3D Visualization */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-cyan-900/30 rounded-lg overflow-hidden group">
              
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs">
                          <Box size={14} className="animate-pulse" />
                          ASSEMBLY VIEW
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Exploded <span className="text-cyan-500">Check</span>
                       </div>
                    </div>
                    {selectedPart && (
                       <div className="bg-black/60 border border-slate-700 p-3 rounded backdrop-blur text-right">
                          <div className="text-[10px] text-slate-500 uppercase">Selected Part</div>
                          <div className="text-sm font-bold text-white">{selectedPart.name}</div>
                          <div className={`text-xs font-mono font-bold mt-1 uppercase
                             ${selectedPart.status === 'matched' ? 'text-green-400' : 'text-red-400'}
                          `}>Status: {selectedPart.status}</div>
                       </div>
                    )}
                 </div>

                 {/* Explosion Slider */}
                 <div className="pointer-events-auto flex items-center justify-center w-full">
                    <div className="bg-black/60 border border-slate-700 p-3 rounded-full backdrop-blur w-2/3 flex items-center gap-4">
                       <span className="text-[10px] text-slate-400 uppercase font-bold">Assembly</span>
                       <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={explodeLevel}
                         onChange={(e) => setExplodeLevel(parseFloat(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                       <span className="text-[10px] text-slate-400 uppercase font-bold">Explode</span>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <BomThreeScene 
                    parts={BOM_PARTS}
                    selectedPartId={selectedPartId}
                    explodeLevel={explodeLevel}
                    onPartSelect={setSelectedPartId}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>
              
              {/* Background Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
           </div>
        </div>

        {/* Right: Analytics */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="校验结果统计" subtitle="STATS">
              <div className="h-48 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={STATS_DATA} 
                          cx="50%" cy="50%" 
                          innerRadius={40} outerRadius={60} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {STATS_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                    <span className="text-xl font-bold text-white">7</span>
                    <span className="text-[9px] text-slate-500 uppercase">Total Parts</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                 {STATS_DATA.map(s => (
                    <div key={s.name} className="flex items-center gap-2 text-[10px] text-slate-400">
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                       <span>{s.name}: {s.value}</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="操作建议" subtitle="ACTIONS" className="flex-1">
              <div className="space-y-3">
                 <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-red-300">发现缺失件</div>
                       <div className="text-[10px] text-slate-400 leading-tight mt-1">P-06 紧固件组缺失，建议立即补领。</div>
                    </div>
                 </div>
                 <div className="p-3 bg-amber-900/10 border border-amber-900/30 rounded flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-amber-300">型号不匹配</div>
                       <div className="text-[10px] text-slate-400 leading-tight mt-1">P-03 轴承规格偏差，需确认替代性。</div>
                    </div>
                 </div>
                 <button className="w-full mt-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2">
                    <FileCheck size={14} /> 生成校验报告
                 </button>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};