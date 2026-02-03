
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MultiFleetRouteThreeScene } from '../../components/ServiceDataManagement/MultiFleetRoute/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';
import { 
  Globe, Map as MapIcon, Navigation, Anchor, 
  TrendingUp, AlertTriangle, Layers, Clock,
  Fuel, Container, Ship, ArrowRight, Network, Activity
} from 'lucide-react';

export const MultiFleetRouteView: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<string>('route-ae');
  const [globalSpeed, setGlobalSpeed] = useState(1);

  // Mock Data
  const fleetPerformance = [
    { name: '太平洋舰队', punctuality: 92, efficiency: 88, risk: 12 },
    { name: '亚欧舰队', punctuality: 85, efficiency: 94, risk: 25 },
    { name: '南亚支线', punctuality: 98, efficiency: 75, risk: 5 },
    { name: '大西洋快线', punctuality: 89, efficiency: 82, risk: 18 },
  ];

  const cargoVolumeTrend = [
    { month: 'Jan', eu: 450, us: 320, asia: 210 },
    { month: 'Feb', eu: 420, us: 340, asia: 190 },
    { month: 'Mar', eu: 480, us: 360, asia: 240 },
    { month: 'Apr', eu: 510, us: 390, asia: 280 },
    { month: 'May', eu: 530, us: 410, asia: 310 },
    { month: 'Jun', eu: 550, us: 430, asia: 330 },
  ];

  const routeDetails: Record<string, any> = {
    'route-ae': { label: '亚欧干线 (Asia-EU)', vessels: 24, teu: '42,500', delay: '+12h', status: '拥堵' },
    'route-tp': { label: '跨太平洋 (Trans-Pacific)', vessels: 18, teu: '28,100', delay: '-2h', status: '畅通' },
    'route-ia': { label: '亚洲区内 (Intra-Asia)', vessels: 35, teu: '15,200', delay: '0h', status: '正常' },
    'route-au': { label: '澳亚航线 (Aus-Asia)', vessels: 12, teu: '8,400', delay: '+4h', status: '关注' },
  };

  const dispatchLogs = [
    { time: '10:42', fleet: '太平洋舰队', event: 'Vessel-09 改道指令已下发', type: 'cmd' },
    { time: '10:30', fleet: '亚欧舰队', event: '苏伊士运河排队拥堵预警', type: 'alert' },
    { time: '09:15', fleet: '南亚支线', event: 'Q3 季度运力调配计划生成', type: 'info' },
    { time: '08:00', fleet: '全球中心', event: '每日燃油对冲策略更新', type: 'success' },
  ];

  const costStructure = [
    { name: '燃油', value: 45, color: '#f59e0b' },
    { name: '港口费', value: 25, color: '#3b82f6' },
    { name: '折旧', value: 15, color: '#64748b' },
    { name: '人工', value: 15, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020408] p-2 overflow-hidden select-none">
      
      {/* 顶部：全球调度指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-transparent border-b border-cyan-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/10 border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Globe className="text-cyan-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-wide text-white uppercase italic drop-shadow-md">多船队多航线运行服务数据集中管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Ship size={12}/> ACTIVE FLEETS: 14</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Network size={12}/> ROUTES: 42</span>
                 <span>|</span>
                 <span className="text-purple-400 font-bold">GLOBAL SYNC: ONLINE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">在途总货量</span>
              <span className="text-xl font-mono font-black text-white">245,800 <span className="text-xs text-slate-500">TEU</span></span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">综合准班率</span>
              <span className="text-xl font-mono font-black text-emerald-400">92.4%</span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">碳排放指数</span>
              <span className="text-xl font-mono font-black text-orange-400">B+</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：船队与航线列表 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="全球航线效能监控" subtitle="ROUTES" className="flex-1">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                 {Object.entries(routeDetails).map(([key, data]) => (
                    <div 
                      key={key} 
                      onClick={() => setActiveRoute(key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                        activeRoute === key ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30'
                      }`}
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{data.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                             data.status === '拥堵' ? 'bg-red-500/20 text-red-400' : 
                             data.status === '关注' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                          }`}>{data.status}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono">
                          <div>
                             <div className="text-[8px] text-slate-600">VESSELS</div>
                             <div className="text-white">{data.vessels}</div>
                          </div>
                          <div>
                             <div className="text-[8px] text-slate-600">CAPACITY</div>
                             <div className="text-cyan-300">{data.teu}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] text-slate-600">DELAY</div>
                             <div className={data.delay.startsWith('+') && data.delay !== '+0h' ? 'text-red-400' : 'text-green-400'}>{data.delay}</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="船队综合绩效雷达" subtitle="FLEET KPI">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={fleetPerformance}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Radar name="准班率" dataKey="punctuality" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
                       <Radar name="能效" dataKey="efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                       <Radar name="风险" dataKey="risk" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                       <Legend wrapperStyle={{fontSize: '10px', marginTop: '5px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息地球与调度 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#080c18] to-[#020617] border border-cyan-500/20 rounded-2xl relative overflow-hidden group">
              {/* 地球背景装饰 - 模拟星空 */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30" 
                   style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
              
              {/* HUD：选中航线详情 */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-2 mb-2">
                       <Navigation className="text-cyan-400" size={16} />
                       <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Active Route</div>
                          <div className="text-xs font-black text-white">{routeDetails[activeRoute]?.label.split(' ')[0]}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-[10px] text-slate-300">
                       <div>拥堵指数: <span className="text-orange-400 font-bold">High</span></div>
                       <div>平均航速: <span className="text-white font-mono">14.2 kn</span></div>
                       <div>燃油效率: <span className="text-emerald-400 font-bold">A-</span></div>
                       <div>在途货值: <span className="text-white font-mono">$4.2B</span></div>
                    </div>
                 </div>
              </div>

              <MultiFleetRouteThreeScene activeRouteId={activeRoute} onRouteSelect={setActiveRoute} globalSpeed={globalSpeed} />

              {/* 底部控制栏 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                 <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Global Simulation Speed</div>
                 <div className="flex gap-2">
                    {[0.5, 1, 2, 5].map(speed => (
                       <button 
                          key={speed}
                          onClick={() => setGlobalSpeed(speed)}
                          className={`w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold border transition-all ${
                             globalSpeed === speed ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/50 text-slate-400 border-slate-700 hover:border-cyan-500/50'
                          }`}
                       >
                          x{speed}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* 集中调度日志 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Activity size={14} /> 实时调度指令流 (Dispatch Live)
                 </div>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-slate-500 font-mono">LINK: ENCRYPTED</span>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {dispatchLogs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors items-center">
                       <span className="text-slate-600 w-10">[{log.time}]</span>
                       <span className="text-cyan-600 font-bold w-16">{log.fleet}</span>
                       <span className={`flex-1 ${log.type === 'alert' ? 'text-red-400' : log.type === 'cmd' ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {log.type === 'cmd' && '> '} {log.event}
                       </span>
                       <span className="text-[9px] border border-slate-700 px-1 rounded text-slate-500 uppercase">{log.type}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：分析与成本 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* 货运量趋势 */}
           <SciFiCard title="区域货运量趋势" subtitle="TEU VOLUME" className="flex-1">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cargoVolumeTrend}>
                       <defs>
                          <linearGradient id="colorEu" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorUs" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="eu" stackId="1" stroke="#22d3ee" fill="url(#colorEu)" />
                       <Area type="monotone" dataKey="us" stackId="1" stroke="#a855f7" fill="url(#colorUs)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                 <div className="flex items-center gap-1 text-[9px] text-slate-400"><div className="w-2 h-2 bg-cyan-400 rounded-full"></div> 欧洲航线</div>
                 <div className="flex items-center gap-1 text-[9px] text-slate-400"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> 美洲航线</div>
              </div>
           </SciFiCard>

           {/* 运营成本结构 */}
           <SciFiCard title="运营成本构成" subtitle="OPEX" className="border-cyan-900/50">
              <div className="flex items-center gap-4">
                 <div className="h-28 w-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={costStructure} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                             {costStructure.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Fuel size={16} className="text-slate-500" />
                    </div>
                 </div>
                 <div className="flex-1 space-y-2">
                    {costStructure.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                             {item.name}
                          </span>
                          <span className="font-mono text-white">{item.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="智能辅助决策" className="bg-indigo-900/20 border-indigo-800/30">
              <div className="flex items-start gap-3">
                 <div className="mt-1"><AlertTriangle className="text-yellow-500" size={16} /></div>
                 <div>
                    <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">燃油对冲建议</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">
                       鹿特丹港燃油价格预计下周上涨 5%，建议亚欧航线船队在新加坡港完成 80% 补给。
                    </div>
                    <button className="mt-2 text-[9px] text-cyan-400 flex items-center gap-1 hover:text-white transition-colors">
                       执行预案 <ArrowRight size={8} />
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
