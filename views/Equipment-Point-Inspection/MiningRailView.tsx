import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/Equipment-Point-Inspection/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-0]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-0';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';
import { 
  TrainFront, Activity, ShieldCheck, Zap, 
  MapPin, Wind, Thermometer, Scan, Camera, History, 
  Database, Eye, Ruler, Gauge, AlertTriangle
} from 'lucide-react';

export const MiningRailView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    speed: 15.2,
    gas: 0.02,
    vibration: 1.15,
    current: 168,
    voltage: 552,
    gaugeDev: 0.8 // 轨距偏差
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'CRITICAL', msg: 'K4+120 轨道发现微小裂纹 (长度 12mm)', time: '10:45:12' },
    { id: 2, type: 'WARNING', msg: '左侧接触网张力略低于阈值', time: '10:42:05' },
  ]);

  const [waveData, setWaveData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        speed: 15 + (Math.random() - 0.5) * 1.5,
        vibration: 1.1 + (Math.random() - 0.5) * 0.4,
        gaugeDev: 0.8 + (Math.random() - 0.5) * 0.2
      }));

      setWaveData(prev => {
        const newData = [...prev, { 
            time: Date.now(), 
            val: 1.2 + Math.sin(Date.now() / 1000) * 0.5 + Math.random() * 0.2 
        }];
        return newData.slice(-40);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-amber-50">
      
      {/* 顶部战术状态条 */}
      <div className="flex items-center justify-between bg-[#0b1221]/90 border border-amber-500/20 p-5 clip-corner shadow-[0_0_30px_rgba(245,158,11,0.05)]">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-sm">
            <TrainFront size={32} className="text-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                矿山轨道运输点巡检 <span className="text-amber-500 font-light not-italic">| 智能数字孪生</span>
            </h1>
            <div className="flex gap-5 text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-mono">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-amber-500"/> 位置: 北翼-600水平-02运输道</span>
              <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 深度自愈中</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">线路安全系数</div>
              <div className="text-2xl font-mono font-black text-amber-400">0.992</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">累计探测里程</div>
              <div className="text-2xl font-mono font-black text-white">4,120.5 km</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* 左侧：机车实时遥测 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
          <SciFiCard title="机车动力学遥测" className="bg-[#1a1408]/60 border-amber-900/40">
             <div className="flex flex-col gap-6 py-2">
                <div className="relative">
                   <div className="text-[10px] text-slate-500 mb-1">前进瞬时速度 VELOCITY</div>
                   <div className="text-4xl font-mono font-black text-white flex items-baseline gap-2">
                      {metrics.speed.toFixed(1)} <span className="text-xs text-amber-600 italic font-bold">KM/H</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-amber-500 shadow-[0_0_15px_orange] transition-all" style={{width: `${(metrics.speed/30)*100}%`}}></div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-white/5 rounded border border-white/5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2 mb-1">
                         <Zap size={14} className="text-amber-500" />
                         <span className="text-[10px] text-slate-400">电机电流</span>
                      </div>
                      <div className="text-xl font-mono font-bold text-white">{metrics.current} <span className="text-xs">A</span></div>
                   </div>
                   <div className="p-3 bg-white/5 rounded border border-white/5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2 mb-1">
                         <Gauge size={14} className="text-cyan-500" />
                         <span className="text-[10px] text-slate-400">牵引电压</span>
                      </div>
                      <div className="text-xl font-mono font-bold text-white">{metrics.voltage} <span className="text-xs">V</span></div>
                   </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-sm border-l-2 border-amber-500 flex justify-between items-center">
                   <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">制动风压 BRAKE</div>
                      <div className="text-2xl font-mono font-bold text-cyan-400">0.45 <span className="text-xs">MPa</span></div>
                   </div>
                   <div className="w-10 h-10 rounded-full border-2 border-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                   </div>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="实时震动频谱 FFT" className="flex-1 border-amber-900/40">
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={waveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2}/>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 3]} />
                      <Area type="monotone" dataKey="val" fill="#f59e0b" fillOpacity={0.05} stroke="#f59e0b" strokeWidth={1} isAnimationActive={false} />
                      <Line type="step" dataKey="val" stroke="#06b6d4" strokeWidth={0.5} dot={false} opacity={0.3} />
                   </ComposedChart>
                </ResponsiveContainer>
                <div className="text-center text-[10px] text-slate-500 mt-[-10px] font-mono tracking-widest uppercase">Dynamic Balancing Stream</div>
             </div>
          </SciFiCard>
        </div>

        {/* 中部：3D 孪生主视窗 & HUD */}
        <div className="w-full lg:w-2/4 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-amber-500/20 rounded-sm overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10">
                 <div className="absolute inset-0 opacity-10 tech-grid-bg"></div>
                 
                 {/* 四角框 */}
                 <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-500/30 m-4"></div>
                 <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-500/30 m-4"></div>
                 
                 {/* 扫描线 */}
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30 shadow-[0_0_25px_cyan] animate-[scan_5s_linear_infinite]"></div>

                 {/* 扫描状态 */}
                 <div className="absolute top-8 left-8 flex flex-col gap-3">
                    <div className="bg-black/80 backdrop-blur-md px-4 py-2 border border-cyan-500/40 rounded flex items-center gap-3">
                       <Scan size={18} className="text-cyan-400 animate-spin" />
                       <div className="leading-none">
                          <div className="text-[10px] font-bold text-white tracking-widest uppercase">LiDAR 点云扫描回路</div>
                          <div className="text-[8px] text-cyan-500 font-mono mt-1">SENSE_RADAR_PRO // ONLINE</div>
                       </div>
                    </div>
                    <div className="bg-red-500/10 backdrop-blur-md px-4 py-2 border border-red-500/40 rounded flex items-center gap-3">
                       <Eye size={18} className="text-red-400" />
                       <div className="leading-none">
                          <div className="text-[10px] font-bold text-red-100 tracking-widest uppercase">缺陷神经网络引擎</div>
                          <div className="text-[8px] text-red-400 font-mono mt-1">YOLO_RAIL_V8 // INFERENCE</div>
                       </div>
                    </div>
                 </div>

                 {/* 底部参数看板 */}
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-10 py-4 border border-white/10 rounded-full flex gap-12">
                    <div className="text-center">
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">轨道轨距 GAUGE</div>
                       <div className="text-lg font-mono font-black text-amber-400">{metrics.gaugeDev.toFixed(2)} <span className="text-[10px]">mm</span></div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="text-center">
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">巷道瓦斯 CH4</div>
                       <div className="text-lg font-mono font-black text-green-400">{metrics.gas.toFixed(3)} <span className="text-[10px]">%</span></div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="text-center">
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">环境温度 TEMP</div>
                       <div className="text-lg font-mono font-black text-white">24.5 <span className="text-[10px]">℃</span></div>
                    </div>
                 </div>
              </div>

              <ThreeScene moveSpeed={metrics.speed / 10} />

              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 缺陷识别模拟框 */}
              <div className="absolute top-[45%] left-[35%] w-40 h-28 border border-red-500/50 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">
                 <div className="absolute -top-6 left-0 bg-red-600 text-white text-[9px] px-2 py-0.5 font-black">发现异物: 落石 92%</div>
                 <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500"></div>
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-500"></div>
              </div>
           </div>

           <div className="h-44 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="环境多物理场分析" className="bg-black/30" noPadding>
                 <div className="grid grid-cols-3 h-full divide-x divide-white/5">
                    <div className="flex flex-col items-center justify-center gap-1">
                       <Thermometer size={20} className="text-orange-500" />
                       <div className="text-[10px] text-slate-500">机房散热</div>
                       <div className="text-xl font-mono font-bold">52°C</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                       <Wind size={20} className="text-blue-400" />
                       <div className="text-[10px] text-slate-500">巷道风压</div>
                       <div className="text-xl font-mono font-bold">280Pa</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                       <Database size={20} className="text-cyan-400" />
                       <div className="text-[10px] text-slate-500">边缘存储</div>
                       <div className="text-xl font-mono font-bold">14%</div>
                    </div>
                 </div>
              </SciFiCard>
              <SciFiCard title="轨道平顺性评估指数" className="bg-black/30">
                 <div className="flex flex-col justify-center h-full gap-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold uppercase tracking-widest">Vertical Profile</span>
                       <span className="text-white font-mono bg-green-600/30 px-2 border border-green-500/30">良好</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[94%]"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold uppercase tracking-widest">Alignment Deviance</span>
                       <span className="text-white font-mono bg-amber-600/30 px-2 border border-amber-500/30">关注</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[62%]"></div>
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：诊断日志与系统拓扑 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="智能识别事件流" className="flex-1 border-amber-900/40">
              <div className="flex flex-col gap-4">
                 {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-sm border-l-4 group cursor-pointer hover:bg-white/5 transition-all ${alert.type === 'CRITICAL' ? 'bg-red-950/20 border-red-600' : 'bg-amber-950/20 border-amber-600'}`}>
                       <div className="flex justify-between items-center mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded italic ${alert.type === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>{alert.type}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                       </div>
                       <div className="text-xs text-slate-200 font-bold leading-relaxed">{alert.msg}</div>
                       <div className="mt-3 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[10px] text-amber-500 flex items-center gap-1 hover:underline underline-offset-4">
                             <History size={12}/> 查看证据快照
                          </button>
                       </div>
                    </div>
                 ))}
                 <button className="mt-2 w-full py-4 border border-dashed border-slate-700 rounded text-[10px] text-slate-500 hover:text-white hover:border-amber-500 transition-all uppercase tracking-[0.2em] font-black">
                    调取历史巡检报告数据库
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="分布式边缘网关状态">
              <div className="flex items-center gap-5 py-2">
                 <div className="w-14 h-14 bg-cyan-950/50 rounded border border-cyan-500/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-cyan-500/10 animate-ping rounded-full scale-50"></div>
                    <Database size={24} className="text-cyan-400" />
                 </div>
                 <div className="flex-1">
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Node_Identifier</div>
                    <div className="text-lg font-mono font-black text-white italic">RAIL_HUB_B02</div>
                    <div className="flex gap-2 mt-2">
                       <div className="w-4 h-1 bg-green-500 rounded-full"></div>
                       <div className="w-4 h-1 bg-green-500 rounded-full"></div>
                       <div className="w-4 h-1 bg-slate-700 rounded-full"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-amber-600/10 border border-amber-500/30 p-5 rounded-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12"><AlertTriangle size={80}/></div>
              <div className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black mb-2">专家决策建议</div>
              <p className="text-xs text-amber-100/80 leading-relaxed font-bold">
                 检测到 K4+120 轨道沉降趋势异常，建议在 <span className="text-white border-b border-amber-500">本班次结束后</span> 立即进行人工复核，防止发生脱轨事故。
              </p>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10% }
          100% { top: 110% }
        }
      `}</style>
    </div>
  );
};
