import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/Ventilation/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-4]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-4';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  Fan, Wind, Thermometer, Activity, ShieldCheck, 
  MapPin, AlertTriangle, Zap, Eye, Gauge, 
  Layers, Database, Airplay, ScanText
} from 'lucide-react';

export const MiningVentilationView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    windSpeed: 12.4, // m/s
    negativePressure: 2450, // Pa
    totalAirVolume: 15600, // m3/min
    ch4: 0.02, // %
    co: 0.001, // %
    motorTemp: 58.5, // °C
    vibX: 1.2, // mm/s
    fanRpm: 1450
  });

  const [flowHistory, setFlowHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        windSpeed: 12 + (Math.random() - 0.5) * 0.8,
        negativePressure: 2400 + (Math.random() - 0.5) * 100,
        vibX: 1.1 + (Math.random() - 0.5) * 0.4
      }));

      setFlowHistory(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          vol: 15600 + Math.random() * 500,
          pres: 2400 + Math.random() * 200
        }];
        return newData.slice(-20);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const sensorHealth = [
    { name: '井口风速仪', status: 'online', val: '12.4 m/s' },
    { name: 'U型压差计', status: 'online', val: '2452 Pa' },
    { name: '红外测温阵列', status: 'warning', val: '62.1 °C' },
    { name: '超声波探伤仪', status: 'online', val: 'Detecting' },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-sky-50 font-[Rajdhani]">
      
      {/* 顶部：巡检任务实时链路 */}
      <div className="bg-[#0b1221]/90 border border-sky-500/20 p-5 clip-corner shadow-[0_0_40px_rgba(14,165,233,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-sky-500/10 border border-sky-500/40 rounded shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Fan size={32} className="text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                 通风井口智能点巡检 <span className="text-sky-400 text-xl not-italic tracking-[0.2em] ml-2">// VENT_SEC_NODE_01</span>
              </h1>
              <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">
                 <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-500"/> 位置: 南翼主通风井 #1-2</span>
                 <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 巡检状态: 自动监测中</span>
                 <span className="flex items-center gap-1"><Zap size={12}/> 当前功耗: 420.5 kW</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">实时总风量 VOLUME</div>
                <div className="text-2xl font-mono font-black text-white">15,642 <span className="text-xs text-sky-500">m³/min</span></div>
             </div>
             <div className="w-[1px] h-10 bg-white/10"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">负压指数 PRESSURE</div>
                <div className="text-2xl font-mono font-black text-sky-400">2,450 <span className="text-xs">Pa</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：气动力学监测仓 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           <SciFiCard title="环境气体健康监测" className="bg-[#0f172a]/60 border-sky-900/40">
              <div className="flex flex-col gap-5 py-2">
                 <div className="p-3 bg-slate-900/80 rounded-sm border-l-2 border-green-500">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">瓦斯浓度 (CH4)</div>
                    <div className="text-2xl font-mono font-bold text-green-400">0.022 %</div>
                    <div className="mt-1 w-full h-1 bg-slate-800">
                       <div className="bg-green-500 h-full w-[10%]"></div>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-900/80 rounded-sm border-l-2 border-cyan-500">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">一氧化碳 (CO)</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">0.001 %</div>
                 </div>
                 <div className="p-3 bg-slate-900/80 rounded-sm border-l-2 border-blue-500">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">巷道湿度 (HUM)</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">42.5 %</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="巡检节点自检清单" className="flex-1 border-sky-900/30">
              <div className="flex flex-col gap-3">
                 {sensorHealth.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-sm border border-white/5 group hover:border-sky-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                          <span className="text-xs font-bold text-slate-300">{s.name}</span>
                       </div>
                       <span className="text-xs font-mono font-bold text-sky-400 group-hover:text-white transition-colors">{s.val}</span>
                    </div>
                 ))}
                 <button className="mt-4 py-3 bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/30 text-sky-200 text-[10px] font-black uppercase tracking-widest transition-all">
                    全量远程校准校零
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中部：3D 数字孪生 & 动态气流 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-sky-500/20 rounded-sm overflow-hidden group">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-sky-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-sky-500/30 rounded flex items-center gap-4">
                       <Wind size={24} className="text-sky-400 animate-pulse" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">实时进风速度</div>
                          <div className="text-xl font-mono font-bold text-white">{metrics.windSpeed.toFixed(1)} m/s</div>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-sky-500/30 rounded flex items-center gap-4">
                       <Gauge size={24} className="text-purple-400" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">动压 (Pd)</div>
                          <div className="text-xl font-mono font-bold text-white">420.2 Pa</div>
                       </div>
                    </div>
                 </div>

                 {/* 井口 AI 画面切片 */}
                 <div className="absolute bottom-10 left-10 w-48 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden">
                    <div className="absolute top-1 left-1 bg-red-600 px-1 text-[8px] font-bold">CAM_SHAFT_TOP</div>
                    <div className="w-full h-full flex items-center justify-center">
                       <Eye size={24} className="text-slate-700" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-sky-500/10 text-[8px] p-1 text-center text-sky-300 uppercase">
                       智能监测：无结冰/无附着物
                    </div>
                 </div>
              </div>

              <ThreeScene speed={metrics.windSpeed / 12} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* 流量与负压耦合曲线 */}
           <div className="h-44">
              <SciFiCard title="通风动力学实时耦合监测" noPadding className="h-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={flowHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                       <XAxis dataKey="time" hide />
                       <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} hide />
                       <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={10} hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area yAxisId="left" type="monotone" dataKey="vol" name="瞬时风量" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                       <Line yAxisId="right" type="stepAfter" dataKey="pres" name="井筒负压" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：风机动力监测 & 预警 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           
           <SciFiCard title="风机马达状态 (ME-01)" className="bg-[#0f172a]/40">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">轴承温度 Bearing</div>
                    <div className="text-xl font-mono font-black text-orange-400">62.1 <span className="text-xs">°C</span></div>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[62%]"></div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">震动峰值 Vibration</div>
                    <div className="text-xl font-mono font-black text-white">{metrics.vibX.toFixed(2)} <span className="text-xs">mm/s</span></div>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {Array.from({length: 12}).map((_, i) => (
                       <div key={i} className={`h-4 border border-white/5 ${i < 8 ? 'bg-sky-500/40' : 'bg-slate-800'}`}></div>
                    ))}
                 </div>
                 
                 <div className="mt-2 bg-slate-900/80 p-3 border border-white/5 rounded-sm">
                    <div className="text-[10px] text-slate-400 uppercase mb-1 font-bold">变频器输出频率</div>
                    <div className="text-xl font-mono font-bold text-sky-400">48.52 <span className="text-xs text-slate-500">Hz</span></div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="智能巡检 AI 发现流" className="flex-1 border-sky-900/30">
              <div className="flex flex-col gap-4">
                 <div className="p-3 bg-red-600/10 border-l-4 border-red-600 rounded-r-sm">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black text-red-500 uppercase">叶片表面缺陷</span>
                       <span className="text-[8px] text-slate-500 font-mono">10:45:12</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-bold leading-relaxed">
                       检测到 #2 风机 B 侧叶片根部疑似微小疲劳裂纹，建议下次停机核验。
                    </p>
                    <div className="mt-2 flex justify-end">
                       <button className="text-[9px] text-sky-400 flex items-center gap-1 font-black">{">>>"} 调取频闪图像证据</button>
                    </div>
                 </div>

                 <div className="p-3 bg-sky-900/10 border-l-4 border-sky-500 rounded-r-sm">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black text-sky-400 uppercase">声学指纹分析</span>
                       <span className="text-[8px] text-slate-500 font-mono">10:30:05</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-bold leading-relaxed">
                       轴承润滑声学信号正常。预计剩余寿命 1450 运行小时。
                    </p>
                 </div>

                 <div className="mt-auto space-y-3">
                    <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Database size={16} className="text-sky-500" />
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">边缘网关</div>
                       </div>
                       <span className="text-xs font-mono font-black text-green-500">SYNC_OK</span>
                    </div>
                    <button className="w-full py-4 bg-sky-600 hover:bg-sky-700 transition-all font-black uppercase italic tracking-[0.3em] text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                       发起联动维护派单
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
