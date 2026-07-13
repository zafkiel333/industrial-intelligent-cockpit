
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroSensorsThreeScene } from '../../components/spare_parts_hydro_sensors/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-sensors]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-sensors';
import { SensorPart } from '../../components/spare_parts_hydro_sensors/three-types';
import { 
  Wifi, 
  Activity, 
  Zap, 
  Search, 
  Radio, 
  Cpu, 
  RefreshCw, 
  Target, 
  Signal, 
  Share2, 
  Database, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart4
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, LineChart, Line
} from 'recharts';

// --- MOCK DATA ---

const SENSOR_LIST: SensorPart[] = [
  { id: 'AGS-01', name: '空气间隙传感器 A', type: 'air-gap', status: 'normal', position: [4, 0, 0], signalQuality: 98, lastCalibrated: '2024-03-20' },
  { id: 'AGS-02', name: '空气间隙传感器 B', type: 'air-gap', status: 'normal', position: [-4, 0, 0], signalQuality: 96, lastCalibrated: '2024-03-20' },
  { id: 'VIB-X1', name: '上导X向振动探头', type: 'vibration', status: 'drift', position: [0, 3, 2], signalQuality: 75, lastCalibrated: '2023-11-15' },
  { id: 'VIB-Y1', name: '上导Y向振动探头', type: 'vibration', status: 'normal', position: [2, 3, 0], signalQuality: 92, lastCalibrated: '2023-11-15' },
  { id: 'MFP-01', name: '磁通量探头 (Flux)', type: 'magnetic', status: 'normal', position: [3, -1, 3], signalQuality: 99, lastCalibrated: '2024-01-10' },
  { id: 'TMP-S1', name: '定子槽温传感器', type: 'temp', status: 'offline', position: [-2, -2, -2], signalQuality: 0, lastCalibrated: '2023-05-05' },
];

const DRIFT_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  val: 5 + Math.sin(i * 0.5) + (Math.random() - 0.5) * 0.5,
  limit: 8
}));

const SPECTRUM_DATA = Array.from({ length: 40 }, (_, i) => ({
  freq: i * 10,
  db: Math.random() * 20 + (i % 5 === 0 ? 40 : 10) // Peaks
}));

export const HydroSensorsView: React.FC = () => {
  const [selectedSensorId, setSelectedSensorId] = useState('VIB-X1');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeSensor = useMemo(() => SENSOR_LIST.find(s => s.id === selectedSensorId) || SENSOR_LIST[0], [selectedSensorId]);

  const handleCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 3000);
  };

  const filteredSensors = SENSOR_LIST.filter(s => s.name.includes(searchTerm) || s.id.includes(searchTerm));

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-cyan-50 animate-in fade-in duration-1000 bg-[#02050b]">
      
      {/* 顶部：传感器阵列指挥台 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 relative group">
              <Radio size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded-lg animate-[pulse_2s_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Hydro-Electric Sensor Matrix
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 水电站专用 <span className="text-cyan-500 italic">传感器备件服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">在线节点数</div>
              <div className="text-2xl font-mono font-bold text-white">482</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">信号完整度</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">漂移预警</div>
              <div className="text-2xl font-mono font-bold text-amber-500 flex items-center gap-1">
                 03 <Activity size={14} className="animate-pulse" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：传感器矩阵列表 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="传感器状态矩阵" subtitle="SENSOR_GRID" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-4 h-full overflow-hidden">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700" size={14} />
                    <input 
                      type="text" 
                      placeholder="搜索位号 / 类型..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500 text-cyan-100 placeholder:text-cyan-900"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {filteredSensors.map(sensor => (
                       <div 
                         key={sensor.id}
                         onClick={() => setSelectedSensorId(sensor.id)}
                         className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                            ${selectedSensorId === sensor.id 
                               ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                               : 'bg-slate-900/40 border-slate-800 hover:border-cyan-700'}
                         `}
                       >
                          {selectedSensorId === sensor.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                          
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${sensor.status === 'normal' ? 'bg-emerald-500' : sensor.status === 'drift' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                                <span className="text-[10px] font-mono text-cyan-300 font-bold">{sensor.id}</span>
                             </div>
                             <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                                ${sensor.status === 'normal' ? 'bg-emerald-900/20 text-emerald-400' : 
                                  sensor.status === 'drift' ? 'bg-amber-900/20 text-amber-400' : 'bg-slate-800 text-slate-500'}
                             `}>{sensor.status}</span>
                          </div>
                          
                          <div className="text-xs font-bold text-white mb-2 truncate">{sensor.name}</div>
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                             <span className="flex items-center gap-1"><Signal size={10} /> Quality: {sensor.signalQuality}%</span>
                             <span>{sensor.type.toUpperCase()}</span>
                          </div>

                          {/* Mini Signal Visualizer */}
                          <div className="h-4 w-full mt-2 flex items-end gap-0.5 opacity-50">
                             {Array.from({length: 20}).map((_, i) => (
                                <div key={i} className="flex-1 bg-cyan-500" style={{ height: `${Math.random() * 100}%`, opacity: i/20 }}></div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                 <AlertTriangle size={14} /> 备件寿命预警
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-amber-500">
                 <span className="text-amber-400 font-bold">VIB-X1</span> 探头灵敏度衰减 12%，预计 3 个月后超出 ISO 容差范围，建议列入下季度采购计划。
              </div>
           </div>
        </div>

        {/* 中枢：3D 传感器全息映射 (Holographic Map) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#010204] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Cpu size={14} className="animate-pulse" />
                          DIGITAL TWIN: TURBINE SENSOR MAP
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          <span className="text-cyan-500">Sensor</span> Topology
                       </h2>
                    </div>
                    
                    {/* Active Sensor HUD */}
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto min-w-[150px]">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Selected Node</div>
                       <div className="text-xl font-bold text-white mb-1">{activeSensor.id}</div>
                       <div className="flex justify-end gap-2 text-[9px]">
                          <span className="text-emerald-400 bg-emerald-900/20 px-1 rounded">Online</span>
                          <span className="text-cyan-400 bg-cyan-900/20 px-1 rounded">Calibrated</span>
                       </div>
                    </div>
                 </div>

                 {/* Bottom Action Bar */}
                 <div className="flex justify-between items-end pointer-events-auto">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center gap-2 backdrop-blur-sm text-[10px] text-cyan-300">
                          <Wifi size={12} /> 无线回传：4ms
                       </div>
                       <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center gap-2 backdrop-blur-sm text-[10px] text-cyan-300">
                          <Zap size={12} /> 电池电量：Stable
                       </div>
                    </div>
                    
                    <button 
                       onClick={handleCalibration}
                       disabled={isCalibrating || activeSensor.status === 'offline'}
                       className={`px-8 py-3 font-bold text-xs uppercase tracking-[0.2em] rounded transition-all flex items-center gap-2 shadow-lg
                          ${isCalibrating 
                             ? 'bg-slate-800 text-slate-500 cursor-wait' 
                             : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'}
                       `}
                    >
                       {isCalibrating ? <RefreshCw className="animate-spin" size={14}/> : <Target size={14}/>}
                       {isCalibrating ? '校准中...' : '启动远程零点校准'}
                    </button>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <HydroSensorsThreeScene 
                    sensors={SENSOR_LIST} 
                    activeSensorId={selectedSensorId}
                    onSelect={setSelectedSensorId}
                    isCalibrating={isCalibrating}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Decorative Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#02050b_100%)] opacity-80"></div>
           </div>

           {/* 底部：信号频谱分析 */}
           <SciFiCard title="信号频谱特征分析 (FFT)" subtitle="SPECTRUM_ANALYZER" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SPECTRUM_DATA}>
                       <defs>
                          <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="freq" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="db" stroke="#06b6d4" strokeWidth={2} fill="url(#colorSignal)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：校准实验室 (Calibration Lab) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="零点漂移趋势 (Drift Analysis)" subtitle="PRECISION">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DRIFT_DATA}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 10]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                       <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={2} dot={{r:2}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-center text-slate-500 mt-1">
                 线性度偏差: <span className="text-amber-400 font-bold">+1.2%</span> (需补偿)
              </div>
           </SciFiCard>

           <SciFiCard title="传感器全生命周期DNA" subtitle="LIFECYCLE_TAG" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-4 h-full">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                       <span className="text-slate-500">出厂日期</span>
                       <span className="text-white font-mono">2021-06-15</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                       <span className="text-slate-500">累计运行</span>
                       <span className="text-cyan-400 font-mono">14,250 hrs</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                       <span className="text-slate-500">剩余寿命 (RUL)</span>
                       <span className="text-emerald-400 font-mono">~3.5 yrs</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                       <span className="text-slate-500">上次标定</span>
                       <span className="text-white font-mono">{activeSensor.lastCalibrated}</span>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900/80 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded text-cyan-500"><Database size={16} /></div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">校准证书区块链存证</div>
                          <div className="text-xs font-bold text-white">HASH: 0x882...99A</div>
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 transition-all">
                    <Share2 size={14} /> 生成健康体检报告
                 </button>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
