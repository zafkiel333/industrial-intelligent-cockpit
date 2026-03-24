import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PassengerBoardingBridge/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, Bar
} from 'recharts';
import { 
  Plane, Link, Shield, Activity, Eye, Zap, 
  MoveHorizontal, AlertCircle, CheckCircle2, 
  MapPin, Clock, History, Database, Camera, Scan,
  Anchor, ChevronRight
} from 'lucide-react';

export const PassengerBoardingBridgeView: React.FC = () => {
  const [bridgeData, setBridgeData] = useState({
    length: 12.5, // meters
    angle: 4.2, // degrees
    cabYaw: 15, // degrees
    hydraulicPressure: 18.4, // MPa
    loadBearing: 450, // kg/m2
    syncError: 0.02 // mm
  });

  const [aiLogs, setAiLogs] = useState([
    { id: 1, type: '结构异常', msg: '二节隧道滚轮轨道磨损 0.8mm', severity: 'warning', time: '14:20' },
    { id: 2, type: '液压渗漏', msg: '主升降油缸 B 侧密封圈疑似渗油', severity: 'critical', time: '14:15' },
    { id: 3, type: '对接诊断', msg: '邮轮接船口密封性匹配度 98.4%', severity: 'normal', time: '14:05' },
  ]);

  const [stressHistory, setStressHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBridgeData(prev => ({
        ...prev,
        length: 12 + Math.sin(Date.now()/2000) * 0.5,
        syncError: Math.random() * 0.05
      }));

      setStressHistory(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          stress: 40 + Math.random() * 15,
          temp: 24 + Math.random() * 2 
        };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const healthRadar = [
    { subject: '结构强度', A: 96, fullMark: 100 },
    { subject: '液压动力', A: 82, fullMark: 100 },
    { subject: '同步精度', A: 98, fullMark: 100 },
    { subject: '环境适应', A: 90, fullMark: 100 },
    { subject: '安防冗余', A: 95, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：全息指挥面板 */}
      <div className="bg-[#0b1221]/90 border border-sky-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-sky-500/10 border border-sky-500/40 rounded-sm">
               <Link size={32} className="text-sky-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  港口登船桥智能点巡检系统 <span className="text-sky-500 text-xl not-italic ml-2 tracking-normal">// BRIDGE_EYE_SCAN_V9</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-500"/> 泊位: CRUISE_TERM_08</span>
                  <span className="flex items-center gap-1 text-green-400"><Shield size={12}/> 系统状态: 自律全息巡航</span>
                  <span className="flex items-center gap-1"><Activity size={12}/> 实时风速: 8.4m/s (安全)</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">油缸同步误差 SYNC_ERR</div>
                <div className="text-3xl font-mono font-black text-white">{bridgeData.syncError.toFixed(3)} <span className="text-sm text-sky-500">mm</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">综合健康指数 HEALTH</div>
                <div className="text-3xl font-mono font-black text-emerald-400">94.2</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 孪生巡检视图 (占据 12列中的 8列) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-sky-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_60px_rgba(14,165,233,0.05)]">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-sky-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-sky-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-sky-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">LiDAR 激光扫描</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">TUNNEL_STRUCTURE_LOCK</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时参数浮窗 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-sky-950/80 p-3 rounded border border-sky-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">Tunnel Length</div>
                        <div className="text-2xl font-mono font-bold text-white">{bridgeData.length.toFixed(1)}m</div>
                    </div>
                    <div className="bg-sky-950/80 p-3 rounded border border-sky-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">Cab Rotation</div>
                        <div className="text-2xl font-mono font-bold text-white">{bridgeData.cabYaw.toFixed(1)}°</div>
                    </div>
                 </div>

                 {/* AI 缺陷识别框模拟 */}
                 <div className="absolute top-[40%] right-[30%] w-32 h-20 border-2 border-red-500/40 pointer-events-none">
                    <div className="absolute -top-6 left-0 bg-red-600 px-2 text-[8px] font-black text-white italic">DEFECT: HYDRAULIC_LEAK 84%</div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-500"></div>
                 </div>

                 {/* 底部交互提示 */}
                 <div className="absolute bottom-10 left-10">
                    <div className="bg-sky-600 text-black px-4 py-1 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2">
                       <Database size={14}/> 实时数据链路：已锁定邮轮 "Ocean Pacific"
                    </div>
                 </div>
              </div>

              <ThreeScene length={(bridgeData.length - 12) * 2} rotation={bridgeData.cabYaw * Math.PI / 180} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>
        </div>

        {/* 右上区域：核心监控矩阵 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
           <SciFiCard title="结构载荷与环境平衡" className="bg-[#0f172a]/60 border-sky-900/40 h-2/5">
              <div className="flex flex-col h-full gap-4 py-2">
                 <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between group hover:border-sky-500/30 transition-all">
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="text-yellow-400 group-hover:animate-bounce" />
                       <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">液压主压强</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-white">{bridgeData.hydraulicPressure} <span className="text-xs text-slate-500">MPa</span></span>
                 </div>
                 <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between group hover:border-sky-500/30 transition-all">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-emerald-400" />
                       <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">动态风压载荷</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-white">14.2 <span className="text-xs text-slate-500">kN</span></span>
                 </div>
                 <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex flex-col gap-2">
                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase">结构形变偏移量 DEFLECTION</div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 shadow-[0_0_10px_cyan]" style={{width: '24%'}}></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="综合健康诊断雷达" className="flex-1 border-sky-900/30">
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="65%" data={healthRadar}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="健康评价" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                 </RadarChart>
              </ResponsiveContainer>
           </SciFiCard>
        </div>

        {/* 底部区域：AI 发现流、趋势分析、任务管理 */}
        <div className="col-span-12 grid grid-cols-12 gap-5 h-64">
           
           {/* AI 巡检识别日志 */}
           <SciFiCard title="AI 巡检识别发现流" className="col-span-12 lg:col-span-5 border-sky-900/30">
              <div className="flex flex-col gap-3 py-1 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                 {aiLogs.map(log => (
                    <div key={log.id} className={`p-3 bg-slate-900/60 border rounded-sm flex gap-4 transition-all hover:bg-sky-500/5 ${log.severity === 'critical' ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
                       <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center shrink-0 border border-white/5">
                          {log.severity === 'critical' ? <AlertCircle size={20} className="text-red-500 animate-pulse"/> : <Eye size={20} className="text-sky-400"/>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${log.severity === 'critical' ? 'text-red-400' : 'text-sky-400'}`}>{log.type}</span>
                             <span className="text-[9px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-bold truncate leading-tight">{log.msg}</div>
                          <div className="mt-1 flex items-center gap-2">
                             <div className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">核验源: CAM_UNIT_02</div>
                             <button className="text-[8px] text-sky-500 font-black hover:underline uppercase italic">{">>>"} 详情</button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* 实时应力演化流图 */}
           <SciFiCard title="主梁应力实时演化流图" noPadding className="col-span-12 lg:col-span-4 border-sky-900/30">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stressHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                    <defs>
                       <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                    <Area type="monotone" dataKey="stress" stroke="#0ea5e9" fill="url(#colorStress)" strokeWidth={2} />
                    <Line type="stepAfter" dataKey="temp" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                 </AreaChart>
              </ResponsiveContainer>
           </SciFiCard>

           {/* 自动化巡检控制与响应 */}
           <SciFiCard title="自律巡检应急闭环" className="col-span-12 lg:col-span-3 border-sky-900/30">
              <div className="flex flex-col h-full gap-3 py-1">
                 <div className="p-3 bg-red-600/10 border border-red-500/30 rounded flex items-start gap-3">
                    <Shield size={20} className="text-red-500 shrink-0" />
                    <div className="leading-tight">
                       <div className="text-[10px] font-black text-red-100 uppercase italic">Security Protocol Delta</div>
                       <p className="text-[9px] text-red-400 mt-1 uppercase font-bold tracking-tighter">监测到液压压力下降异常，建议立即锁定对接机构。</p>
                    </div>
                 </div>
                 <button className="mt-auto w-full py-4 bg-sky-600 hover:bg-sky-700 transition-all text-white font-black uppercase text-xs italic tracking-[0.3em] shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2">
                    <History size={16}/> 执行一键自律复位
                 </button>
              </div>
           </SciFiCard>

        </div>

      </div>

    </div>
  );
};
