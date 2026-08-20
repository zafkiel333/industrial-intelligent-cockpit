import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-7]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-7';
// 2026-07-13 新增：场景库测试方案 Phase 4.6 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '../src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '../src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实动力趋势 + 燃油效率散点图 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '../src/scenarioLib/scenarioFieldReport';
const SCENARIO_ID = 'eq-7';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Anchor, Navigation, Compass, Wind, Thermometer,
  Activity, Gauge, Box, ArrowUpRight, LocateFixed, Upload, Trash2, FileDown
} from 'lucide-react';

export const ShipView: React.FC = () => {
  // 2026-07-13 重塑：speed/rpm/fuelConsumption/exhaustTemp 改为真实数据；
  // heading/depth/load/姿态/环境等次要指标保持原有模拟，避免单页指标过多超出试点范畴。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const latestRow = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;

  // --- STATE ---
  const [navData, setNavData] = useState({
    speed: 18.5, // Knots
    heading: 245, // Degrees
    lat: "34°12'N",
    long: "135°44'E",
    depth: 1450, // m
  });

  const [engineData, setEngineData] = useState({
    rpm: 92,
    load: 85,
    fuelConsumption: 125, // kg/h
    exhaustTemp: 420, // C
  });

  const handleClear = async () => {
    if (!window.confirm('确定要清空全部已上传数据吗？清空后无法恢复。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const [stability, setStability] = useState({
    pitch: 0.5,
    roll: 1.2,
    ballastLevel: 65,
    trim: -0.2 // m (Stern trim)
  });

  const [envData, setEnvData] = useState({
    windSpeed: 12.5, // m/s
    windDir: 270,
    waveHeight: 2.5, // m
  });

  // 2026-07-13 新增：latestRow 变化时（新数据上传/清空）同步真实指标到 navData/engineData
  useEffect(() => {
    if (!latestRow) return;
    setNavData(prev => ({ ...prev, speed: Number(latestRow.speed) }));
    setEngineData(prev => ({
      ...prev,
      rpm: Number(latestRow.rpm),
      fuelConsumption: Number(latestRow.fuelConsumption),
      exhaustTemp: Number(latestRow.exhaustTemp),
    }));
  }, [latestRow]);

  // Simulation Loop（姿态/环境/负荷等次要指标保持原有模拟，不纳入本次真实数据范围）
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / 1000;

      // 1. Navigation Updates（speed 改为真实数据驱动，heading/depth 保持模拟）
      setNavData(prev => ({
        ...prev,
        heading: 245 + Math.sin(time * 0.1) * 2,
        depth: 1450 + Math.floor(Math.random() * 10)
      }));

      // 2. Engine Fluctuations（rpm/fuelConsumption/exhaustTemp 改为真实数据驱动，load 保持模拟）
      setEngineData(prev => ({
        ...prev,
        load: 85 + (Math.random() - 0.5) * 2,
      }));

      // 3. Stability (Oscillation)
      setStability(prev => ({
        ...prev,
        pitch: Math.sin(time) * 1.5,
        roll: Math.cos(time * 0.8) * 3.0,
      }));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2026-07-14 新增：真实动力系统趋势——直接取上传数据的完整时间序列（替换原来随机推进的假历史）。
  const engineRealTrend = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        rpm: Number(row.rpm),
        fuelConsumption: Number(row.fuelConsumption),
        exhaustTemp: Number(row.exhaustTemp),
      }))
    : [{ time: '--', rpm: engineData.rpm, fuelConsumption: engineData.fuelConsumption, exhaustTemp: engineData.exhaustTemp }];

  // 燃油效率散点：转速 vs 油耗，反映主机运行经济性（转速升高但油耗异常偏高 = 效率下降）
  const fuelEfficiencyPoints = engineRealTrend.map((d) => ({ rpm: d.rpm, fuel: d.fuelConsumption }));

  const engineConclusion =
    engineData.exhaustTemp > 480 || engineData.fuelConsumption > 150
      ? `排烟温度 ${engineData.exhaustTemp.toFixed(0)}°C / 油耗 ${engineData.fuelConsumption.toFixed(0)}kg/h 已偏高，建议检查喷油器雾化状态及增压器效率，排查燃烧不完全风险。`
      : `主机排烟温度 ${engineData.exhaustTemp.toFixed(0)}°C、油耗 ${engineData.fuelConsumption.toFixed(0)}kg/h，均在正常经济航速范围内，运行经济性良好。`;

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '船舶主机智能运维报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '航速', value: navData.speed.toFixed(1), unit: 'kn' },
        { label: '主机转速', value: engineData.rpm.toFixed(1), unit: 'RPM' },
        { label: '燃油消耗', value: engineData.fuelConsumption.toFixed(0), unit: 'kg/h' },
        { label: '排烟温度', value: engineData.exhaustTemp.toFixed(0), unit: '°C' },
        { label: '主机负荷', value: engineData.load.toFixed(0), unit: '%' },
      ],
      conclusion: engineConclusion,
    });
  };

  const radarData = [
    { subject: 'Propulsion', A: 95, fullMark: 100 },
    { subject: 'Navigation', A: 98, fullMark: 100 },
    { subject: 'Cargo Safety', A: 100, fullMark: 100 },
    { subject: 'Hull Stress', A: 85, fullMark: 100 },
    { subject: 'Electrical', A: 92, fullMark: 100 },
    { subject: 'Comms', A: 99, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-slate-100 selection:bg-cyan-500/30">
      
      {/* HEADER: Maritime Theme */}
      <div className="flex items-end justify-between border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-slate-900/50 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Anchor size={12} className="animate-bounce" />
             OCEAN LOGISTICS & OPERATIONS
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-cyan-400 text-shadow-glow">船舶</span> 智能运维指挥台
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">IMO 9876543</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">SOG (Speed)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{navData.speed.toFixed(1)} <span className="text-sm text-slate-500">knots</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">COG (Heading)</div>
                <div className="text-2xl font-mono font-bold text-white">{navData.heading.toFixed(0)}<span className="text-sm text-slate-500">°</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Engine Load</div>
                <div className="text-2xl font-mono font-bold text-green-400">{engineData.load.toFixed(0)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col gap-2 border-l border-cyan-900/40 pl-6 justify-center">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-colors"
                >
                  <Upload size={14} /> 数据入库
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} /> 一键清空
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Navigation & Weather */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Navigation Card */}
           <SciFiCard title="实时航行数据" subtitle="GNSS/AIS" className="border-cyan-900/50 bg-[#081b2e]/60">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-cyan-500/10">
                    <div className="flex items-center gap-3">
                       <LocateFixed className="text-cyan-400" />
                       <div>
                          <div className="text-xs text-slate-400">LATITUDE</div>
                          <div className="font-mono text-lg font-bold">{navData.lat}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-slate-400">LONGITUDE</div>
                       <div className="font-mono text-lg font-bold">{navData.long}</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-3 rounded text-center border border-slate-700">
                        <ArrowUpRight className="mx-auto text-cyan-500 mb-1" style={{transform: `rotate(${navData.heading}deg)`}} />
                        <div className="text-2xl font-mono font-bold text-white">{navData.heading.toFixed(0)}°</div>
                        <div className="text-[10px] text-slate-500 uppercase">True Heading</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded text-center border border-slate-700">
                        <Activity className="mx-auto text-blue-500 mb-1" />
                        <div className="text-2xl font-mono font-bold text-white">{navData.depth}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Depth (m)</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Weather & Environment */}
           <SciFiCard title="海况环境监测" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-4 h-full justify-center">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Wind className="text-slate-300" />
                       <span className="text-sm text-slate-400">Apparent Wind</span>
                    </div>
                    <span className="text-xl font-bold text-white">{envData.windSpeed} <span className="text-xs font-normal">m/s</span></span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{width: '65%'}}></div>
                 </div>

                 <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                       <Activity className="text-blue-400" />
                       <span className="text-sm text-slate-400">Sig. Wave Height</span>
                    </div>
                    <span className="text-xl font-bold text-blue-200">{envData.waveHeight} <span className="text-xs font-normal">m</span></span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{width: '40%'}}></div>
                 </div>

                 <div className="p-3 mt-auto bg-blue-900/20 rounded border border-blue-800/30 text-xs text-center text-blue-300">
                    <span className="font-bold">FORECAST:</span> Gale warning in sector B4. Course correction advised +5°.
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#030712] border border-cyan-800/40 relative rounded overflow-hidden shadow-[inset_0_0_80px_rgba(8,145,178,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-cyan-500/30">
                    <Navigation className="text-cyan-400" size={16} />
                    <span className="text-xs text-white font-mono font-bold tracking-wider">AUTOPILOT: ENGAGED</span>
                 </div>
              </div>
              
              <div className="absolute bottom-4 left-4 z-10 w-64 bg-black/70 backdrop-blur p-3 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Main Engine (ME-1)</div>
                  <div className="flex justify-between items-end mb-1">
                      <span className="text-2xl font-mono font-bold text-white">{engineData.rpm.toFixed(1)} <span className="text-sm font-normal text-slate-500">RPM</span></span>
                      <span className="text-xs text-orange-400">{engineData.fuelConsumption.toFixed(0)} kg/h</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full transition-all duration-300" style={{width: `${engineData.load}%`}}></div>
                  </div>
              </div>

              <ThreeScene type="ship" color="#38bdf8" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Propulsion Trend（真实数据） */}
           <SciFiCard title="动力系统趋势（真实数据）" subtitle="RPM & EXHAUST TEMP" className="h-[250px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engineRealTrend}>
                       <defs>
                          <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="rpm" stroke="#0ea5e9" tick={{fontSize: 9}} width={30} />
                       <YAxis yAxisId="temp" orientation="right" stroke="#f59e0b" tick={{fontSize: 9}} width={30} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                       <Area yAxisId="rpm" type="monotone" dataKey="rpm" name="转速(RPM)" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorRpm)" />
                       <Line yAxisId="temp" type="monotone" dataKey="exhaustTemp" name="排烟温度(°C)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Fuel Efficiency Scatter（真实数据） */}
           <SciFiCard title="燃油效率分析（转速 vs 油耗）" subtitle="FUEL EFFICIENCY" className="h-[200px] border-cyan-900/50">
              <div className="flex h-full gap-3">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="rpm" name="转速" unit="RPM" stroke="#64748b" tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                      <YAxis type="number" dataKey="fuel" name="油耗" unit="kg/h" stroke="#64748b" tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                      <ZAxis range={[60, 60]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff' }} />
                      <Scatter data={fuelEfficiencyPoints} fill="#22d3ee" fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-36 flex flex-col justify-between gap-2">
                  <p className="text-[10px] text-slate-400 leading-relaxed">{engineConclusion}</p>
                  <button
                    onClick={handleExportReport}
                    className="w-full py-2 bg-cyan-700/40 hover:bg-cyan-700/60 border border-cyan-500/50 rounded text-[10px] text-cyan-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <FileDown size={12} /> 导出运维报告
                  </button>
                </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Stability & Cargo */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Stability Monitor (Artificial Horizon) */}
           <SciFiCard title="船舶姿态监控" subtitle="STABILITY" className="border-cyan-900/50">
              <div className="flex flex-col items-center justify-center py-4 relative h-48 bg-slate-900/30 rounded border border-slate-800/50 overflow-hidden">
                  
                  {/* Horizon Line Visualization */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <div className="w-[150%] h-[200%] bg-gradient-to-b from-sky-400/20 to-blue-900/40 transition-transform duration-500 origin-center"
                           style={{
                               transform: `rotate(${stability.roll}deg) translateY(${stability.pitch * 10}px)`
                           }}
                      >
                          <div className="w-full h-[50%] border-b-2 border-cyan-400/50"></div>
                      </div>
                  </div>

                  {/* Ship Silhouette (Fixed) */}
                  <div className="relative z-10 opacity-80">
                      <Anchor size={48} className="text-white drop-shadow-lg" />
                  </div>

                  {/* Readouts */}
                  <div className="absolute bottom-2 left-2 z-10">
                      <div className="text-[10px] text-slate-400">PITCH</div>
                      <div className="text-sm font-bold font-mono text-white">{stability.pitch.toFixed(1)}°</div>
                  </div>
                  <div className="absolute bottom-2 right-2 z-10 text-right">
                      <div className="text-[10px] text-slate-400">ROLL</div>
                      <div className="text-sm font-bold font-mono text-white">{stability.roll.toFixed(1)}°</div>
                  </div>
              </div>
           </SciFiCard>

           {/* Cargo & Ballast */}
           <SciFiCard title="货物与压载状态" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Box size={12} /> Cargo Holds Temp</span>
                    <span className="text-green-400">Normal</span>
                 </div>
                 <div className="grid grid-cols-4 gap-1">
                     {[22, 23, 22, 24, 23, 22, 21, 23].map((t, i) => (
                        <div key={i} className="bg-slate-800 p-1 text-center rounded">
                            <div className="text-[10px] font-mono text-white">{t}°</div>
                        </div>
                     ))}
                 </div>

                 <div className="mt-2">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                       <span>Ballast Tank Levels</span>
                       <span>Trim: {stability.trim}m</span>
                    </div>
                    <div className="w-full h-16 flex gap-1 items-end border-b border-slate-700 pb-1">
                        <div className="flex-1 bg-blue-900/50 relative group">
                            <div className="absolute bottom-0 w-full bg-blue-500" style={{height: '60%'}}></div>
                            <span className="absolute -top-4 text-[8px] w-full text-center">Fore</span>
                        </div>
                        <div className="flex-1 bg-blue-900/50 relative">
                            <div className="absolute bottom-0 w-full bg-blue-500" style={{height: '45%'}}></div>
                        </div>
                        <div className="flex-1 bg-blue-900/50 relative">
                            <div className="absolute bottom-0 w-full bg-blue-500" style={{height: '45%'}}></div>
                        </div>
                        <div className="flex-1 bg-blue-900/50 relative">
                            <div className="absolute bottom-0 w-full bg-blue-500" style={{height: '70%'}}></div>
                            <span className="absolute -top-4 text-[8px] w-full text-center">Aft</span>
                        </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="speed(kn) / rpm(RPM) / fuelConsumption(kg/h) / exhaustTemp(°C)"
      />
    </div>
  );
};
