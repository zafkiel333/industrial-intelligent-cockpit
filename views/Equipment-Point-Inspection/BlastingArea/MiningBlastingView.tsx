import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/BlastingArea/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { 
  Bomb, ShieldAlert, Activity, Users, Radio, 
  MapPin, Ruler, Timer, AlertTriangle, Zap,
  Target, Info, Flame
} from 'lucide-react';

export const MiningBlastingView: React.FC = () => {
  const [isBlasting, setIsBlasting] = useState(false);
  const [metrics, setMetrics] = useState({
    holeCount: 42,
    completionRate: 85,
    ppv: 0.12, // Peak Particle Velocity
    decibels: 65,
    gasConcentration: 0.01,
    countdown: 3600 // 秒
  });

  const [seismicData, setSeismicData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        ppv: Math.max(0.1, 0.12 + (Math.random() - 0.5) * 0.05),
        gasConcentration: 0.01 + (Math.random() * 0.005)
      }));

      setSeismicData(prev => {
        const newData = [...prev, { time: Date.now(), val: Math.random() * 2 + Math.sin(Date.now()/500) }];
        return newData.slice(-40);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-red-50">
      
      {/* 顶部：战术指挥头栏 */}
      <div className="flex items-center justify-between bg-red-950/20 border-b border-red-500/30 p-5 clip-corner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none tech-grid-bg"></div>
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Bomb size={36} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                爆破区域智能点巡检 <span className="text-red-500">| BLASTING OPS</span>
            </h1>
            <div className="flex gap-6 text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-red-500"/> 区域: 东部露天矿区-02作业面</span>
              <span className="flex items-center gap-1 text-yellow-500"><AlertTriangle size={12}/> 爆破状态: 填装中</span>
              <span className="flex items-center gap-1"><Timer size={12}/> 窗口关闭: 17:30:00</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-10">
           <div className="text-right">
              <div className="text-[10px] text-red-500 font-bold mb-1 uppercase tracking-tighter">Current Countdown</div>
              <div className="text-3xl font-mono font-black text-white tabular-nums">00:59:52</div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">Safety Clearance</div>
              <div className="text-3xl font-mono font-black text-green-500">92.4%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 grid-rows-6 flex-1 gap-5 min-h-0">
        
        {/* 左上: 3D 数字孪生 (核心占据) */}
        <div className="col-span-12 lg:col-span-8 row-span-4 relative bg-black/60 border border-red-500/20 rounded-sm overflow-hidden group">
           {/* HUD 叠加层 */}
           <div className="absolute inset-0 pointer-events-none z-10 p-6">
              <div className="absolute top-0 right-0 w-48 h-48 border-t-2 border-r-2 border-red-500/20 m-4"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 border-b-2 border-l-2 border-red-500/20 m-4"></div>
              
              <div className="bg-black/60 backdrop-blur-md p-4 border border-red-500/30 rounded inline-flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-red-400">
                    <Target size={18} className="animate-spin" />
                    <span className="text-xs font-black tracking-widest">爆破孔位分布图 (Hole Matrix)</span>
                 </div>
                 <div className="grid grid-cols-5 gap-1 mt-2">
                    {Array.from({length: 15}).map((_, i) => (
                       <div key={i} className={`w-3 h-3 rounded-full ${i < 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                    ))}
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">10 Stemmed / 5 Loading...</div>
              </div>

              <div className="absolute bottom-10 right-10 flex flex-col gap-3">
                 <div className="bg-red-600 text-white px-4 py-2 font-black italic tracking-widest text-sm flex items-center gap-2">
                    <ShieldAlert size={18}/> 强制撤离半径: 500M
                 </div>
                 <div className="bg-black/60 border border-white/10 p-3 rounded backdrop-blur">
                    <div className="text-[10px] text-slate-400 mb-1">主震中实时坐标</div>
                    <div className="text-sm font-mono font-bold">X: 4212.5 Y: 9812.2</div>
                 </div>
              </div>
           </div>

           <ThreeScene isSimulating={isBlasting} />
        </div>

        {/* 右上: 填装数据看板 */}
        <div className="col-span-12 lg:col-span-4 row-span-4 flex flex-col gap-5">
           <SciFiCard title="装药序列实时状态" className="flex-1 bg-[#1a0a0a]/60 border-red-900/40">
              <div className="flex flex-col h-full gap-5 py-2">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                       <div className="text-[10px] text-slate-500 mb-1">平均孔深 (m)</div>
                       <div className="text-2xl font-mono font-bold text-white">12.55</div>
                    </div>
                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                       <div className="text-[10px] text-slate-500 mb-1">起爆网络延迟 (ms)</div>
                       <div className="text-2xl font-mono font-bold text-yellow-500">25</div>
                    </div>
                 </div>

                 <div className="flex-1 border-t border-red-500/10 pt-4 overflow-y-auto">
                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                       <Zap size={10}/> 炸药类型平衡分布
                    </div>
                    {['乳化炸药 #1', '重油炸药 #2', '膨化硝铵 #3'].map((item, i) => (
                       <div key={item} className="mb-4">
                          <div className="flex justify-between text-[10px] mb-1">
                             <span className="text-slate-400">{item}</span>
                             <span className="text-white font-mono">{i === 0 ? '75%' : i === 1 ? '15%' : '10%'}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-red-500" style={{width: i === 0 ? '75%' : i === 1 ? '15%' : '10%'}}></div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <button 
                  onClick={() => setIsBlasting(!isBlasting)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 transition-all font-black uppercase italic tracking-[0.3em] text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                 >
                    {isBlasting ? '停止震动模拟' : '启动震动预推演'}
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 下方全宽：安全监控与震动流 */}
        <div className="col-span-12 lg:col-span-4 row-span-2">
           <SciFiCard title="地震波 PPV 实时流" noPadding className="h-full">
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={seismicData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331111" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 10]} />
                       <Area type="monotone" dataKey="val" fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeWidth={2} isAnimationActive={false} />
                       <Line type="stepAfter" dataKey="val" stroke="#facc15" strokeWidth={0.5} dot={false} opacity={0.2} />
                    </ComposedChart>
                 </ResponsiveContainer>
                 <div className="absolute top-12 right-6 text-[9px] font-mono text-red-500/60 uppercase text-right">
                    Peak Ground Acceleration<br/>Ref: ISO-4866
                 </div>
              </div>
           </SciFiCard>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-2">
           <SciFiCard title="AI 视觉区域清场" className="h-full bg-black/40 border-red-900/40">
              <div className="flex flex-col h-full">
                 <div className="flex-1 relative bg-slate-900/50 rounded overflow-hidden flex items-center justify-center border border-white/5">
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                       <div className="bg-red-600 px-1 text-[8px] font-bold text-white uppercase">Thermal_Cam_03</div>
                    </div>
                    <Users size={48} className="text-red-950/40" />
                    {/* 模拟热像仪方框 */}
                    <div className="absolute inset-10 border border-red-500/20 bg-red-500/5 flex items-center justify-center">
                       <div className="text-[10px] text-red-400 font-bold uppercase animate-pulse">区域已净空</div>
                    </div>
                 </div>
                 <div className="mt-3 flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                       <span className="text-[10px] text-green-500 font-bold uppercase">安全扫描通过</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Sensors: 14/14 Active</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-2">
           <SciFiCard title="气体与环境风险" className="h-full">
              <div className="grid grid-cols-2 gap-4 h-full py-1">
                 <div className="flex flex-col justify-center gap-1 border-r border-red-500/10 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                       <Flame size={16} className="text-orange-500" />
                       <span className="text-[10px] text-slate-400 uppercase font-bold">CO 浓度 (PPM)</span>
                    </div>
                    <div className="text-2xl font-mono font-black text-white">0.002</div>
                    <div className="text-[8px] text-green-500 uppercase tracking-tighter">Under Safety Limit</div>
                 </div>
                 <div className="flex flex-col justify-center gap-1 pl-2">
                    <div className="flex items-center gap-2 mb-1">
                       <Radio size={16} className="text-cyan-500" />
                       <span className="text-[10px] text-slate-400 uppercase font-bold">5G 通信链路</span>
                    </div>
                    <div className="text-2xl font-mono font-black text-white">-92<span className="text-xs"> dBm</span></div>
                    <div className="text-[8px] text-cyan-500 uppercase tracking-tighter">Signal Locked</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>

      <style>{`
        @keyframes sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
