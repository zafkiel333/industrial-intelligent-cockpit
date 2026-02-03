
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroEmergencyThreeScene } from '../../components/ServiceDataManagement/HydroEmergency/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Siren, Zap, CloudRain, ShieldAlert, Radio, 
  ArrowRight, Activity, LifeBuoy, PhoneCall, 
  AlertTriangle, Megaphone, Truck
} from 'lucide-react';

export const HydroEmergencyDispatchView: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<string>('gate-spillway');
  const [defconLevel, setDefconLevel] = useState(2); // 1 (Critical) to 5 (Normal)
  const [rainSim, setRainSim] = useState(0.8);

  // Mock Data
  const floodData = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    inflow: 2500 + Math.pow(i, 2) * 5 + (Math.random()*200), // Rising fast
    level: 145 + i * 0.2, // Rising
    limit: 148 // Dam crest/limit
  }));

  const resourceReadiness = [
    { subject: '应急电源', A: 95, fullMark: 100 },
    { subject: '防汛物资', A: 88, fullMark: 100 },
    { subject: '抢修队伍', A: 100, fullMark: 100 },
    { subject: '通信链路', A: 75, fullMark: 100 }, // Weakness
    { subject: '后勤保障', A: 90, fullMark: 100 },
  ];

  const emergencyLog = [
    { time: '14:20', type: 'CRITICAL', msg: '上游测站洪峰流量超 3000m³/s' },
    { time: '14:15', type: 'WARNING', msg: '坝前水位达到警戒线 148.5m' },
    { time: '14:10', type: 'INFO', msg: '防汛指挥部启动 II 级响应' },
    { time: '14:05', type: 'ACTION', msg: '开启 1# 3# 表孔泄洪闸' },
  ];

  const assetStatus: Record<string, any> = {
    'gate-spillway': { name: '表孔溢洪道', status: '全开泄洪', load: '100%', msg: '流量 1200 m³/s' },
    'gen-backup': { name: '应急柴油机', status: '热备用', load: '0%', msg: '油箱液位 95%' },
    'road-access': { name: '坝顶交通桥', status: '交通管制', load: 'N/A', msg: '禁止通行' },
    'sens-level': { name: '水位遥测站', status: '数据正常', load: 'Active', msg: '实时上传中' },
  };

  const activeInfo = assetStatus[activeAsset] || assetStatus['gate-spillway'];

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Randomly adjust rain for visual effect
        setRainSim(prev => Math.min(1, Math.max(0.5, prev + (Math.random()-0.5)*0.1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#1a0505] p-2 overflow-hidden select-none">
      
      {/* 顶部：红色警戒指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/80 via-red-900/60 to-transparent border-b border-red-600/40 rounded-t-xl relative overflow-hidden">
        {/* Pulsing Background */}
        <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none"></div>
        
        <div className="flex items-center gap-5 z-10">
           <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-bounce">
              <Siren className="text-red-500" size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic text-shadow-glow">水电站应急调度与保障服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-red-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><ShieldAlert size={12}/> DEFCON LEVEL: {defconLevel}</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><CloudRain size={12}/> WEATHER: SEVERE STORM</span>
                 <span>|</span>
                 <span className="text-white font-bold bg-red-600 px-2 rounded">RESPONSE ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4 z-10">
           <div className="px-4 py-2 bg-black/60 border border-red-900 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-red-400 uppercase font-bold">Flood Peak (Est)</div>
              <div className="text-2xl font-mono font-black text-white">3,450 <span className="text-xs text-slate-500">m³/s</span></div>
           </div>
           <div className="px-4 py-2 bg-black/60 border border-red-900 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-red-400 uppercase font-bold">Hours to Crest</div>
              <div className="text-2xl font-mono font-black text-white">4.5 <span className="text-xs text-slate-500">h</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：威胁情报与日志 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Flood Graph */}
           <SciFiCard title="入库流量突变监测" subtitle="FLOOD SURGE" className="bg-[#2a0a0a]/80 border-red-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={floodData}>
                       <defs>
                          <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#450a0a" vertical={false} />
                       <XAxis dataKey="time" stroke="#991b1b" tick={{fontSize: 10}} />
                       <YAxis stroke="#991b1b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #ef4444', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="inflow" stroke="#ef4444" fill="url(#colorInflow)" strokeWidth={2} name="Inflow" />
                       <Line type="monotone" dataKey="limit" stroke="#ffffff" strokeDasharray="5 5" dot={false} strokeWidth={1} name="Dam Limit" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 p-2 bg-red-950/40 border border-red-900 rounded flex items-center gap-2">
                 <AlertTriangle className="text-red-500" size={14} />
                 <span className="text-[10px] text-red-200">预测洪峰将在 18:00 到达，超设计标准 5%。</span>
              </div>
           </SciFiCard>

           {/* Emergency Log */}
           <SciFiCard title="应急事件实时流" subtitle="EVENT LOG" className="flex-1 border-red-900/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-full">
                 {emergencyLog.map((log, i) => (
                    <div key={i} className={`p-2 rounded border border-l-4 ${
                        log.type === 'CRITICAL' ? 'bg-red-950/40 border-red-600 border-l-red-500' :
                        log.type === 'WARNING' ? 'bg-orange-950/40 border-orange-800 border-l-orange-500' :
                        'bg-slate-900/40 border-slate-700 border-l-blue-500'
                    }`}>
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                          <span className="text-[9px] font-bold px-1 rounded bg-black">{log.type}</span>
                       </div>
                       <div className="text-xs text-white">{log.msg}</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：暴风雨中的大坝 (3D) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#2a0505] to-[#050000] border border-red-500/30 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(220,38,38,0.2)]">
              
              {/* HUD: Asset Detail */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-red-500/40 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-red-500/20 pb-2 mb-2">
                       <Zap className="text-red-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Asset</div>
                          <div className="text-sm font-black text-white uppercase">{activeInfo.name}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                       <div>状态: <span className="text-red-400 font-bold">{activeInfo.status}</span></div>
                       <div>负载: <span className="text-white font-mono">{activeInfo.load}</span></div>
                       <div className="col-span-2 text-slate-400 italic border-t border-white/10 pt-1 mt-1">
                          {activeInfo.msg}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Rain/Storm Toggle */}
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                 <div className="flex items-center gap-2 bg-red-950/80 px-3 py-1 rounded border border-red-500/50">
                    <CloudRain className="text-slate-300" size={14} />
                    <span className="text-xs text-white">Rain: {(rainSim*100).toFixed(0)}%</span>
                 </div>
              </div>

              <HydroEmergencyThreeScene 
                 waterLevel={4} // Higher visual level
                 rainIntensity={rainSim}
                 lightningActive={true}
                 activeAssetId={activeAsset}
                 onAssetSelect={setActiveAsset}
              />

              {/* Emergency Action Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-[0_0_20px_red] transition-all flex items-center gap-2 animate-pulse">
                    <Megaphone size={14} /> 全厂撤离广播
                 </button>
                 <button className="bg-slate-900/80 hover:bg-slate-800 border border-red-500/50 text-red-100 px-6 py-2 rounded-full text-xs font-bold backdrop-blur flex items-center gap-2">
                    <Radio size={14} /> 联系防汛办
                 </button>
              </div>
           </div>

           {/* Communication Stats */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    <Radio size={14} /> Emergency Comm Links
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                 <div className="bg-black/40 p-2 rounded border border-green-900/30 text-center">
                    <div className="text-[9px] text-slate-500">Satellite</div>
                    <div className="text-green-500 font-bold">ONLINE</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded border border-yellow-900/30 text-center">
                    <div className="text-[9px] text-slate-500">4G/5G Public</div>
                    <div className="text-yellow-500 font-bold">UNSTABLE</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded border border-green-900/30 text-center">
                    <div className="text-[9px] text-slate-500">Internal UHF</div>
                    <div className="text-green-500 font-bold">ONLINE</div>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：保障资源与预案 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Readiness Radar */}
           <SciFiCard title="应急保障就绪度" subtitle="READINESS" className="border-red-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={resourceReadiness}>
                       <PolarGrid stroke="#331111" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#991b1b', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Readiness" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Resource Dispatch */}
           <SciFiCard title="物资与队伍调度" subtitle="LOGISTICS" className="flex-1 border-red-900/50">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <LifeBuoy className="text-orange-400" size={20} />
                    <div className="flex-1">
                       <div className="flex justify-between text-xs text-slate-300">
                          <span>防汛沙袋 (5000袋)</span>
                          <span className="text-green-400">已就位</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded mt-1">
                          <div className="h-full bg-green-500 w-full"></div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <Truck className="text-blue-400" size={20} />
                    <div className="flex-1">
                       <div className="flex justify-between text-xs text-slate-300">
                          <span>移动电源车 (2台)</span>
                          <span className="text-yellow-400">在途中 (15min)</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded mt-1">
                          <div className="h-full bg-yellow-500 w-[70%] animate-pulse"></div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">预案执行进度 (SOP: FLOOD-01)</div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                       <span className="text-green-400">1. 预警发布</span>
                       <ArrowRight size={10} />
                       <span className="text-green-400">2. 闸门开启</span>
                       <ArrowRight size={10} />
                       <span className="text-white border border-red-500 px-1 rounded animate-pulse">3. 人员撤离</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
