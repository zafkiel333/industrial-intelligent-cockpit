import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PortBerth/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { 
  Anchor, Activity, Ship, Compass, Ruler, 
  MapPin, ShieldCheck, Zap, Thermometer, Camera,
  Scan, History, Database, Waves, AlertTriangle, 
  Info, RefreshCw, BarChart3, Wind
} from 'lucide-react';

export const PortBerthInspectionView: React.FC = () => {
  const [dockingParams, setDockingParams] = useState({
    distBow: 4.52, // meters
    distStern: 4.88, // meters
    velocity: 0.12, // m/s
    angle: 1.2, // degrees
    kineticEnergy: 1450, // kJ
    tideLevel: 2.1 // meters
  });

  const [mooringTensions, setMooringTensions] = useState([
    { id: 'L1', val: 42, status: 'normal' },
    { id: 'L2', val: 38, status: 'normal' },
    { id: 'L3', val: 75, status: 'warning' },
    { id: 'L4', val: 40, status: 'normal' },
    { id: 'L5', val: 35, status: 'normal' },
    { id: 'L6', val: 44, status: 'normal' },
  ]);

  const [aiObservations, setAiObservations] = useState([
    { id: 1, type: '结构疲劳', msg: '4#系缆桩根部发现微细裂纹', confidence: 0.89, time: '10:45' },
    { id: 2, type: '腐蚀监测', msg: '护弦面板防腐涂层 15% 剥落', confidence: 0.94, time: '10:42' },
    { id: 3, type: '异物检测', msg: '泊位底泥发现沉没障碍物', confidence: 0.78, time: '10:35' },
  ]);

  const [tideHistory, setTideHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDockingParams(prev => ({
        ...prev,
        distBow: Math.max(0.2, prev.distBow - 0.01),
        distStern: Math.max(0.2, prev.distStern - 0.008),
        velocity: 0.1 + Math.random() * 0.05
      }));

      setTideHistory(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString().slice(-8), 
          tide: 2.1 + Math.sin(Date.now() / 10000) * 0.5,
          current: 0.8 + Math.random() * 0.2
        }];
        return newData.slice(-20);
      });
      
      // 随机张力波动
      setMooringTensions(prev => prev.map(l => ({
        ...l,
        val: l.id === 'L3' ? 70 + Math.random() * 10 : 35 + Math.random() * 10
      })));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const fenderHeatData = [
    { subject: '1# 护弦', A: 45, fullMark: 100 },
    { subject: '2# 护弦', A: 52, fullMark: 100 },
    { subject: '3# 护弦', A: 85, fullMark: 100 },
    { subject: '4# 护弦', A: 50, fullMark: 100 },
    { subject: '5# 护弦', A: 48, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：港口智慧大脑导航栏 */}
      <div className="bg-[#0b1221]/90 border border-emerald-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-sm">
               <Anchor size={32} className="text-emerald-400 animate-bounce" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  泊位智能点巡检指挥系统 <span className="text-emerald-500 text-xl not-italic ml-2 tracking-normal">// BERTH_SEC_CENTER</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500"/> 泊位编号: 二期 08# 散货泊位</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 协同巡检模式 (AI_ACTIVE)</span>
                  <span className="flex items-center gap-1"><History size={12}/> 当前作业船舶: MV OCEAN_PACIFIC</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">当前实时潮位 TIDE</div>
                <div className="text-3xl font-mono font-black text-white">{dockingParams.tideLevel.toFixed(2)} <span className="text-sm text-emerald-500">m</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">靠泊安全系数 SAFE_INDEX</div>
                <div className="text-3xl font-mono font-black text-emerald-400">0.982</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 数字孪生巡检 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-emerald-500/10 rounded-sm overflow-hidden group">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-emerald-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-emerald-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-emerald-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">BAS 激光测距链路</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">STABLE // DATA_SYNC</div>
                       </div>
                    </div>
                 </div>

                 {/* 距离显示浮窗 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-emerald-950/80 p-3 rounded border border-emerald-500/40 text-right">
                        <div className="text-[8px] text-emerald-400 font-bold uppercase">Bow Dist (船艏)</div>
                        <div className="text-2xl font-mono font-bold">{dockingParams.distBow.toFixed(2)}m</div>
                    </div>
                    <div className="bg-emerald-950/80 p-3 rounded border border-emerald-500/40 text-right">
                        <div className="text-[8px] text-emerald-400 font-bold uppercase">Stern Dist (船艉)</div>
                        <div className="text-2xl font-mono font-bold">{dockingParams.distStern.toFixed(2)}m</div>
                    </div>
                 </div>

                 {/* ROV 水下视野 */}
                 <div className="absolute bottom-10 left-10 w-48 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden">
                    <div className="absolute top-1 left-1 bg-blue-600 px-1 text-[8px] font-bold">ROV_UNDERWATER_01</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Waves size={24} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-blue-900/40 text-[8px] p-1 text-center font-bold">
                       基床状态：未见异常冲刷
                    </div>
                 </div>
              </div>

              <ThreeScene shipDist={dockingParams.distBow} shipAngle={dockingParams.angle} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>
        </div>

        {/* 右上区域：动力学与压力矩阵 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="grid grid-cols-2 gap-5 h-2/5">
              <SciFiCard title="靠泊动力学核心参数" className="bg-[#0f172a]/60 border-emerald-900/40">
                 <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">触碰速度 (Approach)</div>
                       <div className="text-2xl font-mono font-bold text-white">{dockingParams.velocity.toFixed(2)} <span className="text-xs">m/s</span></div>
                    </div>
                    <div className="flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">吸收动能 (Energy)</div>
                       <div className="text-2xl font-mono font-bold text-emerald-400">{dockingParams.kineticEnergy} <span className="text-xs">kJ</span></div>
                    </div>
                    <div className="flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">泊位偏角 (Angle)</div>
                       <div className="text-2xl font-mono font-bold text-white">{dockingParams.angle.toFixed(1)} <span className="text-xs">deg</span></div>
                    </div>
                    <div className="flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">环境能见度</div>
                       <div className="text-2xl font-mono font-bold text-cyan-400">8.5 <span className="text-xs">km</span></div>
                    </div>
                 </div>
              </SciFiCard>
              <SciFiCard title="护弦压力载荷分布" className="bg-[#0f172a]/60 border-emerald-900/40">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={fenderHeatData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="压力值" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>

           <div className="flex-1 grid grid-cols-3 gap-5">
              <SciFiCard title="系缆张力矩阵 (L1-L6)" className="col-span-2 border-emerald-900/30">
                 <div className="grid grid-cols-3 gap-4 py-2">
                    {mooringTensions.map(l => (
                       <div key={l.id} className={`p-3 rounded border transition-all ${l.status === 'warning' ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-900/40 border-white/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-slate-400">Line {l.id}</span>
                             {l.status === 'warning' && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                          </div>
                          <div className="text-lg font-mono font-black text-white">{l.val.toFixed(1)} <span className="text-[10px]">t</span></div>
                          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                             <div className={`h-full ${l.status === 'warning' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${l.val}%`}}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </SciFiCard>
              <SciFiCard title="环境实时态势" className="border-emerald-900/30">
                 <div className="flex flex-col gap-4 py-2">
                    <div className="flex items-center gap-3">
                       <Wind size={20} className="text-cyan-400" />
                       <div>
                          <div className="text-[10px] text-slate-500">平均风速</div>
                          <div className="text-lg font-mono font-bold">12.4 m/s</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <RefreshCw size={20} className="text-emerald-400 animate-spin" style={{animationDuration: '10s'}} />
                       <div>
                          <div className="text-[10px] text-slate-500">表面流速</div>
                          <div className="text-lg font-mono font-bold">0.82 kn</div>
                       </div>
                    </div>
                    <div className="p-3 bg-emerald-950/20 rounded border border-emerald-500/20">
                       <div className="text-[9px] text-emerald-400 font-bold uppercase mb-1">巡检建议</div>
                       <p className="text-[10px] text-slate-400 leading-tight">建议在 14:00 潮平期间执行水下桩基 3D 扫描。</p>
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 底部区域：AI 发现流与任务清单 */}
        <div className="col-span-12 grid grid-cols-12 gap-5 h-48">
           <SciFiCard title="AI 巡检视觉识别流" className="col-span-12 lg:col-span-4 border-emerald-900/30">
              <div className="flex gap-4 h-full">
                 <div className="w-24 h-full bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden">
                    <Camera size={32} className="text-slate-600" />
                    <div className="absolute top-1 left-1 bg-red-600 text-[8px] px-1 font-bold">AI_CAM_04</div>
                 </div>
                 <div className="flex-1 flex flex-col gap-2 py-1 overflow-y-auto">
                    {aiObservations.map(obs => (
                       <div key={obs.id} className="flex justify-between items-center p-2 bg-slate-900/40 rounded border-l-2 border-emerald-500">
                          <div>
                             <div className="text-[10px] font-black text-emerald-400 uppercase">{obs.type}</div>
                             <div className="text-[11px] text-slate-200">{obs.msg}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] text-slate-500 font-mono">{obs.time}</div>
                             <div className="text-[9px] text-emerald-600 font-black">{(obs.confidence*100).toFixed(0)}%</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="泊位结构形变趋势" noPadding className="col-span-12 lg:col-span-5 border-emerald-900/30">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={tideHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                    <defs>
                       <linearGradient id="colorTide" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                    <Area type="monotone" dataKey="tide" stroke="#10b981" fill="url(#colorTide)" strokeWidth={2} />
                    <Line type="stepAfter" dataKey="current" stroke="#0ea5e9" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </SciFiCard>

           <SciFiCard title="今日巡检任务闭环" className="col-span-12 lg:col-span-3 border-emerald-900/30">
              <div className="flex flex-col h-full gap-2 py-1">
                 {[
                    { t: '系缆桩拉拔力测试', s: 'done' },
                    { t: '靠泊基岩 ROV 扫描', s: 'processing' },
                    { t: '岸边电箱绝缘巡检', s: 'pending' },
                 ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/40 rounded border border-white/5 group">
                       <div className={`w-1.5 h-1.5 rounded-full ${t.s === 'done' ? 'bg-green-500' : t.s === 'processing' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></div>
                       <span className={`text-xs ${t.s === 'processing' ? 'text-white font-bold' : 'text-slate-400'}`}>{t.t}</span>
                    </div>
                 ))}
                 <button className="mt-auto py-2 bg-emerald-600 hover:bg-emerald-700 transition-all text-white font-black uppercase text-[10px] tracking-[0.2em] italic">
                    下载本日巡检报告 (PDF)
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>

    </div>
  );
};
