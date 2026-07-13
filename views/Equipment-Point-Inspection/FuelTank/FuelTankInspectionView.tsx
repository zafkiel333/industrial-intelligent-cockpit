import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/FuelTank/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-17]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-17';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Droplet, Activity, Thermometer, ShieldAlert, Zap, 
  MapPin, Wind, Camera, Eye, Layers, Scan, 
  RefreshCw, Info, History, Database, Cpu, 
  Flame, Anchor, Gauge, Search, ShieldCheck
} from 'lucide-react';

export const FuelTankInspectionView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'xray'>('standard');
  const [totalFuel, setTotalFuel] = useState(8420.5); // m3
  const [fuelStatus, setFuelStatus] = useState({
    avgTemp: 38.4,
    avgViscosity: 185.2, // cSt
    avgDensity: 0.942, // g/cm3
    flashPoint: 62.5, // °C
    sludgeRate: 1.2 // %
  });

  const [tankLevels, setTankLevels] = useState([0.85, 0.62, 0.45, 0.78]);

  const [aiLogs, setAiLogs] = useState([
    { id: 1, type: '泄露诊断', msg: '2# 舱底泄露检测点无流体异常信号', status: 'normal', time: '16:45' },
    { id: 2, type: '油质预警', msg: '3# 舱底部油泥沉积率接近临界值 (1.8%)', status: 'warning', time: '16:30' },
    { id: 3, type: '结构监测', msg: '纵向隔板 124# 焊缝应力分布均匀', status: 'success', time: '16:15' },
  ]);

  const [consumptionTrend, setConsumptionTrend] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalFuel(prev => prev - 0.1);
      setFuelStatus(prev => ({
        ...prev,
        avgTemp: 38 + Math.random(),
        avgViscosity: 185 + (Math.random() - 0.5) * 2
      }));

      setConsumptionTrend(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          val: 120 + Math.random() * 30,
          temp: 38 + Math.random() * 2 
        };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const healthRadar = [
    { subject: '油密封性', A: 98, fullMark: 100 },
    { subject: '温控效率', A: 85, fullMark: 100 },
    { subject: '结构强度', A: 95, fullMark: 100 },
    { subject: '油质纯净度', A: 82, fullMark: 100 },
    { subject: '传感可靠性', A: 96, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：油料调度与巡检态势栏 */}
      <div className="bg-[#0b1221]/90 border border-orange-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-500/10 border border-orange-500/40 rounded shadow-[0_0_20px_rgba(249,115,22,0.2)]">
               <Droplet size={32} className="text-orange-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  船舶油料舱智能巡检监控中心 <span className="text-orange-500 text-xl not-italic ml-2 tracking-normal">// FUEL_INTEL_SYSTEM_V8</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><Anchor size={12} className="text-orange-500"/> 船舶 ID: MV_NEO_CARRIER</span>
                  {/* Fixed ShieldCheck usage */}
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 防污染状态: 级联保护生效</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> 位置: 太平洋 3区 航段</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">当前总储油量 VOLUME</div>
                <div className="text-3xl font-mono font-black text-white">{totalFuel.toFixed(1)} <span className="text-sm text-orange-500">m³</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">平均油温 TEMPERATURE</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{fuelStatus.avgTemp.toFixed(1)} <span className="text-sm">°C</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：3D 孪生舱室视图 (占据 8列) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-orange-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_80px_rgba(249,115,22,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-orange-500/20 m-4"></div>
                 
                 {/* 视图模式交互 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-3 pointer-events-auto">
                    {[
                      { id: 'standard', label: '实时孪生', icon: Eye },
                      { id: 'thermal', label: '热场探测', icon: Thermometer },
                      { id: 'xray', label: '结构探伤', icon: Layers },
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`flex items-center gap-3 px-4 py-2 border transition-all rounded backdrop-blur-md ${viewMode === mode.id ? 'bg-orange-500 border-orange-400 text-black shadow-[0_0_15px_#f97316]' : 'bg-black/60 border-white/10 text-slate-400 hover:border-orange-500/50'}`}
                      >
                         <mode.icon size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                      </button>
                    ))}
                 </div>

                 {/* 实时油品参数仪表 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-orange-950/80 p-3 rounded border border-orange-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-orange-400 font-bold uppercase tracking-tighter">Kinetic Viscosity</div>
                        <div className="text-2xl font-mono font-bold text-white">{fuelStatus.avgViscosity.toFixed(1)} <span className="text-xs">cSt</span></div>
                    </div>
                    <div className="bg-orange-950/80 p-3 rounded border border-orange-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-orange-400 font-bold uppercase tracking-tighter">Fuel Density</div>
                        <div className="text-2xl font-mono font-bold text-white">{fuelStatus.avgDensity} <span className="text-xs">g/cm³</span></div>
                    </div>
                 </div>

                 {/* AI 巡检无人值守记录窗口 */}
                 <div className="absolute bottom-10 left-10 w-64 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-2 left-2 bg-red-600 px-2 text-[8px] font-bold uppercase tracking-widest">AUTO_INSPECT_LIVE</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Scan size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-orange-500/10 text-[8px] p-2 text-center font-bold italic text-orange-300">
                       正在执行 2# 舱壁激光厚度扫描...
                    </div>
                 </div>
              </div>

              <ThreeScene mode={viewMode} fillLevels={tankLevels} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 底部：多源数据趋势图 */}
           <div className="h-44 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="燃油消耗率与温控耦合曲线" noPadding className="border-orange-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={consumptionTrend} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 200]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="val" name="消耗率" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                       <Line type="stepAfter" dataKey="temp" name="温度" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="舱室健康度综合评价" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={healthRadar}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <Radar name="健康评价" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：状态矩阵、AI 日志与报警 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
           
           {/* 核心指标矩阵 */}
           <SciFiCard title="油品特性核心矩阵" className="bg-[#1a1c2e]/40 border-orange-900/30">
              <div className="grid grid-cols-2 gap-4 h-full">
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1"><Flame size={30} className="text-orange-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">燃油闪点 FLASH_PT</div>
                    <div className="text-3xl font-mono font-black text-orange-400 mt-2">62.5 <span className="text-xs italic">°C</span></div>
                    <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 font-bold">
                       {/* Fixed ShieldCheck usage */}
                       <ShieldCheck size={10}/> 安全阈值内
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Droplet size={30} className="text-blue-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">油泥沉积率 SLUDGE</div>
                    <div className="text-3xl font-mono font-black text-blue-400 mt-2">1.2 <span className="text-xs italic">%</span></div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                       <History size={10}/> 预计 14天后清理
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">舱内油雾浓度 FOG_CONC</div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[15%]"></div>
                       </div>
                       <span className="text-xs font-mono font-bold">NORMAL</span>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">分油机净化效率</div>
                    <div className="text-xl font-black text-emerald-400">99.2%</div>
                 </div>
              </div>
           </SciFiCard>

           {/* AI 巡检发现流 */}
           <SciFiCard title="AI 巡检发现流 (实时推理)" className="flex-1 border-orange-900/40">
              <div className="flex flex-col gap-4">
                 {aiLogs.map(event => (
                    <div key={event.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer ${event.status === 'warning' ? 'border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-orange-500 hover:bg-white/5'}`}>
                       <div className="w-12 h-12 bg-slate-800 border border-white/10 rounded flex items-center justify-center shrink-0">
                          {event.type.includes('泄露') ? <ShieldAlert size={20} className="text-red-500" /> : event.type.includes('结构') ? <Cpu size={20} className="text-orange-400" /> : <RefreshCw size={20} className="text-blue-400" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${event.status === 'warning' ? 'text-red-400' : 'text-orange-400'}`}>{event.type}</span>
                             <span className="text-[8px] text-slate-500 font-mono">{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 leading-relaxed font-bold">{event.msg}</div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 应急响应闭环区 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start gap-3">
                       <ShieldAlert size={20} className="text-red-500 animate-pulse shrink-0" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase italic">Emergency Protocol Alpha</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tight">检测到管路压差瞬间波动，建议锁定 2# 输油泵组。</div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                       执行一键智能应急锁闭
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 分布式边缘计算拓扑 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-orange-950/50 rounded flex items-center justify-center border border-orange-500/20 shadow-inner">
                    <Database size={18} className="text-orange-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">分布采集节点状态</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // TANK_NODE_12</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
