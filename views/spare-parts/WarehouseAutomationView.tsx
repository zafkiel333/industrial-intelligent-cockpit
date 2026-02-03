
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { WarehouseThreeScene } from '../../components/warehouse_automation/WarehouseThreeScene';
import { 
  Cpu, 
  Zap, 
  Warehouse, 
  Activity, 
  Route, 
  ShieldCheck, 
  Maximize2,
  BoxSelect,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis
} from 'recharts';

// --- 仿真数据 ---
const MOCK_BINS = Array.from({ length: 40 }, (_, i) => ({
  id: `BIN-${i}`,
  x: i % 10,
  y: Math.floor(i / 10),
  z: 0,
  type: Math.random() > 0.8 ? 'critical' : (Math.random() > 0.3 ? 'spare-part' : 'empty'),
  occupancy: Math.random()
}));

const RECENT_TASKS = [
  { id: 'JOB-9022', item: '高压阀芯组件', type: '入库', time: '02:14', priority: 'High' },
  { id: 'JOB-8842', item: '主轴轴承', type: '拣选', time: '05:30', priority: 'Med' },
  { id: 'JOB-7712', item: '密封垫片组', type: '移位', time: '10:12', priority: 'Low' },
];

export const WarehouseAutomationView: React.FC = () => {
  const [activeBinId, setActiveBinId] = useState<string | null>(null);
  const [stackerPos, setStackerPos] = useState({ x: 2, y: 3 });
  const [isOperational, setIsOperational] = useState(false);
  const [showCenterAlert, setShowCenterAlert] = useState(false);

  // 堆垛机逻辑：当处于运行状态时，自动模拟作业
  useEffect(() => {
    if (!isOperational) return;
    const timer = setInterval(() => {
      setStackerPos({
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 4)
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [isOperational]);

  const toggleSystem = () => {
    setIsOperational(!isOperational);
    if (!isOperational) {
        setActiveBinId(null);
    }
  };

  const handleBinSelect = (id: string) => {
    setActiveBinId(id);
    const bin = MOCK_BINS.find(b => b.id === id);
    if (bin) {
        setStackerPos({ x: bin.x, y: bin.y });
    }
  };

  return (
    <div className="relative h-full flex flex-col gap-6 font-[Rajdhani] text-slate-100 bg-[#02040a] overflow-hidden p-6 select-none animate-in fade-in duration-1000">
      
      {/* 顶部：战略概览 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 z-20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase">
            <Warehouse size={14} className={isOperational ? "animate-spin" : ""} />
            Strategic Logistics Upgrade
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            仓储自动化 <span className="text-cyan-500 italic">升级服务</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mt-2">
            当前处于 <span className={`font-bold ${isOperational ? 'text-green-400' : 'text-amber-500'}`}>{isOperational ? '自动作业' : '系统待命'}</span> 模式。点击货位或执行按钮以开启协同。
          </p>
        </div>

        <div className="flex gap-4">
           <div className="bg-slate-900/60 border border-white/10 px-6 py-4 rounded-xl backdrop-blur-xl flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">存取循环时耗</span>
                 <span className="text-2xl font-mono font-bold text-white">{isOperational ? '42.5' : '--'} <span className="text-xs text-slate-600">sec</span></span>
              </div>
              <div className="w-[1px] h-10 bg-slate-800"></div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">能量利用率</span>
                 <span className="text-2xl font-mono font-bold text-emerald-400">{isOperational ? '92.4%' : '0%'}</span>
              </div>
           </div>
           <button 
             onClick={toggleSystem}
             className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-3 active:scale-95
               ${isOperational ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'}
             `}
           >
              {isOperational ? <Zap size={20} className="animate-pulse" /> : <PlayCircleIcon size={20} />}
              {isOperational ? '停止自动存取' : '开启极速存取'}
           </button>
        </div>
      </div>

      {/* 核心 3D 交互场 */}
      <div className="flex-1 relative min-h-[400px]">
        <div className="absolute inset-0 z-0">
           <WarehouseThreeScene 
             bins={MOCK_BINS} 
             stackerPos={stackerPos} 
             isMoving={isOperational}
             activeId={activeBinId}
             onBinSelect={handleBinSelect}
           />
        </div>

        {/* 悬浮数据卡片 */}
        <div className="absolute top-4 left-0 w-64 z-10 animate-in slide-in-from-left-4 duration-500">
           <SciFiCard title="空间利用率重构" subtitle="SPATIAL_GAINS" highlight className="bg-slate-950/60 border-cyan-500/20">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400">改造后容量增幅</span>
                    <span className="text-2xl font-bold text-emerald-400">+240%</span>
                 </div>
                 <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500" style={{ width: '85%' }}></div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        <div className="absolute bottom-4 left-0 w-80 z-10 animate-in slide-in-from-bottom-4 duration-700">
           <SciFiCard title="WCS 实时调度指令" subtitle="DIRECT_CONTROL" className="bg-black/80">
              <div className="space-y-3">
                 {RECENT_TASKS.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{task.item}</div>
                       </div>
                       <span className="text-[10px] font-mono text-slate-500">{task.time}</span>
                    </div>
                 ))}
                 <button 
                  onClick={() => setShowCenterAlert(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 rounded transition-all flex items-center justify-center gap-2 mt-2"
                 >
                    <Maximize2 size={12} /> 进入中央集成监控室
                 </button>
              </div>
           </SciFiCard>
        </div>

        <div className="absolute top-4 right-0 w-72 z-10 animate-in slide-in-from-right-4 duration-500">
           <SciFiCard title="AMR 协同负载" subtitle="FLEET_HEAT" className="bg-slate-950/60">
              <div className="h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.from({length: 12}, (_, i) => ({ x: i, y: (isOperational ? 40 : 0) + Math.random() * 50 }))}>
                       <defs>
                          <linearGradient id="fleetColor" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Area type="step" dataKey="y" stroke="#0ea5e9" fill="url(#fleetColor)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500">
                 <span className="flex items-center gap-1 font-bold"><Route size={12} /> 在途路径: {isOperational ? '12 条' : '0 条'}</span>
              </div>
           </SciFiCard>
        </div>

        <div className="absolute bottom-4 right-0 w-64 z-10 animate-in slide-in-from-right-4 duration-700">
           <SciFiCard title="智能库位探析" subtitle="BIN_ANALYTICS" className="border-orange-500/30">
              {activeBinId ? (
                <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-900/20 border border-orange-500/30 rounded flex items-center justify-center text-orange-500">
                         <BoxSelect size={24} />
                      </div>
                      <div>
                         <div className="text-[10px] text-slate-500 uppercase">选定库位</div>
                         <div className="text-lg font-bold text-white font-mono">{activeBinId}</div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                         <span className="text-slate-500">存件状态:</span>
                         <span className="text-slate-200">精密导轴 C4</span>
                      </div>
                      <div className="flex justify-between text-xs">
                         <span className="text-slate-500">出库建议:</span>
                         <span className="text-amber-400 font-bold">高频调拨</span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="h-24 flex flex-col items-center justify-center text-slate-600 italic text-xs gap-2">
                   <Loader2 size={24} className={isOperational ? "animate-spin" : ""} />
                   <span>{isOperational ? "请在 3D 场景中点击库位进行扫描" : "系统就绪，等待交互"}</span>
                </div>
              )}
           </SciFiCard>
        </div>
      </div>

      {/* 底部底座板块 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 z-20">
         <div className="md:col-span-3 bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col lg:flex-row gap-8 backdrop-blur-sm">
            <div className="flex-1 flex flex-col justify-center">
               <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] mb-4">Core Automation Features</div>
               <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: '多向穿梭车驱动', icon: <ChevronRight className="text-cyan-500" />, desc: '提升存储密度 60%' },
                    { label: '库内自动理货', icon: <ChevronRight className="text-cyan-500" />, desc: 'AI 触发的物料重排序' },
                    { label: '数字孪生实时同步', icon: <ChevronRight className="text-cyan-500" />, desc: '物理与虚拟 10ms 同步' },
                    { label: '能效管理 2.0', icon: <ChevronRight className="text-cyan-500" />, desc: '再生能回馈制动系统' },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3 group cursor-help">
                       <div className="mt-1 transition-transform group-hover:translate-x-1">{feat.icon}</div>
                       <div>
                          <div className="text-sm font-bold text-white">{feat.label}</div>
                          <div className="text-[10px] text-slate-500">{feat.desc}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="w-[1px] h-full bg-slate-800 hidden lg:block"></div>

            <div className="w-full lg:w-72 flex flex-col justify-center gap-4">
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">改造投资回报 (ROI)</div>
               <div className="flex items-end gap-3">
                  <span className="text-4xl font-mono font-bold text-white leading-none">14.2</span>
                  <span className="text-sm text-emerald-500 font-bold">MONTHS</span>
               </div>
               <button 
                 onClick={() => alert('正在调阅全生命周期 LCC 成本档案...')}
                 className="w-full py-2 bg-slate-800 border border-slate-700 hover:border-cyan-500 text-[10px] font-bold text-slate-400 hover:text-white rounded transition-all uppercase tracking-widest active:scale-95"
               >
                  调阅 LCC 成本档案
               </button>
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-950/40 to-blue-950/40 border border-indigo-500/20 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
            <Cpu size={100} className="absolute -right-4 -bottom-4 text-white/5 group-hover:rotate-12 transition-all" />
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-600 rounded text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                  <ShieldCheck size={20} />
               </div>
               <div className="text-xs font-bold text-white uppercase tracking-widest">系统安全审计</div>
            </div>
            <div className="space-y-1">
               <div className="text-[10px] text-slate-500 uppercase">Network Encryption</div>
               <div className="text-sm font-mono text-indigo-400">TLS 1.3 / AES-256</div>
               <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
                  <CheckCircle2 size={12} />
                  符合 ISO 27001 认证
               </div>
            </div>
         </div>
      </div>

      {/* 弹窗遮罩示例 */}
      {showCenterAlert && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-cyan-500/50 p-8 rounded-2xl shadow-2xl max-w-md text-center">
               <Cpu size={48} className="mx-auto text-cyan-400 mb-4 animate-bounce" />
               <h3 className="text-xl font-bold text-white mb-2 uppercase">中央集成监控室</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  正在建立与 WCS 系统的安全链路... <br/>
                  当前权限级别：<span className="text-cyan-400 font-bold">LV-3 ADMINISTRATOR</span>
               </p>
               <button 
                  onClick={() => setShowCenterAlert(false)}
                  className="px-12 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
               >
                  确认并进入
               </button>
            </div>
         </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
      `}} />
    </div>
  );
};

const PlayCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);
