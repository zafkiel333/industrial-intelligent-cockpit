
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { AutomationThreeScene } from '../../components/spare_parts_automation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-automation-sys]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-automation-sys';
import { PLCModule } from '../../components/spare_parts_automation/three-types';
import { 
  Cpu, 
  Server, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  GitBranch, 
  RefreshCw, 
  Settings,
  HardDrive,
  Network,
  Zap,
  CheckCircle2,
  Box,
  FileCode,
  Download,
  Terminal,
  Scan,
  BookOpen,
  Database,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

const PLC_MODULES: PLCModule[] = [
  { id: 'PS-101', name: '电源模块 24VDC', slotIndex: 0, type: 'PWR', status: 'normal', temperature: 42, firmware: 'v1.2' },
  { id: 'CPU-315', name: '主控 CPU 315-2DP', slotIndex: 1, type: 'CPU', status: 'normal', temperature: 55, firmware: 'v4.5' },
  { id: 'IM-360', name: '接口模块 IM360', slotIndex: 2, type: 'COMM', status: 'normal', temperature: 40, firmware: 'v1.0' },
  { id: 'DI-32', name: '数字量输入 32x24V', slotIndex: 3, type: 'IO', status: 'normal', temperature: 38, firmware: 'N/A' },
  { id: 'DO-32', name: '数字量输出 32x24V', slotIndex: 4, type: 'IO', status: 'warning', temperature: 62, firmware: 'N/A' }, // Overheat warning
  { id: 'AI-8', name: '模拟量输入 8x16bit', slotIndex: 5, type: 'IO', status: 'normal', temperature: 45, firmware: 'v2.1' },
  { id: 'AO-4', name: '模拟量输出 4x12bit', slotIndex: 6, type: 'IO', status: 'error', temperature: 25, firmware: 'v2.0' }, // Fault
  { id: 'CP-343', name: '以太网通讯 CP343', slotIndex: 7, type: 'COMM', status: 'normal', temperature: 48, firmware: 'v3.2' },
];

const COMPATIBILITY_MATRIX = [
  { subject: '固件版本', A: 100, fullMark: 100 },
  { subject: '背板带宽', A: 85, fullMark: 100 },
  { subject: '电气接口', A: 100, fullMark: 100 },
  { subject: '热设计功耗', A: 75, fullMark: 100 },
  { subject: '通讯协议', A: 90, fullMark: 100 },
];

const FIRMWARE_LIFECYCLE = [
  { name: 'v1.0', usage: 10, status: 'EOL' },
  { name: 'v2.0', usage: 35, status: 'Active' },
  { name: 'v3.0', usage: 45, status: 'Recommended' },
  { name: 'v4.0', usage: 10, status: 'Beta' },
];

const NETWORK_LOAD = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    load: 20 + Math.random() * 40 + (i > 9 && i < 17 ? 30 : 0) // Peak during day
}));

export const AutomationSysView: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('CPU-315');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeModule = PLC_MODULES.find(m => m.id === selectedModuleId) || PLC_MODULES[1];

  const handleDiagnosis = () => {
    setIsDiagnosing(true);
    setTimeout(() => setIsDiagnosing(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02050e]">
      
      {/* 顶部：自动化控制中心抬头 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border-2 border-indigo-400/50 relative group">
              <Cpu size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-indigo-500/20 rounded-sm animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Automation Control Assets
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 电站自动化 <span className="text-indigo-500 italic">控制系统备件库</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">LCU 在线率</div>
              <div className="text-2xl font-mono font-bold text-white">99.9%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">冗余健康度</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">Stable</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">版本一致性</div>
              <div className="text-2xl font-mono font-bold text-purple-400">95.2%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：机架配置树 (Rack View) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="LCU 模块配置" subtitle="RACK_01" highlight className="flex-1 border-indigo-900/30">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="查找模块 ID..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 {PLC_MODULES.map(mod => (
                    <div 
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between group
                         ${selectedModuleId === mod.id 
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${mod.type === 'PWR' ? 'bg-amber-500' : mod.type === 'CPU' ? 'bg-indigo-500' : 'bg-cyan-500'}`}></div>
                          <div>
                             <div className="text-[10px] font-mono text-slate-500">SLOT {mod.slotIndex}</div>
                             <div className="text-xs font-bold text-slate-200 group-hover:text-white">{mod.name}</div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-1">
                          <span className={`text-[8px] px-1.5 rounded uppercase font-bold
                             ${mod.status === 'normal' ? 'bg-green-900/30 text-green-400' : mod.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400'}
                          `}>{mod.status}</span>
                          <span className="text-[9px] text-slate-600 font-mono">{mod.firmware}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-indigo-500" /> 固件安全审计
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-red-500">
                 发现 AO-4 模块固件版本 (v2.0) 存在已知溢出漏洞 (CVE-2023-XX)，建议升级至 v2.2 以上。
              </div>
           </div>
        </div>

        {/* 中枢：PLC 数字孪生 (Digital Twin) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020205] border border-indigo-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Server size={14} className="animate-pulse" />
                          PLC RACK DIAGNOSTICS
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          SIMATIC <span className="text-indigo-500 italic">S7-300</span> Twin
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                        <div className="bg-black/60 border border-indigo-500/30 p-2 rounded backdrop-blur-md flex items-center gap-3">
                           <Activity size={16} className="text-green-500" />
                           <div>
                              <div className="text-[9px] text-slate-500 uppercase">System Heartbeat</div>
                              <div className="text-xs font-mono font-bold text-white">10ms Cycle</div>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* 选中模块详情浮窗 */}
                 <div className="pointer-events-auto bg-slate-900/90 border-l-4 border-indigo-500 p-4 rounded-r-sm backdrop-blur-md animate-in slide-in-from-bottom-4 shadow-2xl max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Module</span>
                       <div className="flex gap-2">
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">{activeModule.type}</span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">{activeModule.id}</span>
                       </div>
                    </div>
                    <div className="text-lg font-bold text-white mb-2">{activeModule.name}</div>
                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 mb-4">
                       <div>Temp: <span className={activeModule.temperature > 50 ? 'text-red-400' : 'text-white'}>{activeModule.temperature}°C</span></div>
                       <div>Firmware: <span className="text-white">{activeModule.firmware}</span></div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={handleDiagnosis}
                         disabled={isDiagnosing}
                         className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-2"
                       >
                          {isDiagnosing ? <RefreshCw className="animate-spin" size={12}/> : <Scan size={12}/>}
                          {isDiagnosing ? 'Diagnosing...' : '深度诊断'}
                       </button>
                       <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300">
                          <FileCode size={14}/>
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <AutomationThreeScene 
                    modules={PLC_MODULES}
                    activeModuleId={selectedModuleId}
                    onModuleSelect={setSelectedModuleId}
                    isDiagnosing={isDiagnosing}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>
           </div>

           {/* 底部：总线负载与兼容性 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-56">
              <SciFiCard title="控制网络负载 (Bus Load)" subtitle="PROFINET" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={NETWORK_LOAD}>
                          <defs>
                             <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                          <Area type="step" dataKey="load" stroke="#8b5cf6" fill="url(#colorNet)" strokeWidth={2} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>

              <SciFiCard title="备件兼容性评估" subtitle="COMPATIBILITY" noPadding>
                 <div className="h-full w-full relative p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPATIBILITY_MATRIX}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Match Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-2 right-2 text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                       100% 兼容
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：生命周期与文档 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="固件生命周期" subtitle="LIFECYCLE">
              <div className="h-44 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FIRMWARE_LIFECYCLE} layout="vertical" margin={{left: -20}}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={40} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={12}>
                          {FIRMWARE_LIFECYCLE.map((entry, index) => (
                             <Cell key={index} fill={entry.status === 'Active' ? '#10b981' : entry.status === 'EOL' ? '#ef4444' : '#64748b'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
                 <div className="pr-2 space-y-1">
                    {FIRMWARE_LIFECYCLE.map(f => (
                       <div key={f.name} className="flex justify-between items-center text-[9px] text-slate-500">
                          <span>{f.status}</span>
                          <span className="text-slate-300">{f.usage}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="技术资源库" subtitle="RESOURCES" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-3">
                 <div className="p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded"><BookOpen size={16} className="text-slate-400" /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">S7-300 编程手册.pdf</div>
                          <div className="text-[9px] text-slate-600">Manual • 12.4 MB</div>
                       </div>
                       <Download size={14} className="text-slate-600 group-hover:text-indigo-400" />
                    </div>
                 </div>
                 
                 <div className="p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded"><Terminal size={16} className="text-slate-400" /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">固件升级包 v4.5.zip</div>
                          <div className="text-[9px] text-slate-600">Driver • 45.2 MB</div>
                       </div>
                       <Download size={14} className="text-slate-600 group-hover:text-indigo-400" />
                    </div>
                 </div>

                 <div className="mt-auto pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 transition-all">
                       <Zap size={12} /> 一键推送更新至现场
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联版本控制系统</div>
                    <div className="text-xs font-bold text-white">GIT_REPO_PLC_V2</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};
