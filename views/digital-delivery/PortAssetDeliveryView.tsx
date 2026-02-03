
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Box, Truck, Container, Anchor, 
  CheckCircle2, AlertTriangle, FileText, 
  Settings, Activity, Search, Scan, 
  QrCode, Share2, Printer
} from 'lucide-react';

// --- MOCK DATA ---

const ASSET_BATCH = [
  { id: 'RS-001', name: '正面吊 (Reach Stacker)', type: 'Handling', status: 'Ready', image: 'RS' },
  { id: 'TT-012', name: '集卡 (Terminal Tractor)', type: 'Transport', status: 'Pending', image: 'TT' },
  { id: 'FL-005', name: '重型叉车 (Forklift)', type: 'Auxiliary', status: 'Ready', image: 'FL' },
  { id: 'ECH-08', name: '空箱堆高机', type: 'Handling', status: 'Ready', image: 'ECH' },
  { id: 'AGV-22', name: '自动导引车', type: 'Transport', status: 'Inspecting', image: 'AGV' },
];

const ASSET_DETAILS = {
  id: 'RS-001-2023',
  model: 'Kalmar RS-45',
  mfgDate: '2023-11-10',
  engine: 'Volvo TAD-1151',
  capacity: '45 Ton',
  hours: '0.5 h (Test)',
  warranty: '24 Months',
  config: ['Fire Suppression', 'Camera System', 'Smart Fleet Link']
};

const HANDOVER_FLOW = [
  { label: '出厂检验 (FAT)', status: 'Done', time: '11-12' },
  { label: '到港点验', status: 'Done', time: '11-20' },
  { label: '性能测试 (SAT)', status: 'Active', time: 'Now' },
  { label: '备件移交', status: 'Pending', time: '--' },
  { label: '最终签字', status: 'Pending', time: '--' },
];

export const PortAssetDeliveryView: React.FC = () => {
  const [selectedId, setSelectedId] = useState('RS-001');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0c1218] text-slate-200 relative overflow-hidden">
      
      {/* Background Tech Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#0c1218] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Box size={14} className="animate-pulse" /> Equipment Handover
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             港口设备设施 <span className="text-cyan-500 text-shadow-glow">资产数字交付</span>
          </h1>
        </div>
        
        {/* Batch Info */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Batch ID</span>
                 <span className="font-mono text-white font-bold text-lg">BATCH-2023-11</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Items Ready</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">12 / 15</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-2 border border-cyan-500/50">
                 <Share2 size={14} /> 批量归档
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Asset Matrix */}
          <div className="w-72 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="交付资产矩阵 (Assets)" subtitle="LIST" className="flex-1 border-cyan-900/50 bg-[#081016]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {/* Search */}
                      <div className="relative mb-2">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                          <input type="text" placeholder="Search ID / SN..." className="w-full bg-slate-900 border border-slate-700 rounded py-1.5 pl-8 pr-2 text-xs text-slate-300 outline-none focus:border-cyan-500"/>
                      </div>

                      {ASSET_BATCH.map((asset) => (
                          <div 
                            key={asset.id}
                            onClick={() => setSelectedId(asset.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group flex items-center gap-3
                                ${selectedId === asset.id 
                                    ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-cyan-700'}
                            `}
                          >
                              <div className={`p-2 rounded ${selectedId === asset.id ? 'bg-cyan-800 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                  {asset.type === 'Handling' ? <Box size={16}/> : asset.type === 'Transport' ? <Truck size={16}/> : <Settings size={16}/>}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="font-bold text-xs">{asset.id}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${asset.status === 'Ready' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                          {asset.status}
                                      </span>
                                  </div>
                                  <div className="text-[10px] opacity-70 truncate">{asset.name}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Showroom */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#05080c] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-port-asset" color="#0ea5e9" />
                  </div>

                  {/* HUD: Asset ID Overlay */}
                  <div className="absolute top-8 left-8 z-20 pointer-events-none">
                      <div className="text-6xl font-black text-white/5 tracking-tighter absolute -top-4 -left-4">
                          {selectedId}
                      </div>
                      <div className="relative">
                          <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">Asset Verification</div>
                          <div className="text-2xl font-bold text-white">{ASSET_DETAILS.model}</div>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> Geo-Fence OK</span>
                              <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> Telemetry OK</span>
                          </div>
                      </div>
                  </div>

                  {/* Scanning Status */}
                  <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end pointer-events-none">
                      <div className="flex items-center gap-2 mb-2">
                          <Scan size={20} className="text-cyan-400 animate-spin-slow" />
                          <span className="text-xs font-bold text-cyan-100">DIGITAL TWIN SCANNING</span>
                      </div>
                      <div className="w-48 h-1 bg-slate-800 rounded overflow-hidden">
                          <div className="h-full bg-cyan-500 w-[85%] animate-pulse"></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Digital Passport */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="数字资产护照 (Passport)" subtitle="ID" className="flex-1 border-cyan-900/50 bg-[#081016]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 h-full">
                      {/* Identity Section */}
                      <div className="flex gap-4 items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                          <div className="bg-white p-1 rounded">
                              <QrCode size={48} className="text-black"/>
                          </div>
                          <div>
                              <div className="text-[10px] text-slate-500 uppercase">Unique Asset Code</div>
                              <div className="text-sm font-mono font-bold text-white">{ASSET_DETAILS.id}</div>
                              <div className="text-[10px] text-cyan-400">Hash: 8a7c...2f1</div>
                          </div>
                      </div>

                      {/* Specs */}
                      <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2 pl-1">Specifications</div>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                                  <div className="text-[9px] text-slate-500">Engine</div>
                                  <div className="text-xs text-slate-200">{ASSET_DETAILS.engine}</div>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                                  <div className="text-[9px] text-slate-500">Capacity</div>
                                  <div className="text-xs text-slate-200">{ASSET_DETAILS.capacity}</div>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                                  <div className="text-[9px] text-slate-500">Hours</div>
                                  <div className="text-xs text-slate-200">{ASSET_DETAILS.hours}</div>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                                  <div className="text-[9px] text-slate-500">Warranty</div>
                                  <div className="text-xs text-green-400">{ASSET_DETAILS.warranty}</div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Configuration */}
                      <div className="space-y-1 mt-2">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1 pl-1">Configuration</div>
                          {ASSET_DETAILS.config.map((cfg, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                                  <CheckCircle2 size={10} className="text-cyan-500"/> {cfg}
                              </div>
                          ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-4 border-t border-slate-800 flex gap-2">
                          <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-xs text-slate-300 flex justify-center items-center gap-1 transition-colors">
                              <FileText size={12}/> Manuals
                          </button>
                          <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-xs text-slate-300 flex justify-center items-center gap-1 transition-colors">
                              <Printer size={12}/> Print Tag
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

      {/* BOTTOM: Handover Process */}
      <div className="h-20 bg-[#081016]/90 border-t border-cyan-900/30 z-20 px-10 flex items-center justify-center relative pointer-events-auto">
          <div className="flex items-center gap-4 w-full max-w-5xl">
              {HANDOVER_FLOW.map((step, i) => (
                  <div key={i} className="flex items-center flex-1 relative group">
                      <div className="flex flex-col items-center gap-1 min-w-[80px] z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                              ${step.status === 'Done' ? 'bg-cyan-600 border-cyan-500 text-white' : 
                                step.status === 'Active' ? 'bg-black border-cyan-400 text-cyan-400 shadow-[0_0_15px_#0ea5e9]' : 
                                'bg-slate-900 border-slate-700 text-slate-600'}
                          `}>
                              {step.status === 'Done' ? <CheckCircle2 size={16}/> : i+1}
                          </div>
                          <span className={`text-[10px] font-bold uppercase ${step.status === 'Active' ? 'text-cyan-300' : 'text-slate-500'}`}>{step.label}</span>
                          <span className="text-[9px] text-slate-600">{step.time}</span>
                      </div>
                      
                      {i < HANDOVER_FLOW.length - 1 && (
                          <div className="absolute top-4 left-[50%] w-full h-0.5 bg-slate-800 -z-0">
                              <div className={`h-full bg-cyan-600 transition-all duration-500 ${step.status === 'Done' ? 'w-full' : 'w-0'}`}></div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
