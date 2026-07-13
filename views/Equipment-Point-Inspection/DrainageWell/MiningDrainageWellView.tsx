import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/DrainageWell/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-7]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-7';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Waves, Activity, Droplets, Gauge, AlertTriangle, 
  MapPin, ShieldCheck, Zap, Thermometer, Camera,
  Scan, History, Database, Cpu, Wind, Info, RotateCw
} from 'lucide-react';

export const MiningDrainageWellView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    waterLevel: 4.52, // meters
    inflowRate: 1240, // m3/h
    dischargeRate: 1580, // m3/h
    headLoss: 0.12, // MPa
    activePumps: 2,
    pumpsStatus: [
      { id: 'P1', rpm: 1450, temp: 48.2, vib: 1.2, flow: 800, status: 'running' },
      { id: 'P2', rpm: 1445, temp: 49.5, vib: 1.4, flow: 780, status: 'running' },
      { id: 'P3', rpm: 0, temp: 22.1, vib: 0.0, flow: 0, status: 'standby' },
      { id: 'P4', rpm: 0, temp: 21.8, vib: 0.0, flow: 0, status: 'standby' },
    ]
  });

  const [levelHistory, setLevelHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        waterLevel: prev.waterLevel + (Math.random() - 0.5) * 0.02,
        dischargeRate: 1580 + (Math.random() - 0.5) * 50
      }));

      setLevelHistory(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          lv: 4.5 + Math.sin(Date.now() / 10000) * 0.5,
          in: 1200 + Math.random() * 100 
        }];
        return newData.slice(-20);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const inspectionTasks = [
    { id: 'T1', name: '电机绕组红外扫描', status: 'completed', time: '14:20' },
    { id: 'T2', name: '法兰接头密封AI识别', status: 'processing', time: '现在' },
    { id: 'T3', name: '水位计超声波自校', status: 'pending', time: '预计15:00' },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：集控与巡检头栏 */}
      <div className="bg-[#0b1221]/90 border border-cyan-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/40 rounded-sm">
               <Waves size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  排水泵井自律巡检集控台 <span className="text-cyan-500 text-xl not-italic ml-2 tracking-normal">// DRAIN_CENTRAL_CORE</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500"/> 位置: -600m 水平中央水泵房</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 智能巡检模式 (ACTIVE)</span>
                  <span className="flex items-center gap-1"><Zap size={12}/> 实时总能耗: 1,420 kW</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">当前总排水量 FLOW</div>
                <div className="text-3xl font-mono font-black text-white">{metrics.dischargeRate.toFixed(0)} <span className="text-sm text-cyan-500">m³/h</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">水仓警戒余量 MARGIN</div>
                <div className="text-3xl font-mono font-black text-emerald-400">1.48 <span className="text-sm">m</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：水文与排水势能 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           <SciFiCard title="水文特征实时感知" className="bg-[#0f172a]/60 border-cyan-900/40">
              <div className="flex flex-col gap-5 py-2">
                 <div className="p-3 bg-slate-900/80 rounded-sm border-l-2 border-cyan-500 group">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">当前水位高度 (LVL)</div>
                    <div className="text-3xl font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{metrics.waterLevel.toFixed(2)} m</div>
                    <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-cyan-500 h-full w-[45%] shadow-[0_0_8px_#0ea5e9]"></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/40 rounded border border-white/5">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">涌水变率</div>
                       <div className="text-lg font-mono font-bold text-emerald-400">+1.2%</div>
                    </div>
                    <div className="p-3 bg-slate-900/40 rounded border border-white/5">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">平均浊度</div>
                       <div className="text-lg font-mono font-bold text-white">4.2 NTU</div>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-900/80 rounded-sm border-l-2 border-blue-500">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">瞬时入井水量 (IN)</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">{metrics.inflowRate} <span className="text-xs text-slate-600 font-normal">m³/h</span></div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="水位/入流关联趋势" noPadding className="flex-1 border-cyan-900/30">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={levelHistory} margin={{top: 20, right: 10, left: -20, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                    <Area type="monotone" dataKey="lv" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="in" stroke="#3b82f6" fill="transparent" strokeDasharray="3 3" />
                 </AreaChart>
              </ResponsiveContainer>
           </SciFiCard>
        </div>

        {/* 中部：3D 孪生深井 & HUD */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-cyan-500/10 rounded-sm overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-cyan-500/20 m-4"></div>
                 
                 {/* 实时点位数据浮窗 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-cyan-500/30 rounded flex items-center gap-4">
                       <Cpu size={24} className="text-cyan-400" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">边缘控制逻辑</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">AUTO_LEVEL_BALANCING</div>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-cyan-500/30 rounded flex items-center gap-4">
                       <RotateCw size={24} className="text-emerald-400 animate-spin" style={{animationDuration: '4s'}} />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">排水机组共振监测</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">SPECTRUM_STABLE</div>
                       </div>
                    </div>
                 </div>

                 {/* 巡检机器人 AI 预览 */}
                 <div className="absolute bottom-10 left-10 w-56 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden">
                    <div className="absolute top-1 left-1 bg-red-600 px-2 text-[8px] font-bold">ROBOT_VIEW_04</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Camera size={32} className="text-slate-600" />
                       <span className="text-[8px] mt-2 uppercase tracking-widest">正在进行红外泄露扫描...</span>
                    </div>
                    <div className="absolute bottom-0 w-full bg-cyan-500/10 text-[8px] p-2 text-center text-cyan-300 italic">
                       识别结果：无渗漏/无过热
                    </div>
                 </div>
              </div>

              <ThreeScene waterLevel={metrics.waterLevel} activeCount={metrics.activePumps} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 背景扫描纹理 */}
              <div className="absolute inset-0 tech-grid-bg opacity-5 pointer-events-none"></div>
           </div>

           {/* 排水动力学实时数据流 */}
           <div className="h-44">
              <SciFiCard title="排水管网压力与流量耦合分析" noPadding className="h-full border-cyan-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={levelHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Bar dataKey="in" fill="#3b82f6" fillOpacity={0.2} barSize={10} />
                       <Line type="monotone" dataKey="lv" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：机电诊断矩阵与巡检任务 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           
           <SciFiCard title="排水机组健康矩阵" className="bg-[#0f172a]/40 border-cyan-900/30">
              <div className="flex flex-col gap-3 py-1">
                 {metrics.pumpsStatus.map(p => (
                    <div key={p.id} className={`p-3 rounded border transition-all ${p.status === 'running' ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                             <RotateCw size={14} className={p.status === 'running' ? 'text-cyan-400 animate-spin' : 'text-slate-600'} />
                             <span className="text-xs font-bold text-slate-200">机组 {p.id}</span>
                          </div>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${p.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                             {p.status}
                          </span>
                       </div>
                       <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono text-slate-400">
                          <div className="flex justify-between"><span>轴承温:</span> <span className="text-white">{p.temp}°C</span></div>
                          <div className="flex justify-between"><span>振动值:</span> <span className="text-white">{p.vib}</span></div>
                          <div className="flex justify-between"><span>频率:</span> <span className="text-white">49Hz</span></div>
                          <div className="flex justify-between"><span>负荷:</span> <span className="text-cyan-400">82%</span></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="智能巡检任务序列" className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-4">
                 {inspectionTasks.map(task => (
                    <div key={task.id} className="p-3 bg-slate-900/40 border border-white/5 rounded flex gap-4 hover:border-cyan-500/40 transition-all cursor-pointer group">
                       <div className={`w-10 h-10 rounded flex items-center justify-center border transition-all ${task.status === 'processing' ? 'border-cyan-500/50 bg-cyan-500/10 animate-pulse' : 'border-white/10 bg-white/5'}`}>
                          {task.status === 'completed' ? <ShieldCheck size={18} className="text-green-500"/> : task.status === 'processing' ? <Scan size={18} className="text-cyan-400"/> : <RotateCw size={18} className="text-slate-600"/>}
                       </div>
                       <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-slate-200 uppercase">{task.name}</span>
                             <span className="text-[8px] text-slate-500 font-mono">{task.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className={`w-1 h-1 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'processing' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                             <span className={`text-[8px] font-bold uppercase ${task.status === 'completed' ? 'text-green-500' : task.status === 'processing' ? 'text-cyan-400' : 'text-slate-600'}`}>{task.status}</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 紧急调度区 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 p-3 bg-orange-600/10 border border-orange-500/30 rounded">
                       <AlertTriangle size={18} className="text-orange-500 mt-1 shrink-0" />
                       <div className="leading-tight">
                          <div className="text-[10px] font-black text-orange-200 uppercase">System Suggestion</div>
                          <p className="text-[9px] text-orange-300/80 mt-1 font-bold">水位持续上涨，建议 15min 后联启 3 号备用泵。</p>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                       发起全站智能联动
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
