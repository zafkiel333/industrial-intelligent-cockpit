
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-channel-regulation]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-channel-regulation';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Anchor, FileSpreadsheet, ScanEye, 
  Map as MapIcon, Database, CheckCircle2, 
  Ruler, Activity, Share2, UploadCloud, 
  ArrowRight, Compass, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---

const PROJECT_SPECS = [
  { label: '航道等级', value: 'Class I (内河一级)', unit: '' },
  { label: '整治里程', value: '12.5', unit: 'km' },
  { label: '设计水深', value: '6.0', unit: 'm' },
  { label: '航道宽度', value: '180', unit: 'm' },
  { label: '疏浚土方', value: '45.2', unit: '万m³' },
];

const ASSET_LIST = [
  { id: 'DYKE-01', name: '1# 丁坝群 (Spur Dike)', status: 'Verified', type: 'Structure' },
  { id: 'REVET-A', name: 'A段护岸工程', status: 'Verified', type: 'Protection' },
  { id: 'REEF-X', name: 'X号炸礁区', status: 'Scanning', type: 'Dredging' },
  { id: 'MAT-05', name: '5# 软体排', status: 'Pending', type: 'Geotech' },
];

// Cross Section Profile (Design vs Actual)
const CROSS_SECTION_DATA = Array.from({length: 40}, (_, i) => {
    const x = i * 5; // Width 0 to 200m
    // Trapezoid Channel Shape
    // Bottom: 50 to 150. Slopes: 0-50, 150-200.
    let designZ = 0;
    if (x < 50) designZ = -2 - (x/50)*6; // Slope down to -8
    else if (x > 150) designZ = -8 + ((x-150)/50)*6; // Slope up
    else designZ = -8; // Bottom

    // Actual (with noise/silt)
    const actualZ = designZ + (Math.random() * 0.5) - 0.2; 
    
    return { x, design: designZ, actual: actualZ };
});

const QUALITY_AUDIT = [
    { item: '水深保证率', val: '98.5%', status: 'Pass' },
    { item: '航宽合格率', val: '100%', status: 'Pass' },
    { item: '抛石偏差', val: '< 0.5m', status: 'Pass' },
    { item: '扫床验收', val: 'No Obstacle', status: 'Pass' },
];

export const ChannelRegulationDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('SECTION');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020617] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#020617] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Waves size={14} className="animate-pulse" /> Hydrographic Digital Twin
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             航道整治工程 <span className="text-cyan-500 text-shadow-glow">数字移交控制台</span>
          </h1>
        </div>
        
        {/* Progress & Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Survey Coverage</span>
                 <span className="font-mono text-white font-bold text-lg">100%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Compliance</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">Pass</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-2 border border-cyan-500/50">
                 <Share2 size={14} /> 生成验收报告
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Project Parameters */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="工程概况 (Overview)" subtitle="SPECS" className="border-cyan-900/50 bg-[#050b14]/90 pointer-events-auto">
                  <div className="space-y-3 p-1">
                      {PROJECT_SPECS.map((spec, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-colors">
                              <span className="text-xs text-slate-400">{spec.label}</span>
                              <span className="text-sm font-bold text-white font-mono">{spec.value} <span className="text-[10px] font-normal text-slate-500">{spec.unit}</span></span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="整治资产清单" subtitle="ASSETS" className="flex-1 border-cyan-900/50 bg-[#050b14]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ASSET_LIST.map((asset, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded group hover:bg-slate-800 cursor-pointer transition-all">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-400`}>
                                      {asset.type === 'Structure' ? <Anchor size={14}/> : <Layers size={14}/>}
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-200">{asset.name}</div>
                                      <div className="text-[9px] text-slate-500">{asset.id}</div>
                                  </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                                  ${asset.status === 'Verified' ? 'bg-green-900/30 text-green-400' : 
                                    asset.status === 'Scanning' ? 'bg-blue-900/30 text-blue-400 animate-pulse' : 'bg-slate-700 text-slate-400'}
                              `}>{asset.status}</span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-channel-regulation" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <ScanEye size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Sonar Scan</div>
                              <div className="text-sm font-bold text-white">Active</div>
                          </div>
                      </div>
                  </div>

                  {/* Water Depth Readout */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none opacity-50">
                      <div className="text-4xl font-black text-white/10 tracking-[0.5em]">CHANNEL</div>
                      <div className="w-24 h-1 bg-cyan-500/20 mt-2"></div>
                  </div>
              </div>

              {/* Bottom: Cross-Section Analysis */}
              <SciFiCard title="断面高程比对 (Design vs As-Built)" subtitle="CROSS-SECTION" className="h-[240px] border-cyan-900/50 bg-[#050b14]" noPadding>
                  <div className="w-full h-full p-2 relative">
                      {/* Water Level Line */}
                      <div className="absolute top-[30%] left-10 right-4 h-0.5 bg-blue-500/50 border-t border-blue-400 border-dashed z-10"></div>
                      <div className="absolute top-[28%] right-6 text-[9px] text-blue-300">Water Level</div>

                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={CROSS_SECTION_DATA} margin={{top: 20, right: 20, bottom: 0, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="x" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }} domain={[-10, 2]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                              
                              <Area type="monotone" dataKey="actual" fill="#1e293b" stroke="#0ea5e9" strokeWidth={2} name="As-Built" />
                              <Line type="step" dataKey="design" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Design" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>
          </div>

          {/* RIGHT: Quality & Data */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Quality Audit */}
              <SciFiCard title="质量验评统计" subtitle="QC AUDIT" className="border-cyan-900/50 bg-[#050b14]/90 pointer-events-auto">
                  <div className="space-y-3 p-1">
                      {QUALITY_AUDIT.map((q, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/50 border border-slate-800 rounded">
                              <div className="flex items-center gap-2">
                                  <Activity size={14} className="text-cyan-500"/>
                                  <span className="text-xs text-slate-300">{q.item}</span>
                              </div>
                              <div className="text-right">
                                  <div className={`text-sm font-bold font-mono ${q.status === 'Pass' ? 'text-green-400' : 'text-yellow-400'}`}>{q.val}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Data Handover */}
              <SciFiCard title="数字化交付成果" subtitle="DELIVERABLES" className="flex-1 border-cyan-900/50 bg-[#050b14]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full justify-center">
                      <div className="p-3 border border-slate-700 rounded bg-slate-900/40 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-3">
                              <Database size={18} className="text-blue-400"/>
                              <div>
                                  <div className="text-xs font-bold text-white">Bathymetric Database</div>
                                  <div className="text-[10px] text-slate-500">XYZ Points • 2.5 GB</div>
                              </div>
                              <UploadCloud size={14} className="ml-auto text-slate-600 group-hover:text-cyan-400"/>
                          </div>
                      </div>
                      
                      <div className="p-3 border border-slate-700 rounded bg-slate-900/40 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-3">
                              <MapIcon size={18} className="text-orange-400"/>
                              <div>
                                  <div className="text-xs font-bold text-white">Electronic Charts (ENC)</div>
                                  <div className="text-[10px] text-slate-500">S-57 Format • 120 MB</div>
                              </div>
                              <UploadCloud size={14} className="ml-auto text-slate-600 group-hover:text-cyan-400"/>
                          </div>
                      </div>

                      <div className="p-3 border border-slate-700 rounded bg-slate-900/40 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-3">
                              <FileSpreadsheet size={18} className="text-green-400"/>
                              <div>
                                  <div className="text-xs font-bold text-white">Dredging Logs</div>
                                  <div className="text-[10px] text-slate-500">Daily Records • 15 MB</div>
                              </div>
                              <UploadCloud size={14} className="ml-auto text-slate-600 group-hover:text-cyan-400"/>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
