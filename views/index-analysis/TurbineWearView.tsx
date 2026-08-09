
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-turbine-wear]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-turbine-wear';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, AlertTriangle, Droplets, 
  ArrowDown, Gauge, Microscope, Flame
} from 'lucide-react';

// --- MOCK DATA ---

// Thoma Diagram (Cavitation Limit)
// Sigma vs Efficiency
const THOMA_DATA = Array.from({length: 30}, (_, i) => {
    const sigma = i * 0.02 + 0.01;
    // Efficiency drops sharply below critical sigma
    let eff = 92;
    if (sigma < 0.15) {
        eff = 92 * Math.pow(sigma / 0.15, 0.5);
    }
    return { sigma, eff };
});

// Vibration Spectrum (FFT) - High freq indicates cavitation
const FFT_DATA = Array.from({length: 40}, (_, i) => {
    const freq = i * 50; // Hz
    // Cavitation signature at high freq (e.g. 1000Hz+)
    const amp = freq > 1000 ? Math.random() * 5 + 2 : Math.random() * 2;
    return { freq, amp };
});

export const TurbineWearView: React.FC = () => {
  // --- STATE ---
  const [suctionHead, setSuctionHead] = useState(-2.5); // m (Negative = below tailwater)
  const [sedimentLoad, setSedimentLoad] = useState(5.0); // kg/m3
  const [guideVaneOpen, setGuideVaneOpen] = useState(85); // %

  const [metrics, setMetrics] = useState({
    sigma: 0.12, // Thoma Coefficient
    abrasionRate: 0.85, // mm/year
    cavitationRisk: 'LOW',
    vibration: 2.4, // mm/s
    effDrop: 0.0 // %
  });

  // Simulation Logic
  useEffect(() => {
    // Sigma = (Ha - Hv - Hs) / H
    // Simplified: Sigma proportional to Suction Head (+ more positive is safer, - is worse)
    // Here Hs is suction height (positive = above tailwater, bad for cavitation). 
    // Wait, typical formula Hs is suction head. 
    // Let's model: Lower Hs (more negative) = Less Cavitation. Higher Hs = More Cavitation.
    // Actually, usually deeper submergence (larger negative suction head) is better.
    // Let's stick to the slider value: -2.5m (submerged) is safe. +2m is dangerous.
    
    const sigma = 0.2 - (suctionHead + 5) * 0.02; 
    
    // Abrasion = k * Sediment * V^3
    // Velocity related to Guide Vane Opening
    const velocity = guideVaneOpen / 100;
    const abrasion = 0.5 * sedimentLoad * Math.pow(velocity, 3);

    // Risk Logic
    let risk = 'LOW';
    let effDrop = 0;
    if (sigma < 0.1) {
        risk = 'CRITICAL';
        effDrop = (0.1 - sigma) * 50;
    } else if (sigma < 0.15) {
        risk = 'HIGH';
    }

    setMetrics({
        sigma: Math.max(0.01, sigma),
        abrasionRate: abrasion,
        cavitationRisk: risk,
        vibration: 2.0 + (risk === 'CRITICAL' ? 5 : risk === 'HIGH' ? 2 : 0) + Math.random() * 0.5,
        effDrop: Math.min(20, effDrop)
    });

  }, [suctionHead, sedimentLoad, guideVaneOpen]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c100c] text-orange-50 relative overflow-hidden">
      
      {/* Background Rust/Water Mix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900/20 via-[#0c100c] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-orange-800/50 pb-4 px-2 bg-gradient-to-r from-orange-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Microscope size={14} className="animate-pulse" /> Material Degradation Forensics
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水轮机气蚀 <span className="text-orange-500">& 磨损指数分析</span>
          </h1>
        </div>
        
        {/* Core KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Cavitation Coeff (σ)</div>
                <div className={`text-2xl font-mono font-bold ${metrics.sigma < 0.1 ? 'text-red-500' : 'text-green-400'}`}>
                    {metrics.sigma.toFixed(3)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-orange-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Flame size={10}/> Abrasion Rate</div>
                <div className="text-2xl font-mono font-bold text-orange-400">{metrics.abrasionRate.toFixed(2)} <span className="text-sm text-slate-500">mm/y</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-orange-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><AlertTriangle size={10}/> Risk Level</div>
                <div className={`text-2xl font-bold ${metrics.cavitationRisk === 'CRITICAL' ? 'text-red-500 animate-pulse' : metrics.cavitationRisk === 'HIGH' ? 'text-orange-500' : 'text-blue-400'}`}>
                    {metrics.cavitationRisk}
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Physics Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="运行边界条件" subtitle="PHYSICS" className="flex-1 border-orange-900/50 bg-[#160b05]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Suction Head */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><ArrowDown size={12}/> 吸出高度 (Suction Head)</span>
                              <span className="font-mono">{suctionHead.toFixed(1)} m</span>
                          </div>
                          <input 
                            type="range" min="-5" max="5" step="0.1" 
                            value={suctionHead} onChange={(e) => setSuctionHead(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Safe (Submerged)</span>
                              <span>Risk (Vacuum)</span>
                          </div>
                      </div>

                      {/* Sediment Load */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-orange-200">
                              <span className="flex items-center gap-2"><Droplets size={12}/> 含沙量 (Sediment)</span>
                              <span className="font-mono">{sedimentLoad.toFixed(1)} kg/m³</span>
                          </div>
                          <input 
                            type="range" min="0" max="20" step="0.5" 
                            value={sedimentLoad} onChange={(e) => setSedimentLoad(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      {/* Guide Vane */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-green-200">
                              <span className="flex items-center gap-2"><Gauge size={12}/> 导叶开度 (Opening)</span>
                              <span className="font-mono">{guideVaneOpen}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="5" 
                            value={guideVaneOpen} onChange={(e) => setGuideVaneOpen(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                      </div>

                      <div className="mt-4 p-3 bg-orange-900/20 border border-orange-800/30 rounded text-xs text-orange-200/80">
                          <strong className="block mb-1">Impact Forecast:</strong> 
                          At current sediment load, blade leading edge life is reduced by <span className="text-white">35%</span>.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="托马气蚀系数图 (Thoma σ)" subtitle="SIGMA" className="h-[220px] border-orange-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={THOMA_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="sigma" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Sigma', position: 'insideBottom', offset: -5, fontSize: 10 }} domain={[0, 0.6]} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} label={{ value: 'Eff %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                              <ReferenceLine x={0.15} stroke="yellow" strokeDasharray="3 3" label={{value: 'Critical', fill: 'yellow', fontSize: 10}} />
                              <Line type="monotone" dataKey="eff" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                              {/* Operating Point */}
                              <ReferenceLine x={metrics.sigma} stroke="red" label={{value: 'Current', fill: 'red', fontSize: 10}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Blade Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050202] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(249,115,22,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Zap size={16} className="text-orange-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Est. Material Loss</div>
                              <div className="text-sm font-bold text-white">{(metrics.abrasionRate * 0.5).toFixed(2)} kg/month</div>
                          </div>
                      </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-orange-900 text-[10px] text-slate-300 text-right">
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_5px_cyan]"></div> Cavitation Bubbles</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Sediment Impact</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> Erosion Hotspot</div>
                  </div>

                  <ThreeScene type="turbine-wear-analysis" color="#f97316" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

          </div>

          {/* RIGHT: Vibration & Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Vibration Spectrum */}
              <SciFiCard title="振动频谱分析 (FFT)" subtitle="NOISE SIGNATURE" className="flex-1 border-orange-900/50">
                  <div className="flex flex-col h-full">
                      <div className="flex justify-between items-center px-2 mb-2 text-xs text-slate-400">
                          <span>Total Vib: <span className={metrics.vibration > 5 ? 'text-red-500' : 'text-green-400'}>{metrics.vibration.toFixed(2)} mm/s</span></span>
                          <span>High Freq: Cavitation</span>
                      </div>
                      <div className="flex-1 w-full min-h-[150px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={FFT_DATA}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                                  <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Hz', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                                  <Area type="monotone" dataKey="amp" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-300 mt-2">
                          Broadband noise detected in 1kHz-5kHz range indicates active bubble collapse.
                      </div>
                  </div>
              </SciFiCard>

              {/* Maintenance Prediction */}
              <SciFiCard title="维护建议 (Maintenance)" subtitle="PREDICTIVE" className="h-[200px] border-orange-900/50">
                  <div className="flex flex-col gap-3 justify-center h-full">
                      <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Next Coating Repair</span>
                          <span className="text-white font-bold">4 Months</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Est. Efficiency Loss</span>
                          <span className="text-red-400 font-bold">-{metrics.effDrop.toFixed(1)}%</span>
                      </div>
                      
                      <button className="mt-auto w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-300 text-xs rounded border border-orange-700/50 transition-colors">
                          Schedule Inspection
                      </button>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
