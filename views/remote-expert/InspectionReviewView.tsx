
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-inspection-review]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-inspection-review';
import { 
  ScanLine, CheckCircle2, XCircle, AlertTriangle, 
  Eye, Image as ImageIcon, MapPin, ZoomIn, 
  Maximize2, Share2, FileText, Check, X,
  Filter, Search, Clock, Cpu, Crosshair,
  Camera, Zap, Wind, Drone, ChevronRight,
  TrendingUp, History, List, RefreshCw, Send
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// --- Types ---

type InspectionStatus = 'Pending' | 'Verified' | 'Rejected' | 'Re-Inspect';
type DefectType = 'Rust' | 'Crack' | 'Hotspot' | 'Loose Bolt' | 'Insulator Flashover';
type Severity = 'Critical' | 'Major' | 'Minor' | 'Normal';

interface DefectBox {
  id: string;
  type: DefectType;
  confidence: number;
  x: number; // %
  y: number; // %
  w: number; // %
  h: number; // %
  severity: Severity;
}

interface InspectionRecord {
  id: string;
  assetName: string;
  assetType: string;
  timestamp: string;
  method: 'Drone' | 'Robot' | 'Fixed Cam';
  status: InspectionStatus;
  aiVerdict: string;
  aiScore: number;
  defects: DefectBox[];
  imgUrl?: string; // Placeholder in mock
}

// --- Mock Data ---

const INSPECTION_QUEUE: InspectionRecord[] = [
  {
    id: 'INS-2024-8842',
    assetName: 'Tower #42 - Phase A',
    assetType: 'Transmission Line',
    timestamp: '10:42:15',
    method: 'Drone',
    status: 'Pending',
    aiVerdict: 'Anomaly Detected',
    aiScore: 92,
    defects: [
      { id: 'D1', type: 'Insulator Flashover', confidence: 92, x: 45, y: 30, w: 15, h: 20, severity: 'Critical' },
      { id: 'D2', type: 'Rust', confidence: 65, x: 65, y: 40, w: 10, h: 10, severity: 'Minor' }
    ]
  },
  {
    id: 'INS-2024-8841',
    assetName: 'Substation B - Transformer',
    assetType: 'Substation',
    timestamp: '10:35:00',
    method: 'Robot',
    status: 'Pending',
    aiVerdict: 'Potential Thermal Issue',
    aiScore: 78,
    defects: [
      { id: 'D3', type: 'Hotspot', confidence: 78, x: 30, y: 50, w: 20, h: 15, severity: 'Major' }
    ]
  },
  {
    id: 'INS-2024-8830',
    assetName: 'Tower #41 - Ground Wire',
    assetType: 'Transmission Line',
    timestamp: '10:15:22',
    method: 'Drone',
    status: 'Verified',
    aiVerdict: 'Normal',
    aiScore: 99,
    defects: []
  },
  {
    id: 'INS-2024-8828',
    assetName: 'Pump Station - Valve 04',
    assetType: 'Hydraulic',
    timestamp: '09:50:10',
    method: 'Fixed Cam',
    status: 'Rejected',
    aiVerdict: 'False Positive',
    aiScore: 45,
    defects: [
      { id: 'D4', type: 'Crack', confidence: 45, x: 50, y: 50, w: 10, h: 10, severity: 'Minor' }
    ]
  }
];

const DEFECT_STATS = [
  { name: 'Insulator', count: 45, color: '#ef4444' },
  { name: 'Hardware', count: 32, color: '#f59e0b' },
  { name: 'Conductor', count: 18, color: '#0ea5e9' },
  { name: 'Tower', count: 12, color: '#8b5cf6' },
];

const ACCURACY_TREND = Array.from({length: 12}, (_, i) => ({
  time: `${i*2}:00`,
  autoPass: Math.random() * 20 + 70,
  expertReview: Math.random() * 10 + 10
}));

// --- Helper Components ---

const SeverityTag = ({ level }: { level: Severity }) => {
  const colors = {
    'Critical': 'bg-red-500 text-white shadow-[0_0_10px_red]',
    'Major': 'bg-orange-500 text-white',
    'Minor': 'bg-yellow-500 text-black',
    'Normal': 'bg-green-500 text-white'
  }[level];
  return <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${colors}`}>{level}</span>;
};

const BoundingBox = ({ defect, isSelected, onClick }: { defect: DefectBox, isSelected: boolean, onClick: () => void }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`absolute border-2 cursor-pointer transition-all duration-300 group
      ${isSelected ? 'border-white bg-white/10 z-20' : 'border-red-500/70 hover:border-red-400 hover:bg-red-500/10 z-10'}
    `}
    style={{
      left: `${defect.x}%`,
      top: `${defect.y}%`,
      width: `${defect.w}%`,
      height: `${defect.h}%`,
      boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.3)' : 'none'
    }}
  >
    {/* Label Tag */}
    <div className={`absolute -top-6 left-0 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap flex items-center gap-1
       ${isSelected ? 'bg-white text-black' : 'bg-red-600 text-white'}
    `}>
      {defect.confidence}% {defect.type}
    </div>
    
    {/* Corner Brackets Effect */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current"></div>
  </div>
);

export const InspectionReviewView: React.FC = () => {
  const [selectedRecordId, setSelectedRecordId] = useState(INSPECTION_QUEUE[0].id);
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'Standard' | 'Compare' | '3D'>('Standard');

  const activeRecord = INSPECTION_QUEUE.find(r => r.id === selectedRecordId) || INSPECTION_QUEUE[0];
  const activeDefect = activeRecord.defects.find(d => d.id === selectedDefectId) || activeRecord.defects[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#040608]">
      
      {/* 1. Header & Global Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
               <ScanLine size={14} className="animate-pulse" /> Intelligent Vision Review
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               远程智能巡检 <span className="text-cyan-500">结果复核工作台</span>
            </h1>
          </div>
          
          <div className="flex gap-6 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Today's Inspection</div>
                <div className="text-xl font-mono font-bold text-white">1,240 <span className="text-xs text-slate-500 font-normal">imgs</span></div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">AI Auto-Pass</div>
                <div className="text-xl font-mono font-bold text-green-400">92.5%</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Pending Review</div>
                <div className="text-xl font-mono font-bold text-orange-400">42</div>
             </div>
             <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Zap size={14} /> 批量处理
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Inspection Queue */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex items-center justify-between px-1 mb-2">
               <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><List size={14}/> Pending Queue</span>
               <div className="flex gap-1">
                   <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><Filter size={12}/></button>
                   <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><Search size={12}/></button>
               </div>
           </div>

           <div className="flex flex-col gap-3">
               {INSPECTION_QUEUE.map(item => (
                   <div 
                     key={item.id}
                     onClick={() => setSelectedRecordId(item.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedRecordId === item.id 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                               {item.method === 'Drone' ? <Drone size={12} className="text-cyan-400"/> : <Camera size={12} className="text-purple-400"/>}
                               <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                           </div>
                           <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                       </div>
                       
                       <h3 className={`font-bold text-xs mb-2 ${selectedRecordId === item.id ? 'text-white' : 'text-slate-300'}`}>
                           {item.assetName}
                       </h3>
                       
                       <div className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                           <div className="flex items-center gap-1.5">
                               <div className={`w-2 h-2 rounded-full ${item.aiScore > 90 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                               <span className="text-[10px] text-slate-300">{item.aiVerdict}</span>
                           </div>
                           <span className={`text-xs font-bold ${item.aiScore > 90 ? 'text-red-400' : 'text-green-400'}`}>
                               {item.aiScore}%
                           </span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Visual Review Workbench */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
           
           {/* Main Viewer Area */}
           <SciFiCard className="flex-[3] border-cyan-900/50 bg-[#020305] relative overflow-hidden" noPadding>
               <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                   
                   {/* Toolbar */}
                   <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center px-4">
                       <div className="flex gap-2">
                           <button 
                             onClick={() => setReviewMode('Standard')}
                             className={`px-3 py-1 text-xs rounded transition-colors ${reviewMode === 'Standard' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                           >
                             2D View
                           </button>
                           <button 
                             onClick={() => setReviewMode('Compare')}
                             className={`px-3 py-1 text-xs rounded transition-colors ${reviewMode === 'Compare' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                           >
                             Compare
                           </button>
                           <button 
                             onClick={() => setReviewMode('3D')}
                             className={`px-3 py-1 text-xs rounded transition-colors ${reviewMode === '3D' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                           >
                             3D Context
                           </button>
                       </div>
                       <div className="flex gap-2 text-slate-400">
                           <ZoomIn size={16} className="cursor-pointer hover:text-white"/>
                           <Maximize2 size={16} className="cursor-pointer hover:text-white"/>
                       </div>
                   </div>

                   {/* Canvas */}
                   <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                       {reviewMode === '3D' ? (
                           <div className="w-full h-full relative">
                               <ThreeScene type="transmission" color="#ef4444" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                               <div className="absolute bottom-4 left-4 p-2 bg-black/60 border border-slate-700 rounded text-xs text-white">
                                   Drone Position: <span className="font-mono text-cyan-400">X:45 Y:120 Z:35</span>
                               </div>
                           </div>
                       ) : (
                           <div className="relative w-full h-full">
                               {/* Mock Image Background */}
                               <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-600">
                                   <div className="text-center">
                                       <ImageIcon size={64} className="mx-auto mb-2 opacity-20" />
                                       <span className="text-xs uppercase tracking-widest">High-Res Inspection Image</span>
                                   </div>
                               </div>
                               
                               {/* Simulated Image Content (Gradient) */}
                               <div className="absolute inset-0 opacity-30" style={{
                                   backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)',
                                   backgroundSize: '100% 100%'
                               }}></div>

                               {/* Defect Bounding Boxes */}
                               {activeRecord.defects.map(defect => (
                                   <BoundingBox 
                                     key={defect.id} 
                                     defect={defect} 
                                     isSelected={selectedDefectId === defect.id} 
                                     onClick={() => setSelectedDefectId(defect.id)}
                                   />
                               ))}

                               {/* Grid Overlay */}
                               <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                                   backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
                                   backgroundSize: '50px 50px'
                               }}></div>
                           </div>
                       )}
                   </div>

                   {/* Timeline Strip */}
                   <div className="h-16 bg-[#080b14] border-t border-slate-800 flex items-center gap-2 px-2 overflow-x-auto">
                       {Array.from({length: 8}).map((_, i) => (
                           <div key={i} className={`h-12 w-20 bg-slate-800 rounded border cursor-pointer hover:border-cyan-500 ${i===2 ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-700'}`}>
                               <div className="w-full h-full opacity-30 bg-gradient-to-br from-slate-700 to-transparent"></div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Review Controls */}
           <div className="h-20 grid grid-cols-4 gap-4">
               <div className="col-span-3 bg-slate-900/50 border border-slate-700 rounded p-2 flex items-center justify-between px-6">
                   <div className="flex flex-col">
                       <span className="text-xs text-slate-400">AI Confidence</span>
                       <span className={`text-xl font-bold font-mono ${activeRecord.aiScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                           {activeRecord.aiScore}%
                       </span>
                   </div>
                   
                   <div className="flex gap-4">
                       <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-green-400">
                           <div className="p-2 rounded-full border border-slate-600 group-hover:bg-green-900/20 group-hover:border-green-500 transition-colors">
                               <Check size={18} />
                           </div>
                           <span className="text-[10px] font-bold uppercase">Confirm</span>
                       </button>
                       <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-red-400">
                           <div className="p-2 rounded-full border border-slate-600 group-hover:bg-red-900/20 group-hover:border-red-500 transition-colors">
                               <X size={18} />
                           </div>
                           <span className="text-[10px] font-bold uppercase">Reject</span>
                       </button>
                       <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-amber-400">
                           <div className="p-2 rounded-full border border-slate-600 group-hover:bg-amber-900/20 group-hover:border-amber-500 transition-colors">
                               <RefreshCw size={18} />
                           </div>
                           <span className="text-[10px] font-bold uppercase">Re-Fly</span>
                       </button>
                   </div>
               </div>

               <button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-sm shadow-lg transition-colors flex flex-col items-center justify-center gap-1">
                   <Send size={20} />
                   Submit Batch
               </button>
           </div>
        </div>

        {/* RIGHT COLUMN: Defect Details & History */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Defect Analysis */}
           <SciFiCard title="缺陷分析 (Defect Analysis)" subtitle={selectedDefectId || 'NONE'} className="border-red-900/30">
               {activeDefect ? (
                   <div className="flex flex-col gap-4">
                       <div className="flex items-start justify-between">
                           <div>
                               <div className="text-lg font-bold text-white">{activeDefect.type}</div>
                               <SeverityTag level={activeDefect.severity} />
                           </div>
                           <div className="text-right">
                               <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">{activeDefect.confidence}%</div>
                           </div>
                       </div>
                       
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-700 text-xs text-slate-300 leading-relaxed">
                           <strong className="text-cyan-400">AI Note:</strong> High thermal gradient detected (&gt;50°C delta) relative to ambient. Consistent with internal arcing signature.
                       </div>

                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                           <div className="p-2 bg-black/40 rounded border border-slate-800">
                               <span className="block mb-1">Dimensions</span>
                               <span className="text-white font-mono">15mm x 4mm</span>
                           </div>
                           <div className="p-2 bg-black/40 rounded border border-slate-800">
                               <span className="block mb-1">Component</span>
                               <span className="text-white">Insulator String</span>
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="h-32 flex items-center justify-center text-slate-500 text-xs italic">
                       No defect selected. Click a bounding box.
                   </div>
               )}
           </SciFiCard>

           {/* Historical Trend */}
           <SciFiCard title="历史趋势 (Defect History)" className="h-48 border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ACCURACY_TREND}>
                           <defs>
                               <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#10b981', fontSize: '12px'}} />
                           <Area type="monotone" dataKey="autoPass" stroke="#10b981" fill="url(#colorAuto)" strokeWidth={2} name="Auto Pass %" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Defect Distribution */}
           <SciFiCard title="缺陷类型分布" className="flex-1 border-slate-800">
               <div className="h-40 w-full mb-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                               data={DEFECT_STATS} 
                               innerRadius={30} 
                               outerRadius={50} 
                               paddingAngle={5} 
                               dataKey="count"
                           >
                               {DEFECT_STATS.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
               <div className="space-y-1 px-2">
                   {DEFECT_STATS.map((d, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                               <span className="text-slate-300">{d.name}</span>
                           </div>
                           <span className="font-mono text-white">{d.count}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
