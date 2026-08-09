
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-port-completion]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-port-completion';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, CheckCircle2, Box, FileText, 
  Scan, UploadCloud, Database, ShieldCheck,
  TrendingUp, Layers, Map as MapIcon, Share2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';

// --- MOCK DATA ---

const ASSET_TREE = [
  { id: 'ZONE-A', label: '集装箱码头 A区', status: 'Verified', children: [
      { id: 'BERTH-01', label: '1# 泊位 (Berth)', status: 'Pass' },
      { id: 'QC-SET', label: '岸桥组 (QC Group)', status: 'Pass' },
      { id: 'YARD-A', label: '堆场 A (Yard)', status: 'Scanning' }
  ]},
  { id: 'ZONE-B', label: '散货码头 B区', status: 'Pending', children: [
      { id: 'BERTH-02', label: '2# 泊位 (Berth)', status: 'Pending' }
  ]},
  { id: 'INFRA', label: '港区基础设施', status: 'Active', children: [
      { id: 'ROAD', label: '道路管网', status: 'Active' },
      { id: 'POWER', label: '变电站', status: 'Pass' }
  ]}
];

const QUALITY_METRICS = [
  { subject: '几何精度', A: 95, fullMark: 100 },
  { subject: '属性完整', A: 92, fullMark: 100 },
  { subject: '拓扑关系', A: 88, fullMark: 100 },
  { subject: '编码规范', A: 100, fullMark: 100 },
  { subject: '文档关联', A: 90, fullMark: 100 },
];

const DOC_LIST = [
  { id: 'D-01', name: '竣工测量报告.pdf', size: '12 MB', type: 'Report' },
  { id: 'D-02', name: '码头结构计算书.docx', size: '5 MB', type: 'Calc' },
  { id: 'D-03', name: '设备安装图册.dwg', size: '45 MB', type: 'CAD' },
  { id: 'D-04', name: 'BIM模型文件.ifc', size: '120 MB', type: 'Model' },
];

const HANDOVER_TIMELINE = [
    { label: '土建完工', date: '2023-08', status: 'Done' },
    { label: '设备联调', date: '2023-10', status: 'Done' },
    { label: '数字化采集', date: '2023-11', status: 'Active' },
    { label: '预验收', date: '2023-12', status: 'Pending' },
];

export const PortCompletionDeliveryView: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState('BERTH-01');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020408] text-slate-200 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020408] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-20 px-8 py-5 flex justify-between items-start pointer-events-none border-b border-blue-900/30 bg-gradient-to-r from-blue-950/80 to-transparent">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-[0.2em] font-bold animate-pulse">
                 <Anchor size={14} /> Port Digital Twin Delivery
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-lg">
                 港口工程竣工 <span className="text-blue-500">数字化交付平台</span>
              </h1>
          </div>
          
          <div className="flex gap-4 pointer-events-auto items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">Overall Progress</span>
                 <span className="text-xl font-mono text-white font-bold">85.4%</span>
             </div>
             <div className="w-px h-8 bg-slate-700 mx-2"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">Data Health</span>
                 <span className="text-xl font-mono text-green-400 font-bold">A+</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-blue-700/80 hover:bg-blue-600 text-white border border-blue-500/50 rounded font-bold uppercase tracking-wider transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                 <UploadCloud size={16} /> 签署交付证书
             </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 p-6 flex gap-6 min-h-0">
          
          {/* LEFT: Asset Hierarchy */}
          <div className="w-72 flex flex-col gap-4 pointer-events-auto">
              <SciFiCard title="交付对象分解 (WBS)" subtitle="HIERARCHY" className="flex-1 border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ASSET_TREE.map((zone) => (
                          <div key={zone.id} className="mb-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/60 p-2 rounded mb-1">
                                  <MapIcon size={12} className="text-blue-400"/> {zone.label}
                              </div>
                              <div className="pl-3 space-y-1">
                                  {zone.children.map(item => (
                                      <div 
                                        key={item.id}
                                        onClick={() => setActiveAsset(item.id)}
                                        className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all border
                                            ${activeAsset === item.id 
                                                ? 'bg-blue-900/30 border-blue-500 text-white' 
                                                : 'bg-transparent border-slate-800 text-slate-400 hover:border-blue-700'}
                                        `}
                                      >
                                          <span className="text-xs">{item.label}</span>
                                          {item.status === 'Pass' ? <CheckCircle2 size={12} className="text-green-500"/> : 
                                           item.status === 'Scanning' ? <Scan size={12} className="text-blue-400 animate-pulse"/> : 
                                           <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Twin */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-port-completion" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Layers size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Active Layer</div>
                              <div className="text-sm font-bold text-white">Structural + MEP</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-3 rounded border border-blue-900 text-[10px] text-slate-300 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Water Infrastructure</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Port Machinery</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Verified Asset</div>
                  </div>
              </div>

              {/* Bottom: Timeline */}
              <div className="h-24 bg-[#050b14]/90 border border-blue-900/30 rounded p-4 flex items-center justify-between pointer-events-auto">
                  {HANDOVER_TIMELINE.map((step, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center relative group">
                          {i !== HANDOVER_TIMELINE.length - 1 && (
                              <div className="absolute top-3 left-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
                          )}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-2 z-10 bg-[#050b14]
                              ${step.status === 'Done' ? 'border-green-500 text-green-500' : 
                                step.status === 'Active' ? 'border-blue-500 text-blue-500 animate-pulse' : 'border-slate-700 text-slate-700'}
                          `}>
                              <div className={`w-2 h-2 rounded-full ${step.status === 'Done' ? 'bg-green-500' : step.status === 'Active' ? 'bg-blue-500' : ''}`}></div>
                          </div>
                          <div className="text-xs font-bold text-slate-200">{step.label}</div>
                          <div className="text-[10px] text-slate-500">{step.date}</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT: Validation & Docs */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto">
              
              {/* Quality Metrics */}
              <SciFiCard title="模型质量评分 (Audit)" subtitle="SCORE" className="h-[280px] border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={QUALITY_METRICS}>
                              <PolarGrid stroke="#1e3a8a" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#3b82f6'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-xs font-bold text-green-400 bg-blue-900/30 px-2 py-1 rounded">Pass</div>
                  </div>
              </SciFiCard>

              {/* Document List */}
              <SciFiCard title="竣工资料包 (Artifacts)" subtitle="FILES" className="flex-1 border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-1">
                      {DOC_LIST.map((doc, i) => (
                          <div key={i} className="p-2 border border-slate-800 bg-slate-900/30 rounded flex items-center justify-between group hover:border-blue-600/50 cursor-pointer">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText size={16} className="text-blue-400 shrink-0"/>
                                  <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white">{doc.name}</div>
                                      <div className="text-[10px] text-slate-500">{doc.type} • {doc.size}</div>
                                  </div>
                              </div>
                              <Share2 size={14} className="text-slate-600 group-hover:text-blue-400"/>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-3 border-t border-slate-800">
                          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                              <Database size={12} /> View Full Repository
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
