import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ExplodedThreeScene } from '../../components/exploded/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-3d-explode]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-3d-explode';
import { 
  Box, 
  Layers, 
  Settings2, 
  Maximize2, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Wrench, 
  Info,
  ChevronRight,
  ListTree,
  Cpu,
  Eye,
  History,
  AlertCircle
} from 'lucide-react';

const BOM_DATA = [
  { id: 'p01', name: '底部基座 (Base)', material: 'Cast Iron', weight: '45kg', status: '正常' },
  { id: 'p02', name: '泵体外壳 (Housing)', material: 'Steel Alloy', weight: '28kg', status: '正常' },
  { id: 'p03', name: '定子绕组 (Stator)', material: 'Copper/Epoxy', weight: '15kg', status: '需清理' },
  { id: 'p04', name: '核心转子 (Rotor)', material: 'Stainless Steel', weight: '12kg', status: '正常' },
  { id: 'p05', name: '上端盖 (Top Cap)', material: 'Aluminum', weight: '8kg', status: '正常' },
  { id: 'p06', name: '密封轴承 (Bearing)', material: 'Hybrid Ceramic', weight: '0.5kg', status: '预警' },
];

export const ExplodedView: React.FC = () => {
  const [explodeFactor, setExplodeFactor] = useState(0.2);
  const [selectedPart, setSelectedPart] = useState<string | null>('p04');
  const [displayMode, setDisplayMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');

  const activePartData = BOM_DATA.find(p => p.id === selectedPart);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：操作状态与模式切换 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500 rounded flex items-center justify-center text-cyan-400">
              <Box size={24} />
           </div>
           <div>
              <div className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-bold mb-1">Interactive Digital Twin</div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 3D 拆解与 <span className="text-cyan-500">爆炸图交互</span> 终端
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 p-1 rounded border border-slate-800">
           {[
             { id: 'solid', label: '实体', icon: <Box size={14}/> },
             { id: 'wireframe', label: '线框', icon: <Layers size={14}/> },
             { id: 'xray', label: 'X光', icon: <Eye size={14}/> },
           ].map(mode => (
             <button
               key={mode.id}
               onClick={() => setDisplayMode(mode.id as any)}
               className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2
                 ${displayMode === mode.id ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-300'}
               `}
             >
               {mode.icon} {mode.label}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        {/* 3D 渲染主视窗 */}
        <div className="absolute inset-0 bg-[#020617] rounded-sm border border-white/5 overflow-hidden">
           <ExplodedThreeScene 
             explodeFactor={explodeFactor} 
             displayMode={displayMode}
             highlightedPartId={selectedPart}
             onPartSelect={(id) => setSelectedPart(id)}
           />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           
           {/* 背景网格装饰 */}
           <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* 左侧：零件分级目录 (BOM) */}
        <div className="absolute left-6 top-6 bottom-6 w-72 pointer-events-none">
           <SciFiCard title="零件分级目录" subtitle="BOM_STRUCTURE" className="h-full pointer-events-auto border-cyan-900/30">
              <div className="flex flex-col h-full">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="检索构件..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500"
                    />
                 </div>
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                    {BOM_DATA.map(item => (
                       <div 
                         key={item.id}
                         onClick={() => setSelectedPart(item.id)}
                         className={`p-3 rounded border transition-all cursor-pointer group flex items-center justify-between
                           ${selectedPart === item.id 
                             ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                             : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                         `}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`w-1.5 h-1.5 rounded-full ${item.status === '预警' ? 'bg-amber-500 animate-pulse' : 'bg-cyan-600'}`}></div>
                             <span className={`text-xs font-bold ${selectedPart === item.id ? 'text-white' : 'text-slate-400'}`}>{item.name}</span>
                          </div>
                          <ChevronRight size={12} className={selectedPart === item.id ? 'text-cyan-400' : 'text-slate-700'} />
                       </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                       <ListTree size={12} /> 导出物料清单
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：零件透视卡片 */}
        {selectedPart && activePartData && (
          <div className="absolute right-6 top-6 w-80 pointer-events-none">
            <SciFiCard title="构件技术透视" subtitle="SPECIFICATIONS" className="pointer-events-auto border-orange-900/30">
               <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                     <div>
                        <div className="text-[10px] font-mono text-orange-500 mb-1">PART_UID: {activePartData.id.toUpperCase()}</div>
                        <div className="text-lg font-bold text-white tracking-tight">{activePartData.name}</div>
                     </div>
                     <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${activePartData.status === '正常' ? 'bg-green-900/30 text-green-500' : 'bg-amber-900/30 text-amber-500'}
                     `}>{activePartData.status}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase">主要材质</div>
                        <div className="text-sm font-bold text-slate-200">{activePartData.material}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase">构件重量</div>
                        <div className="text-sm font-bold text-slate-200">{activePartData.weight}</div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 uppercase flex items-center gap-1"><Activity size={12}/> 磨损寿命检测</span>
                        <span className="text-orange-400 font-mono">82.5%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500" style={{ width: '82.5%' }}></div>
                     </div>
                  </div>

                  <div className="p-3 bg-orange-950/10 border-l-4 border-orange-500 rounded-r flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase">
                        <Zap size={14} /> 维修建议
                     </div>
                     <p className="text-[11px] text-slate-400 leading-normal">
                        检测到边缘存在微量油渍积聚，建议在本次大修中执行超声波清洗，并检查密封圈弹性。
                     </p>
                  </div>

                  <div className="flex gap-2">
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 transition-all uppercase">
                        调阅图纸
                     </button>
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 transition-all uppercase">
                        维修历史
                     </button>
                  </div>
               </div>
            </SciFiCard>
          </div>
        )}

        {/* 底部：控制中心 (爆炸系数滑块) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] pointer-events-none">
           <div className="bg-slate-900/90 border border-white/10 p-6 rounded-sm backdrop-blur-md pointer-events-auto flex items-center gap-8 shadow-2xl">
              <div className="flex flex-col gap-2 shrink-0">
                 <div className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <History size={12} /> Explosion Factor
                 </div>
                 <div className="text-xl font-bold text-white font-mono leading-none">{(explodeFactor * 100).toFixed(0)}<span className="text-xs text-slate-600 ml-1">%</span></div>
              </div>
              
              <div className="flex-1 flex flex-col gap-3">
                 <input 
                   type="range" 
                   min="0" max="1" step="0.01" 
                   value={explodeFactor}
                   onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                 />
                 <div className="flex justify-between text-[8px] text-slate-600 uppercase font-bold tracking-tighter">
                    <span>Collapsed</span>
                    <span>Assembled State</span>
                    <span>Partial Disassembly</span>
                    <span>Full Exploded View</span>
                 </div>
              </div>

              <div className="flex gap-2 shrink-0">
                 <button className="w-10 h-10 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 transition-colors">
                    <Wrench size={16} />
                 </button>
                 <button className="w-10 h-10 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 transition-colors">
                    <Maximize2 size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* 右下角：环境统计 */}
        <div className="absolute right-6 bottom-6 flex flex-col gap-3 pointer-events-none">
           <div className="bg-black/60 border border-slate-800 p-3 rounded backdrop-blur text-right">
              <div className="text-[9px] text-slate-500 uppercase">GPU Load</div>
              <div className="text-lg font-bold text-green-400 font-mono">14%</div>
           </div>
           <div className="bg-black/60 border border-slate-800 p-3 rounded backdrop-blur text-right">
              <div className="text-[9px] text-slate-500 uppercase">Vertices</div>
              <div className="text-lg font-bold text-white font-mono">14,204</div>
           </div>
        </div>

      </div>

      {/* 辅助 CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.4);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
        
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #0ea5e9;
          cursor: pointer;
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
        }
      `}</style>
    </div>
  );
};

// 辅助图标
const Search = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
