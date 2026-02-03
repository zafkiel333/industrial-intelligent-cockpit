import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ToolsThreeScene } from '../../components/maintenance_tools/ThreeScene';
import { LockerSlot } from '../../components/maintenance_tools/three-types';
import { 
  Scan, 
  UserCheck, 
  Search, 
  Wrench, 
  BatteryCharging, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Lock, 
  Unlock,
  RotateCcw,
  Fingerprint,
  QrCode,
  ShieldCheck,
  Zap,
  Box,
  Clock,
  RotateCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- MOCK DATA ---

const USER_INFO = {
  name: '李明 (Li Ming)',
  id: 'TECH-8842',
  dept: '动力维修班',
  level: 'LV-3 (高级技师)',
  permissions: ['精密仪器', '电动工具', '测量设备'],
  status: 'Verified'
};

const INITIAL_SLOTS: LockerSlot[] = [
  { id: 'L-01', row: 3, col: 0, status: 'available', toolName: '福禄克热像仪 Ti480', toolType: 'Instrument' },
  { id: 'L-02', row: 3, col: 1, status: 'borrowed', toolName: '激光对中仪', toolType: 'Instrument' },
  { id: 'L-03', row: 3, col: 2, status: 'available', toolName: '数显扭矩扳手 (20-100Nm)', toolType: 'Hand Tool' },
  { id: 'L-04', row: 3, col: 3, status: 'available', toolName: '便携式振动分析仪', toolType: 'Instrument' },
  { id: 'L-05', row: 3, col: 4, status: 'maintenance', toolName: '绝缘电阻测试仪', toolType: 'Instrument' },
  
  { id: 'L-06', row: 2, col: 0, status: 'available', toolName: '冲击钻 (36V)', toolType: 'Power Tool' },
  { id: 'L-07', row: 2, col: 1, status: 'available', toolName: '角磨机 (无刷)', toolType: 'Power Tool' },
  { id: 'L-08', row: 2, col: 2, status: 'borrowed', toolName: '内窥镜', toolType: 'Instrument' },
  { id: 'L-09', row: 2, col: 3, status: 'available', toolName: '液压拉马套装', toolType: 'Hydraulic' },
  { id: 'L-10', row: 2, col: 4, status: 'available', toolName: '超声波检漏仪', toolType: 'Instrument' },

  { id: 'L-11', row: 1, col: 0, status: 'available', toolName: '示波器 (手持)', toolType: 'Instrument' },
  { id: 'L-12', row: 1, col: 1, status: 'borrowed', toolName: '红外测温枪', toolType: 'Instrument' },
  { id: 'L-13', row: 1, col: 2, status: 'available', toolName: '万用表 87V', toolType: 'Instrument' },
  { id: 'L-14', row: 1, col: 3, status: 'available', toolName: '钳形电流表', toolType: 'Instrument' },
  { id: 'L-15', row: 1, col: 4, status: 'available', toolName: '接地电阻测试仪', toolType: 'Instrument' },

  { id: 'L-16', row: 0, col: 0, status: 'maintenance', toolName: '备用电池组 A', toolType: 'Accessory' },
  { id: 'L-17', row: 0, col: 1, status: 'available', toolName: '备用电池组 B', toolType: 'Accessory' },
  { id: 'L-18', row: 0, col: 2, status: 'available', toolName: '精密水平仪', toolType: 'Hand Tool' },
  { id: 'L-19', row: 0, col: 3, status: 'borrowed', toolName: '听诊器', toolType: 'Hand Tool' },
  { id: 'L-20', row: 0, col: 4, status: 'available', toolName: '转速表', toolType: 'Instrument' },
];

const MY_LOANS = [
  { id: 'L-02', name: '激光对中仪', borrowTime: '08:30', due: '17:30', status: 'In Use' },
  { id: 'L-08', name: '内窥镜', borrowTime: '09:15', due: '17:30', status: 'In Use' },
];

const TOOL_STATS = [
  { name: '精密仪器', value: 45, color: '#0ea5e9' },
  { name: '电动工具', value: 25, color: '#8b5cf6' },
  { name: '液压工具', value: 15, color: '#f59e0b' },
  { name: '通用工具', value: 15, color: '#64748b' },
];

export const ToolsLoanView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);

  const activeToolData = INITIAL_SLOTS.find(s => s.id === selectedSlot);

  const handleAction = () => {
    if (!selectedSlot) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSelectedSlot(null);
      // In a real app, update state here
    }, 2000);
  };

  const filteredSlots = INITIAL_SLOTS.filter(s => 
    s.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-amber-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Wrench size={32} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Smart Arsenal System
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 智能维修工具 <span className="text-amber-500 italic">借还管理终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700">
              <button 
                onClick={() => setActiveTab('borrow')}
                className={`px-6 py-2 rounded font-bold text-sm transition-all flex items-center gap-2
                   ${activeTab === 'borrow' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}
                `}
              >
                 <Unlock size={16} /> 借出 (Borrow)
              </button>
              <button 
                onClick={() => setActiveTab('return')}
                className={`px-6 py-2 rounded font-bold text-sm transition-all flex items-center gap-2
                   ${activeTab === 'return' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}
                `}
              >
                 <RotateCcw size={16} /> 归还 (Return)
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Identity & Inventory */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* User Profile Card */}
           <SciFiCard title="当前操作员" subtitle="IDENTITY" highlight className="border-amber-900/30">
              <div className="flex items-center gap-4 mb-4">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-500 p-1">
                       <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserCheck size={32} />
                       </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded border border-black">
                       VERIFIED
                    </div>
                 </div>
                 <div>
                    <div className="text-lg font-bold text-white">{USER_INFO.name}</div>
                    <div className="text-xs text-amber-400 font-mono">{USER_INFO.id}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{USER_INFO.level}</div>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1">
                    <span>Permission Scope</span>
                    <span>Status</span>
                 </div>
                 {USER_INFO.permissions.map((perm, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                       <span className="text-slate-300 flex items-center gap-2"><ShieldCheck size={12} className="text-green-500"/> {perm}</span>
                       <span className="text-green-500">OK</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* My Toolkit */}
           <SciFiCard title="我的随身工具包" subtitle="ON_HAND" className="flex-1">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {MY_LOANS.length === 0 ? (
                       <div className="text-center text-slate-500 py-8 text-xs">暂无借出工具</div>
                    ) : (
                       MY_LOANS.map(tool => (
                          <div key={tool.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded group hover:border-amber-500/30 transition-all cursor-pointer">
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1 rounded">{tool.id}</span>
                                <span className="text-[10px] text-amber-400 font-bold">{tool.status}</span>
                             </div>
                             <div className="text-sm font-bold text-white mb-2">{tool.name}</div>
                             <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><History size={10}/> 借: {tool.borrowTime}</span>
                                <span className="flex items-center gap-1"><Clock size={10}/> 还: {tool.due}</span>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                       <ArrowRightLeft size={14} /> 一键归还全部
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 智能柜交互 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#0a0502] border border-amber-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs">
                          <Box size={14} className="animate-pulse" />
                          SMART CABINET: A-01
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Unit <span className="text-amber-500">Alpha</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-700">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-[10px] text-slate-300">Available</span>
                       </div>
                       <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-700">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-[10px] text-slate-300">Selected</span>
                       </div>
                       <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-700">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-[10px] text-slate-300">Maint</span>
                       </div>
                    </div>
                 </div>

                 {/* 选中工具悬浮卡片 */}
                 {activeToolData && (
                    <div className="self-center bg-slate-900/90 border border-amber-500 p-4 rounded backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-4 w-72 pointer-events-auto">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-amber-400 font-mono">{activeToolData.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                             ${activeToolData.status === 'available' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-slate-800 text-slate-500'}
                          `}>{activeToolData.status}</span>
                       </div>
                       <div className="text-lg font-bold text-white mb-1">{activeToolData.toolName}</div>
                       <div className="text-xs text-slate-400 mb-4">{activeToolData.toolType}</div>
                       
                       {activeToolData.status === 'available' && activeTab === 'borrow' ? (
                          <button 
                            onClick={handleAction}
                            disabled={processing}
                            className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             {processing ? <RotateCw className="animate-spin" size={14} /> : <Unlock size={14} />}
                             确认借出 (Unlock)
                          </button>
                       ) : activeToolData.status === 'borrowed' && activeTab === 'return' ? (
                          <button 
                            onClick={handleAction}
                            disabled={processing}
                            className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             {processing ? <RotateCw className="animate-spin" size={14} /> : <Lock size={14} />}
                             归还入柜 (Lock)
                          </button>
                       ) : (
                          <div className="text-center text-[10px] text-red-400 py-1 bg-red-950/20 rounded border border-red-900/30">
                             当前状态不可操作
                          </div>
                       )}
                    </div>
                 )}
              </div>

              <div className="absolute inset-0 bg-[#0a0502]">
                 <ToolsThreeScene 
                    slots={INITIAL_SLOTS} 
                    selectedSlotId={selectedSlot}
                    onSlotSelect={setSelectedSlot}
                 />
              </div>
           </div>

           {/* 底部操作区 */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex items-center gap-4 hover:border-amber-500/30 transition-all cursor-pointer">
                 <div className="p-3 bg-slate-800 rounded-full text-white">
                    <QrCode size={24} />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-200">扫码领用</div>
                    <div className="text-[10px] text-slate-500">Scan QR Code on Tool</div>
                 </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex items-center gap-4 hover:border-amber-500/30 transition-all cursor-pointer">
                 <div className="p-3 bg-slate-800 rounded-full text-white">
                    <Fingerprint size={24} />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-200">生物验证</div>
                    <div className="text-[10px] text-slate-500">Biometric Auth Required</div>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：工具库与健康 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="智能工具库检索" subtitle="CATALOG" className="flex-1 overflow-hidden border-slate-700">
              <div className="flex flex-col h-full">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="输入工具名称或规格..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-200 focus:border-amber-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                    {filteredSlots.map(tool => (
                       <div 
                         key={tool.id} 
                         onClick={() => setSelectedSlot(tool.id)}
                         className={`p-2 rounded border cursor-pointer flex items-center justify-between transition-all group
                            ${selectedSlot === tool.id 
                               ? 'bg-amber-900/20 border-amber-500' 
                               : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800'}
                         `}
                       >
                          <div>
                             <div className={`text-xs font-bold ${selectedSlot === tool.id ? 'text-white' : 'text-slate-300'}`}>{tool.toolName}</div>
                             <div className="text-[10px] text-slate-500 mt-0.5">{tool.toolType} • {tool.id}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${tool.status === 'available' ? 'bg-cyan-500' : tool.status === 'borrowed' ? 'bg-slate-600' : 'bg-red-500'}`}></div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="grid grid-cols-2 gap-6 h-48">
              <SciFiCard title="分类统计" subtitle="STATS">
                 <div className="h-full w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                             data={TOOL_STATS} 
                             cx="50%" cy="50%" 
                             innerRadius={25} outerRadius={40} 
                             paddingAngle={5} 
                             dataKey="value"
                          >
                             {TOOL_STATS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}}/>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-xs font-bold text-slate-500">100%</span>
                    </div>
                 </div>
              </SciFiCard>

              <SciFiCard title="健康监测" subtitle="HEALTH">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                       <span>需校准设备</span>
                       <span className="text-amber-500 font-bold">2 台</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                       <span>低电量告警</span>
                       <span className="text-red-500 font-bold">1 台</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                       <span>维修中</span>
                       <span className="text-slate-200 font-bold">2 台</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700">
                       <div className="text-[9px] text-green-400 flex items-center gap-1">
                          <BatteryCharging size={10} /> 充电柜运行正常
                       </div>
                    </div>
                 </div>
              </SciFiCard>
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.6);
        }
      `}</style>
    </div>
  );
};