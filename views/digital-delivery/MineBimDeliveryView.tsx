
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-mine-bim]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-mine-bim';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Database, Layers, CheckCircle2, AlertTriangle, 
  Eye, FileText, Share2, Scan, Box, Search, 
  GitCommit, Activity
} from 'lucide-react';

const LAYERS = [
  { id: 'TOPO', label: '地形地貌 (Topography)', active: true },
  { id: 'GIM', label: '地质模型 (Geology)', active: true },
  { id: 'BIM', label: '井巷工程 (Infrastructure)', active: true },
  { id: 'MEP', label: '机电管网 (MEP)', active: false },
  { id: 'IOT', label: '安全监测 (Sensors)', active: false },
];

const VALIDATION_TASKS = [
  { id: 1, name: 'BIM-GIM 碰撞检测', status: 'Pass', val: '0 Conflicts' },
  { id: 2, name: '属性信息完整度', status: 'Pass', val: '99.8%' },
  { id: 3, name: '坐标系统一性', status: 'Pass', val: 'CGCS2000' },
  { id: 4, name: '拓扑连接检查', status: 'Warn', val: '2 Disconnected' },
];

const PACKAGES = [
  { name: 'Mine_Structure_LOD400.ifc', size: '4.2 GB', type: 'IFC' },
  { name: 'Geology_Block_Model.csv', size: '1.5 GB', type: 'Data' },
  { name: 'Drawing_Set_Final.dwg', size: '850 MB', type: 'CAD' },
];

export const MineBimDeliveryView: React.FC = () => {
  const [layers, setLayers] = useState(LAYERS);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0c121c] text-slate-200 relative overflow-hidden">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Layers size={14} className="animate-pulse" /> Integrated Digital Delivery
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山BIM/GIM <span className="text-cyan-500 text-shadow-glow">一体化模型交付</span>
          </h1>
        </div>
        
        {/* Status */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Model Precision</span>
                 <span className="font-mono text-white font-bold text-lg">LOD 400</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Data Volume</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">15.2 GB</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2 border border-cyan-500/50">
                 <Share2 size={14} /> 确认交付
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Layer Control */}
          <div className="w-72 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="模型层级管理 (Layers)" subtitle="VISIBILITY" className="flex-1 border-cyan-900/50 bg-[#08101a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 p-1">
                      {layers.map((layer) => (
                          <div 
                            key={layer.id}
                            onClick={() => toggleLayer(layer.id)}
                            className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border
                               ${layer.active 
                                  ? 'bg-cyan-900/30 border-cyan-500 text-white' 
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                            `}
                          >
                              <span className="text-xs font-bold">{layer.label}</span>
                              {layer.active ? <Eye size={14} className="text-cyan-400"/> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-800">
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-center">
                          <div className="text-[10px] text-slate-400 uppercase mb-1">Fusion Status</div>
                          <div className="text-sm font-bold text-green-400 flex items-center justify-center gap-2">
                              <GitCommit size={14}/> SYNCHRONIZED
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Fusion View */}
          <div className="flex-1 relative border border-cyan-800/40 rounded-lg overflow-hidden bg-[#030508]">
              {/* 3D Scene */}
              <div className="absolute inset-0">
                  <ThreeScene type="dd-mine-bim-delivery" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* HUD */}
              <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                      <Scan size={16} className="text-cyan-400 animate-pulse" />
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase">Scanning</div>
                          <div className="text-sm font-bold text-white">Active</div>
                      </div>
                  </div>
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-3 rounded border border-cyan-900 text-[10px] text-slate-300 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Infrastructure (BIM)</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-yellow-500 border border-yellow-300"></div> Ore Body (GIM)</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Verification Pass</div>
              </div>
          </div>

          {/* RIGHT: QA & Packages */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Automated QA */}
              <SciFiCard title="自动化合规检查 (QA)" subtitle="AUTO-CHECK" className="border-cyan-900/50 bg-[#08101a]/90 pointer-events-auto">
                  <div className="space-y-3">
                      {VALIDATION_TASKS.map((task) => (
                          <div key={task.id} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                              <div>
                                  <div className="text-xs text-slate-300 font-bold">{task.name}</div>
                                  <div className={`text-[10px] ${task.status === 'Pass' ? 'text-green-400' : 'text-yellow-400'}`}>{task.val}</div>
                              </div>
                              {task.status === 'Pass' ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertTriangle size={16} className="text-yellow-500"/>}
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Delivery Packages */}
              <SciFiCard title="交付数据包 (Packages)" subtitle="DOWNLOAD" className="flex-1 border-cyan-900/50 bg-[#08101a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full">
                      {PACKAGES.map((pkg, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-800 rounded text-slate-400 group-hover:text-cyan-400 transition-colors">
                                      {pkg.type === 'IFC' ? <Box size={14}/> : pkg.type === 'Data' ? <Database size={14}/> : <FileText size={14}/>}
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-200 group-hover:text-white">{pkg.name}</div>
                                      <div className="text-[10px] text-slate-500">{pkg.size}</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
