import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, PlugZap, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/shore-power-plug-contact-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[shore-power-plug-contact-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/shore-power-plug-contact-life';
import { ShorePowerPlugState } from '../../../components/life-warning/shore-power-plug-contact-life/three-types';

export const View: React.FC = () => {
  const [plugState, setPlugState] = useState<ShorePowerPlugState>({
    insertionCycles: 1250, // count
    contactResistance: 0.8, // mOhm
    temperature: 45, // Celsius
    currentLoad: 350, // A
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(1500); // Cycles remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setPlugState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate load fluctuations
        const loadSpike = Math.random() > 0.8;
        let newCurrent = prev.currentLoad;

        if (loadSpike) {
            newCurrent = 400 + Math.random() * 150; // Surge
        } else {
            newCurrent = prev.currentLoad + (350 - prev.currentLoad) * 0.1 + (Math.random() - 0.5) * 20;
        }

        // Resistance increases slowly with cycles, but can spike if arcing occurs
        let newResistance = prev.contactResistance + 0.0001;
        if (prev.temperature > 85) newResistance += 0.001; // Oxidation accelerates at high temp

        // Temperature based on I^2 * R heating
        const heatGenerated = (newCurrent * newCurrent * newResistance) / 1000; // Simplified
        const targetTemp = 30 + heatGenerated * 0.5; // Ambient 30C
        const newTemp = prev.temperature + (targetTemp - prev.temperature) * 0.1;

        // Health calculation
        // Resistance > 1.5 is warning, > 2.5 is critical
        // Temp > 75 is warning, > 90 is critical
        const resPenalty = Math.max(0, ((newResistance - 1.0) / 1.5) * 50); 
        const tempPenalty = Math.max(0, ((newTemp - 70) / 20) * 50);

        const health = Math.max(0, Math.floor(100 - resPenalty - tempPenalty));
        
        const baseLife = 3000; // Rated for 3000 insertions
        const remainingLife = Math.max(0, Math.floor((baseLife - prev.insertionCycles) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          currentLoad: newCurrent,
          contactResistance: newResistance,
          temperature: newTemp,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPlugState({
      insertionCycles: 0,
      contactResistance: 0.3,
      temperature: 30,
      currentLoad: 350,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(3000);
  };

  const handleInsert = () => {
    setPlugState(prev => ({
        ...prev,
        insertionCycles: prev.insertionCycles + 1,
        // Slight wear on each insertion
        contactResistance: prev.contactResistance + 0.005
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <PlugZap className="w-8 h-8" />
            港口岸电系统插头触点寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于接触电阻、温升效应与插拔频次的电接触疲劳与氧化评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">触点健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余插拔寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">次</span></div>
            </div>
          </div>
          <button onClick={handleInsert} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>模拟插拔操作</span>
          </button>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换插头组件</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              电气与热工参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="传输电流 (A)" value={plugState.currentLoad} max={600} color={plugState.currentLoad > 500 ? 'bg-rose-500' : 'bg-blue-500'} onChange={(v) => setPlugState(s => ({...s, currentLoad: v}))} />
              <ParameterControl label="触点温度 (°C)" value={plugState.temperature} max={120} color={plugState.temperature > 90 ? 'bg-rose-500' : plugState.temperature > 75 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setPlugState(s => ({...s, temperature: v}))} />
              
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">累计插拔次数</span>
                <span className={`font-mono font-bold ${plugState.insertionCycles > 2500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {plugState.insertionCycles} 次
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              接触电阻监测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">电阻值 (mΩ)</span>
                <span className={`font-mono font-bold text-2xl ${plugState.contactResistance > 2.5 ? 'text-rose-500 animate-pulse' : plugState.contactResistance > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {plugState.contactResistance.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${plugState.contactResistance > 2.5 ? 'bg-rose-500' : plugState.contactResistance > 1.5 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (plugState.contactResistance / 4) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(1.5 / 4) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(2.5 / 4) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>警告: 1.5</span>
                <span>危险: 2.5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            高压岸电插头热分布与电弧 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={plugState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${plugState.temperature > 90 ? 'text-rose-500 animate-bounce' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">热失控/烧毁风险</div>
                <div className={`text-xl font-mono ${plugState.temperature > 90 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (plugState.temperature / 110) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计通电时间</div>
              <div className="text-xl font-mono text-slate-300">
                {plugState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="触点氧化/磨损 (高电阻)" value={(plugState.contactResistance / 3) * 100} critical={83} />
              <DiagnosticItem label="绝缘件热老化 (高温)" value={(plugState.temperature / 120) * 100} critical={75} />
              <DiagnosticItem label="机械疲劳 (插拔次数)" value={(plugState.insertionCycles / 3000) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {plugState.contactResistance > 2.5 || plugState.temperature > 90 ? (
                <span className="text-rose-400 font-bold">【危急】 接触电阻过大导致严重发热，可能引发电弧烧蚀甚至火灾。绝缘材料可能已开始熔化。必须立即切断岸电，禁止继续使用该插头，并进行整体更换。</span>
              ) : plugState.contactResistance > 1.5 || plugState.temperature > 75 ? (
                <span className="text-amber-400">【警告】 触点表面存在明显氧化或磨损，温升异常。建议在下一次断电时使用专用清洁剂清理触点，并检查弹簧夹紧力。</span>
              ) : plugState.insertionCycles > 2500 ? (
                <span className="text-yellow-400">【注意】 插拔次数接近设计寿命上限，镀银层可能已磨损殆尽，请密切关注温升变化。</span>
              ) : (
                <span className="text-emerald-400">【正常】 岸电插头接触良好，温升在安全范围内，导电性能稳定。</span>
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
      <span className="font-mono text-blue-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
