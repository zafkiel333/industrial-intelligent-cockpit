import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, HardDrive, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/server-hard-drive-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[server-hard-drive-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/server-hard-drive-life';
import { HardDriveState } from '../../../components/life-warning/server-hard-drive-life/three-types';

export const View: React.FC = () => {
  const [driveState, setDriveState] = useState<HardDriveState>({
    temperature: 38, // Celsius
    tbw: 150, // Terabytes Written
    badSectors: 2, // count
    vibration: 0.5, // G
    powerOnHours: 12000, // hours
  });

  const [healthScore, setHealthScore] = useState(98);
  const [estimatedLife, setEstimatedLife] = useState(40000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setDriveState(prev => {
        // Simulate operational factors
        const newHours = prev.powerOnHours + 1; // Accelerated time
        
        // TBW increases steadily
        const newTBW = prev.tbw + 0.01;

        // Vibration fluctuates, occasional spikes
        const newVibration = Math.max(0.1, Math.min(5.0, prev.vibration + (Math.random() > 0.95 ? Math.random() * 2 : (Math.random() - 0.5) * 0.2)));

        // Temperature rises with vibration (friction/work) and ambient
        let tempTarget = 35 + (newVibration * 2);
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Bad sectors increase slowly, but accelerate with high temp or high vibration (head crash risk)
        let badSectorIncrease = 0;
        if (newTemp > 55) badSectorIncrease += 0.1;
        if (newVibration > 2.0) badSectorIncrease += 0.5;
        if (newHours > 30000) badSectorIncrease += 0.05; // Age factor
        
        const newBadSectors = prev.badSectors + (Math.random() > 0.8 ? badSectorIncrease : 0);

        // Health Index Calculation (SMART-like)
        // Bad Sectors: > 100 is warning, > 500 is critical
        const sectorPenalty = Math.max(0, newBadSectors / 5);
        // Temperature: > 50C is bad
        const tempPenalty = Math.max(0, (newTemp - 50) / 10) * 10;
        // TBW: Assuming 600TBW endurance
        const tbwPenalty = Math.max(0, (newTBW / 600) * 100);

        const health = Math.max(0, Math.floor(100 - sectorPenalty - tempPenalty - tbwPenalty));
        
        // Estimated Life (Hours) - Base 50,000h
        const baseLife = 50000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          powerOnHours: newHours,
          tbw: newTBW,
          vibration: newVibration,
          temperature: newTemp,
          badSectors: newBadSectors,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setDriveState({
      temperature: 35,
      tbw: 0,
      badSectors: 0,
      vibration: 0.2,
      powerOnHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <HardDrive className="w-8 h-8" />
            监控系统服务器硬盘寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于S.M.A.R.T数据、振动与热应力的存储介质可靠性评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">硬盘健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 80 ? 'text-emerald-400' : healthScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换新硬盘 (RAID重建)</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="机箱振动加速度 (G)" 
                value={driveState.vibration} 
                max={5} 
                color={driveState.vibration > 2.5 ? 'bg-rose-500' : driveState.vibration > 1.0 ? 'bg-amber-500' : 'bg-sky-500'}
                onChange={(v) => setDriveState(s => ({...s, vibration: v}))}
              />
              
              <ParameterControl 
                label="工作温度 (°C)" 
                value={driveState.temperature} 
                max={70} 
                color={driveState.temperature > 55 ? 'bg-rose-500' : driveState.temperature > 45 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setDriveState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1">通电时间 (POH)</span>
                  <span className="font-mono text-xl font-bold text-slate-300">
                    {driveState.powerOnHours.toLocaleString()} <span className="text-sm font-normal">h</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              S.M.A.R.T 核心指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">重新分配扇区数 (05)</span>
                <span className={`font-mono font-bold text-lg ${driveState.badSectors > 100 ? 'text-rose-500 animate-pulse' : driveState.badSectors > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.floor(driveState.badSectors)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${driveState.badSectors > 100 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (driveState.badSectors / 200) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
            磁盘盘片热分布与坏道映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={driveState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${driveState.vibration > 2.0 ? 'text-rose-500' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">磁头寻道错误率估算</div>
                <div className={`text-xl font-mono ${driveState.vibration > 2.0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {(driveState.vibration * 15).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计写入量 (TBW)</div>
              <div className={`text-xl font-mono ${driveState.tbw > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {driveState.tbw.toFixed(1)} <span className="text-sm">TB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="磁道物理损伤 (坏道蔓延)" 
                value={(driveState.badSectors / 200) * 100} 
                critical={50} // > 100 sectors
              />
              <DiagnosticItem 
                label="磁头划盘风险 (高振动)" 
                value={(driveState.vibration / 3) * 100} 
                critical={83} // > 2.5G
              />
              <DiagnosticItem 
                label="主控芯片热应力" 
                value={(driveState.temperature / 65) * 100} 
                critical={84} // > 55C
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {driveState.badSectors > 150 ? (
                <span className="text-rose-400 font-bold">【危急】 重新分配扇区数激增，磁盘表面存在严重物理损伤，数据丢失风险极高！必须立即备份数据并更换硬盘。</span>
              ) : driveState.vibration > 2.5 ? (
                <span className="text-rose-400 font-bold">【危急】 机箱振动加速度超标，极易导致磁头划伤盘片。请立即检查机柜风扇共振或外部震源。</span>
              ) : driveState.temperature > 55 ? (
                <span className="text-amber-400">【警告】 硬盘工作温度偏高，将加速机械部件老化。建议清理服务器防尘网，改善机房散热。</span>
              ) : driveState.badSectors > 10 ? (
                <span className="text-yellow-400">【注意】 出现少量坏道，属于正常老化现象。系统已自动重映射，请持续关注坏道增长趋势。</span>
              ) : (
                <span className="text-emerald-400">【正常】 S.M.A.R.T 各项指标优良，温度与振动均在安全范围内。存储系统运行稳定。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
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
