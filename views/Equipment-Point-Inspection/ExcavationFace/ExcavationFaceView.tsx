
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ExcavationFace/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';
// Added RotateCw to the imports from lucide-react
import { 
  Scan, Activity, ShieldCheck, Zap, 
  MapPin, Wind, Thermometer, Camera, History, 
  Database, Eye, Ruler, Gauge, AlertTriangle,
  LayoutGrid, Box, Cpu, AlertCircle, RotateCw
} from 'lucide-react';

export const ExcavationFaceView: React.FC = () => {
  const [shearerPos, setShearerPos] = useState(0.5);
  const [metrics, setMetrics] = useState({
    cuttingSpeed: 4.5, // m/min
    vibration: 2.1,
    armTemp: 52,
    ch4: 0.12,
    co: 0.001,
    hydraulicPressure: 31.5 // MPa
  });

  const [aiEvidence, setAiEvidence] = useState([
    { id: 1, type: '煤岩识别', msg: '当前含矸率: 8.2%', confidence: 0.95, time: '14:20:05' },
    { id: 2, type: '大块煤告警', msg: '第 42 号支架前方发现大块煤', confidence: 0.88, time: '14:18:12' },
    { id: 3, type: '红外扫描', msg: '摇臂减速箱温度正常', confidence: 0.99, time: '14:15:30' },
  ]);

  const [supportData, setSupportData] = useState(Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    pressure: 28 + Math.random() * 8,
    status: Math.random() > 0.9 ? 'warning' : 'normal'
  })));

  useEffect(() => {
    const timer = setInterval(() => {
      // 模拟采煤机左右往复运动
      setShearerPos(prev => {
        const next = prev + 0.01;
        return next > 1 ? 0 : next;
      });

      setMetrics(prev => ({
        ...prev,
        cuttingSpeed: 4 + Math.random(),
        vibration: 2.1 + (Math.random() - 0.5) * 0.4
      }));

      setSupportData(prev => prev.map(s => ({
        ...s,
        pressure: 28 + Math.random() * 8
      })));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：巡检指挥与任务链 */}
      <div className="bg-[#0b1221]/90 border border-orange-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-500/10 border border-orange-500/40 rounded-sm">
               <Cpu size={32} className="text-orange-500 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  采掘面智能化巡检决策舱 <span className="text-orange-500 text-xl not-italic ml-2 tracking-normal">// FACE_AUTO_DIAG_V2</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-orange-500"/> 工作面: 12402综采面</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 巡检自研模式: LiDAR + 视觉融合</span>
                  <span className="flex items-center gap-1"><History size={12}/> 任务持续: 4h 12m</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">本刀截割进度 PROGRESS</div>
                <div className="flex items-center gap-3">
                   <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]" style={{width: `${shearerPos * 100}%`}}></div>
                   </div>
                   <span className="text-xl font-mono font-black text-white">{(shearerPos * 100).toFixed(0)}%</span>
                </div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-red-500 font-bold mb-1 uppercase tracking-tighter">实时结构预警 ALERT</div>
                <div className="text-3xl font-mono font-black text-red-500">01</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧区域：3D 孪生与动力学 */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
           
           {/* 3D 采掘孪生视图 */}
           <div className="flex-1 relative bg-[#020617] border border-slate-800 rounded-sm overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-orange-500/20 m-4"></div>
                 
                 {/* HUD: 采煤机状态 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-orange-500/30 rounded flex items-center gap-4">
                       <Zap size={24} className="text-orange-400" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">牵引功率 Traction</div>
                          <div className="text-xl font-mono font-bold text-white">425.2 kW</div>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-orange-500/30 rounded flex items-center gap-4">
                       <RotateCw size={24} className="text-cyan-400 animate-spin" style={{animationDuration: '3s'}} />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">滚筒转速 Drum</div>
                          <div className="text-xl font-mono font-bold text-white">35.4 RPM</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时位置标签 */}
                 <div className="absolute bottom-10 left-10">
                    <div className="bg-orange-500 text-black px-4 py-1 text-xs font-black uppercase italic shadow-[0_0_15px_#f97316]">
                       Shearer Tracking: #{(shearerPos * 120).toFixed(0)} Support
                    </div>
                 </div>
              </div>

              <ThreeScene progress={shearerPos} />

              {/* 背景特效 */}
              <div className="absolute inset-0 tech-grid-bg opacity-5 pointer-events-none"></div>
           </div>

           {/* 采煤机动力学曲线 */}
           <div className="h-44">
              <SciFiCard title="设备动力学健康流" subtitle="VIB_LOGS" noPadding className="h-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={Array.from({length: 20}, (_, i) => ({ time: i, v: 2 + Math.random() * 2, t: 50 + Math.random() * 5 }))} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" fontSize={10} hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="v" name="震动强度" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                       <Line type="stepAfter" dataKey="t" name="电机温度" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧区域：支架矩阵与 AI 证据 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
           
           {/* 液压支架健康状态矩阵 */}
           <SciFiCard title="液压支架群健康矩阵" subtitle="SUPPORT_CLUSTER" className="h-[280px]">
              <div className="grid grid-cols-10 gap-2 h-full py-1">
                 {supportData.map(s => (
                    <div 
                      key={s.id} 
                      className={`relative rounded-sm border transition-all cursor-pointer flex flex-col items-center justify-center group ${s.status === 'warning' ? 'bg-red-500/20 border-red-500/50 animate-pulse' : 'bg-green-500/10 border-green-500/30'}`}
                    >
                       <div className={`w-1.5 h-4 rounded-t-full mb-1 ${s.pressure > 34 ? 'bg-red-500' : 'bg-green-400'}`}></div>
                       <span className="text-[8px] text-slate-500 font-mono">#{s.id}</span>
                       
                       {/* 浮动详细信息 */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-28 bg-slate-900 border border-orange-500/40 p-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-[10px] text-orange-400 font-black">Support #{s.id}</div>
                          <div className="text-white text-xs mt-1 font-mono">Pressure: {s.pressure.toFixed(1)} MPa</div>
                          <div className="text-[9px] text-slate-400 mt-1">Status: OK</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* AI 巡检识别证据流 */}
           <SciFiCard title="AI 自律巡检实时发现流" className="flex-1 border-orange-900/30">
              <div className="flex flex-col gap-4">
                 {aiEvidence.map(log => (
                    <div key={log.id} className="flex gap-4 p-3 bg-slate-900/40 border border-white/5 rounded-sm hover:border-orange-500/30 transition-all cursor-pointer group">
                       <div className="w-20 h-16 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden">
                          <Camera size={24} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                          <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-transparent transition-all"></div>
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[6px] px-1">AI_CAM</div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{log.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs font-bold text-white my-1">{log.msg}</div>
                          <div className="flex items-center gap-3">
                             <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 italic">置信度: {(log.confidence * 100).toFixed(0)}%</div>
                             <button className="text-[9px] text-orange-500 font-black hover:underline uppercase italic">{">>>"} 追溯历史异常点</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 紧急警报区域 */}
                 <div className="mt-2 space-y-3">
                    <div className="p-3 bg-red-600/10 border border-red-500/30 rounded flex items-start gap-3">
                       <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-200 uppercase">Emergency Notification</div>
                          <p className="text-[10px] text-red-300/80 mt-1">检测到 42 号支架动作异常，自动停机锁定协议已就绪。</p>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 transition-all font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_20px_rgba(249,115,22,0.3)] italic">
                       发起全站智能联动核验
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 环境综合指标 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded-sm grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                 <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">瓦斯 CH4</div>
                 <div className="text-xl font-mono font-black text-green-400">{metrics.ch4}%</div>
              </div>
              <div className="flex flex-col items-center border-x border-white/5">
                 <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">一氧化碳 CO</div>
                 <div className="text-xl font-mono font-black text-cyan-400">{metrics.co}%</div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">湿度 HUM</div>
                 <div className="text-xl font-mono font-black text-blue-400">42%</div>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
