
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ShieldAlert, Eye, Wind, Waves, 
  Siren, Navigation, Activity, Target,
  CloudRain, CloudFog, AlertOctagon
} from 'lucide-react';

// --- MOCK DATA ---

const RISK_HISTORY = Array.from({length: 40}, (_, i) => ({
    time: i,
    risk: 15 + Math.random() * 10, // Base low risk
    prediction: 15 + Math.random() * 5 + (i > 30 ? i - 30 : 0) * 2 // Rising prediction
}));

const RISK_FACTORS = [
    { subject: 'Visibility', A: 85, fullMark: 100 },
    { subject: 'Traffic', A: 92, fullMark: 100 },
    { subject: 'Wind/Wave', A: 65, fullMark: 100 },
    { subject: 'Current', A: 45, fullMark: 100 },
    { subject: 'Depth', A: 20, fullMark: 100 },
];

export const ChannelSafetyView: React.FC = () => {
  const [visibility, setVisibility] = useState(100); // %
  const [trafficDensity, setTrafficDensity] = useState(45); // %
  const [alertActive, setAlertActive] = useState(false);
  
  const [metrics, setMetrics] = useState({
    riskIndex: 18.5,
    collisionProb: 0.4, // %
    nearestEncounter: 1.2, // nm
    weatherStatus: 'GOOD'
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Risk Logic: High traffic + Low Vis = High Risk
        const visFactor = (100 - visibility) * 0.5;
        const trafFactor = trafficDensity * 0.4;
        
        let risk = 10 + visFactor + trafFactor + (Math.random() - 0.5) * 5;
        risk = Math.min(100, Math.max(0, risk));
        
        if (alertActive) risk = 95; // Override for demo alert

        setMetrics(prev => ({
            riskIndex: risk,
            collisionProb: risk * 0.05,
            nearestEncounter: Math.max(0.1, 2.0 - (trafficDensity/100) * 1.5 - (alertActive ? 1.5 : 0)),
            weatherStatus: visibility > 80 ? 'GOOD' : visibility > 40 ? 'MODERATE' : 'POOR'
        }));

    }, 800);
    return () => clearInterval(interval);
  }, [visibility, trafficDensity, alertActive]);

  return (
    <div className="h-full flex flex-col font-[Rajdhani] bg-[#020617] text-slate-200 relative overflow-hidden">
      
      {/* 3D BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
          {/* We make the 3D container full screen behind UI */}
          <div className="w-full h-full opacity-60">
             <ThreeScene type="channel-safety-analysis" color="#f43f5e" />
          </div>
          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between p-4 pointer-events-none">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-500 mb-1 uppercase tracking-widest font-bold">
             <ShieldAlert size={14} className="animate-pulse" /> Maritime Sentinel
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 text-shadow-lg">
             航道通航 <span className="text-rose-500">安全风险指数分析</span>
          </h1>
        </div>
        
        {/* Main Index Display */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-rose-900/50 p-4 rounded-xl flex items-center gap-6 shadow-2xl pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Dynamic Risk Index (CRI)</div>
                <div className={`text-4xl font-black ${metrics.riskIndex > 80 ? 'text-red-500 animate-pulse' : metrics.riskIndex > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {metrics.riskIndex.toFixed(1)}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-700"></div>
            <div>
                <div className="flex items-center justify-between text-xs text-slate-400 w-32 mb-1">
                    <span>Probability</span>
                    <span className="text-white font-bold">{metrics.collisionProb.toFixed(2)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{width: `${metrics.riskIndex}%`}}></div>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="relative flex-1 flex justify-between px-4 pb-4 min-h-0 z-10 pointer-events-none">
          
          {/* LEFT: Analysis Panel */}
          <div className="w-[300px] flex flex-col gap-4 pointer-events-auto">
              
              <SciFiCard title="风险因子归因" subtitle="ATTRIBUTION" className="border-rose-900/50 bg-[#0c0508]/80 backdrop-blur-md">
                  <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_FACTORS}>
                              <PolarGrid stroke="#881337" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#fda4af', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Risk" dataKey="A" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.4} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              <SciFiCard title="碰撞风险预警" subtitle="T-MINUS 4H" className="flex-1 border-rose-900/50 bg-[#0c0508]/80 backdrop-blur-md">
                  <div className="flex flex-col h-full gap-4">
                      <div className="flex-1 w-full min-h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={RISK_HISTORY}>
                                  <defs>
                                      <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                                  <XAxis dataKey="time" hide />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f43f5e'}} />
                                  <Area type="monotone" dataKey="prediction" stroke="#f43f5e" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                                  <Area type="monotone" dataKey="risk" stroke="#f43f5e" fill="url(#gradRisk)" strokeWidth={2} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      
                      <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded">
                          <div className="text-xs text-rose-300 font-bold mb-1 flex items-center gap-2">
                              <Target size={12}/> Nearest Encounter (CPA)
                          </div>
                          <div className="text-2xl font-mono text-white">{metrics.nearestEncounter.toFixed(2)} <span className="text-sm text-slate-500">nm</span></div>
                          <div className="text-[10px] text-slate-400 mt-1">Time to CPA: 12m 30s</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Controls */}
          <div className="w-[280px] flex flex-col gap-4 pointer-events-auto">
              
              <SciFiCard title="环境干扰模拟" subtitle="SIMULATOR" className="border-rose-900/50 bg-[#0c0508]/80 backdrop-blur-md">
                  <div className="flex flex-col gap-6 p-2">
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span className="flex items-center gap-2"><Eye size={12}/> Visibility</span>
                              <span className="font-bold text-white">{visibility}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="5" 
                            value={visibility} onChange={(e) => setVisibility(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
                          />
                          <div className="flex justify-between text-[8px] text-slate-500">
                              <span>Foggy</span>
                              <span>Clear</span>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span className="flex items-center gap-2"><Navigation size={12}/> Traffic Density</span>
                              <span className="font-bold text-white">{trafficDensity}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="5" 
                            value={trafficDensity} onChange={(e) => setTrafficDensity(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-400"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                          <button 
                             onClick={() => setAlertActive(!alertActive)}
                             className={`py-3 text-xs font-bold rounded flex flex-col items-center gap-1 border transition-all
                                ${alertActive ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                             `}
                          >
                              <Siren size={16}/> SIMULATE COLLISION
                          </button>
                          
                          <div className="py-2 px-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col justify-center text-center">
                              <div className="text-[10px] text-slate-500">Wind</div>
                              <div className="text-xs font-bold text-white flex items-center justify-center gap-1"><Wind size={10}/> 12 kn</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <div className="flex-1"></div>

              {/* Status Ticker */}
              <div className="bg-black/60 border border-slate-700 p-3 rounded-lg backdrop-blur">
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                      <Activity size={12} className="text-rose-500"/> System Status
                  </div>
                  <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-500">VTS Radar</span> <span className="text-green-400">ONLINE</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">AIS Feed</span> <span className="text-green-400">SYNCED</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">CCTV AI</span> <span className="text-yellow-400">LATENCY</span></div>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
};
