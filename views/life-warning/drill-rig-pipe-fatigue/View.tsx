import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ArrowDownToLine, RotateCw, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/drill-rig-pipe-fatigue/ThreeScene';
import { DrillPipeState } from '../../../components/life-warning/drill-rig-pipe-fatigue/three-types';

export const View: React.FC = () => {
  const [pipeState, setPipeState] = useState<DrillPipeState>({
    torque: 8, // kNm
    axialThrust: 120, // kN
    rotationSpeed: 90, // RPM
    fatigueDamage: 15, // %
    operatingHours: 850, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(2150); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPipeState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate varying rock hardness
        const hardnessSpike = Math.random() > 0.95;
        const newTorque = Math.max(2, Math.min(25, prev.torque + (hardnessSpike ? 5 : (Math.random() - 0.5) * 1)));
        const newThrust = Math.max(50, Math.min(350, prev.axialThrust + (hardnessSpike ? 30 : (Math.random() - 0.5) * 10)));
        const newSpeed = Math.max(30, Math.min(150, prev.rotationSpeed + (Math.random() - 0.5) * 2));

        // Fatigue accumulation based on torque (torsion) and thrust (buckling/bending)
        let fatigueRate = 0.005;
        if (newTorque > 15) fatigueRate *= 2;
        if (newThrust > 200) fatigueRate *= 1.5;
        // Combined stress
        if (newTorque > 12 && newThrust > 180) fatigueRate *= 3;

        const newFatigue = Math.min(100, prev.fatigueDamage + fatigueRate);

        const torquePenalty = Math.max(0, (newTorque - 12) / 13) * 20;
        const thrustPenalty = Math.max(0, (newThrust - 180) / 170) * 20;
        const fatiguePenalty = newFatigue * 0.6;

        const health = Math.max(0, Math.floor(100 - torquePenalty - thrustPenalty - fatiguePenalty));
        
        const baseLife = 3000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          torque: newTorque,
          axialThrust: newThrust,
          rotationSpeed: newSpeed,
          fatigueDamage: newFatigue,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPipeState({
      torque: 5,
      axialThrust: 100,
      rotationSpeed: 100,
      fatigueDamage: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(3000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <ArrowDownToLine className="w-8 h-8" />
            露天钻机钻杆疲劳预警
          </h1>
          <p className="text-slate-400 mt-1">基于扭矩、轴压与复合应力的钻柱高低周疲劳损伤评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">钻杆健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-amber-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换钻杆/接头</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              钻进工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="回转扭矩 (kNm)" value={pipeState.torque} max={25} color={pipeState.torque > 18 ? 'bg-rose-500' : pipeState.torque > 12 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, torque: v}))} />
              <ParameterControl label="轴向推力/钻压 (kN)" value={pipeState.axialThrust} max={350} color={pipeState.axialThrust > 250 ? 'bg-rose-500' : pipeState.axialThrust > 180 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, axialThrust: v}))} />
              <ParameterControl label="回转速度 (RPM)" value={pipeState.rotationSpeed} max={150} color={pipeState.rotationSpeed > 120 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, rotationSpeed: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <RotateCw className="w-5 h-5" />
              疲劳损伤累积
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">累积损伤度 (Miner法则)</span>
                <span className={`font-mono font-bold text-lg ${pipeState.fatigueDamage > 80 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pipeState.fatigueDamage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pipeState.fatigueDamage > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${pipeState.fatigueDamage}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '80%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">断裂临界值: 80%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            钻杆扭转弯曲复合应力与裂纹 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pipeState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${pipeState.torque > 18 || pipeState.axialThrust > 250 ? 'text-rose-500' : 'text-amber-400'}`} />
              <div>
                <div className="text-xs text-slate-400">卡钻/断钻风险指数</div>
                <div className={`text-xl font-mono ${pipeState.torque > 18 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (pipeState.torque / 25) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计进尺时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pipeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="扭转疲劳断裂 (高扭矩)" value={(pipeState.torque / 25) * 100} critical={72} />
              <DiagnosticItem label="屈曲变形/弯曲疲劳 (高轴压)" value={(pipeState.axialThrust / 350) * 100} critical={71} />
              <DiagnosticItem label="螺纹接头磨损/脱扣" value={pipeState.fatigueDamage * 1.1} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-400">诊断结论与建议：</strong></p>
              {pipeState.fatigueDamage > 80 ? (
                <span className="text-rose-400 font-bold">【危急】 钻杆疲劳损伤已超临界值，微裂纹可能已扩展，随时有断钻落井风险！必须立即提钻并进行无损探伤或更换。</span>
              ) : pipeState.torque > 20 ? (
                <span className="text-rose-400 font-bold">【危急】 扭矩异常偏高，可能遇到硬岩夹层或发生卡钻。请立即降低钻压，提高转速或上下活动钻具。</span>
              ) : pipeState.axialThrust > 250 ? (
                <span className="text-amber-400">【警告】 轴向推力过大，钻杆容易发生屈曲变形和早期疲劳。建议根据岩性适当减小钻压。</span>
              ) : pipeState.fatigueDamage > 50 ? (
                <span className="text-yellow-400">【注意】 钻杆已进入疲劳寿命后期，建议在下次交接班时重点检查接头螺纹及管体磨损情况。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钻进参数匹配合理，钻杆应力状态良好。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-amber-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
