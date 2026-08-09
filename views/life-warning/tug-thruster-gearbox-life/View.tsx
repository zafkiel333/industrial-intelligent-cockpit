import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Anchor, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/tug-thruster-gearbox-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[tug-thruster-gearbox-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/tug-thruster-gearbox-life';
import { ThrusterGearboxState } from '../../../components/life-warning/tug-thruster-gearbox-life/three-types';

export const View: React.FC = () => {
  const [gearboxState, setGearboxState] = useState<ThrusterGearboxState>({
    inputSpeed: 1200, // RPM
    torque: 45, // kN.m
    oilTemp: 65, // Celsius
    metalParticles: 80, // ppm
    operatingHours: 18000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(25000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setGearboxState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate tugboat operations (frequent load changes)
        const isManeuvering = Math.random() > 0.4;
        let newSpeed = prev.inputSpeed;
        let newTorque = prev.torque;

        if (isManeuvering) {
            newSpeed = 800 + Math.random() * 800; // 800 - 1600 RPM
            newTorque = 20 + Math.random() * 60; // 20 - 80 kN.m
            
            // Occasional shock load (e.g., crash stop or heavy tow)
            if (Math.random() > 0.95) {
                newTorque = 90 + Math.random() * 20;
            }
        } else {
            newSpeed = 600; // Idle/transit
            newTorque = 15;
        }

        // Oil temp responds to torque/speed
        const targetTemp = 50 + (newTorque / 100) * 40; 
        const newTemp = prev.oilTemp + (targetTemp - prev.oilTemp) * 0.05;

        // Wear rate (metal particles)
        let wearRate = 0.005;
        if (newTorque > 80) wearRate *= 5; // Shock loads cause chipping/spalling
        if (newTemp > 85) wearRate *= 2; // High temp reduces lubrication
        
        const newParticles = Math.min(800, prev.metalParticles + wearRate);

        // Health calculation
        // Particles > 300 is warning, > 500 is critical
        const particlePenalty = Math.max(0, (newParticles / 500) * 60); 
        const tempPenalty = Math.max(0, ((newTemp - 80) / 20) * 20);

        const health = Math.max(0, Math.floor(100 - particlePenalty - tempPenalty));
        
        const baseLife = 45000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          inputSpeed: newSpeed,
          torque: newTorque,
          oilTemp: newTemp,
          metalParticles: newParticles,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setGearboxState({
      inputSpeed: 600,
      torque: 15,
      oilTemp: 50,
      metalParticles: 20,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(45000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <Anchor className="w-8 h-8" />
            港口拖轮推进器齿轮箱寿命预警
          </h1>
          <p className="text-zinc-400 mt-1">基于全回转 (Z-Drive) 伞齿轮受力、油温与铁谱分析的疲劳磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-zinc-400">齿轮箱健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-500' : healthScore > 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-zinc-700"></div>
            <div className="text-center">
              <div className="text-sm text-zinc-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-amber-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>大修更换齿轮组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              动力输入与热工监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="输入转速 (RPM)" value={gearboxState.inputSpeed} max={2000} color="bg-blue-500" onChange={(v) => setGearboxState(s => ({...s, inputSpeed: v}))} />
              <ParameterControl label="传递扭矩 (kN.m)" value={gearboxState.torque} max={120} color={gearboxState.torque > 90 ? 'text-rose-500 bg-rose-500' : gearboxState.torque > 70 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearboxState(s => ({...s, torque: v}))} />
              <ParameterControl label="润滑油温度 (°C)" value={gearboxState.oilTemp} max={100} color={gearboxState.oilTemp > 85 ? 'bg-rose-500' : gearboxState.oilTemp > 75 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setGearboxState(s => ({...s, oilTemp: v}))} />
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              润滑油铁谱分析
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">金属颗粒浓度 (ppm)</span>
                <span className={`font-mono font-bold text-2xl ${gearboxState.metalParticles > 500 ? 'text-rose-500 animate-pulse' : gearboxState.metalParticles > 300 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {gearboxState.metalParticles.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${gearboxState.metalParticles > 500 ? 'bg-rose-500' : gearboxState.metalParticles > 300 ? 'bg-amber-500' : 'bg-zinc-500'}`} style={{ width: `${Math.min(100, (gearboxState.metalParticles / 800) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(300 / 800) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(500 / 800) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>注意: 300</span>
                <span>危险: 500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#18181b] border border-zinc-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-zinc-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            伞齿轮啮合应力与磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={gearboxState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${gearboxState.torque > 90 ? 'text-rose-500 animate-bounce' : 'text-amber-500'}`} />
              <div>
                <div className="text-xs text-zinc-400">齿面接触疲劳风险</div>
                <div className={`text-xl font-mono ${gearboxState.metalParticles > 500 ? 'text-rose-500 animate-pulse' : 'text-zinc-200'}`}>
                  {Math.min(100, (gearboxState.metalParticles / 600) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-700 text-right">
              <div className="text-xs text-zinc-400">累计运行时间</div>
              <div className="text-xl font-mono text-zinc-300">
                {gearboxState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
              <DiagnosticItem label="齿面点蚀/剥落 (金属颗粒)" value={(gearboxState.metalParticles / 600) * 100} critical={83} />
              <DiagnosticItem label="冲击载荷致断齿风险" value={(gearboxState.torque / 120) * 100} critical={80} />
              <DiagnosticItem label="润滑油膜破裂 (高温)" value={(gearboxState.oilTemp / 100) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-zinc-800/40 rounded-lg border border-zinc-700 text-sm text-zinc-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-500">诊断结论与建议：</strong></p>
              {gearboxState.metalParticles > 500 ? (
                <span className="text-rose-500 font-bold">【危急】 润滑油中金属颗粒浓度严重超标，表明伞齿轮或轴承已发生严重的疲劳剥落。继续运行极易导致断齿或卡死。必须立即停机，开箱检查。</span>
              ) : gearboxState.torque > 90 ? (
                <span className="text-rose-500 font-bold">【危急】 传递扭矩过大，存在严重的冲击载荷。请规范拖轮操作，避免频繁的急车或全负荷顶推，以防断齿。</span>
              ) : gearboxState.metalParticles > 300 ? (
                <span className="text-amber-500">【警告】 铁谱分析显示磨损加剧，可能处于疲劳点蚀初期。建议缩短滑油取样化验周期，并考虑更换滑油。</span>
              ) : gearboxState.oilTemp > 80 ? (
                <span className="text-yellow-500">【注意】 齿轮箱油温偏高，可能导致润滑油膜变薄，加速齿面磨损。请检查冷却器工作状态。</span>
              ) : (
                <span className="text-emerald-500">【正常】 齿轮箱运转平稳，润滑良好，未见异常磨损迹象。</span>
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
