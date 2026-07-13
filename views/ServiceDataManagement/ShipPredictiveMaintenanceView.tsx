
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipPredictiveMaintenanceThreeScene } from '../../components/ServiceDataManagement/ShipPredictiveMaintenance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-4]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-4';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { 
  Activity, Search, AlertOctagon, History, Settings, 
  Cpu, Database, Wifi, Microscope, Timer, 
  ArrowRight, FileText, Zap, Ruler
} from 'lucide-react';

export const ShipPredictiveMaintenanceView: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('prop-unit');

  // Mock Data
  const vibrationSpectrum = Array.from({length: 40}, (_, i) => ({
    freq: i * 50, // Hz
    amp: Math.random() * 0.5 + (i === 8 || i === 24 ? 2.5 : 0) // Peaks at 400Hz and 1200Hz
  }));

  const oilAnalysis = [
    { metric: 'Fe (ppm)', value: 45, limit: 100, status: 'normal' },
    { metric: 'Cu (ppm)', value: 12, limit: 20, status: 'normal' },
    { metric: 'Si (ppm)', value: 8, limit: 15, status: 'normal' },
    { metric: 'Water (%)', value: 0.05, limit: 0.1, status: 'normal' },
    { metric: 'Visc @40C', value: 95, limit: 110, status: 'warning' },
  ];

  const predictionTimeline = [
    { date: 'T+7 Days', event: '轴承润滑油膜临界预警', prob: '85%', type: 'warning' },
    { date: 'T+14 Days', event: '螺旋桨空泡腐蚀扩展', prob: '62%', type: 'critical' },
    { date: 'T+30 Days', event: '2号缸排气阀磨损超标', prob: '45%', type: 'info' },
  ];

  const componentDetails: Record<string, any> = {
    'eng-main': { name: '主推进引擎 (Main Engine)', health: 85, rul: '420 Days', vibe: '0.8 mm/s', temp: '68°C' },
    'gear-box': { name: '减速齿轮箱 (Gearbox)', health: 45, rul: '45 Days', vibe: '4.2 mm/s', temp: '82°C' },
    'shaft-sys': { name: '中间轴承组 (Shaft Bearings)', health: 92, rul: '600 Days', vibe: '0.2 mm/s', temp: '45°C' },
    'prop-unit': { name: '螺旋桨推进器 (Propeller)', health: 28, rul: '12 Days', vibe: '6.5 mm/s', temp: 'N/A' },
  };

  const healthRadar = [
    { subject: '振动 (VIB)', A: 65, fullMark: 100 },
    { subject: '热工 (THM)', A: 85, fullMark: 100 },
    { subject: '油液 (OIL)', A: 40, fullMark: 100 },
    { subject: '电气 (ELC)', A: 90, fullMark: 100 },
    { subject: '声学 (ACU)', A: 55, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#050505] p-2 overflow-hidden select-none">
      
      {/* 顶部：PHM 指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-950/30 to-transparent border-b border-violet-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-violet-600/20 border border-violet-500/50 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse">
              <Cpu className="text-violet-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">船舶在役监测与预测性维护服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-400 tracking-[0.2em]">
                 <span className="text-violet-400 font-bold flex items-center gap-2"><Activity size={12}/> PHM 核心引擎: ACTIVE</span>
                 <span>|</span>
                 <span>全船健康指数: 82.4 / 100</span>
                 <span>|</span>
                 <span className="text-red-400 font-bold flex items-center gap-1"><AlertOctagon size={10}/> 待处理预测警报: 03</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">总监测测点</div>
              <div className="text-xl font-mono font-black text-blue-400">1,248 <span className="text-xs text-slate-600">CH</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">预测准确率 (90天)</div>
              <div className="text-xl font-mono font-black text-emerald-500">94.2%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Real-time Diagnostics */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Vibration Spectrum */}
           <SciFiCard title="振动频谱分析 (FFT)" subtitle="HIGH FREQ" className="bg-[#0a0a0f]/80 border-slate-800">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vibrationSpectrum}>
                       <defs>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #8b5cf6', fontSize: '10px'}} />
                       <Area type="step" dataKey="amp" stroke="#a78bfa" fill="url(#colorVib)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-[9px] text-slate-500 text-center mt-1">
                 检测到 400Hz 处存在异常谐波，疑似齿轮啮合故障特征。
              </div>
           </SciFiCard>

           {/* Oil Analysis */}
           <SciFiCard title="油液摩擦学监测" subtitle="TRIBOLOGY" className="flex-1">
              <div className="space-y-3">
                 {oilAnalysis.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                       <div className="flex justify-between text-[10px] text-slate-300">
                          <span>{item.metric}</span>
                          <span className={item.status === 'warning' ? 'text-yellow-400 font-bold' : 'text-emerald-400'}>{item.value}</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${item.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                             style={{width: `${Math.min(100, (item.value / item.limit) * 100)}%`}}
                          ></div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-4 p-2 bg-slate-900/50 border border-slate-700 rounded flex items-center gap-3">
                    <Microscope className="text-violet-400" size={18} />
                    <div className="text-[9px] text-slate-400 leading-tight">
                       铁谱分析显示磨损颗粒呈片状，建议缩短取样周期。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin & Prediction */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#020617] border border-violet-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(124,58,237,0.1)]">
              {/* Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none z-0 opacity-10" 
                   style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(139, 92, 246, .3) 25%, rgba(139, 92, 246, .3) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, .3) 75%, rgba(139, 92, 246, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 92, 246, .3) 25%, rgba(139, 92, 246, .3) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, .3) 75%, rgba(139, 92, 246, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px'}}></div>
              
              {/* HUD: Component RUL */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur-md border border-violet-500/30 p-4 rounded-xl shadow-2xl min-w-[240px]">
                    <div className="flex items-center gap-3 border-b border-violet-500/20 pb-3 mb-3">
                       <Search className="text-violet-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Diagnosing Asset</div>
                          <div className="text-sm font-black text-white uppercase">{componentDetails[activeComponent]?.name}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">剩余寿命 (RUL)</div>
                          <div className={`text-xl font-mono font-bold ${
                             activeComponent === 'prop-unit' ? 'text-red-500 animate-pulse' : 'text-emerald-400'
                          }`}>{componentDetails[activeComponent]?.rul}</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">健康度 Health</div>
                          <div className="text-xl font-mono font-bold text-white">{componentDetails[activeComponent]?.health}%</div>
                       </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-violet-500/10 text-[9px] text-slate-400 font-mono flex justify-between">
                       <span>VIB: {componentDetails[activeComponent]?.vibe}</span>
                       <span>TEMP: {componentDetails[activeComponent]?.temp}</span>
                    </div>
                 </div>
              </div>

              <ShipPredictiveMaintenanceThreeScene
                 activeNodeId={activeComponent}
                 onNodeSelect={setActiveComponent}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                 <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-bold shadow-lg transition-all flex items-center gap-2">
                       <Zap size={12} /> 启动 AI 深度诊断
                    </button>
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-600 transition-all flex items-center gap-2">
                       <History size={12} /> 历史故障回溯
                    </button>
                 </div>
              </div>
           </div>

           {/* Prediction Timeline */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    <Timer size={14} /> 预测性维护时间轴 (Prediction Timeline)
                 </div>
              </div>
              <div className="flex-1 flex gap-4 overflow-x-auto custom-scrollbar pb-2 items-center">
                 {predictionTimeline.map((item, i) => (
                    <div key={i} className={`min-w-[180px] p-3 rounded-lg border flex flex-col gap-1 relative ${
                       item.type === 'critical' ? 'bg-red-950/20 border-red-500/40' : 
                       item.type === 'warning' ? 'bg-yellow-950/20 border-yellow-500/40' : 'bg-blue-950/20 border-blue-500/40'
                    }`}>
                       <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold ${
                             item.type === 'critical' ? 'text-red-400' : item.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                          }`}>{item.date}</span>
                          <span className="text-[9px] bg-black/40 px-1 rounded text-slate-300">{item.prob} Prob</span>
                       </div>
                       <div className="text-[10px] text-white leading-tight mt-1">{item.event}</div>
                       
                       {i < predictionTimeline.length - 1 && (
                          <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 text-slate-600">
                             <ArrowRight size={12} />
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Strategy & Reports */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="子系统健康雷达" subtitle="MULTI-DIMENSIONAL" className="flex-1">
              <div className="h-full flex flex-col">
                 <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={healthRadar}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Health" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="text-center mt-2">
                    <div className="inline-block px-3 py-1 bg-violet-900/30 border border-violet-800 rounded text-[10px] text-violet-300">
                       短板识别: 油液污染度 (OIL) - 40/100
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="智能维护决策建议" subtitle="AI STRATEGY">
              <div className="space-y-3">
                 <div className="flex gap-3 items-start p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-red-500/30 transition-colors cursor-pointer group">
                    <div className="mt-1">
                       <AlertOctagon size={16} className="text-red-500 animate-bounce" />
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-red-400 uppercase mb-1">立即执行 (Critical)</div>
                       <div className="text-[10px] text-slate-400 leading-relaxed group-hover:text-white transition-colors">
                          螺旋桨推进器振动烈度超标，建议停机检查轴封并安排潜水员探摸。
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 items-start p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-yellow-500/30 transition-colors cursor-pointer group">
                    <div className="mt-1">
                       <Settings size={16} className="text-yellow-500" />
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-yellow-400 uppercase mb-1">计划内安排 (Scheduled)</div>
                       <div className="text-[10px] text-slate-400 leading-relaxed group-hover:text-white transition-colors">
                          减速齿轮箱油温呈上升趋势，建议在 200 小时内更换润滑油及滤芯。
                       </div>
                    </div>
                 </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/40 rounded text-[10px] text-violet-200 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <FileText size={12} /> 生成维修工单
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
