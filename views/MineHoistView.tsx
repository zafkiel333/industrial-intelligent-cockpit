import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-12]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-12';
// 2026-07-13 新增：场景库测试方案 Phase 4.8 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '../src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '../src/scenarioLib/ScenarioDataUploadModal';
const SCENARIO_ID = 'eq-12';
// 2026-07-14 新增：真实深度-时间运行轨迹 + 真实钢丝绳不平衡系数 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '../src/scenarioLib/scenarioFieldReport';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  ArrowDown, ArrowUp, Lock, Gauge, Settings,
  AlertTriangle, Hammer, Ruler, ChevronsDown, Upload, Trash2, FileDown
} from 'lucide-react';

export const MineHoistView: React.FC = () => {
  // 2026-07-13 重塑：depth/velocity/payload/brakePressure/ropeTensions 改为真实数据；
  // mode/drumSpeed/direction 属于派生/操作状态量，保持原有派生逻辑（drumSpeed=velocity*4.5，direction 由 velocity 符号派生）。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // --- STATE ---
  const [hoistStatus, setHoistStatus] = useState({
    depth: 450, // meters
    velocity: 8.5, // m/s
    payload: 24.5, // tons
    mode: 'AUTO', // AUTO, MAN, INSPECT
    drumSpeed: 42, // rpm
    brakePressure: 14.5, // MPa
    direction: 'DOWN' as 'UP' | 'DOWN' | 'STOP'
  });

  const [velocityCurve, setVelocityCurve] = useState<any[]>([]);
  const [ropeTensions, setRopeTensions] = useState([
      { id: 'R1', val: 120 },
      { id: 'R2', val: 122 },
      { id: 'R3', val: 119 },
      { id: 'R4', val: 121 },
  ]);

  const handleClear = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  // 真实数据同步：depth/velocity/payload/brakePressure/ropeTensions
  useEffect(() => {
    if (unifiedData.length === 0) return;
    const latest = unifiedData[unifiedData.length - 1];
    const velocity = Number(latest.velocity);
    setHoistStatus(prev => ({
      ...prev,
      depth: Number(latest.depth),
      velocity,
      payload: Number(latest.payload),
      brakePressure: Number(latest.brakePressure),
      drumSpeed: velocity * 4.5,
      direction: Math.abs(velocity) < 0.5 ? 'STOP' : (velocity > 0 ? 'DOWN' : 'UP'),
    }));
    setRopeTensions((['R1', 'R2', 'R3', 'R4'] as const).map((id) => ({
      id,
      val: Number(latest[`ropeTension${id}`]),
    })));
  }, [unifiedData]);

  // Generate S-Curve for velocity chart visualization（保持原有展示，不接入真实数据）
  useEffect(() => {
    const curve = [];
    for(let i=0; i<=60; i++) {
        let v = 0;
        if(i < 10) v = i; // Accel
        else if (i < 50) v = 10; // Constant
        else v = 10 - (i-50); // Decel
        curve.push({ time: i, vel: Math.max(0, v) });
    }
    setVelocityCurve(curve);
  }, []);

  // 2026-07-14 新增：真实"深度-时间"运行轨迹——直接取上传数据的实际时间序列，
  // 展示提升机真实的下放/提升行程曲线（替换原来固定形状的 S 型曲线静态展示）。
  const depthTrace = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        depth: Number(row.depth),
        velocity: Number(row.velocity),
      }))
    : [{ time: '--', depth: hoistStatus.depth, velocity: hoistStatus.velocity }];

  // 2026-07-14 新增：真实钢丝绳不平衡系数（替换原来固定的 "1.2% (Limit: 5%)" 静态展示）。
  const ropeVals = ropeTensions.map((r) => r.val);
  const ropeAvg = ropeVals.reduce((a, b) => a + b, 0) / ropeVals.length;
  const ropeImbalancePct = ropeAvg > 0 ? ((Math.max(...ropeVals) - Math.min(...ropeVals)) / ropeAvg) * 100 : 0;

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '矿山提升机运行状态报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '当前深度', value: hoistStatus.depth.toFixed(1), unit: 'm' },
        { label: '当前速度', value: hoistStatus.velocity.toFixed(1), unit: 'm/s' },
        { label: '载荷', value: hoistStatus.payload.toFixed(2), unit: 't' },
        { label: '制动压力', value: hoistStatus.brakePressure.toFixed(2), unit: 'MPa' },
        ...ropeTensions.map((r) => ({ label: `钢丝绳 ${r.id} 张力`, value: r.val.toFixed(1), unit: 'kN' })),
        { label: '钢丝绳不平衡系数', value: ropeImbalancePct.toFixed(1), unit: '%' },
      ],
      conclusion: ropeImbalancePct > 5
        ? `钢丝绳张力不平衡系数已达 ${ropeImbalancePct.toFixed(1)}%，超过 5% 限值，建议立即停机检查各绳张力调节装置。`
        : `钢丝绳张力不平衡系数 ${ropeImbalancePct.toFixed(1)}%，制动压力 ${hoistStatus.brakePressure.toFixed(2)}MPa，均在正常范围内，提升系统运行平稳。`,
    });
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-amber-50 selection:bg-amber-500/30">
      
      {/* HEADER: Deep Earth Theme */}
      <div className="flex items-end justify-between border-b border-amber-700/40 pb-4 bg-gradient-to-r from-[#2a1b0a] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <ChevronsDown size={12} className="animate-bounce" />
             DEEP SHAFT TRANSPORTATION
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-amber-500 text-shadow-glow">矿山提升机</span> 智能运维系统
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">SHAFT-MAIN-01</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Current Depth</div>
                <div className="text-2xl font-mono font-bold text-amber-400">-{hoistStatus.depth.toFixed(1)} <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Cage Velocity</div>
                <div className="text-2xl font-mono font-bold text-white">{hoistStatus.velocity.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">System Mode</div>
                <div className="text-2xl font-mono font-bold text-green-500 bg-green-900/20 px-2 rounded border border-green-800/30">{hoistStatus.mode}</div>
            </div>
            <div className="flex flex-col gap-2 border-l border-amber-900/40 pl-6 justify-center">
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
        
        {/* LEFT COLUMN: Drive & Safety */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Safety Braking System */}
           <SciFiCard title="液压制动站监测" subtitle="SAFETY CRITICAL" className="border-amber-900/50 bg-[#160b00]/80">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border-l-4 border-amber-600">
                    <div className="flex items-center gap-3">
                        <Gauge size={20} className="text-amber-500" />
                        <div>
                            <div className="text-xs text-slate-400">OIL PRESSURE (E1)</div>
                            <div className="text-sm font-bold text-white">{hoistStatus.brakePressure.toFixed(2)} MPa</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border-l-4 border-amber-600">
                    <div className="flex items-center gap-3">
                        <Gauge size={20} className="text-amber-500" />
                        <div>
                            <div className="text-xs text-slate-400">OIL PRESSURE (E2)</div>
                            <div className="text-sm font-bold text-white">{(hoistStatus.brakePressure - 0.1).toFixed(2)} MPa</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                         <div className="text-[10px] text-slate-500">Brake Shoe Gap</div>
                         <div className="text-green-400 font-mono">1.5 mm</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                         <div className="text-[10px] text-slate-500">Disc Temp</div>
                         <div className="text-orange-400 font-mono">65 °C</div>
                     </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Motor Status */}
           <SciFiCard title="主电机状态" className="flex-1 border-amber-900/50">
              <div className="flex flex-col gap-4 justify-center h-full">
                 <div className="text-center">
                     <div className="relative inline-block">
                         <div className={`w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center ${hoistStatus.velocity > 0.5 ? 'animate-[spin_3s_linear_infinite]' : ''}`}>
                             <div className="w-2 h-2 bg-amber-500 rounded-full absolute top-2"></div>
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center flex-col">
                             <span className="text-3xl font-bold text-white">{hoistStatus.drumSpeed.toFixed(0)}</span>
                             <span className="text-[10px] text-slate-500">RPM</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-400">Armature Current</span>
                         <span className="text-amber-200 font-mono">1250 A</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-amber-500 h-full" style={{width: '65%'}}></div>
                     </div>
                     
                     <div className="flex justify-between text-xs mt-2">
                         <span className="text-slate-400">Stator Temp</span>
                         <span className="text-amber-200 font-mono">72 °C</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-red-500 h-full" style={{width: '40%'}}></div>
                     </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Shaft Visualization */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0500] border border-amber-800/40 relative rounded overflow-hidden shadow-[inset_0_0_80px_rgba(217,119,6,0.1)]">
              {/* Depth Ruler Overlay (Left) */}
              <div className="absolute top-0 left-0 bottom-0 w-12 bg-black/40 border-r border-amber-900/30 flex flex-col justify-between py-4 items-center z-10">
                  <span className="text-[10px] text-slate-500">0m</span>
                  <div className="flex-1 w-[1px] bg-slate-700 my-2 relative">
                      {/* Moving Marker */}
                      <div 
                        className="absolute w-3 h-3 bg-amber-500 -left-1.5 rounded-sm shadow-[0_0_10px_orange]"
                        style={{ top: `${(hoistStatus.depth / 800) * 100}%` }}
                      ></div>
                  </div>
                  <span className="text-[10px] text-slate-500">-800m</span>
              </div>

              {/* Status Overlay (Top Right) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                     {hoistStatus.direction === 'UP' && <ArrowUp className="text-green-500 animate-bounce" />}
                     {hoistStatus.direction === 'DOWN' && <ArrowDown className="text-amber-500 animate-bounce" />}
                     {hoistStatus.direction === 'STOP' && <Lock className="text-red-500" />}
                     <span className="text-lg font-bold text-white tracking-widest">{hoistStatus.direction}</span>
                 </div>
                 <div className="text-[10px] text-slate-400 font-mono">Payload: {hoistStatus.payload.toFixed(2)} t</div>
              </div>

              {/* 2026-08-11 优化：提升机模型线框改用统一青蓝色，减少与蓝白界面的色彩冲突； */}
              <ThreeScene type="mine-hoist" color="#2fb7d7" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Depth-Time Trajectory（真实数据） */}
           <SciFiCard title="运行轨迹（深度-时间，真实数据）" subtitle="DEPTH TRACE" className="h-[250px] border-amber-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={depthTrace}>
                       <defs>
                          <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                             {/* 2026-08-11 优化：运行轨迹使用企业蓝渐变，与页面主题保持一致； */}
                             <stop offset="5%" stopColor="#0068b7" stopOpacity={0.24}/>
                             <stop offset="95%" stopColor="#0068b7" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" vertical={false} />
                       <XAxis dataKey="time" stroke="#667085" tick={{fontSize: 9}} />
                       <YAxis reversed stroke="#667085" tick={{fontSize: 9}} label={{ value: 'Depth(m)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#667085' }} />
                       <Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#d9e2ec', color: '#1f2937'}} />
                       <Area type="monotone" dataKey="depth" name="深度(m)" stroke="#0068b7" strokeWidth={2} fill="url(#colorDepth)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Ropes & Environment */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Wire Rope Tension Balance */}
           <SciFiCard title="钢丝绳张力平衡" subtitle="TENSION (kN)" className="flex-1 border-amber-900/50">
              <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pb-4 border-b border-slate-800">
                  {ropeTensions.map((rope, i) => (
                      <div key={rope.id} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="text-[10px] text-slate-400 group-hover:text-white transition-colors">{rope.val.toFixed(0)}</div>
                          <div className="w-full bg-slate-800 rounded-t-sm relative overflow-hidden h-32">
                              <div 
                                className={`absolute bottom-0 w-full transition-all duration-500 ${rope.val > 123 || rope.val < 117 ? 'bg-red-500' : 'bg-amber-600'}`} 
                                style={{height: `${(rope.val / 150) * 100}%`}}
                              ></div>
                          </div>
                          <div className="text-xs font-bold text-slate-500">{rope.id}</div>
                      </div>
                  ))}
              </div>
              <div className="mt-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Imbalance Coefficient</div>
                  <div className={`text-xl font-mono ${ropeImbalancePct > 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {ropeImbalancePct.toFixed(1)}% <span className="text-xs text-slate-600">(Limit: 5%)</span>
                  </div>
              </div>
              <button
                onClick={handleExportReport}
                className="mt-3 w-full py-2 bg-amber-700/40 hover:bg-amber-700/60 border border-amber-500/50 rounded text-xs text-amber-100 transition-colors flex items-center justify-center gap-2"
              >
                <FileDown size={14} /> 导出提升机运行报告
              </button>
           </SciFiCard>

           {/* Safety Chain */}
           <SciFiCard title="安全回路监控" className="border-amber-900/50">
              <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Lock size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Shaft Gate: CLOSED</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Ruler size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Overwind: OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Hammer size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Slack Rope: OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Settings size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">PLC Health: OK</span>
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
        metricsHint="depth(m) / velocity(m/s) / payload(t) / brakePressure(MPa) / ropeTensionR1~R4(kN)"
      />
    </div>
  );
};
