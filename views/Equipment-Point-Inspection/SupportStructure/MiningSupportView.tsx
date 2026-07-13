import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/SupportStructure/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-3]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-3';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  ShieldCheck, HardHat, Activity, Ruler, Grid, 
  MapPin, AlertOctagon, Camera, Eye, Zap, 
  Search, Info, Database, Layers
} from 'lucide-react';

export const MiningSupportView: React.FC = () => {
  const [inspectionState, setInspectionState] = useState({
    activeBolts: 1240,
    warningBolts: 3,
    avgTension: 145.2, // kN
    convergenceX: 2.1, // mm
    convergenceY: 1.5, // mm
    progress: 68
  });

  const [crackLogs, setCrackLogs] = useState([
    { id: 'C-01', location: 'K4+122 顶板', type: '结构缝', depth: '12mm', time: '15:12:01', status: '已标注' },
    { id: 'C-02', location: 'K4+125 左帮', type: '渗水点', depth: 'N/A', time: '15:10:45', status: '待核验' },
  ]);

  const [convergenceData, setConvergenceData] = useState<any[]>([]);

  useEffect(() => {
    // 模拟数据流
    const timer = setInterval(() => {
      setConvergenceData(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          x: 2 + Math.sin(Date.now()/5000) * 0.5, 
          y: 1.5 + Math.cos(Date.now()/4000) * 0.3 
        }];
        return newData.slice(-20);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 锚杆受力矩阵数据
  const boltMatrix = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    val: 140 + Math.random() * 20,
    status: Math.random() > 0.95 ? 'warning' : 'normal'
  }));

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：巡检指挥状态栏 */}
      <div className="bg-[#0b1221]/90 border border-sky-500/20 p-5 clip-corner shadow-[0_0_50px_rgba(56,189,248,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-sky-500/5 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-sky-500/10 border border-sky-500/40 rounded shadow-[0_0_20px_rgba(56,189,248,0.2)]">
               <ShieldCheck size={36} className="text-sky-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                  矿山支护结构智能点巡检 <span className="text-sky-500 text-xl not-italic tracking-[0.2em] ml-2">// STRUC_SEC_HUB</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-500"/> 井下中段: -450m 运输平巷</span>
                  <span className="flex items-center gap-1 text-green-400"><Activity size={12}/> 支护健康度指数: 98.4%</span>
                  <span className="flex items-center gap-1"><Layers size={12}/> 巡检模式: 激光雷达三维扫描</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">当前巡检进度</div>
                <div className="flex items-center gap-3">
                   <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-sky-500 shadow-[0_0_10px_#38bdf8]" style={{width: '68%'}}></div>
                   </div>
                   <span className="text-xl font-mono font-black text-white">68%</span>
                </div>
             </div>
             <div className="w-[1px] h-12 bg-white/10"></div>
             <div className="text-right">
                <div className="text-[10px] text-orange-500 font-bold mb-1 uppercase tracking-widest">异常锚杆统计</div>
                <div className="text-3xl font-mono font-black text-orange-500 animate-pulse">03</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：3D 支护诊断中心 */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
           <div className="flex-1 relative bg-black/40 border border-sky-500/10 rounded-sm overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-sky-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-sky-500/30 rounded flex items-center gap-4">
                       <Zap size={24} className="text-sky-400" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">顶板垂直压力 (σz)</div>
                          <div className="text-xl font-mono font-bold text-white">42.5 MPa</div>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-sky-500/30 rounded flex items-center gap-4">
                       <Ruler size={24} className="text-orange-400" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">围岩移动速率</div>
                          <div className="text-xl font-mono font-bold text-white">0.05 mm/d</div>
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2">
                    <div className="bg-sky-500 text-black px-4 py-1 text-xs font-black uppercase italic">
                       实时应力分布切片 S-04
                    </div>
                    <div className="w-48 h-32 bg-sky-950/40 border border-sky-500/30 backdrop-blur flex items-center justify-center">
                       <div className="text-[10px] text-sky-300 font-mono">BEYOND_VISUAL_RANGE</div>
                    </div>
                 </div>
              </div>

              <ThreeScene />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* 巷道收敛监测曲线 */}
           <div className="h-48 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="巷道收敛实时监测 (mm)" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={convergenceData} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <defs>
                          <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" fontSize={10} domain={[0, 5]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="x" name="两帮收敛" stroke="#38bdf8" fill="url(#colorX)" />
                       <Area type="monotone" dataKey="y" name="顶底下沉" stroke="#fb923c" fill="transparent" />
                    </AreaChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="支护载荷平衡分布" className="bg-sky-950/10">
                 <div className="flex flex-col justify-center h-full gap-4">
                    <div className="flex justify-between items-end">
                       <div className="text-xs text-slate-400">总体支护效能评级</div>
                       <div className="text-xl font-black text-green-400 uppercase tracking-tighter">Excellent</div>
                    </div>
                    <div className="space-y-3">
                       {['金属网强度', '混凝土喷层', '锚索预应力'].map((label, i) => (
                          <div key={i} className="flex flex-col gap-1">
                             <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-500 uppercase">{label}</span>
                                <span className="text-white">92%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500" style={{width: '92%'}}></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：数据矩阵与诊断 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
           
           {/* 锚杆拉拔力实时矩阵 */}
           <SciFiCard title="锚杆群组拉拔力监测矩阵" subtitle="UNIT: kN" className="h-[280px]">
              <div className="grid grid-cols-8 gap-1.5 h-full py-1">
                 {boltMatrix.map(bolt => (
                    <div 
                      key={bolt.id} 
                      className={`relative rounded-sm border transition-all hover:scale-110 cursor-pointer flex items-center justify-center group ${bolt.status === 'warning' ? 'bg-orange-500/20 border-orange-500/50 animate-pulse' : 'bg-sky-500/5 border-sky-500/20 hover:border-sky-500/50'}`}
                    >
                       <div className={`w-1 h-1 rounded-full ${bolt.status === 'warning' ? 'bg-orange-500' : 'bg-sky-500 opacity-40'}`}></div>
                       {/* 悬浮框预览 */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 bg-slate-900 border border-sky-500/50 p-2 text-[8px] z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-sky-400 font-bold">Bolt #{bolt.id}</div>
                          <div className="text-white mt-1">载荷: {bolt.val.toFixed(1)} kN</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* AI 视觉巡检发现流 */}
           <SciFiCard title="AI 视觉巡检发现日志" className="flex-1 border-sky-900/30">
              <div className="flex flex-col gap-4">
                 {crackLogs.map(log => (
                    <div key={log.id} className="flex gap-4 p-3 bg-slate-900/40 border border-white/5 rounded-sm hover:border-sky-500/30 transition-all cursor-pointer group">
                       <div className="w-20 h-20 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden">
                          <Camera size={32} className="text-slate-600 group-hover:text-sky-500 transition-colors" />
                          <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-transparent"></div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{log.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs font-bold text-white my-1">{log.location}</div>
                          <div className="flex items-center gap-3">
                             <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 italic">深度/尺寸: {log.depth}</div>
                             <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${log.status === '已标注' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{log.status}</div>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-2 space-y-4">
                    <div className="p-4 bg-orange-600/10 border border-orange-500/30 rounded flex items-start gap-3">
                       <AlertOctagon size={20} className="text-orange-500 shrink-0 mt-1" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-orange-200">预警提示: K4+122 区段锚固失效风险</div>
                          <p className="text-[10px] text-orange-300/80 mt-1 uppercase font-bold">检测到围岩松动圈扩大，建议追加喷锚支护。</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="py-3 bg-sky-600 hover:bg-sky-700 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_15px_rgba(8,145,178,0.2)]">
                          调取历史对比报告
                       </button>
                       <button className="py-3 bg-slate-800 hover:bg-slate-700 transition-all font-black uppercase text-[10px] tracking-[0.2em] border border-white/5">
                          导出结构鉴定书
                       </button>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* 数据库与边缘计算状态 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-sky-950/50 rounded flex items-center justify-center">
                    <Database size={18} className="text-sky-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">数据同步链路</div>
                    <div className="text-xs font-mono font-bold text-white">EDGE_NODE_03 ACTIVE</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-sky-500' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
