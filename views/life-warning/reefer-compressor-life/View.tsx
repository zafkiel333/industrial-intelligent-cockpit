import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ThermometerSnowflake, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/reefer-compressor-life/ThreeScene';
import { ReeferCompressorState } from '../../../components/life-warning/reefer-compressor-life/three-types';

export const View: React.FC = () => {
  const [compressorState, setCompressorState] = useState<ReeferCompressorState>({
    suctionPressure: 2.5, // bar
    dischargePressure: 15.0, // bar
    motorTemp: 65, // Celsius
    vibration: 2.5, // mm/s
    operatingHours: 28000, // hours
  });

  const [healthScore, setHealthScore] = useState(86);
  const [estimatedLife, setEstimatedLife] = useState(22000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setCompressorState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate refrigeration cycle
        const ambientTempChange = Math.random() > 0.8;
        let newSuction = prev.suctionPressure;
        let newDischarge = prev.dischargePressure;

        if (ambientTempChange) {
            // Ambient gets hotter, discharge pressure rises
            newDischarge = Math.min(25.0, prev.dischargePressure + Math.random() * 0.5);
            newSuction = Math.min(4.0, prev.suctionPressure + Math.random() * 0.1);
        } else {
            newDischarge = prev.dischargePressure + (15.0 - prev.dischargePressure) * 0.1 + (Math.random() - 0.5) * 0.2;
            newSuction = prev.suctionPressure + (2.5 - prev.suctionPressure) * 0.1 + (Math.random() - 0.5) * 0.05;
        }

        // Compression ratio
        const compressionRatio = newDischarge / newSuction;

        // Motor temp rises with high compression ratio or high ambient
        let targetTemp = 50 + compressionRatio * 5;
        if (newDischarge > 20) targetTemp += 10;
        
        // Vibration increases slowly with age, spikes with liquid slugging (simulated rarely)
        let newVib = prev.vibration + 0.0001;
        if (Math.random() > 0.98) {
            newVib += Math.random() * 2; // Sudden spike
        } else {
            newVib = prev.vibration + (2.5 + (newHours/10000) - prev.vibration) * 0.1; // Trend back to baseline based on age
        }
        
        const newTemp = prev.motorTemp + (targetTemp - prev.motorTemp) * 0.1;

        // Health calculation
        // High temp degrades oil/motor, high vibration indicates mechanical wear
        const tempPenalty = Math.max(0, ((newTemp - 90) / 30) * 40); // >90C is bad
        const vibPenalty = Math.max(0, ((newVib - 4.5) / 3.0) * 50); // >4.5 mm/s is warning

        const health = Math.max(0, Math.floor(100 - tempPenalty - vibPenalty));
        
        const baseLife = 50000; // ~5-6 years continuous
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          suctionPressure: newSuction,
          dischargePressure: newDischarge,
          motorTemp: newTemp,
          vibration: newVib,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setCompressorState({
      suctionPressure: 2.5,
      dischargePressure: 15.0,
      motorTemp: 50,
      vibration: 1.5,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  const compressionRatio = compressorState.dischargePressure / compressorState.suctionPressure;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <ThermometerSnowflake className="w-8 h-8" />
            船舶冷藏集装箱压缩机寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于热力学参数、电机温度与振动频谱的涡旋/活塞磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">压缩机健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-cyan-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换压缩机总成</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              热力学与电气参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="吸气压力 (bar)" value={compressorState.suctionPressure} max={8} color="bg-blue-500" onChange={(v) => setCompressorState(s => ({...s, suctionPressure: v}))} />
              <ParameterControl label="排气压力 (bar)" value={compressorState.dischargePressure} max={30} color={compressorState.dischargePressure > 25 ? 'bg-rose-500' : compressorState.dischargePressure > 20 ? 'bg-amber-500' : 'bg-rose-400'} onChange={(v) => setCompressorState(s => ({...s, dischargePressure: v}))} />
              <ParameterControl label="电机绕组温度 (°C)" value={compressorState.motorTemp} max={150} color={compressorState.motorTemp > 110 ? 'bg-rose-500' : compressorState.motorTemp > 90 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setCompressorState(s => ({...s, motorTemp: v}))} />
              
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">压缩比 (CR)</span>
                <span className={`font-mono font-bold ${compressionRatio > 10 ? 'text-rose-500' : 'text-emerald-400'}`}>
                  {compressionRatio.toFixed(1)} : 1
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              机械振动烈度
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">振动速度 (mm/s)</span>
                <span className={`font-mono font-bold text-2xl ${compressorState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : compressorState.vibration > 4.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {compressorState.vibration.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${compressorState.vibration > 7.1 ? 'bg-rose-500' : compressorState.vibration > 4.5 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (compressorState.vibration / 10) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(4.5 / 10) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(7.1 / 10) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>ISO 10816: 4.5</span>
                <span>危险: 7.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#111827] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            制冷剂压缩循环与机械磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={compressorState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${compressorState.vibration > 7.1 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
              <div>
                <div className="text-xs text-slate-400">机械故障风险指数</div>
                <div className={`text-xl font-mono ${compressorState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (compressorState.vibration / 8) * 100).toFixed(1)}%
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
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="机械磨损/轴承损坏 (振动)" value={(compressorState.vibration / 8) * 100} critical={88} />
              <DiagnosticItem label="电机绝缘老化 (高温)" value={(compressorState.motorTemp / 130) * 100} critical={84} />
              <DiagnosticItem label="阀片/涡旋盘内漏 (压比异常)" value={compressionRatio > 10 ? 90 : (compressionRatio < 3 ? 80 : 20)} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断结论与建议：</strong></p>
              {compressorState.vibration > 7.1 ? (
                <span className="text-rose-400 font-bold">【危急】 振动烈度超过 ISO 10816 危险限值，内部机械部件 (如轴承、涡旋盘、连杆) 可能已发生严重损坏或存在液击现象。必须立即停机检查，防止抱轴或碎裂。</span>
              ) : compressorState.motorTemp > 110 ? (
                <span className="text-rose-400 font-bold">【危急】 电机绕组温度过高，可能导致绝缘漆包线烧毁。请检查冷凝器散热不良、制冷剂泄漏或系统堵塞问题。</span>
              ) : compressorState.vibration > 4.5 ? (
                <span className="text-amber-400">【警告】 振动偏大，存在早期机械磨损。建议进行振动频谱分析，确认是否为轴承磨损或转子不平衡。</span>
              ) : compressionRatio > 10 ? (
                <span className="text-yellow-400">【注意】 压缩比过高，排气温度将急剧上升，润滑油可能碳化。请检查冷凝压力是否过高。</span>
              ) : (
                <span className="text-emerald-400">【正常】 压缩机热力学参数正常，机械运转平稳，电机冷却良好。</span>
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
      <span className="font-mono text-cyan-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
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
