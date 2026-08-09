import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/EnergyControl/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-8]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-8';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Zap, Activity, ShieldCheck, Cpu, BatteryCharging, 
  MapPin, Wind, Thermometer, Camera, History, 
  Database, Eye, Ruler, Gauge, AlertTriangle,
  Lightbulb, Info, RefreshCw, BarChart3, CloudLightning
} from 'lucide-react';

export const MiningEnergyControlView: React.FC = () => {
  const [loadFactor, setLoadFactor] = useState(0.65);
  const [metrics, setMetrics] = useState({
    totalInput: 45.2, // MW
    powerFactor: 0.96,
    totalEfficiency: 92.4,
    thdu: 1.2, // Harmonic distortion
    carbonRate: 0.42 // tCO2/MWh
  });

  const [robotFeeds, setRobotFeeds] = useState([
    { id: 1, type: '红外扫描', msg: '1#主变套管温升 42°C', status: 'normal', time: '10:42' },
    { id: 2, type: '视觉识别', msg: '馈电柜 402 门锁关闭确认', status: 'success', time: '10:40' },
    { id: 3, type: '声纹诊断', msg: '检测到电抗器轻微放电音', status: 'warning', time: '10:35' },
  ]);

  const [loadTrend, setLoadTrend] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadFactor(prev => {
        const next = 0.6 + Math.random() * 0.1;
        return next;
      });

      setMetrics(prev => ({
        ...prev,
        totalInput: 45 + (Math.random() - 0.5) * 2,
        thdu: 1.1 + Math.random() * 0.3
      }));

      setLoadTrend(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString().slice(-8), 
          load: 40 + Math.random() * 10,
          reactive: 5 + Math.random() * 2 
        }];
        return newData.slice(-15);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const radarData = [
    { subject: '电能质量', A: 95, fullMark: 100 },
    { subject: '设备健康', A: 88, fullMark: 100 },
    { subject: '负载平衡', A: 82, fullMark: 100 },
    { subject: '能效等级', A: 90, fullMark: 100 },
    { subject: '预测精度', A: 98, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：能源集控战术面板 */}
      <div className="bg-[#0b1221]/90 border border-blue-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/40 rounded-sm">
               <CloudLightning size={32} className="text-blue-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  矿山能源集控智能巡检中心 <span className="text-blue-500 text-xl not-italic ml-2 tracking-normal">// ENERGY_CORE_V1</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> 监测域: 地面 110kV 主变电所</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 自律寻优巡航中</span>
                  <span className="flex items-center gap-1"><History size={12}/> 持续运行: 2,450h 无故障</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">总输入功率 REAL-TIME LOAD</div>
                <div className="flex items-center gap-3">
                   <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{width: `${loadFactor * 100}%`}}></div>
                   </div>
                   <span className="text-xl font-mono font-black text-white">{metrics.totalInput.toFixed(1)} <span className="text-xs">MW</span></span>
                </div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">实时功率因数 PF</div>
                <div className="text-3xl font-mono font-black text-green-400">{metrics.powerFactor.toFixed(3)}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：变电健康与能效雷达 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           <SciFiCard title="主变运行体检状态" className="bg-[#0f172a]/60 border-blue-900/40">
              <div className="flex flex-col gap-4 py-2">
                 {[
                   { label: '变比一致性', val: '99.8%', status: 'ok' },
                   { label: '瓦斯继电器', val: '正常', status: 'ok' },
                   { label: '油中溶解气体', val: '合格', status: 'ok' },
                   { label: '避雷器泄露', val: '0.42mA', status: 'warning' },
                 ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-900/80 rounded border border-white/5 hover:border-blue-500/30 transition-all">
                       <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                       <span className={`text-[10px] font-mono font-bold ${item.status === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>{item.val}</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="能源供给综合评价" className="flex-1 border-blue-900/30">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="评价指数" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </RadarChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中部：3D 能量流转孪生 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5 relative">
           <div className="flex-1 relative bg-[#020617] border border-blue-500/10 rounded-sm overflow-hidden group">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-blue-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-blue-500/30 rounded flex items-center gap-4">
                       <RefreshCw size={24} className="text-blue-400 animate-spin" style={{animationDuration: '6s'}} />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">能量环平衡度</div>
                          <div className="text-xl font-mono font-bold text-white">98.5% <span className="text-xs text-green-500 font-normal">SYNC</span></div>
                       </div>
                    </div>
                 </div>

                 {/* 实时谐波透视窗 */}
                 <div className="absolute bottom-10 left-10 w-56 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden p-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-bold text-blue-400">电能谐波分析 (THDu)</span>
                        <span className="text-[8px] font-mono text-slate-500">{metrics.thdu.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                        {[40, 60, 30, 20, 15, 10, 5, 3].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/40" style={{height: `${h}%`}}></div>
                        ))}
                    </div>
                    <div className="text-[6px] text-slate-600 mt-1 flex justify-between">
                        <span>H1</span><span>H3</span><span>H5</span><span>H7</span><span>H11</span>
                    </div>
                 </div>
              </div>

              <ThreeScene loadFactor={loadFactor} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 背景扫描纹理 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 负荷趋势与预测曲线 */}
           <div className="h-44">
              <SciFiCard title="实时负荷曲线与无功补差" noPadding className="h-full border-blue-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadTrend} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <defs>
                          <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="load" name="有功负荷" stroke="#3b82f6" fill="url(#colorLoad)" strokeWidth={2} />
                       <Line type="stepAfter" dataKey="reactive" name="无功损耗" stroke="#8b5cf6" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：机器人发现流与应急控制 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           
           <SciFiCard title="巡检机器人 AI 发现流" className="bg-[#0f172a]/40 border-blue-900/30">
              <div className="flex flex-col gap-4 py-1">
                 {robotFeeds.map(feed => (
                    <div key={feed.id} className={`p-3 bg-slate-900/60 border rounded-sm flex gap-3 hover:border-blue-500/40 transition-all cursor-pointer group ${feed.status === 'warning' ? 'border-orange-500/40' : 'border-white/5'}`}>
                       <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                          {feed.type === '红外扫描' ? <Thermometer size={16} className="text-orange-400" /> : feed.type === '视觉识别' ? <Eye size={16} className="text-blue-400" /> : <Activity size={16} className="text-purple-400" />}
                       </div>
                       <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-slate-200 uppercase">{feed.type}</span>
                             <span className="text-[8px] text-slate-500 font-mono">{feed.time}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{feed.msg}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="能效管理与减碳指数" className="flex-1 border-blue-900/30">
              <div className="flex flex-col h-full gap-4">
                 <div className="bg-blue-950/20 p-4 border border-blue-500/20 rounded">
                    <div className="flex items-center gap-2 mb-2">
                       <BatteryCharging size={16} className="text-green-400" />
                       <span className="text-[10px] font-black text-white uppercase">实时减碳强度</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tighter">0.428 <span className="text-xs text-slate-500">tCO2/MWh</span></div>
                    <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-green-500 h-full w-[85%]"></div>
                    </div>
                 </div>

                 {/* 应急操作区 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 p-3 bg-blue-600/10 border border-blue-500/30 rounded">
                       <Zap size={20} className="text-blue-400 mt-1 shrink-0" />
                       <div className="leading-tight">
                          <div className="text-[10px] font-black text-blue-100 uppercase">用电策略建议</div>
                          <p className="text-[9px] text-blue-300/80 mt-1 font-bold">预测 15min 后进入用电高峰，建议对 2# 泵站执行柔性负荷削减。</p>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                       执行一键负荷寻优
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/80 border border-white/5 p-4 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Database size={18} className="text-blue-500" />
                 <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">边缘控制总线</div>
                    <div className="text-xs font-mono font-bold text-white tracking-widest uppercase">SYNC_LOCKED</div>
                 </div>
              </div>
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
