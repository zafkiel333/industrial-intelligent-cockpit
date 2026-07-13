import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { AnnualThreeScene } from '../../components/maintenance_annual/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-annual-inspect]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-annual-inspect';
import { InspectionPoint } from '../../components/maintenance_annual/three-types';
import { 
  ShieldCheck, 
  FileBadge, 
  Scale, 
  AlertOctagon, 
  CalendarClock, 
  QrCode, 
  Printer, 
  UploadCloud, 
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ScanLine,
  Thermometer,
  Gauge,
  ScrollText,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

// --- MOCK DATA ---

const EQUIPMENT_LIST = [
  { id: 'EQ-PV-201', name: '高压储气罐 #2', type: 'Pressure Vessel', nextDate: '2024-04-15', status: 'Due Soon', risk: 'High' },
  { id: 'EQ-EL-105', name: '3号货梯', type: 'Elevator', nextDate: '2024-03-20', status: 'Expired', risk: 'High' },
  { id: 'EQ-BL-004', name: '燃气锅炉 A', type: 'Boiler', nextDate: '2024-06-10', status: 'Valid', risk: 'Med' },
  { id: 'EQ-CR-302', name: '50T 桥式起重机', type: 'Crane', nextDate: '2024-05-22', status: 'Valid', risk: 'Low' },
  { id: 'EQ-PV-202', name: '分汽缸 B', type: 'Pressure Vessel', nextDate: '2024-04-18', status: 'Due Soon', risk: 'Med' },
];

const INSPECTION_POINTS: InspectionPoint[] = [
  { id: 'p1', position: [-2, 0, 1.4], status: 'ok', label: '焊缝 A-1 (Weld)' },
  { id: 'p2', position: [0, 0, 1.4], status: 'issue', label: '筒体壁厚 (Wall Thickness)' },
  { id: 'p3', position: [2, 0, 1.4], status: 'ok', label: '焊缝 A-2 (Weld)' },
  { id: 'p4', position: [0, 1.8, 0], status: 'ok', label: '安全阀接口 (Nozzle)' },
];

const TYPE_STATS = [
  { name: '压力容器', value: 45, color: '#f59e0b' },
  { name: '起重机械', value: 30, color: '#0ea5e9' },
  { name: '锅炉', value: 15, color: '#ef4444' },
  { name: '电梯', value: 10, color: '#8b5cf6' },
];

const CHECKLIST_ITEMS = [
  { id: 1, item: '外观检查 (Corrosion/Deformation)', status: 'pass' },
  { id: 2, item: '壁厚测定 (Ultrasonic Test)', status: 'fail', val: '4.8mm (Min 6.0mm)' },
  { id: 3, item: '安全阀校验 (Safety Valve)', status: 'pass', val: 'Set: 1.2MPa' },
  { id: 4, item: '压力表检定 (Pressure Gauge)', status: 'pass' },
  { id: 5, item: '焊缝无损探伤 (NDT)', status: 'pass' },
];

export const AnnualInspectView: React.FC = () => {
  const [selectedEq, setSelectedEq] = useState(EQUIPMENT_LIST[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [certGenerating, setCertGenerating] = useState(false);

  const activeEquipment = EQUIPMENT_LIST.find(e => e.id === selectedEq) || EQUIPMENT_LIST[0];

  const handleStartInspection = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleGenerateCert = () => {
    setCertGenerating(true);
    setTimeout(() => setCertGenerating(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：合规中心抬头 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-amber-600/20 border-2 border-amber-500 rounded flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <FileBadge size={36} className="text-amber-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Regulatory Compliance Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 特种设备 <span className="text-amber-500 italic">年检数字化管理</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">综合定检率</div>
              <div className="text-xl font-mono font-bold text-green-400">96.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">即将超期</div>
              <div className="text-xl font-mono font-bold text-amber-500 flex items-center gap-1">
                 02 <span className="text-[10px] text-slate-400 font-normal">台</span>
              </div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已超期警告</div>
              <div className="text-xl font-mono font-bold text-red-500 flex items-center gap-1 animate-pulse">
                 <AlertOctagon size={16}/> 01
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：设备台账 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="特种设备台账" subtitle="REGISTRY" highlight className="flex-1 border-amber-900/30">
              <div className="flex flex-col h-full">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="搜索注册代码/设备名称..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500"
                    />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {EQUIPMENT_LIST.map(eq => (
                       <div 
                         key={eq.id}
                         onClick={() => setSelectedEq(eq.id)}
                         className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                            ${selectedEq === eq.id 
                               ? 'bg-amber-950/30 border-amber-500 shadow-lg' 
                               : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                          {selectedEq === eq.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                          
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-[10px] font-mono text-slate-500">{eq.id}</span>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                ${eq.status === 'Expired' ? 'bg-red-900/40 text-red-400' : 
                                  eq.status === 'Due Soon' ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/20 text-green-400'}
                             `}>{eq.status}</span>
                          </div>
                          <div className="text-sm font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{eq.name}</div>
                          <div className="flex justify-between items-center text-[10px] bg-black/20 p-1.5 rounded">
                             <span className="text-slate-400">下次检验: {eq.nextDate}</span>
                             <span className="text-slate-500">{eq.type}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="h-48 bg-slate-900/60 border border-slate-800 rounded p-4 flex flex-col">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                 <Scale size={12}/> 设备类型分布
              </div>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={TYPE_STATS} 
                          cx="50%" cy="50%" 
                          innerRadius={30} outerRadius={50} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {TYPE_STATS.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 中间：3D 探伤仿真与执行 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           
           <div className="flex-1 relative bg-[#0a0500] border border-amber-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs">
                          <ScanLine size={14} className={isScanning ? "animate-pulse" : ""} />
                          NDT SCANNER: {isScanning ? 'ACTIVE' : 'STANDBY'}
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Inspection <span className="text-amber-500">Bay 04</span>
                       </div>
                    </div>
                    {isScanning && (
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase">Coverage</div>
                          <div className="text-xl font-mono font-bold text-amber-400">{scanProgress}%</div>
                       </div>
                    )}
                 </div>

                 {/* 实时数据浮窗 */}
                 <div className="absolute top-20 right-6 pointer-events-auto space-y-2">
                    {INSPECTION_POINTS.map(pt => (
                       <div key={pt.id} className={`flex items-center gap-3 p-2 rounded backdrop-blur-sm border transition-all animate-in slide-in-from-right-4
                          ${pt.status === 'issue' ? 'bg-red-900/40 border-red-500/50' : 'bg-slate-900/60 border-slate-700'}
                       `}>
                          <div className={`w-2 h-2 rounded-full ${pt.status === 'issue' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                          <div>
                             <div className="text-[10px] text-slate-300 font-bold">{pt.label}</div>
                             <div className={`text-[9px] ${pt.status === 'issue' ? 'text-red-300' : 'text-slate-500'}`}>
                                {pt.status === 'issue' ? 'DEFECT DETECTED' : 'Normal'}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <AnnualThreeScene 
                    isScanning={isScanning}
                    scanProgress={scanProgress}
                    inspectionPoints={INSPECTION_POINTS}
                    scanColor="#f59e0b"
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>
              
              {/* 背景装饰 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
           </div>

           {/* 底部操作区 */}
           <div className="bg-slate-900/60 border border-slate-800 rounded p-4 flex justify-between items-center">
              <div className="flex gap-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Wall Thickness</span>
                    <span className="text-lg font-mono font-bold text-white flex items-center gap-2">
                       <Gauge size={14} className="text-cyan-400"/> 4.8mm
                    </span>
                 </div>
                 <div className="w-[1px] h-8 bg-slate-700"></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Temperature</span>
                    <span className="text-lg font-mono font-bold text-white flex items-center gap-2">
                       <Thermometer size={14} className="text-orange-400"/> 42°C
                    </span>
                 </div>
              </div>
              
              <button 
                onClick={handleStartInspection}
                disabled={isScanning}
                className={`px-8 py-3 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                   ${isScanning ? 'bg-slate-800 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'}
                `}
              >
                 <ScanLine size={16} /> {isScanning ? 'Scanning...' : 'Start NDT Scan'}
              </button>
           </div>

        </div>

        {/* 右侧：合规认证 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
           
           {/* 核验清单 */}
           <SciFiCard title="国标检验项目核查" subtitle="GB/T CHECKLIST" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-0.5">
                 {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                       <div className="flex items-center gap-3">
                          {item.status === 'pass' 
                             ? <CheckCircle2 size={16} className="text-green-500" /> 
                             : <XCircle size={16} className="text-red-500" />}
                          <span className={`text-xs ${item.status === 'fail' ? 'text-white' : 'text-slate-300'}`}>{item.item}</span>
                       </div>
                       {item.val && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.status === 'fail' ? 'bg-red-900/30 text-red-400' : 'bg-slate-900 text-slate-500'}`}>
                             {item.val}
                          </span>
                       )}
                    </div>
                 ))}
              </div>
              <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-3">
                 <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                 <div className="text-[10px] text-red-200 leading-normal">
                    <span className="font-bold">不合格项发现：</span> 筒体壁厚局部减薄至 4.8mm，低于标准值 6.0mm。需立即降压运行并制定补焊或报废计划。
                 </div>
              </div>
           </SciFiCard>

           {/* 证书生成 */}
           <SciFiCard title="电子合格证生成" subtitle="CERTIFICATE" className="bg-slate-950/50 border-amber-900/30">
              <div className="flex flex-col items-center justify-center py-4 relative overflow-hidden">
                 
                 {/* 证书预览 */}
                 <div className="w-full bg-[#fdfbf7] p-4 rounded text-slate-800 shadow-xl relative mb-4 transform rotate-[-2deg] border-4 double border-amber-800/20 max-w-[280px]">
                    <div className="border-2 border-amber-800/20 p-2 h-full flex flex-col items-center">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-amber-900 border-b border-amber-900/20 pb-1 mb-2 w-full text-center">Certificate of Inspection</div>
                       <QrCode size={48} className="text-slate-800 mb-2" />
                       <div className="text-[8px] font-mono text-slate-600 mb-1">ID: {activeEquipment.id}</div>
                       <div className="text-[8px] font-mono text-slate-600">VALID UNTIL: 2025-04-15</div>
                       
                       {/* 盖章动画 */}
                       {certGenerating && (
                          <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-150 duration-300">
                             <div className="w-20 h-20 rounded-full border-4 border-red-600 flex items-center justify-center transform rotate-[-15deg] opacity-80">
                                <span className="text-red-600 font-bold text-xs uppercase">Pending</span>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="flex gap-3 w-full px-4">
                    <button 
                      onClick={handleGenerateCert}
                      disabled={certGenerating}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20"
                    >
                       <Printer size={14} /> {certGenerating ? 'Generating...' : '生成报告'}
                    </button>
                    <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                       <UploadCloud size={14} /> 上报监察网
                    </button>
                 </div>
                 
                 <div className="mt-3 flex items-center gap-1 text-[9px] text-slate-500">
                    <ScrollText size={10} /> 数据将同步至国家特种设备公示平台
                 </div>

              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};