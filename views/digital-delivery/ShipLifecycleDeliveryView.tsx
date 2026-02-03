
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Ship, Anchor, FileText, CheckCircle2, 
  Database, GitCommit, Layers, Scan, 
  Settings, Clock, UploadCloud, ShieldCheck, 
  FileCode, Box, Share2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

// --- MOCK DATA ---

const LIFECYCLE_STEPS = [
  { id: 'DESIGN', label: '设计审批 (Approval)', status: 'Done', date: '2022-05' },
  { id: 'BUILD', label: '建造施工 (Construction)', status: 'Done', date: '2023-08' },
  { id: 'TRIAL', label: '海试验证 (Sea Trial)', status: 'Done', date: '2023-11' },
  { id: 'DELIVERY', label: '完工交付 (Delivery)', status: 'Active', date: 'Now' },
  { id: 'OPS', label: '运营维护 (Operation)', status: 'Pending', date: '--' },
];

const CERTIFICATES = [
  { name: 'Classification Cert', issuer: 'CCS', status: 'Valid', hash: '8a2f...9c1' },
  { name: 'IOPP Certificate', issuer: 'MSA', status: 'Valid', hash: 'b4d2...e55' },
  { name: 'Safety Construction', issuer: 'CCS', status: 'Valid', hash: '1f9a...33d' },
  { name: 'Load Line Cert', issuer: 'CCS', status: 'Valid', hash: 'e2c1...88b' },
];

const COMPLIANCE_DATA = [
  { subject: 'Structure', A: 100, fullMark: 100 },
  { subject: 'Stability', A: 98, fullMark: 100 },
  { subject: 'Emission', A: 92, fullMark: 100 },
  { subject: 'Safety', A: 96, fullMark: 100 },
  { subject: 'Machinery', A: 95, fullMark: 100 },
];

const DIGITAL_ASSETS = [
    { type: '3D Model', name: 'Hull_Structure.ifc', size: '1.2 GB', status: 'Synced' },
    { type: 'Drawing', name: 'General_Arrangement.pdf', size: '15 MB', status: 'Synced' },
    { type: 'Data', name: 'SeaTrial_Logs.csv', size: '450 MB', status: 'Synced' },
    { type: 'System', name: 'AMS_Config.json', size: '2 MB', status: 'Checking' },
];

export const ShipLifecycleDeliveryView: React.FC = () => {
  const [activeStep, setActiveStep] = useState('DELIVERY');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#02050b] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#02050b] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-blue-900/30 bg-gradient-to-r from-blue-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Ship size={14} className="animate-pulse" /> Vessel Digital Twin
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶全生命周期 <span className="text-cyan-500 text-shadow-glow">数字交付系统</span>
          </h1>
        </div>
        
        {/* Status Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">IMO Number</span>
                 <span className="font-mono text-white font-bold text-lg">9876543</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Class Notation</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">★ CSA 5/5</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 border border-blue-500/50">
                 <Share2 size={14} /> 电子签章移交
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Lifecycle Helix */}
          <div className="w-72 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="生命周期阶段 (Lifecycle)" subtitle="TIMELINE" className="flex-1 border-blue-900/50 bg-[#050814]/90 pointer-events-auto">
                  <div className="relative pl-6 space-y-8 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700/50">
                      {LIFECYCLE_STEPS.map((step) => (
                          <div 
                            key={step.id} 
                            onClick={() => setActiveStep(step.id)}
                            className={`relative group cursor-pointer transition-all ${activeStep === step.id ? 'translate-x-1' : ''}`}
                          >
                              <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#02050b] z-10 transition-all duration-300
                                  ${step.status === 'Done' ? 'bg-green-500 border-green-500' : 
                                    step.status === 'Active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}
                              `}></div>
                              
                              <div className={`p-3 rounded border transition-colors
                                  ${activeStep === step.id 
                                    ? 'bg-blue-900/30 border-cyan-500 text-white' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-blue-700'}
                              `}>
                                  <div className="text-sm font-bold mb-1">{step.label}</div>
                                  <div className="flex justify-between text-[10px] font-mono opacity-80">
                                      <span>{step.status}</span>
                                      <span>{step.date}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-ship-lifecycle" color="#22d3ee" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Scan size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Verification Scan</div>
                              <div className="text-sm font-bold text-white">Active</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Box size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Hull Integrity</div>
                              <div className="text-sm font-bold text-white">100%</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Digital Twin Label */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/60 px-6 py-2 rounded-full border border-blue-600 text-xs text-blue-200 pointer-events-none font-bold tracking-widest">
                      DIGITAL TWIN : <span className="text-white">MV OCEAN PIONEER</span>
                  </div>
              </div>
          </div>

          {/* RIGHT: Digital Vault & Compliance */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto">
              
              {/* Electronic Certificates */}
              <SciFiCard title="电子证书 (E-Cert)" subtitle="VALID" className="flex-1 border-blue-900/50 bg-[#050814]/90">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {CERTIFICATES.map((cert, i) => (
                          <div key={i} className="bg-slate-900/50 p-2.5 rounded border border-slate-800 flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                              <div>
                                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">{cert.name}</div>
                                  <div className="text-[9px] text-slate-500 font-mono">Hash: {cert.hash}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] text-blue-400">{cert.issuer}</div>
                                  <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold">
                                      <ShieldCheck size={10} /> {cert.status}
                                  </div>
                              </div>
                          </div>
                      ))}
                      <div className="mt-auto pt-3 border-t border-slate-800 text-center">
                          <button className="text-xs text-cyan-400 hover:text-white flex items-center justify-center gap-1 w-full">
                              <FileText size={12} /> Verify Signatures
                          </button>
                      </div>
                  </div>
              </SciFiCard>

              {/* Data Package */}
              <SciFiCard title="交付数据包" subtitle="ASSETS" className="h-[220px] border-blue-900/50 bg-[#050814]/90">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                      {DIGITAL_ASSETS.map((asset, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/30 hover:bg-slate-800 transition-colors cursor-pointer">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  {asset.type === '3D Model' ? <Box size={14} className="text-blue-400"/> : 
                                   asset.type === 'Data' ? <Database size={14} className="text-green-400"/> :
                                   <FileCode size={14} className="text-orange-400"/>}
                                  <span className="text-xs text-slate-300 truncate w-32">{asset.name}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex flex-col items-end">
                                  <span>{asset.size}</span>
                                  <span className={asset.status === 'Synced' ? 'text-green-500' : 'text-yellow-500'}>{asset.status}</span>
                              </div>
                          </div>
                      ))}
                      <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors text-xs">
                           <UploadCloud size={12} /> Download Package
                      </button>
                  </div>
              </SciFiCard>

              {/* Compliance Radar */}
              <SciFiCard title="合规性检查 (Audit)" subtitle="SCORE" className="h-[200px] border-blue-900/50 bg-[#050814]/90">
                  <div className="w-full h-full p-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={COMPLIANCE_DATA}>
                              <PolarGrid stroke="#1e3a8a" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 9 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#3b82f6', fontSize:'10px'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-0 right-0 text-xs font-bold text-green-400 bg-blue-900/30 px-2 py-1 rounded">Passed</div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
