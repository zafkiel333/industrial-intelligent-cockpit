import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ThermometerSun, Zap, CloudRain } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/relay-protection-component-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[relay-protection-component-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/relay-protection-component-life';
import { RelayComponentState } from '../../../components/life-warning/relay-protection-component-life/three-types';

export const View: React.FC = () => {
  const [relayState, setRelayState] = useState<RelayComponentState>({
    temperature: 35, // Celsius
    humidity: 45, // %
    voltageFluctuation: 2, // %
    operatingHours: 25000, // hours
    dustAccumulation: 10, // %
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(60000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setRelayState(prev => {
        // Simulate environmental factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Temperature fluctuates
        const newTemp = Math.max(10, Math.min(85, prev.temperature + (Math.random() - 0.5) * 2));
        
        // Humidity fluctuates
        const newHumidity = Math.max(20, Math.min(95, prev.humidity + (Math.random() - 0.5) * 5));

        // Voltage fluctuation spikes occasionally
        const newVoltageFluc = Math.max(0, Math.min(20, prev.voltageFluctuation + (Math.random() > 0.9 ? Math.random() * 5 : -0.5)));

        // Dust accumulates slowly
        const newDust = Math.min(100, prev.dustAccumulation + 0.05);

        // Health Index Calculation
        // Temperature: > 50C accelerates aging (Arrhenius)
        const tempPenalty = Math.max(0, (newTemp - 50) / 35) * 30;
        
        // Humidity + Dust = Short circuit / corrosion risk
        let envPenalty = 0;
        if (newHumidity > 70 && newDust > 30) {
           envPenalty = ((newHumidity - 70) / 30) * 20 + (newDust / 100) * 20;
        } else if (newHumidity > 85) {
           envPenalty = 15;
        }

        // Voltage Fluctuation: Stresses capacitors and power supply ICs
        const voltagePenalty = Math.max(0, (newVoltageFluc - 5) / 15) * 30;

        const health = Math.max(0, Math.floor(100 - tempPenalty - envPenalty - voltagePenalty));
        
        // Estimated Life (Hours) - Design life typically 100,000 hours at 25C
        const baseLife = 100000;
        // Temperature halves life every 10C above 25C
        const tempFactor = Math.pow(2, Math.max(0, newTemp - 25) / 10);
        const remainingLife = Math.max(0, Math.floor((baseLife / tempFactor) * (health / 100) - (newHours * 0.1)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          temperature: newTemp,
          humidity: newHumidity,
          voltageFluctuation: newVoltageFluc,
          dustAccumulation: newDust,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRelayState({
      temperature: 25,
      humidity: 40,
      voltageFluctuation: 1,
      operatingHours: 0,
      dustAccumulation: 0,
    });
    setHealthScore(100);
    setEstimatedLife(100000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" />
            继电保护装置电子元件寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于温湿度、灰尘与电压波动的微机保护装置可靠性评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">装置健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-emerald-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换插件/除尘维护</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行环境与工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="机箱内部温度 (°C)" 
                value={relayState.temperature} 
                max={85} 
                color={relayState.temperature > 60 ? 'bg-rose-500' : relayState.temperature > 45 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setRelayState(s => ({...s, temperature: v}))}
              />
              
              <ParameterControl 
                label="环境湿度 (%)" 
                value={relayState.humidity} 
                max={100} 
                color={relayState.humidity > 80 ? 'bg-rose-500' : 'bg-emerald-500'}
                onChange={(v) => setRelayState(s => ({...s, humidity: v}))}
              />

              <ParameterControl 
                label="电源电压波动率 (%)" 
                value={relayState.voltageFluctuation} 
                max={20} 
                color={relayState.voltageFluctuation > 10 ? 'bg-rose-500' : 'bg-emerald-500'}
                onChange={(v) => setRelayState(s => ({...s, voltageFluctuation: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              累积损伤指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">积灰程度 (%)</span>
                <span className={`font-mono font-bold text-lg ${relayState.dustAccumulation > 60 ? 'text-rose-500 animate-pulse' : relayState.dustAccumulation > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {relayState.dustAccumulation.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${relayState.dustAccumulation > 60 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${relayState.dustAccumulation}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            PCB板热分布与环境应力 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={relayState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <CloudRain className={`w-6 h-6 ${relayState.humidity > 80 && relayState.dustAccumulation > 50 ? 'text-rose-500' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">凝露/爬电风险指数</div>
                <div className={`text-xl font-mono ${relayState.humidity > 80 && relayState.dustAccumulation > 50 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {((relayState.humidity / 100) * (relayState.dustAccumulation / 100) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">电解电容寿命加速因子</div>
              <div className={`text-xl font-mono ${relayState.temperature > 50 ? 'text-rose-500' : 'text-amber-400'}`}>
                {Math.pow(2, Math.max(0, relayState.temperature - 25) / 10).toFixed(1)}x
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="热老化 (半导体/电容)" 
                value={(relayState.temperature / 85) * 100} 
                critical={80} // > 68C
              />
              <DiagnosticItem 
                label="绝缘下降 (高湿+积灰)" 
                value={((relayState.humidity * relayState.dustAccumulation) / 10000) * 100} 
                critical={60} 
              />
              <DiagnosticItem 
                label="电源模块过压击穿风险" 
                value={(relayState.voltageFluctuation / 20) * 100} 
                critical={75} // > 15%
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-emerald-400">诊断结论与建议：</strong></p>
              {relayState.temperature > 70 ? (
                <span className="text-rose-400 font-bold">【危急】 装置内部温度极高，电子元件寿命呈指数级衰减，存在随时死机或误动的风险。必须立即检查屏柜散热风扇及空调系统！</span>
              ) : relayState.humidity > 85 && relayState.dustAccumulation > 50 ? (
                <span className="text-rose-400 font-bold">【危急】 高湿度伴随严重积灰，极易在PCB板表面形成导电通道引发短路（爬电）。请立即安排停电清扫并开启加热除湿器。</span>
              ) : relayState.voltageFluctuation > 15 ? (
                <span className="text-amber-400">【警告】 电源电压波动剧烈，严重威胁装置电源插件寿命。建议检查站用电系统或更换UPS。</span>
              ) : (
                <span className="text-emerald-400">【正常】 运行环境良好，温湿度适宜，装置可靠性高。请按计划进行常规巡检。</span>
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
      <span className="font-mono text-emerald-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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
