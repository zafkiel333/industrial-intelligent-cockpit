import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Wind, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/conveyor-belt-roller-life/ThreeScene';
import { RollerState } from '../../../components/life-warning/conveyor-belt-roller-life/three-types';

export const View: React.FC = () => {
  const [rollerState, setRollerState] = useState<RollerState>({
    rotationalSpeed: 300, // RPM
    bearingTemperature: 35, // Celsius
    vibration: 1.5, // mm/s
    dustAccumulation: 20, // %
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(15000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setRollerState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Speed fluctuates slightly based on belt load
        const newSpeed = Math.max(0, Math.min(600, prev.rotationalSpeed + (Math.random() - 0.5) * 10));

        // Dust accumulates over time, faster if speed is high (kicking up dust)
        const newDust = Math.min(100, prev.dustAccumulation + (newSpeed / 300) * 0.05);

        // Vibration increases with wear (hours) and dust ingress
        let vibIncrease = 0;
        if (newDust > 60) vibIncrease += 0.05; // Dust entering bearing
        if (newHours > 10000) vibIncrease += 0.02; // General wear
        const newVibration = Math.max(0.5, Math.min(15, prev.vibration + (Math.random() > 0.8 ? vibIncrease : (Math.random() - 0.5) * 0.1)));

        // Temperature rises with friction (vibration) and speed
        let tempTarget = 25 + (newSpeed / 10) + (newVibration * 3);
        // Dust acts as insulator, increasing temp
        if (newDust > 50) tempTarget += (newDust - 50) * 0.2;
        
        const newTemp = prev.bearingTemperature + (tempTarget - prev.bearingTemperature) * 0.05 + (Math.random() - 0.5);

        // Health Index Calculation
        // Temperature: > 65C is warning, > 85C is critical
        const tempPenalty = Math.max(0, (newTemp - 50) / 35) * 40;
        
        // Vibration: > 4.5 mm/s is warning, > 7.1 mm/s is critical (ISO 10816)
        const vibPenalty = Math.max(0, (newVibration - 2.8) / 4.3) * 40;
        
        // Dust: > 70% is bad (seal failure risk)
        const dustPenalty = Math.max(0, (newDust - 50) / 50) * 20;

        const health = Math.max(0, Math.floor(100 - tempPenalty - vibPenalty - dustPenalty));
        
        // Estimated Life (Hours) - Design life typically 20,000 - 30,000 hours
        const baseLife = 25000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          rotationalSpeed: newSpeed,
          bearingTemperature: newTemp,
          vibration: newVibration,
          dustAccumulation: newDust,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRollerState({
      rotationalSpeed: 300,
      bearingTemperature: 25,
      vibration: 0.8,
      dustAccumulation: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(25000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Wind className="w-8 h-8" />
            输送带托辊寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于轴承温升、振动特征与粉尘侵入的托辊健康评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">托辊健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换新托辊</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="轴承座温度 (°C)" 
                value={rollerState.bearingTemperature} 
                max={100} 
                color={rollerState.bearingTemperature > 85 ? 'bg-rose-500' : rollerState.bearingTemperature > 65 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setRollerState(s => ({...s, bearingTemperature: v}))}
              />
              
              <ParameterControl 
                label="径向振动速度 (mm/s)" 
                value={rollerState.vibration} 
                max={15} 
                color={rollerState.vibration > 7.1 ? 'bg-rose-500' : rollerState.vibration > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setRollerState(s => ({...s, vibration: v}))}
              />

              <ParameterControl 
                label="表面粉尘堆积度 (%)" 
                value={rollerState.dustAccumulation} 
                max={100} 
                color={rollerState.dustAccumulation > 80 ? 'bg-rose-500' : rollerState.dustAccumulation > 50 ? 'bg-amber-500' : 'bg-blue-500'}
                onChange={(v) => setRollerState(s => ({...s, dustAccumulation: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              运行状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">转速 (RPM)</span>
                <span className={`font-mono font-bold text-lg ${rollerState.rotationalSpeed < 50 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                  {rollerState.rotationalSpeed.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${rollerState.rotationalSpeed < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(rollerState.rotationalSpeed / 600) * 100}%` }}></div>
              </div>
              <div className="text-right text-xs text-slate-500">额定转速: 300-400 RPM</div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            托辊热分布与粉尘侵入 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={rollerState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${rollerState.vibration > 7.1 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">轴承疲劳损伤指数</div>
                <div className={`text-xl font-mono ${rollerState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (rollerState.vibration / 10) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {rollerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="轴承磨损/点蚀 (高振动)" 
                value={(rollerState.vibration / 10) * 100} 
                critical={71} // > 7.1 mm/s
              />
              <DiagnosticItem 
                label="润滑脂干涸/流失 (高温)" 
                value={(rollerState.bearingTemperature / 90) * 100} 
                critical={72} // > 65C
              />
              <DiagnosticItem 
                label="密封失效 (粉尘侵入)" 
                value={(rollerState.dustAccumulation / 100) * 100} 
                critical={80} // > 80%
              />
              <DiagnosticItem 
                label="筒皮磨损/卡死 (低转速)" 
                value={rollerState.rotationalSpeed < 100 ? 100 : 0} 
                critical={50}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {rollerState.rotationalSpeed < 50 ? (
                <span className="text-rose-400 font-bold">【危急】 托辊转速极低或已卡死，将导致输送带严重磨损甚至引发火灾！必须立即停机更换！</span>
              ) : rollerState.bearingTemperature > 85 || rollerState.vibration > 7.1 ? (
                <span className="text-rose-400 font-bold">【危急】 轴承温度或振动严重超标，内部可能已发生严重剥落或保持架断裂。建议在下一个检修班次强制更换。</span>
              ) : rollerState.dustAccumulation > 70 ? (
                <span className="text-amber-400">【警告】 表面粉尘堆积严重，影响散热并增加迷宫密封失效风险。建议安排清理，并检查防尘裙板。</span>
              ) : rollerState.vibration > 4.5 ? (
                <span className="text-yellow-400">【注意】 振动值处于边缘状态，可能存在早期磨损或安装松动。请加强巡检频次。</span>
              ) : (
                <span className="text-emerald-400">【正常】 托辊运行平稳，温升正常，密封良好。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-blue-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
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
        {/* Critical threshold marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
