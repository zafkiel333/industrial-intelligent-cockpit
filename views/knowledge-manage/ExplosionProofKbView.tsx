
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/explosion-proof/ThreeScene';
import { ElectricState } from '../../components/knowledge-manage/explosion-proof/three-types';
import { 
  Zap, Calculator, ShieldCheck, Settings, 
  Activity, AlertTriangle, FileText, Gauge,
  ArrowRight, RefreshCw, Layers, CheckCircle2,
  Lock, BookOpen, XCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ReferenceLine, AreaChart, Area, Legend
} from 'recharts';

// --- MOCK DATA ---

const EQUIP_TYPES = [
    { id: 'TRANS', name: '移动变电站 (KBSGZY)', volt: '10/1.14kV', cap: '1000kVA' },
    { id: 'FEEDER', name: '高压真空配电 (BGP)', volt: '10kV', cap: '400A' },
    { id: 'STARTER', name: '磁力启动器 (QJZ)', volt: '1140V', cap: '200A' },
    { id: 'LIGHT', name: '照明综保 (ZBZ)', volt: '127V', cap: '4kVA' },
];

const STANDARD_LIB = [
    { code: 'GB 3836.1', name: '爆炸性环境 第1部分: 通用要求' },
    { code: 'GB 3836.2', name: '爆炸性环境 第2部分: 隔爆外壳 "d"' },
    { code: 'MT/T 661', name: '煤矿井下低压电网过流保护整定细则' },
];

// Curve Data generator for Inverse Time Protection
const generateCurve = (currentSetting: number) => {
    const data = [];
    // t = k / (I/Is - 1) typical inverse curve form
    for(let i=1.1; i<=10; i+=0.2) {
        const t = 20 / (i - 1); // Mock constant
        data.push({ x: i * currentSetting, t: Math.min(100, t) });
    }
    return data;
};

export const ExplosionProofKbView: React.FC = () => {
  const [elecState, setElecState] = useState<ElectricState>('NORMAL');
  const [selectedEquip, setSelectedEquip] = useState(EQUIP_TYPES[1]);
  
  // Calculation Parameters
  const [params, setParams] = useState({
      ratedPower: 200, // kW
      ratedVoltage: 1140, // V
      cableLength: 450, // m
      transformerCap: 1000, // kVA
      demandFactor: 0.8,
  });

  const [results, setResults] = useState({
      ratedCurrent: 0,
      overloadSet: 0,
      shortCircuitSet: 0,
      sensitivity: 0,
      cableCheck: true
  });

  const [curveData, setCurveData] = useState<any[]>([]);

  // Real-time Calculation
  useEffect(() => {
      // 1. Rated Current Ie = P / (1.732 * U * cosPhi * eff)
      // Assume cosPhi=0.85, eff=0.9
      const Ie = (params.ratedPower * 1000) / (1.732 * params.ratedVoltage * 0.85 * 0.9);
      
      // 2. Overload Iz = Ie (approx)
      const Iz = Ie;

      // 3. Short Circuit Id = 8 * Ie (typical start current) or setting for protection
      const Id = 8 * Ie;

      // 4. Sensitivity (Simplified) = Id_min / Id_set >= 1.5
      // Mock Id_min calc based on cable length
      const cableImpedance = params.cableLength * 0.0005; // ohm
      const sysImpedance = 0.05;
      const Id_min = (params.ratedVoltage / 1.732) / (sysImpedance + cableImpedance);
      const Ks = Id_min / Id;

      setResults({
          ratedCurrent: parseFloat(Ie.toFixed(1)),
          overloadSet: parseFloat(Iz.toFixed(1)),
          shortCircuitSet: parseFloat(Id.toFixed(0)),
          sensitivity: parseFloat(Ks.toFixed(2)),
          cableCheck: Ks >= 1.5
      });

      setCurveData(generateCurve(Iz));

  }, [params]);

  // Simulate states based on values
  useEffect(() => {
      if (elecState === 'CALCULATING') {
          setTimeout(() => setElecState('NORMAL'), 1500);
      }
  }, [elecState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-amber-50 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* Background Tech Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-amber-600/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/20 border-2 border-amber-500 rounded flex items-center justify-center relative">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <Zap size={30} className="text-amber-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> Ex-Proof Electrical Safety
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用防爆设备 <span className="text-amber-500 italic">电气整定值计算逻辑</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Load Current</div>
                <div className="text-2xl font-mono font-black text-white">{results.ratedCurrent} <span className="text-sm font-normal text-stone-600">A</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Sensitivity Ks</div>
                <div className={`text-3xl font-mono font-black ${results.cableCheck ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
                    {results.sensitivity}
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Configuration --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="设备选型 (Selection)" subtitle="DEVICE" className="border-amber-900/30 bg-[#1c120b]/90">
              <div className="flex flex-col gap-2 mt-2">
                  {EQUIP_TYPES.map(eq => (
                      <div 
                        key={eq.id}
                        onClick={() => setSelectedEquip(eq)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:bg-stone-800
                           ${selectedEquip.id === eq.id ? 'bg-amber-900/20 border-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]' : 'bg-stone-900/40 border-stone-800'}
                        `}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-bold ${selectedEquip.id === eq.id ? 'text-white' : 'text-stone-400'}`}>{eq.name}</span>
                              <span className="text-[9px] font-mono text-amber-600 bg-amber-950/30 px-1 rounded">{eq.id}</span>
                          </div>
                          <div className="flex gap-4 text-[10px] text-stone-500">
                              <span>Volt: {eq.volt}</span>
                              <span>Cap: {eq.cap}</span>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="整定参数输入" subtitle="INPUTS" className="flex-1 border-stone-800">
               <div className="flex flex-col gap-4 p-1">
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-stone-400">
                           <span>额定功率 (Rated Power)</span>
                           <span className="text-amber-400 font-mono">{params.ratedPower} kW</span>
                       </div>
                       <input 
                         type="range" min="10" max="1000" step="10" 
                         value={params.ratedPower} 
                         onChange={(e) => {setParams({...params, ratedPower: parseInt(e.target.value)}); setElecState('CALCULATING');}}
                         className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                       />
                   </div>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-stone-400">
                           <span>电缆长度 (Cable Len)</span>
                           <span className="text-amber-400 font-mono">{params.cableLength} m</span>
                       </div>
                       <input 
                         type="range" min="50" max="2000" step="50" 
                         value={params.cableLength} 
                         onChange={(e) => {setParams({...params, cableLength: parseInt(e.target.value)}); setElecState('CALCULATING');}}
                         className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                       />
                   </div>
                   
                   <div className="p-3 bg-stone-900/50 border border-stone-700 rounded grid grid-cols-2 gap-2 text-center mt-2">
                       <div>
                           <div className="text-[9px] text-stone-500 uppercase">Demand Factor</div>
                           <div className="text-sm font-bold text-white">{params.demandFactor}</div>
                       </div>
                       <div>
                           <div className="text-[9px] text-stone-500 uppercase">Voltage</div>
                           <div className="text-sm font-bold text-white">{params.ratedVoltage} V</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D & Results --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-amber-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={elecState} />

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-stone-950/80 backdrop-blur border border-amber-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-amber-500 shadow-xl">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={10}/> Equipment Twin
                       </div>
                       <div className="text-xl font-black text-white">{selectedEquip.name}</div>
                       <div className="text-xs text-stone-400 mt-1">Ex-d I Mb (防爆等级)</div>
                   </div>
               </div>

               {/* Sim Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-stone-900/90 p-2 rounded-full border border-stone-600 backdrop-blur shadow-2xl">
                   <button onClick={() => setElecState('NORMAL')} className={`p-2 rounded-full hover:bg-stone-700 ${elecState==='NORMAL'?'text-green-400':'text-stone-500'}`} title="Normal Run"><CheckCircle2 size={18}/></button>
                   <button onClick={() => setElecState('OVERLOAD')} className={`p-2 rounded-full hover:bg-stone-700 ${elecState==='OVERLOAD'?'text-yellow-400':'text-stone-500'}`} title="Overload Sim"><Activity size={18}/></button>
                   <button onClick={() => setElecState('SHORT_CIRCUIT')} className={`p-2 rounded-full hover:bg-stone-700 ${elecState==='SHORT_CIRCUIT'?'text-red-500':'text-stone-500'}`} title="Short Circuit Sim"><Zap size={18}/></button>
                   <div className="w-px h-8 bg-stone-700 mx-1"></div>
                   <button onClick={() => setElecState('OPEN_INSPECT')} className={`p-2 rounded-full hover:bg-stone-700 ${elecState==='OPEN_INSPECT'?'text-blue-400':'text-stone-500'}`} title="Internal Inspect"><Layers size={18}/></button>
               </div>
           </div>

           {/* Results Dashboard */}
           <div className="h-[200px] grid grid-cols-2 gap-4">
               <div className="bg-stone-900/40 border border-stone-800 rounded-lg p-3 flex flex-col">
                   <div className="text-[10px] text-stone-500 font-bold mb-2 uppercase px-1 flex justify-between">
                       <span>整定计算结果 (Calculated Settings)</span>
                       <Calculator size={12} className="text-amber-500"/>
                   </div>
                   <div className="flex-1 flex flex-col justify-center gap-3 px-2">
                       <div className="flex justify-between items-center border-b border-stone-800/50 pb-2">
                           <span className="text-xs text-stone-300">过载整定值 (Iz)</span>
                           <span className="text-lg font-mono font-bold text-amber-400">{results.overloadSet} A</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-stone-800/50 pb-2">
                           <span className="text-xs text-stone-300">短路整定值 (Id)</span>
                           <span className="text-lg font-mono font-bold text-red-400">{results.shortCircuitSet} A</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-xs text-stone-300">校验系数 (Ks)</span>
                           <span className={`text-lg font-mono font-bold ${results.cableCheck ? 'text-green-400' : 'text-red-500'}`}>{results.sensitivity}</span>
                       </div>
                   </div>
               </div>

               <div className="bg-stone-900/40 border border-stone-800 rounded-lg p-3 overflow-hidden">
                   <div className="text-[10px] text-stone-500 font-bold mb-1 uppercase px-1">
                       反时限保护曲线 (Inverse Time Curve)
                   </div>
                   <div className="w-full h-full pb-4">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={curveData} margin={{top: 5, right: 10, bottom: 5, left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                               <XAxis dataKey="x" stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Current (A)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                               <Line type="monotone" dataKey="t" stroke="#d97706" strokeWidth={2} dot={false} />
                               {/* Current Operating Point */}
                               <ReferenceLine x={results.ratedCurrent} stroke="#10b981" strokeDasharray="3 3" label={{value:'Ie', fill:'#10b981', fontSize:10}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Standards & Compliance --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="执行标准库" subtitle="STANDARDS" className="border-stone-700">
               <div className="flex flex-col gap-2">
                   {STANDARD_LIB.map((std, i) => (
                       <div key={i} className="p-2 bg-stone-900/50 border border-stone-800 rounded hover:border-amber-600/30 cursor-pointer group">
                           <div className="text-[10px] font-mono text-amber-600 mb-0.5">{std.code}</div>
                           <div className="text-xs text-stone-300 group-hover:text-white leading-tight">{std.name}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="flex-1 bg-amber-950/10 border border-amber-900/30 rounded-xl p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                   <AlertTriangle size={14} /> Validation Check
               </div>
               
               <div className="space-y-3">
                   <div className="flex items-center gap-3">
                       <div className={`w-4 h-4 rounded-full flex items-center justify-center ${results.cableCheck ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                           {results.cableCheck ? <CheckCircle2 size={10}/> : <XCircle size={10}/>}
                       </div>
                       <div className="flex-1">
                           <div className="text-xs text-stone-200">短路灵敏度校验</div>
                           <div className="text-[10px] text-stone-500">Id_min / Id_set &ge; 1.5</div>
                       </div>
                   </div>

                   <div className="flex items-center gap-3">
                       <div className="w-4 h-4 rounded-full bg-green-500 text-black flex items-center justify-center">
                           <CheckCircle2 size={10}/>
                       </div>
                       <div className="flex-1">
                           <div className="text-xs text-stone-200">电缆热稳定校验</div>
                           <div className="text-[10px] text-stone-500">Cross-section OK</div>
                       </div>
                   </div>
               </div>

               <div className="mt-auto pt-4 border-t border-amber-900/20 text-[10px] text-stone-400 leading-relaxed italic">
                   "提示：长距离供电时，需重点关注末端两相短路电流是否满足灵敏度要求，必要时增大电缆截面或采用电子保护器。"
               </div>
           </div>

           <button className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded text-xs font-bold text-stone-300 flex items-center justify-center gap-2 transition-all">
               <BookOpen size={14} /> 生成整定计算书 (PDF)
           </button>

        </div>

      </div>
    </div>
  );
};
