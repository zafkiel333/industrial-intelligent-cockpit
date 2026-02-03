
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, Ship, ArrowRight, Clock, 
  Settings, Layers, BarChart2, Play, 
  Pause, RotateCcw, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const QUEUE_MOCK = [
    { id: 'S-101', name: 'Cargo A', tons: 800, len: 45, pri: 1 },
    { id: 'S-102', name: 'Tanker B', tons: 1200, len: 55, pri: 2 },
    { id: 'S-103', name: 'Barge C', tons: 500, len: 30, pri: 1 },
    { id: 'S-104', name: 'Passenger D', tons: 300, len: 25, pri: 3 }, // High pri
];

const CYCLE_STATS = Array.from({length: 10}, (_, i) => ({
    cycle: i+1,
    duration: 20 + Math.random() * 5,
    ships: Math.floor(Math.random() * 3) + 1
}));

export const ShipLockDispatchSimView: React.FC = () => {
  // State
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [strategy, setStrategy] = useState<'FCFS' | 'PACKING'>('FCFS');
  
  // Logic State
  const [phase, setPhase] = useState<'IDLE' | 'ENTRY' | 'CLOSING' | 'FILLING' | 'EMPTYING' | 'OPENING' | 'EXIT'>('IDLE');
  const [waterLvl, setWaterLvl] = useState(1); // 0=Low, 1=High (Start High Upstream)
  const [gateAngle, setGateAngle] = useState(0); // 0-1
  const [shipPos, setShipPos] = useState(-60); // Z coord

  const [queue, setQueue] = useState(QUEUE_MOCK);
  const [chamberShips, setChamberShips] = useState<any[]>([]);
  
  // Metrics
  const [metrics, setMetrics] = useState({
    avgWait: 35, // min
    utilization: 65, // %
    waterSaved: 0 // m3
  });

  // Simulation Loop
  useEffect(() => {
    if (simState !== 'RUNNING') return;

    const interval = setInterval(() => {
        // State Machine
        // Cycle: High(Start) -> Entry -> Close -> Empty -> Open -> Exit -> Close -> Fill -> High
        // For simplicity: One-way Downstream (High -> Low)
        
        // 1. IDLE (High Water)
        if (phase === 'IDLE' && waterLvl > 0.9) {
             // If ships waiting upstream
             if (queue.length > 0) {
                 setPhase('OPENING'); // Open Upper Gate
             }
        }
        
        // 2. OPENING (Upper)
        else if (phase === 'OPENING') {
             setGateAngle(prev => Math.min(1, prev + 0.05));
             if (gateAngle >= 0.99) {
                 setPhase('ENTRY');
                 // Move ship from queue to chamber
                 if (queue.length > 0 && chamberShips.length === 0) {
                     const ship = queue[0];
                     setChamberShips([ship]);
                     setQueue(q => q.slice(1));
                     setShipPos(-60); // Reset ship visual start
                 }
             }
        }
        
        // 3. ENTRY
        else if (phase === 'ENTRY') {
             setShipPos(prev => Math.min(0, prev + 1)); // Move to 0
             if (shipPos >= -0.5) {
                 setPhase('CLOSING');
             }
        }
        
        // 4. CLOSING (Upper)
        else if (phase === 'CLOSING') {
             setGateAngle(prev => Math.max(0, prev - 0.05));
             if (gateAngle <= 0.01) {
                 setPhase('EMPTYING'); // Water down
             }
        }
        
        // 5. EMPTYING
        else if (phase === 'EMPTYING') {
             setWaterLvl(prev => Math.max(0, prev - 0.01));
             if (waterLvl <= 0.01) {
                 setPhase('OPENING_LOW'); // Custom state transition internal
             }
        }
        
        // 6. OPENING (Lower) - handled by reusing gateAngle var (logic in builder handles which gate)
        // We need context of High/Low gate.
        // Let's split OPENING into logic: if water low, open lower.
        else if (phase === 'OPENING_LOW' || (phase === 'OPENING' && waterLvl < 0.1)) {
             setGateAngle(prev => Math.min(1, prev + 0.05));
             if (gateAngle >= 0.99) {
                 setPhase('EXIT');
             }
        }
        
        // 7. EXIT
        else if (phase === 'EXIT') {
             setShipPos(prev => prev + 1);
             if (shipPos > 60) {
                 setChamberShips([]); // Ship gone
                 setPhase('CLOSING_LOW');
             }
        }
        
        // 8. CLOSING (Lower)
        else if (phase === 'CLOSING_LOW' || (phase === 'CLOSING' && waterLvl < 0.1)) {
             setGateAngle(prev => Math.max(0, prev - 0.05));
             if (gateAngle <= 0.01) {
                 setPhase('FILLING');
             }
        }
        
        // 9. FILLING
        else if (phase === 'FILLING') {
             setWaterLvl(prev => Math.min(1, prev + 0.01));
             if (waterLvl >= 0.99) {
                 setPhase('IDLE');
             }
        }

    }, 50);

    return () => clearInterval(interval);
  }, [simState, phase, gateAngle, waterLvl, shipPos, queue]);

  // Derived Viz Props
  // Map phase to props
  const vizPhase = (phase === 'OPENING' || phase === 'ENTRY' || phase === 'CLOSING') && waterLvl > 0.5 ? 'ENTRY' // Upper
                 : (phase === 'OPENING_LOW' || phase === 'EXIT' || phase === 'CLOSING_LOW') ? 'EXIT' // Lower
                 : phase === 'FILLING' ? 'FILLING' 
                 : phase === 'EMPTYING' ? 'EMPTYING' : 'IDLE';

  const vizGate = gateAngle * 100; // %

  return (
    <div className="h-full w-full relative bg-[#0b1019] text-blue-50 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="ship-lock-dispatch" 
            simData={{ 
                phase: vizPhase,
                waterLevel: waterLvl,
                gateAngle: vizGate,
                shipPos: shipPos
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b1019_95%)] pointer-events-none"></div>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Lock size={14} /> NAVIGATION LOCK CONTROL
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 船闸调度 <span className="text-cyan-500">& 船舶排队仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Lock Status</span>
                  <span className="text-2xl font-bold text-white">{phase}</span>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Water Level</span>
                  <span className="text-2xl font-mono font-bold text-cyan-300">{(waterLvl * 10 + 2).toFixed(1)} m</span>
              </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Queue & Strategy */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Controls */}
          <div className="bg-[#0b1320]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 调度策略 (Strategy)
              </h3>
              
              <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setStrategy('FCFS')}
                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                        ${strategy === 'FCFS' ? 'bg-cyan-700 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'}
                    `}
                  >
                      FCFS (Standard)
                  </button>
                  <button 
                    onClick={() => setStrategy('PACKING')}
                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                        ${strategy === 'PACKING' ? 'bg-green-700 text-white border-green-500' : 'bg-slate-800 text-slate-400 border-slate-700'}
                    `}
                  >
                      Optimization
                  </button>
              </div>

              <div className="flex gap-2">
                  <button 
                    onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${simState === 'RUNNING' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}
                    `}
                  >
                      {simState === 'RUNNING' ? <Pause size={14}/> : <Play size={14}/>}
                      {simState === 'RUNNING' ? 'PAUSE' : 'START SIM'}
                  </button>
                  <button 
                    onClick={() => { setSimState('IDLE'); setPhase('IDLE'); setWaterLvl(1); setShipPos(-60); setQueue(QUEUE_MOCK); }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                  >
                      <RotateCcw size={14}/>
                  </button>
              </div>
          </div>

          {/* Queue List */}
          <SciFiCard title="待闸船舶队列 (Upstream)" subtitle={queue.length.toString()} className="flex-1 border-cyan-900/50 bg-[#0b1320]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar">
                  {queue.map((ship, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                          <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                  <Anchor size={12}/>
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-white">{ship.name}</div>
                                  <div className="text-[9px] text-slate-500">{ship.len}m • {ship.tons}t</div>
                              </div>
                          </div>
                          <div className={`text-[9px] px-1.5 rounded font-bold ${ship.pri > 2 ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                              P{ship.pri}
                          </div>
                      </div>
                  ))}
                  {queue.length === 0 && <div className="text-center text-xs text-slate-500 py-4">Queue Empty</div>}
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Chamber Visualization (2D) */}
          <div className="h-[280px] bg-[#0b1320]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
               <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Layers size={16} className="text-cyan-500"/> 闸室排布 (Packing)
               </h3>
               {/* 2D representation of lock chamber */}
               <div className="flex-1 w-full h-48 border-2 border-slate-600 rounded bg-slate-900/50 relative overflow-hidden">
                   {/* Water BG */}
                   <div className="absolute inset-0 bg-blue-900/20"></div>
                   
                   {/* Ships in chamber */}
                   {chamberShips.map((ship, i) => (
                       <div 
                         key={i}
                         className="absolute bg-slate-700 border border-slate-500 rounded flex items-center justify-center text-[9px] text-white overflow-hidden shadow-lg transition-all duration-500"
                         style={{
                             width: `${ship.len}%`, // scaled
                             height: '40%',
                             left: '50%',
                             top: '50%',
                             transform: 'translate(-50%, -50%)'
                         }}
                       >
                           {ship.name}
                       </div>
                   ))}

                   {/* Scale Markers */}
                   <div className="absolute bottom-0 left-0 right-0 h-4 border-t border-slate-700 flex justify-between px-2 text-[8px] text-slate-500">
                       <span>0m</span><span>30m</span><span>60m</span>
                   </div>
               </div>
               <div className="text-center text-[10px] text-slate-400 mt-2">Area Utilization: {chamberShips.length > 0 ? '45%' : '0%'}</div>
          </div>

          {/* Efficiency Stats */}
          <SciFiCard title="运行效率统计" subtitle="KPI" className="flex-1 border-cyan-900/50 bg-[#0b1320]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={CYCLE_STATS}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="cycle" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Mins', angle: -90, position: 'insideLeft' }} />
                              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                              <Bar dataKey="duration" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500">Avg Wait</div>
                          <div className="text-lg font-bold text-white">{metrics.avgWait} min</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500">Utilization</div>
                          <div className="text-lg font-bold text-green-400">{metrics.utilization}%</div>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
