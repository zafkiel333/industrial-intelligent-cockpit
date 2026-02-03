
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipEmergencyRepairThreeScene } from '../../components/ServiceDataManagement/ShipEmergencyRepair/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Siren, Wrench, Activity, Radio, TriangleAlert, 
  MapPin, PhoneCall, History, Anchor, Truck, 
  Users, CheckCircle, ShieldAlert, Cpu
} from 'lucide-react';

export const ShipEmergencyRepairView: React.FC = () => {
  const [activeIncident, setActiveIncident] = useState<string>('inc-01');
  const [alertLevel, setAlertLevel] = useState(1); // 0-1

  // Mock Data
  const incidents = {
    'inc-01': { title: '主机第3缸严重爆震', code: 'ERR-ME-03-KNOCK', vessel: 'COSCO STAR', time: '10:42:05', status: '抢修中' },
    'inc-02': { title: '1号辅机配电板高温', code: 'ERR-AE-ELEC-TEMP', vessel: 'EVER GIVEN', time: '09:15:30', status: '专家介入' },
    'inc-03': { title: '艉轴密封水浸报警', code: 'ERR-SHAFT-SEAL', vessel: 'MSC GULSUN', time: '08:00:12', status: '待备件' },
  };

  const sensorData = Array.from({length: 40}, (_, i) => ({
    time: i,
    val: 80 + Math.random() * 20 + (i > 30 ? 50 : 0) // Sudden spike
  }));

  const repairSteps = [
    { step: 1, title: '故障自动捕获与分级', status: 'done', time: '00:00' },
    { step: 2, title: '船岸数据链路锁定', status: 'done', time: '00:02' },
    { step: 3, title: 'AI 预案生成推送', status: 'done', time: '00:05' },
    { step: 4, title: '远程专家介入诊断', status: 'active', time: 'Now' },
    { step: 5, title: '应急备件物流调度', status: 'pending', time: '--:--' },
  ];

  const resourceRadar = [
    { subject: '备件', A: 40, fullMark: 100 },
    { subject: '工具', A: 90, fullMark: 100 },
    { subject: '人力', A: 80, fullMark: 100 },
    { subject: '图纸', A: 100, fullMark: 100 },
    { subject: '通信', A: 65, fullMark: 100 },
  ];

  const nearbyResources = [
    { type: 'Service Hub', name: 'Singapore Base', dist: '120 nm', eta: '6h' },
    { type: 'Supply Ship', name: 'Supply-09', dist: '45 nm', eta: '2h' },
    { type: 'Drone Port', name: 'Coastal-A', dist: '80 nm', eta: 'Out of Range' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#050000] p-2 overflow-hidden select-none">
      
      {/* 顶部：红色警戒指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/60 via-red-900/40 to-transparent border-b border-red-600/30 rounded-t-xl relative overflow-hidden">
        {/* 呼吸灯背景 */}
        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none"></div>
        
        <div className="flex items-center gap-5 z-10">
           <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-bounce">
              <Siren className="text-red-500" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">航运装备应急故障与抢修指挥中心</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-red-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><ShieldAlert size={12}/> ALERT LEVEL: DEFCON 2</span>
                 <span>|</span>
                 <span className="text-white font-bold">ACTIVE INCIDENTS: 03</span>
                 <span>|</span>
                 <span className="animate-pulse">SATELLITE LINK: PRIORITY</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4 z-10">
           <div className="px-4 py-2 bg-black/60 border border-red-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-red-400 uppercase font-bold">Response Time</div>
              <div className="text-xl font-mono font-black text-white">00:12:45</div>
           </div>
           <button className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded border border-red-400 shadow-[0_0_15px_red] transition-all flex items-center gap-2">
              <PhoneCall size={14} /> 全局广播
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：故障情报流 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* 故障列表 */}
           <SciFiCard title="实时故障告警队列" subtitle="LIVE FEED" className="border-red-900/50 bg-red-950/5">
              <div className="space-y-3">
                 {Object.entries(incidents).map(([key, data]) => (
                    <div 
                      key={key} 
                      onClick={() => setActiveIncident(key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        activeIncident === key ? 'bg-red-900/20 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-900/40 border-slate-800 hover:border-red-500/30'
                      }`}
                    >
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                       <div className="flex justify-between items-start mb-1 pl-2">
                          <span className="text-[10px] font-mono text-red-400">{data.code}</span>
                          <span className="text-[9px] bg-red-950 text-red-300 px-1.5 rounded border border-red-900">{data.status}</span>
                       </div>
                       <div className="text-xs font-bold text-white pl-2 group-hover:text-red-100">{data.title}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 pl-2">
                          <span className="flex items-center gap-1"><Anchor size={10}/> {data.vessel}</span>
                          <span className="font-mono">{data.time}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* 故障指纹 */}
           <SciFiCard title="故障特征指纹谱" subtitle="SENSOR DATA">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sensorData}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331111" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[50, 150]} />
                       <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444', color: '#fff'}} />
                       <Area type="step" dataKey="val" stroke="#ef4444" strokeWidth={2} fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-red-300 mt-2 flex items-center gap-2 bg-red-950/30 p-2 rounded">
                 <Activity size={12} /> 检测到非典型高频振动，疑似连杆轴瓦磨损。
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息抢修沙盘 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#1a0505] to-[#020000] border border-red-500/20 rounded-2xl relative overflow-hidden group">
              {/* 背景网格 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" 
                   style={{backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
              
              {/* HUD：连线状态 */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur-md border border-red-500/30 p-3 rounded-lg shadow-2xl flex items-center gap-4">
                    <div className="relative">
                       <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                          <Users size={20} className="text-slate-400" />
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-400 uppercase font-bold">Remote Expert</div>
                       <div className="text-xs font-bold text-white">Chief Eng. Wang</div>
                       <div className="text-[8px] text-green-400">Connection Stable (45ms)</div>
                    </div>
                 </div>
              </div>

              {/* 3D 场景 */}
              <ShipEmergencyRepairThreeScene activeIncidentId={activeIncident} onIncidentSelect={setActiveIncident} />

              {/* 底部：故障详情浮窗 */}
              <div className="absolute bottom-6 left-6 right-6 z-10 bg-black/70 border border-red-500/30 p-3 rounded-xl backdrop-blur flex justify-between items-center">
                 <div>
                    <div className="text-[10px] text-red-400 font-bold uppercase">Active Target</div>
                    <div className="text-sm font-bold text-white">{incidents[activeIncident as keyof typeof incidents]?.title}</div>
                 </div>
                 <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2">
                    <Wrench size={12} /> 生成抢修工单
                 </button>
              </div>
           </div>

           {/* 抢修进度轴 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    <History size={14} /> Emergency Response Timeline
                 </div>
              </div>
              <div className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                 {repairSteps.map((step, i) => (
                    <div key={i} className="flex-1 min-w-[100px] flex flex-col gap-2 relative">
                       {i < repairSteps.length - 1 && (
                          <div className={`absolute top-2 left-1/2 w-full h-[2px] ${step.status === 'done' ? 'bg-green-500' : 'bg-slate-800'}`}></div>
                       )}
                       <div className={`w-4 h-4 rounded-full border-2 z-10 mx-auto ${
                          step.status === 'done' ? 'bg-green-500 border-green-500' : 
                          step.status === 'active' ? 'bg-red-500 border-red-500 animate-pulse' : 'bg-black border-slate-600'
                       }`}></div>
                       <div className="text-center">
                          <div className={`text-[9px] font-bold ${step.status === 'active' ? 'text-red-400' : 'text-slate-400'}`}>{step.title}</div>
                          <div className="text-[8px] font-mono text-slate-500">{step.time}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：资源与方案 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* 资源保障雷达 */}
           <SciFiCard title="抢修资源就绪度" subtitle="READINESS" className="flex-1">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={resourceRadar}>
                       <PolarGrid stroke="#331111" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Resources" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-red-950/20 border border-red-900/30 rounded text-center">
                 <span className="text-[10px] text-red-300">警告: 关键备件 "连杆轴瓦" 船端库存为 0</span>
              </div>
           </SciFiCard>

           {/* 应急物流地图 */}
           <SciFiCard title="应急物流雷达" subtitle="NEARBY ASSETS" className="border-red-900/50">
              <div className="space-y-3">
                 {nearbyResources.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded border border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                             {res.type === 'Drone Port' ? <Cpu size={12}/> : <Truck size={12}/>}
                          </div>
                          <div>
                             <div className="text-xs font-bold text-white">{res.name}</div>
                             <div className="text-[9px] text-slate-500">{res.type}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-mono text-cyan-400">{res.dist}</div>
                          <div className={`text-[9px] ${res.eta === 'Out of Range' ? 'text-red-500' : 'text-green-500'}`}>{res.eta}</div>
                       </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-2 mt-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 rounded text-[10px] text-red-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                    <Truck size={12} /> 申请紧急空投 (Air Drop)
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
