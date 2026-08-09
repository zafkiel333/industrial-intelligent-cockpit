import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CalibrationThreeScene } from '../../components/maintenance_calibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-calibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-calibration';
import { 
  Crosshair, 
  Target, 
  Scale, 
  Ruler, 
  CheckCircle2, 
  AlertOctagon, 
  History, 
  FileCheck, 
  Thermometer, 
  Droplets,
  Microscope,
  RotateCw,
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis, CartesianGrid 
} from 'recharts';

// --- MOCK DATA ---

const INSTRUMENTS = [
  { id: 'INST-001', name: 'Leica AT960 激光跟踪仪', type: 'Optical', lastCal: '2023-10-15', due: '2024-04-15', accuracy: 99.8, status: 'Valid' },
  { id: 'INST-002', name: 'Zeiss Prismo CMM', type: 'Tactile', lastCal: '2023-09-01', due: '2024-03-01', accuracy: 92.5, status: 'Due Soon' },
  { id: 'INST-003', name: 'Fluke 5522A 校准源', type: 'Electrical', lastCal: '2023-06-20', due: '2024-06-20', accuracy: 99.9, status: 'Valid' },
  { id: 'INST-004', name: 'Mitutoyo SJ-410 粗糙度仪', type: 'Surface', lastCal: '2023-01-10', due: '2024-01-10', accuracy: 85.0, status: 'Expired' },
];

const DEVIATION_DATA = Array.from({ length: 50 }, (_, i) => ({
  point: i,
  xDev: (Math.random() - 0.5) * 2, // microns
  yDev: (Math.random() - 0.5) * 2,
  zDev: (Math.random() - 0.5) * 2,
  tolerance: 3 // +/- 3 microns
}));

export const CalibrationRecordView: React.FC = () => {
  const [selectedInst, setSelectedInst] = useState(INSTRUMENTS[0]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDev, setCurrentDev] = useState({ x: 0.1, y: -0.2, z: 0.05 });

  const startCalibration = () => {
    setIsCalibrating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          return 100;
        }
        // Randomize current deviation for effect
        setCurrentDev({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
        });
        return prev + 1;
      });
    }, 50);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Valid': return 'text-green-400 border-green-500/50 bg-green-900/20';
        case 'Due Soon': return 'text-amber-400 border-amber-500/50 bg-amber-900/20';
        case 'Expired': return 'text-red-400 border-red-500/50 bg-red-900/20';
        default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：计量中心抬头 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              <Scale size={32} className="text-cyan-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Precision Metrology Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 定期精度 <span className="text-cyan-500 italic">校准记录与溯源</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex gap-4">
              <div className="flex items-center gap-2 text-xs">
                 <Thermometer size={14} className="text-orange-400"/>
                 <span className="font-mono text-slate-300">20.0 ±0.1 °C</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2 text-xs">
                 <Droplets size={14} className="text-blue-400"/>
                 <span className="font-mono text-slate-300">45 ±5 %RH</span>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">Compliance Standard</div>
              <div className="text-sm font-bold text-white font-mono">ISO 17025:2017</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：仪器注册表 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="受控仪器清单 (Registry)" subtitle="ASSETS" highlight className="border-cyan-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {INSTRUMENTS.map(inst => (
                    <div 
                      key={inst.id}
                      onClick={() => setSelectedInst(inst)}
                      className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                         ${selectedInst.id === inst.id 
                            ? 'bg-cyan-950/30 border-cyan-500 shadow-lg' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       {selectedInst.id === inst.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                       
                       <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="text-[10px] font-mono text-slate-500">{inst.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getStatusColor(inst.status)}`}>
                             {inst.status}
                          </span>
                       </div>
                       <div className="pl-2 text-sm font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{inst.name}</div>
                       <div className="pl-2 flex justify-between items-center text-[10px] text-slate-400">
                          <span>Due: {inst.due}</span>
                          <span className="flex items-center gap-1">
                             <Target size={10} /> Acc: {inst.accuracy}%
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                 <History size={14} className="text-cyan-500" /> 校准历史概览
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full mb-4 relative">
                 <div className="absolute left-[20%] w-2 h-2 bg-green-500 rounded-full -top-0.5"></div>
                 <div className="absolute left-[50%] w-2 h-2 bg-green-500 rounded-full -top-0.5"></div>
                 <div className="absolute left-[80%] w-2 h-2 bg-slate-600 rounded-full -top-0.5 border border-white"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                 <span>2022</span>
                 <span>2023</span>
                 <span>Now</span>
              </div>
           </div>
        </div>

        {/* 中间：校准工作台 (3D + Chart) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           
           {/* 3D 核心 */}
           <div className="flex-1 relative bg-[#020408] border border-cyan-900/30 rounded-lg overflow-hidden group min-h-[300px]">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs">
                          <Microscope size={14} className={isCalibrating ? "animate-pulse" : ""} />
                          LASER INTERFEROMETER: {isCalibrating ? 'ACTIVE' : 'STANDBY'}
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Calibration <span className="text-cyan-500">Workbench</span>
                       </div>
                    </div>
                    {isCalibrating && (
                       <div className="text-right">
                          <div className="text-3xl font-mono font-bold text-cyan-400">{progress}%</div>
                          <div className="text-[10px] text-slate-500 uppercase">Sequence Progress</div>
                       </div>
                    )}
                 </div>

                 {/* 实时偏差读数 */}
                 <div className="flex justify-center gap-6 pointer-events-auto">
                    {['X', 'Y', 'Z'].map((axis, i) => {
                       const val = Object.values(currentDev)[i] as number;
                       return (
                       <div key={axis} className="bg-black/60 border border-slate-700 p-3 rounded w-24 backdrop-blur text-center">
                          <div className="text-[10px] text-slate-500 font-bold mb-1">Δ{axis} (μm)</div>
                          <div className={`text-xl font-mono font-bold ${Math.abs(val) > 1.5 ? 'text-red-500' : 'text-white'}`}>
                             {val.toFixed(3)}
                          </div>
                       </div>
                    )})}
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <CalibrationThreeScene 
                    isScanning={isCalibrating} 
                    accuracyLevel={selectedInst.accuracy}
                    scanColor={isCalibrating ? '#0ea5e9' : '#334155'}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
                 <button 
                   onClick={startCalibration}
                   disabled={isCalibrating}
                   className={`px-6 py-3 rounded font-bold text-sm flex items-center gap-2 shadow-xl transition-all
                      ${isCalibrating ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-500 text-white hover:scale-105'}
                   `}
                 >
                    <RotateCw size={16} className={isCalibrating ? "animate-spin" : ""} />
                    {isCalibrating ? 'Calibrating...' : 'Start Sequence'}
                 </button>
              </div>
           </div>

           {/* 偏差曲线 */}
           <SciFiCard title="微米级偏差分析" subtitle="DEVIATION_PLOT" className="h-64 border-cyan-900/30" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DEVIATION_DATA}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="point" hide />
                       <YAxis domain={[-4, 4]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dev (μm)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '10px'}} />
                       <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" label={{value: '+Tol', fill: 'red', fontSize: 10}} />
                       <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="3 3" label={{value: '-Tol', fill: 'red', fontSize: 10}} />
                       <ReferenceLine y={0} stroke="#64748b" />
                       <Line type="monotone" dataKey="xDev" stroke="#0ea5e9" strokeWidth={1} dot={false} name="X-Axis" />
                       <Line type="monotone" dataKey="yDev" stroke="#8b5cf6" strokeWidth={1} dot={false} name="Y-Axis" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* 右侧：证书与报告 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="校准证书生成" subtitle="CERTIFICATION" className="border-slate-800">
              <div className="flex flex-col gap-4 items-center p-4 bg-slate-950/50 border border-slate-800 rounded">
                 <div className="w-20 h-24 border-2 border-slate-700 bg-white/5 flex flex-col items-center justify-center relative">
                    <Award size={32} className="text-cyan-500 mb-2" />
                    <div className="w-12 h-1 bg-slate-600 rounded"></div>
                    <div className="w-8 h-1 bg-slate-600 rounded mt-1"></div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[8px] font-bold px-1 rounded">PASS</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-slate-400">Cert No.</div>
                    <div className="text-sm font-bold text-white font-mono">CAL-2024-8892</div>
                 </div>
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors">
                    <FileCheck size={14} /> 预览/打印证书
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="溯源性链条" subtitle="TRACEABILITY" className="flex-1">
              <div className="space-y-4 relative pl-4">
                 <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-800"></div>
                 {[
                   { lvl: 'National Std', name: 'NIM (中国计量院)', id: 'CN-PRIMARY' },
                   { lvl: 'Working Std', name: 'Laser Master', id: 'REF-L1-02' },
                   { lvl: 'This Unit', name: selectedInst.name, id: selectedInst.id }
                 ].map((node, i) => (
                    <div key={i} className="relative pl-6">
                       <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-cyan-500 bg-slate-900 z-10"></div>
                       <div className="text-[9px] text-slate-500 uppercase">{node.lvl}</div>
                       <div className="text-xs font-bold text-white">{node.name}</div>
                       <div className="text-[9px] font-mono text-cyan-500">{node.id}</div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2 border border-dashed border-slate-600 text-slate-500 text-xs rounded hover:text-white hover:border-cyan-500 transition-colors flex items-center justify-center gap-2">
                 查看溯源图谱 <ArrowRight size={12}/>
              </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};