import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/mining-rail/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  TrainFront, Activity, ShieldCheck, AlertTriangle, 
  MapPin, Wind, Zap, ScanLine, Camera, History, Database
} from 'lucide-react';

export const MiningRailInspectionView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    speed: 12.5,
    temp: 54,
    vibration: 2.1,
    voltage: 550,
    current: 120,
    brakePressure: 0.42
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: '严重', msg: 'A-12 区段发现轨道侧移 (5.2mm)', time: '14:20:05' },
    { id: 2, type: '警告', msg: '电机 #3 温度上升过快 (62°C)', time: '14:18:12' },
    { id: 3, type: '提示', msg: '自律扫描发现未知障碍物 (已过滤)', time: '14:15:30' },
  ]);

  const [waveData, setWaveData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        speed: 12.5 + (Math.random() - 0.5) * 0.5,
        vibration: 2.1 + (Math.random() - 0.5) * 0.3,
        current: 120 + (Math.random() - 0.5) * 10
      }));

      setWaveData(prev => {
        const newData = [...prev, { time: Date.now(), val: 2 + Math.sin(Date.now() / 500) + Math.random() }];
        return newData.slice(-30);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 text-amber-50">
      {/* 顶部状态条 */}
      <div className="flex items-center justify-between bg-[#0b1221]/80 border-b border-amber-500/30 p-4 clip-corner">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500/20 rounded-full">
            <TrainFront size={28} className="text-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white">矿山轨道运输智能点巡检系统</h1>
            <div className="flex gap-4 text-[10px] text-slate-500 mt-1">
              <span className="flex items-center gap-1"><MapPin size={10}/> 当前位置: 中央运输平巷 K4+200</span>
              <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={10}/> 系统自检: 正常 (V3.2)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">当前运行区段</div>
            <div className="text-xl font-mono font-bold text-amber-400">ZONE_04_WEST</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">安全运行总时长</div>
            <div className="text-xl font-mono font-bold text-white">12,450h</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* 左侧：机车实时遥测 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <SciFiCard title="行车遥测数据" className="bg-[#1a1408]/60 border-amber-900/50">
             <div className="grid grid-cols-1 gap-5 py-2">
                <div className="flex items-end justify-between">
                   <div>
                      <div className="text-[10px] text-slate-500 mb-1">前进速度 (Speed)</div>
                      <div className="text-3xl font-mono font-bold text-white">{metrics.speed.toFixed(1)} <span className="text-xs text-slate-500">km/h</span></div>
                   </div>
                   <Activity size={24} className="text-amber-500 opacity-50" />
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all duration-300" style={{width: `${(metrics.speed/20)*100}%`}}></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                   <div className="bg-white/5 p-2 rounded border border-white/5">
                      <div className="text-[10px] text-slate-500">制动风压</div>
                      <div className="text-lg font-mono text-cyan-400">{metrics.brakePressure.toFixed(2)} <span className="text-xs">MPa</span></div>
                   </div>
                   <div className="bg-white/5 p-2 rounded border border-white/5">
                      <div className="text-[10px] text-slate-500">牵引电流</div>
                      <div className="text-lg font-mono text-amber-400">{metrics.current.toFixed(0)} <span className="text-xs">A</span></div>
                   </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-sm border-l-2 border-amber-500">
                   <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-200">
                      <Zap size={14}/> 能源模组状态
                   </div>
                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>电池荷电 (SOC)</span>
                      <span>82%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[82%]"></div>
                   </div>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="受力平衡分析" className="flex-1">
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={waveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#666" tick={{fontSize: 10}} hide />
                      <Tooltip contentStyle={{backgroundColor: '#000', border: 'none'}} labelStyle={{display: 'none'}} />
                      <Area type="monotone" dataKey="val" fill="#f59e0b" fillOpacity={0.1} stroke="#f59e0b" strokeWidth={1} isAnimationActive={false} />
                   </ComposedChart>
                </ResponsiveContainer>
                <div className="text-center text-[10px] text-slate-500 mt-[-20px]">实时垂直振动频率曲线 (FFT)</div>
             </div>
          </SciFiCard>
        </div>

        {/* 中部：3D 数字孪生 & 实时视觉 */}
        <div className="w-full lg:w-2/4 flex flex-col gap-4">
           <div className="flex-1 relative bg-[#020617] border border-amber-500/20 rounded overflow-hidden">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10">
                 {/* 四角边框 */}
                 <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-500/40"></div>
                 <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-amber-500/40"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-amber-500/40"></div>
                 <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-500/40"></div>
                 
                 {/* 扫描网格 */}
                 <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/20 shadow-[0_0_15px_cyan] animate-pulse"></div>

                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur px-3 py-1 border border-cyan-500/30 rounded flex items-center gap-2">
                       <ScanLine size={14} className="text-cyan-400 animate-spin" />
                       <span className="text-[10px] font-bold text-white tracking-widest uppercase">LiDAR 激光点云扫描中...</span>
                    </div>
                 </div>

                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur px-6 py-2 border border-white/10 rounded-full flex gap-6 text-[10px] text-white">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 轨道几何参数: 正常</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 隧道净空检测: 合规</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 接触网张力: 波动</span>
                 </div>
              </div>

              <ThreeScene />
           </div>

           <div className="h-40 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SciFiCard title="实时 AI 视觉监控" className="bg-black/40" noPadding>
                 <div className="relative h-full flex items-center justify-center group">
                    <div className="absolute top-2 left-2 z-20 flex gap-1">
                       <div className="bg-red-600 px-1 text-[8px] font-bold text-white">LIVE REC</div>
                       <div className="bg-black/40 px-1 text-[8px] text-white">CAM_LOCO_01</div>
                    </div>
                    {/* 模拟摄像头画面 */}
                    <div className="w-full h-full bg-[#111] flex items-center justify-center opacity-50">
                       <Camera size={40} className="text-slate-800" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-32 h-20 border-2 border-red-500/50 flex flex-col justify-end">
                          <span className="bg-red-500 text-white text-[8px] px-1 font-bold">障碍物? 42%</span>
                       </div>
                    </div>
                 </div>
              </SciFiCard>
              <SciFiCard title="区间通行密度" className="bg-black/40">
                 <div className="flex flex-col justify-center h-full gap-2">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">本班次运货量</span>
                       <span className="text-white font-mono font-bold">1,240 吨</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">平均发车间隔</span>
                       <span className="text-white font-mono font-bold">15 分钟</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">运力负荷率</span>
                       <span className="text-amber-400 font-mono font-bold">85%</span>
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：缺陷诊断及日志 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
           <SciFiCard title="智能识别结果" className="flex-1">
              <div className="flex flex-col gap-3">
                 {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded border-l-4 ${alert.type === '严重' ? 'bg-red-950/20 border-red-600' : alert.type === '警告' ? 'bg-amber-950/20 border-amber-600' : 'bg-slate-900/40 border-slate-600'}`}>
                       <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold px-1 rounded ${alert.type === '严重' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{alert.type}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                       </div>
                       <div className="text-[11px] text-slate-200">{alert.msg}</div>
                       <div className="mt-2 flex justify-end">
                          <button className="text-[9px] text-amber-500 flex items-center gap-1 hover:underline">
                             <History size={10}/> 查看快照
                          </button>
                       </div>
                    </div>
                 ))}
                 <div className="mt-4 p-3 border border-dashed border-slate-700 rounded text-center">
                    <button className="text-xs text-slate-500 hover:text-white transition-colors">查看历史检测报告</button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="传感器自研拓扑">
              <div className="flex items-center gap-4 py-2">
                 <div className="w-12 h-12 bg-cyan-950 rounded border border-cyan-500/30 flex items-center justify-center">
                    <Database size={20} className="text-cyan-400" />
                 </div>
                 <div className="flex-1">
                    <div className="text-[10px] text-slate-500">分布式边缘网关</div>
                    <div className="text-sm font-bold text-white tracking-wider">GATEWAY_RAIL_04</div>
                    <div className="flex gap-2 mt-1">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-amber-600/10 border border-amber-500/30 p-4 rounded text-center">
              <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">运维调度决策</div>
              <p className="text-xs text-amber-200">检测到 A-12 轨道微弱侧移，建议在本班次结束后进行二级维护。</p>
           </div>
        </div>
      </div>
    </div>
  );
};
