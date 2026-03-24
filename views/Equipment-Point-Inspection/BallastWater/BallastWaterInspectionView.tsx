import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/BallastWater/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Waves, Activity, ShieldCheck, Zap, Droplets, 
  MapPin, Thermometer, Camera, Eye, Layers, 
  Scan, Info, History, Database, Wind, Anchor,
  ShieldAlert, RefreshCw, Filter, Microscope
} from 'lucide-react';

export const BallastWaterInspectionView: React.FC = () => {
  const [systemState, setSystemState] = useState({
    totalBallast: 4250.8, // m3
    avgSalinity: 32.4, // PSU
    phValue: 7.82,
    uvIntensity: 98.5, // %
    pumpRate: 1250, // m3/h
    oxygenLevel: 6.2, // mg/L
  });

  const [tanks, setTanks] = useState([
    { id: 'FP_01', name: '首尖舱', level: 82.4, status: 'normal' },
    { id: 'P3_DB', name: '3号左舷双层底', level: 45.1, status: 'warning' },
    { id: 'S3_DB', name: '3号右舷双层底', level: 44.8, status: 'normal' },
    { id: 'AP_02', name: '尾尖舱', level: 12.5, status: 'normal' },
  ]);

  const [inspectionEvents, setInspectionEvents] = useState([
    { id: 1, type: '生物活性', msg: '紫外线杀菌单元 (BWTS) 效能监测: 100% 达标', severity: 'success', time: '16:20' },
    { id: 2, type: '结构诊断', msg: '3号左舷底舱发现 0.2mm 焊缝微渗风险', severity: 'warning', time: '16:15' },
    { id: 3, type: '传感器校准', msg: '电磁流量计自校准完成，误差 <0.1%', severity: 'info', time: '16:05' },
  ]);

  const [flowHistory, setFlowHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemState(prev => ({
        ...prev,
        totalBallast: prev.totalBallast + (Math.random() - 0.5) * 5,
        uvIntensity: 98 + Math.random() * 1.5
      }));

      setFlowHistory(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          f: 1200 + Math.random() * 100, 
          p: 0.45 + Math.random() * 0.05 
        };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const radarData = [
    { subject: '生物合规性', A: 98, fullMark: 100 },
    { subject: '能效匹配', A: 92, fullMark: 100 },
    { subject: '结构稳定性', A: 85, fullMark: 100 },
    { subject: '传感器精度', A: 96, fullMark: 100 },
    { subject: '自律修复力', A: 80, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：压载水智慧指挥栏 */}
      <div className="bg-[#0b1221]/90 border border-blue-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/40 rounded-sm shadow-[0_0_20px_rgba(14,165,233,0.3)]">
               <Waves size={32} className="text-blue-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  船舶压载水系统智能巡检中心 <span className="text-blue-500 text-xl not-italic ml-2 tracking-normal">// BALLAST_INTEL_HUB_V3</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> 位置: 马六甲海峡航段</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 智能监控模式 (IMO-D2)</span>
                  <span className="flex items-center gap-1"><Zap size={12}/> 实时功耗: 42.5 kW</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">总压载水量 VOLUME</div>
                <div className="text-3xl font-mono font-black text-white">{systemState.totalBallast.toFixed(1)} <span className="text-sm text-blue-500">m³</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">紫外杀菌强度 UV_INT</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{systemState.uvIntensity.toFixed(1)}%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 孪生巡检视图 (占左上 45% 左右) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-blue-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_80px_rgba(14,165,233,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-blue-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-blue-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-blue-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">AI 智能寻检路径</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase italic">TANK_SCAN_ACTIVE</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时参数仪表 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-blue-950/80 p-3 rounded border border-blue-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter">Avg Salinity</div>
                        <div className="text-2xl font-mono font-bold text-white">{systemState.avgSalinity.toFixed(1)} PSU</div>
                    </div>
                    <div className="bg-blue-950/80 p-3 rounded border border-blue-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter">Dissolved Oxygen</div>
                        <div className="text-2xl font-mono font-bold text-white">{systemState.oxygenLevel.toFixed(2)} mg/L</div>
                    </div>
                 </div>

                 {/* 排水泵自律视野 */}
                 <div className="absolute bottom-10 left-10 w-52 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-1 left-1 bg-red-600 px-1 text-[8px] font-bold uppercase">UAV_PUMP_LIVE</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Filter size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-blue-500/10 text-[8px] p-2 text-center font-bold italic text-blue-300">
                       正在扫描 #3 舱室阀门执行器状态...
                    </div>
                 </div>
              </div>

              <ThreeScene tanks={tanks} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-5 pointer-events-none"></div>
           </div>

           {/* 底部：趋势与能效 */}
           <div className="h-44 grid grid-cols-2 gap-5">
              <SciFiCard title="压载泵组流量与压力平衡" noPadding className="border-blue-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={flowHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="f" name="流量 (m3/h)" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                       <Line type="stepAfter" dataKey="p" name="压力 (MPa)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="压载水处理系统综合评价雷达" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <Radar name="评价指数" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧区域：舱室健康与巡检发现 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
           
           {/* 舱室液位与健康分布 */}
           <SciFiCard title="压载舱组实时液位矩阵" className="bg-[#1a1c2e]/40 border-blue-900/30">
              <div className="grid grid-cols-2 gap-4 h-full py-1">
                 {tanks.map(tank => (
                    <div key={tank.id} className={`p-4 bg-slate-900/60 border rounded relative overflow-hidden group hover:border-blue-500/50 transition-all ${tank.status === 'warning' ? 'border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{tank.name}</div>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${tank.status === 'warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{tank.status}</span>
                       </div>
                       <div className="flex items-end gap-3 mt-1">
                          <div className="text-3xl font-mono font-black text-white">{tank.level.toFixed(1)} <span className="text-sm font-normal text-slate-500">%</span></div>
                       </div>
                       <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${tank.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} style={{width: `${tank.level}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* AI 巡检识别日志 */}
           <SciFiCard title="AI 巡检发现日志 (实时推理流)" className="flex-1 border-blue-900/40">
              <div className="flex flex-col gap-4">
                 {inspectionEvents.map(event => (
                    <div key={event.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer hover:bg-white/5 ${event.severity === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-blue-500'}`}>
                       <div className="w-12 h-12 bg-slate-800 rounded border border-white/5 flex items-center justify-center shrink-0">
                          {event.type.includes('生物') ? <Microscope size={20} className="text-green-400" /> : event.type.includes('结构') ? <ShieldAlert size={20} className="text-orange-400" /> : <RefreshCw size={20} className="text-blue-400" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${event.severity === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>{event.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-bold leading-relaxed">{event.msg}</div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 应急闭环区域 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start gap-3">
                       <ShieldAlert size={20} className="text-red-500 animate-pulse shrink-0" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase italic">Biological Protocol Alpha</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tight">检测到排放口生物活性超标风险，建议立即增加紫外剂量。</div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(14,165,233,0.3)]">
                       执行一键智能平衡压载
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 分布式采集节点 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-950/50 rounded flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Database size={18} className="text-blue-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">边缘采集节点</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // Ballast_Node_12</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
