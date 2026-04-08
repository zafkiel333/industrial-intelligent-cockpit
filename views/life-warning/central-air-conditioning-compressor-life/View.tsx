import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Wind, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/central-air-conditioning-compressor-life/ThreeScene';
import { HVACCompressorState } from '../../../components/life-warning/central-air-conditioning-compressor-life/three-types';

export const View: React.FC = () => {
  const [compressorState, setCompressorState] = useState<HVACCompressorState>({
    suctionPressure: 0.45, // MPa
    dischargePressure: 1.2, // MPa
    motorTemperature: 65, // Celsius
    oilLevel: 85, // %
    vibration: 1.5, // mm/s
    operatingHours: 18000, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(32000); // hours remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setCompressorState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate operation
        let newSucP = prev.suctionPressure + (Math.random() - 0.5) * 0.02;
        let newDisP = prev.dischargePressure + (Math.random() - 0.5) * 0.05;
        let newTemp = prev.motorTemperature + (Math.random() - 0.5) * 0.5;
        let newVib = prev.vibration + (Math.random() - 0.5) * 0.1;
        let newOil = prev.oilLevel - 0.001; // Slow oil consumption

        // Keep within bounds
        if (newSucP < 0.2) newSucP = 0.2;
        if (newDisP > 2.5) newDisP = 2.5;
        if (newTemp > 120) newTemp = 120;
        if (newVib < 0.5) newVib = 0.5;
        if (newOil < 0) newOil = 0;

        // Health calculation
        // High discharge pressure, high temp, low oil, high vibration are bad
        const disPPenalty = Math.max(0, ((newDisP - 1.5) / 1.0) * 20); 
        const tempPenalty = Math.max(0, ((newTemp - 80) / 40) * 30);
        const oilPenalty = Math.max(0, ((50 - newOil) / 50) * 40);
        const vibPenalty = Math.max(0, ((newVib - 3) / 4) * 20);

        const health = Math.max(0, Math.floor(100 - disPPenalty - tempPenalty - oilPenalty - vibPenalty));
        
        const baseLifeHours = 50000;
        const remainingLife = Math.max(0, Math.floor((baseLifeHours - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          suctionPressure: newSucP,
          dischargePressure: newDisP,
          motorTemperature: newTemp,
          vibration: newVib,
          oilLevel: newOil,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setCompressorState({
      suctionPressure: 0.45,
      dischargePressure: 1.2,
      motorTemperature: 60,
      oilLevel: 100,
      vibration: 1.0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  const handleLoadSpike = () => {
    setCompressorState(prev => ({
        ...prev,
        dischargePressure: prev.dischargePressure + 0.5,
        motorTemperature: prev.motorTemperature + 15,
        vibration: prev.vibration + 1.5
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <Wind className="w-8 h-8" />
            中央空调压缩机寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于热力学参数、振动特征与润滑状态的综合寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">机组健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife.toLocaleString()} <span className="text-sm font-normal">h</span></div>
            </div>
          </div>
          <button onClick={handleLoadSpike} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-rose-400" />
            <span>模拟冷凝器脏堵/高负荷</span>
          </button>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>机组大修/更换</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              热力学与润滑参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="排气压力 (MPa)" value={compressorState.dischargePressure} max={3.0} color={compressorState.dischargePressure > 2.0 ? 'bg-rose-500' : compressorState.dischargePressure > 1.6 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setCompressorState(s => ({...s, dischargePressure: v}))} />
              <ParameterControl label="电机绕组温度 (°C)" value={compressorState.motorTemperature} max={150} color={compressorState.motorTemperature > 105 ? 'bg-rose-500' : compressorState.motorTemperature > 85 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setCompressorState(s => ({...s, motorTemperature: v}))} />
              <ParameterControl label="润滑油位 (%)" value={compressorState.oilLevel} max={100} color={compressorState.oilLevel < 30 ? 'bg-rose-500' : compressorState.oilLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setCompressorState(s => ({...s, oilLevel: v}))} />
              
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">吸气压力 (MPa)</span>
                <span className={`font-mono font-bold ${compressorState.suctionPressure < 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {compressorState.suctionPressure.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              机组振动烈度
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">振动速度 (mm/s)</span>
                <span className={`font-mono font-bold text-2xl ${compressorState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : compressorState.vibration > 4.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {compressorState.vibration.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${compressorState.vibration > 7.1 ? 'bg-rose-500' : compressorState.vibration > 4.5 ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(100, (compressorState.vibration / 10) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(4.5 / 10) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(7.1 / 10) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>警告: 4.5</span>
                <span>危险: 7.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(56,189,248,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
            压缩机内部热力与流场 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={compressorState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${compressorState.motorTemperature > 105 ? 'text-rose-500 animate-bounce' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">电机烧毁/抱轴风险</div>
                <div className={`text-xl font-mono ${compressorState.motorTemperature > 105 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (compressorState.motorTemperature / 120) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {compressorState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="电机绕组绝缘老化 (高温)" value={(compressorState.motorTemperature / 120) * 100} critical={85} />
              <DiagnosticItem label="轴承磨损/抱轴 (低油位/振动)" value={((100 - compressorState.oilLevel) / 100 * 50) + ((compressorState.vibration / 8) * 50)} critical={75} />
              <DiagnosticItem label="喘振/排气超压 (高压)" value={(compressorState.dischargePressure / 2.5) * 100} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {compressorState.motorTemperature > 105 ? (
                <span className="text-rose-400 font-bold">【危急】 电机绕组温度严重超标，绝缘层面临击穿风险。可能是冷媒泄漏导致冷却不足或严重过载。必须立即停机检查！</span>
              ) : compressorState.oilLevel < 30 ? (
                <span className="text-rose-400 font-bold">【危急】 润滑油位过低，极易导致轴承干摩擦抱轴和机械损坏。请立即检查油分离器和回油管路，并补充冷冻油。</span>
              ) : compressorState.dischargePressure > 1.8 ? (
                <span className="text-amber-400">【警告】 排气压力偏高，压缩机负荷增大。建议清洗冷凝器，检查冷却水塔风机或水泵运行状态。</span>
              ) : compressorState.vibration > 4.5 ? (
                <span className="text-yellow-400">【注意】 机组振动增大，可能存在转子不平衡或轴承初期磨损。建议进行频谱分析。</span>
              ) : (
                <span className="text-emerald-400">【正常】 压缩机热力参数稳定，润滑良好，振动在正常范围内。</span>
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
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
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
