import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ReverseThreeScene } from '../../components/maintenance_reverse/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-reverse-logistics]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-reverse-logistics';
import { DefectZone } from '../../components/maintenance_reverse/three-types';
import { 
  Recycle, 
  RotateCcw, 
  Truck, 
  Search, 
  Scan, 
  ClipboardCheck, 
  Banknote, 
  Trash2, 
  Settings, 
  ArrowRightLeft,
  PackageX,
  History,
  Factory,
  Microscope,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart4
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const RMA_LIST = [
  { id: 'RMA-2404-001', part: '高压油泵 HPP-200', customer: '西部矿业', status: 'Triaging', date: '2024-03-25', urgency: 'High', partType: 'pump' },
  { id: 'RMA-2404-002', part: '伺服驱动器 SD-X4', customer: '港务集团', status: 'In-Transit', date: '2024-03-24', urgency: 'Med', partType: 'circuit' },
  { id: 'RMA-2404-003', part: '主轴承组 SKF-99', customer: '能源分公司', status: 'Received', date: '2024-03-22', urgency: 'Low', partType: 'motor' },
  { id: 'RMA-2404-004', part: '控制阀组 V-Block', customer: '重型机械厂', status: 'Repaired', date: '2024-03-20', urgency: 'Med', partType: 'pump' },
];

const SCAN_RESULTS: Record<string, { defects: DefectZone[], health: number, decision: string, confidence: number, costAnalysis: any }> = {
  'RMA-2404-001': {
    defects: [
      { id: 'd1', position: [0.5, 0.5, 0.5], type: 'crack', severity: 0.8 },
      { id: 'd2', position: [-0.2, -0.5, 0.2], type: 'wear', severity: 0.4 }
    ],
    health: 45,
    decision: 'REFURBISH',
    confidence: 92,
    costAnalysis: { repair: 4500, new: 12000, scrap: 500 }
  },
  'RMA-2404-002': {
    defects: [
      { id: 'd3', position: [0, 0.2, 0], type: 'corrosion', severity: 0.6 }
    ],
    health: 68,
    decision: 'REPAIR',
    confidence: 88,
    costAnalysis: { repair: 1200, new: 8500, scrap: 200 }
  },
  'RMA-2404-003': {
    defects: [],
    health: 92,
    decision: 'RESTOCK',
    confidence: 99,
    costAnalysis: { repair: 100, new: 5000, scrap: 100 }
  }
};

const LOGISTICS_STEPS = [
  { label: '现场拆卸', status: 'completed', time: '03-25 09:00' },
  { label: '逆向物流', status: 'completed', time: '03-26 14:30' },
  { label: '入库初检', status: 'active', time: 'Now' },
  { label: '深度探伤', status: 'pending', time: '-' },
  { label: '再制造', status: 'pending', time: '-' },
  { label: '出厂测试', status: 'pending', time: '-' },
];

const RECOVERY_DATA = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Apr', value: 61000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 67000 },
];

export const ReverseLogisticsView: React.FC = () => {
  const [selectedRma, setSelectedRma] = useState(RMA_LIST[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const activeRma = RMA_LIST.find(r => r.id === selectedRma) || RMA_LIST[0];
  const scanData = SCAN_RESULTS[selectedRma] || SCAN_RESULTS['RMA-2404-001'];

  // Simulate Scan
  useEffect(() => {
    if (activeRma.status === 'Triaging' || activeRma.status === 'Received') {
      setIsScanning(true);
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setIsScanning(false);
      setScanProgress(100);
    }
  }, [selectedRma]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-purple-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Recycle size={32} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Circular Economy Hub
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 逆向物流与 <span className="text-purple-500 italic">坏件返修中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">待处理 RMA</div>
              <div className="text-xl font-mono font-bold text-white">12</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月回收价值</div>
              <div className="text-xl font-mono font-bold text-green-400">¥ 67.2W</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">再制造率</div>
              <div className="text-xl font-mono font-bold text-purple-400">78%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT: Inbound Stream */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="退货入库队列 (RMA Inbound)" subtitle="QUEUE" highlight className="border-purple-500/20">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="搜索 RMA 单号..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs focus:border-purple-500 outline-none"
                    />
                 </div>
                 
                 {RMA_LIST.map(rma => (
                    <div 
                      key={rma.id}
                      onClick={() => setSelectedRma(rma.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                         ${selectedRma === rma.id 
                            ? 'bg-purple-900/20 border-purple-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       {selectedRma === rma.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                       
                       <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{rma.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${rma.urgency === 'High' ? 'bg-red-900/40 text-red-400' : 
                               rma.urgency === 'Med' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}
                          `}>{rma.urgency}</span>
                       </div>
                       
                       <div className="pl-2 mb-2">
                          <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{rma.part}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                             <Factory size={10} /> {rma.customer}
                          </div>
                       </div>

                       <div className="pl-2 pt-2 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500">
                          <span>{rma.date}</span>
                          <span className="flex items-center gap-1 text-slate-300">
                             {rma.status === 'Triaging' && <Scan size={10} className="animate-pulse text-purple-400"/>}
                             {rma.status === 'In-Transit' && <Truck size={10} />}
                             {rma.status}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase">快速操作</div>
              <div className="grid grid-cols-2 gap-2">
                 <button className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-all">
                    <ClipboardCheck size={14} /> 打印标签
                 </button>
                 <button className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-all">
                    <ArrowRightLeft size={14} /> 极速通道
                 </button>
              </div>
           </div>
        </div>

        {/* CENTER: The Lab */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           
           {/* 3D Scanner Container */}
           <div className="flex-1 relative bg-[#05020a] border border-purple-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs">
                          <Microscope size={14} className="animate-pulse" />
                          AI DEFECT ANALYSIS
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Component <span className="text-purple-500">Autopsy</span>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 border border-purple-500/30 p-2 rounded backdrop-blur text-right">
                       <div className="text-[10px] text-slate-500 uppercase">Scan Progress</div>
                       <div className="text-lg font-mono font-bold text-white">{scanProgress.toFixed(0)}%</div>
                       <div className="h-1 w-24 bg-slate-800 mt-1 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-300" style={{width: `${scanProgress}%`}}></div>
                       </div>
                    </div>
                 </div>

                 {/* Detected Defects List (Floating) */}
                 {!isScanning && scanData.defects.length > 0 && (
                    <div className="absolute top-24 left-6 w-48 space-y-2 pointer-events-auto">
                       {scanData.defects.map((d, i) => (
                          <div key={i} className="bg-slate-900/90 border-l-2 border-red-500 p-2 rounded animate-in slide-in-from-left-4 fade-in">
                             <div className="text-xs font-bold text-red-200 uppercase">{d.type} DETECTED</div>
                             <div className="text-[10px] text-slate-400">Severity: {(d.severity * 100).toFixed(0)}%</div>
                          </div>
                       ))}
                    </div>
                 )}

                 {/* Result Summary (Bottom) */}
                 {!isScanning && (
                    <div className="flex justify-center pointer-events-auto">
                       <div className="bg-slate-900/90 border border-slate-700 px-6 py-3 rounded-full shadow-2xl backdrop-blur flex items-center gap-6">
                          <div className="text-center">
                             <div className="text-[9px] text-slate-500 uppercase">Health Score</div>
                             <div className={`text-xl font-bold ${scanData.health > 70 ? 'text-green-400' : 'text-red-400'}`}>{scanData.health}</div>
                          </div>
                          <div className="w-[1px] h-8 bg-slate-700"></div>
                          <div className="text-center">
                             <div className="text-[9px] text-slate-500 uppercase">AI Recommendation</div>
                             <div className="text-xl font-bold text-purple-400">{scanData.decision}</div>
                          </div>
                          <div className="w-[1px] h-8 bg-slate-700"></div>
                          <div className="text-center">
                             <div className="text-[9px] text-slate-500 uppercase">Confidence</div>
                             <div className="text-xl font-bold text-white">{scanData.confidence}%</div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* 3D Scene */}
              <ReverseThreeScene 
                 partType={activeRma.partType as any}
                 defects={scanData.defects}
                 isScanning={isScanning}
                 scanProgress={scanProgress}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* Value Analysis Card */}
           <div className="grid grid-cols-2 gap-6 h-48">
              <SciFiCard title="修复价值评估 (Cost-Benefit)" subtitle="AI_MATRIX" className="border-slate-800">
                 <div className="flex flex-col h-full justify-center gap-4 px-2">
                    <div className="space-y-3">
                       {/* Repair Cost */}
                       <div className="flex items-center gap-3">
                          <div className="w-24 text-xs text-slate-400 text-right">Repair Cost</div>
                          <div className="flex-1 h-4 bg-slate-800 rounded overflow-hidden relative group">
                             <div className="h-full bg-green-500" style={{width: `${(scanData.costAnalysis.repair / 15000) * 100}%`}}></div>
                             <span className="absolute inset-0 flex items-center pl-2 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">¥{scanData.costAnalysis.repair}</span>
                          </div>
                       </div>
                       {/* New Part Cost */}
                       <div className="flex items-center gap-3">
                          <div className="w-24 text-xs text-slate-400 text-right">New Part</div>
                          <div className="flex-1 h-4 bg-slate-800 rounded overflow-hidden relative group">
                             <div className="h-full bg-red-500" style={{width: `${(scanData.costAnalysis.new / 15000) * 100}%`}}></div>
                             <span className="absolute inset-0 flex items-center pl-2 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">¥{scanData.costAnalysis.new}</span>
                          </div>
                       </div>
                       {/* Scrap Value */}
                       <div className="flex items-center gap-3">
                          <div className="w-24 text-xs text-slate-400 text-right">Scrap Value</div>
                          <div className="flex-1 h-4 bg-slate-800 rounded overflow-hidden relative group">
                             <div className="h-full bg-slate-600" style={{width: `${(scanData.costAnalysis.scrap / 15000) * 100}%`}}></div>
                             <span className="absolute inset-0 flex items-center pl-2 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">¥{scanData.costAnalysis.scrap}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                       <span className="text-xs text-slate-500">ROI Potential</span>
                       <span className="text-lg font-bold text-green-400 font-mono">
                          + {((scanData.costAnalysis.new - scanData.costAnalysis.repair)/scanData.costAnalysis.repair * 100).toFixed(0)}%
                       </span>
                    </div>
                 </div>
              </SciFiCard>

              <SciFiCard title="处理决策执行" subtitle="EXECUTE" className="border-purple-900/50 bg-purple-950/5">
                 <div className="grid grid-cols-2 gap-3 h-full content-center">
                    <button className="flex flex-col items-center justify-center p-3 bg-purple-600/20 border border-purple-500 hover:bg-purple-600 hover:text-white rounded transition-all group">
                       <RotateCcw className="mb-1 text-purple-400 group-hover:text-white" size={24} />
                       <span className="text-xs font-bold text-purple-200 group-hover:text-white">批准翻新</span>
                       <span className="text-[9px] text-purple-400/60">Generate WO</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:border-red-500 hover:bg-red-950/30 rounded transition-all group">
                       <Trash2 className="mb-1 text-slate-400 group-hover:text-red-500" size={24} />
                       <span className="text-xs font-bold text-slate-300 group-hover:text-red-400">报废拆解</span>
                       <span className="text-[9px] text-slate-600">Recycle Mats</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-blue-950/30 rounded transition-all group">
                       <Banknote className="mb-1 text-slate-400 group-hover:text-blue-500" size={24} />
                       <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400">折价置换</span>
                       <span className="text-[9px] text-slate-600">Credit Memo</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:border-green-500 hover:bg-green-950/30 rounded transition-all group">
                       <PackageX className="mb-1 text-slate-400 group-hover:text-green-500" size={24} />
                       <span className="text-xs font-bold text-slate-300 group-hover:text-green-400">退回客户</span>
                       <span className="text-[9px] text-slate-600">Return to Sender</span>
                    </button>
                 </div>
              </SciFiCard>
           </div>

        </div>

        {/* RIGHT: Logistics & Trends */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* Logistics Chain */}
           <SciFiCard title="全流程物流追踪" subtitle="TRACEABILITY" className="flex-1 overflow-hidden border-slate-700">
              <div className="relative h-full flex flex-col pl-4 pt-2">
                 <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                    {LOGISTICS_STEPS.map((step, i) => (
                       <div key={i} className="relative pl-8 group">
                          {/* Dot */}
                          <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 z-10
                             ${step.status === 'completed' ? 'bg-green-500 border-green-900' : 
                               step.status === 'active' ? 'bg-purple-500 border-purple-900 animate-pulse' : 'bg-slate-800 border-slate-600'}
                          `}></div>
                          
                          <div className="flex justify-between items-start">
                             <div>
                                <div className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
                                   {step.label}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{step.time}</div>
                             </div>
                             {step.status === 'active' && (
                                <div className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-[9px] rounded font-bold uppercase border border-purple-500/30">
                                   Current
                                </div>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           {/* Value Recovery Trend */}
           <SciFiCard title="价值回收趋势" subtitle="SAVINGS" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RECOVERY_DATA}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorVal)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};