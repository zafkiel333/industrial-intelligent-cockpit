import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Truck, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/workshop-overhead-crane-wheel-wear/ThreeScene';
import { CraneWheelState } from '../../../components/life-warning/workshop-overhead-crane-wheel-wear/three-types';

export const View: React.FC = () => {
  const [wheelState, setWheelState] = useState<CraneWheelState>({
    travelDistance: 1250, // km
    flangeWear: 4.5, // mm
    railAlignment: 3.2, // mm deviation
    loadWeight: 15, // t
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(800); // km remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setWheelState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate crane operation
        const isMoving = Math.random() > 0.4;
        let newDistance = prev.travelDistance;
        let newLoad = prev.loadWeight;
        let newAlignment = prev.railAlignment;

        if (isMoving) {
            newDistance += 0.01; // 10 meters per tick
            newLoad = Math.random() > 0.5 ? 5 + Math.random() * 25 : 0; // 0 to 30t load
            
            // Alignment fluctuates slightly as it moves along the rail
            newAlignment = prev.railAlignment + (Math.random() - 0.5) * 0.5;
            // Keep within bounds
            if (newAlignment > 12) newAlignment = 12;
            if (newAlignment < -12) newAlignment = -12;
        } else {
            newLoad = 0;
        }

        // Wear rate depends on load and alignment (gnawing rail)
        let wearRate = 0.0001;
        if (newLoad > 20) wearRate *= 2;
        if (Math.abs(newAlignment) > 5) wearRate *= 5; // Severe gnawing
        
        const newWear = prev.flangeWear + (isMoving ? wearRate : 0);

        // Health calculation
        // Wear > 8mm is warning, > 12mm is critical (flange might break)
        // Alignment > 8mm is bad
        const wearPenalty = Math.max(0, (newWear / 12) * 70); 
        const alignPenalty = Math.max(0, (Math.abs(newAlignment) / 10) * 30);

        const health = Math.max(0, Math.floor(100 - wearPenalty - alignPenalty));
        
        const baseLifeKm = 3000;
        const remainingLife = Math.max(0, Math.floor((baseLifeKm - newDistance) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          travelDistance: newDistance,
          loadWeight: newLoad,
          railAlignment: newAlignment,
          flangeWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setWheelState({
      travelDistance: 0,
      flangeWear: 0,
      railAlignment: 1.0,
      loadWeight: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(3000);
  };

  const handleAlign = () => {
    setWheelState(prev => ({
        ...prev,
        railAlignment: 0.5 // Re-align rails
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <Truck className="w-8 h-8" />
            维修车间行车车轮磨损预警
          </h1>
          <p className="text-zinc-400 mt-1">基于啃轨偏斜、运行里程与轮缘磨损量的疲劳失效评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-zinc-400">车轮健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-500' : healthScore > 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-zinc-700"></div>
            <div className="text-center">
              <div className="text-sm text-zinc-400">预计剩余里程</div>
              <div className="text-2xl font-bold text-amber-500">{estimatedLife.toLocaleString()} <span className="text-sm font-normal">km</span></div>
            </div>
          </div>
          <button onClick={handleAlign} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>执行轨道校正</span>
          </button>
          <button onClick={handleReset} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换车轮组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行与载荷参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="起吊载荷 (t)" value={wheelState.loadWeight} max={50} color={wheelState.loadWeight > 40 ? 'bg-rose-500' : wheelState.loadWeight > 25 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setWheelState(s => ({...s, loadWeight: v}))} />
              <ParameterControl label="轨道偏差/啃轨量 (mm)" value={Math.abs(wheelState.railAlignment)} max={15} color={Math.abs(wheelState.railAlignment) > 8 ? 'bg-rose-500' : Math.abs(wheelState.railAlignment) > 5 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setWheelState(s => ({...s, railAlignment: v}))} />
              
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 flex justify-between items-center">
                <span className="text-sm text-zinc-400">累计运行里程</span>
                <span className={`font-mono font-bold ${wheelState.travelDistance > 2500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {wheelState.travelDistance.toFixed(1)} km
                </span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              轮缘磨损量
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-2xl ${wheelState.flangeWear > 12 ? 'text-rose-500 animate-pulse' : wheelState.flangeWear > 8 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {wheelState.flangeWear.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${wheelState.flangeWear > 12 ? 'bg-rose-500' : wheelState.flangeWear > 8 ? 'bg-amber-500' : 'bg-amber-600'}`} style={{ width: `${Math.min(100, (wheelState.flangeWear / 15) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(8 / 15) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(12 / 15) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>警告: 8.0</span>
                <span>危险: 12.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#18181b] border border-zinc-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-zinc-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            车轮啃轨摩擦与轮缘磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={wheelState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${Math.abs(wheelState.railAlignment) > 8 ? 'text-rose-500 animate-bounce' : 'text-amber-500'}`} />
              <div>
                <div className="text-xs text-zinc-400">脱轨/断缘风险指数</div>
                <div className={`text-xl font-mono ${wheelState.flangeWear > 12 ? 'text-rose-500 animate-pulse' : 'text-zinc-200'}`}>
                  {Math.min(100, (wheelState.flangeWear / 15) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-700 text-right">
              <div className="text-xs text-zinc-400">累计运行时间</div>
              <div className="text-xl font-mono text-zinc-300">
                {wheelState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="轮缘磨损变薄 (脱轨风险)" value={(wheelState.flangeWear / 15) * 100} critical={80} />
              <DiagnosticItem label="严重啃轨 (轨道偏差)" value={(Math.abs(wheelState.railAlignment) / 12) * 100} critical={66} />
              <DiagnosticItem label="踏面疲劳剥落 (重载里程)" value={(wheelState.travelDistance / 3000) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-zinc-800/40 rounded-lg border border-zinc-700 text-sm text-zinc-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-500">诊断结论与建议：</strong></p>
              {wheelState.flangeWear > 12 ? (
                <span className="text-rose-500 font-bold">【危急】 轮缘磨损量已超过原厚度的 50%，极易发生轮缘断裂或行车脱轨事故。必须立即停止使用该行车，并更换车轮组。</span>
              ) : Math.abs(wheelState.railAlignment) > 8 ? (
                <span className="text-rose-500 font-bold">【危急】 存在严重的“啃轨”现象，运行阻力剧增，将加速车轮和轨道报废，并可能烧毁运行电机。需立即校正大车轨道跨度与平行度。</span>
              ) : wheelState.flangeWear > 8 ? (
                <span className="text-amber-500">【警告】 轮缘磨损明显，建议在下次定修时进行测量记录，并检查车轮偏斜角。</span>
              ) : wheelState.travelDistance > 2500 ? (
                <span className="text-yellow-500">【注意】 运行里程较长，踏面可能出现疲劳微裂纹，建议进行表面探伤。</span>
              ) : (
                <span className="text-emerald-500">【正常】 车轮与轨道配合良好，未见明显啃轨，磨损在正常范围内。</span>
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
      <span className="text-zinc-400">{label}</span>
      <span className="font-mono text-amber-500">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-500 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
