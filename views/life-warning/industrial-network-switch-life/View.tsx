import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Network, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/industrial-network-switch-life/ThreeScene';
import { NetworkSwitchState } from '../../../components/life-warning/industrial-network-switch-life/three-types';

export const View: React.FC = () => {
  const [switchState, setSwitchState] = useState<NetworkSwitchState>({
    cpuTemperature: 45, // Celsius
    packetLoss: 0.01, // %
    portErrors: 2, // count/sec
    powerSupplyVoltage: 24.1, // V (Industrial 24V DC typical)
    operatingHours: 45000, // hours (~5 years)
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(42000); // hours remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setSwitchState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate operation
        let newTemp = prev.cpuTemperature + (Math.random() - 0.5) * 0.5;
        let newVoltage = prev.powerSupplyVoltage + (Math.random() - 0.5) * 0.05;
        
        // Keep within bounds
        if (newTemp < 30) newTemp = 30;
        if (newVoltage > 25) newVoltage = 25;
        if (newVoltage < 20) newVoltage = 20;

        // Aging effects: higher temp -> more errors/loss over time
        let newErrors = prev.portErrors;
        let newLoss = prev.packetLoss;

        if (newTemp > 75) {
            newErrors += Math.random() * 5;
            newLoss += Math.random() * 0.1;
        } else {
            // Random small fluctuations
            newErrors = Math.max(0, prev.portErrors + (Math.random() - 0.5) * 2);
            newLoss = Math.max(0, prev.packetLoss + (Math.random() - 0.5) * 0.02);
        }

        // Voltage drop causes severe issues
        if (newVoltage < 22) {
            newErrors += 20;
            newLoss += 1.0;
        }

        // Health calculation
        // Temp > 80C is critical
        // Packet loss > 1% is bad for industrial control
        // Voltage < 22V or > 26V is bad
        const tempPenalty = Math.max(0, ((newTemp - 60) / 30) * 40); 
        const lossPenalty = Math.max(0, (newLoss / 2.0) * 40);
        const voltPenalty = Math.max(0, (Math.abs(newVoltage - 24) / 3) * 20);

        const health = Math.max(0, Math.floor(100 - tempPenalty - lossPenalty - voltPenalty));
        
        const baseLifeHours = 87600; // ~10 years MTBF
        const remainingLife = Math.max(0, Math.floor((baseLifeHours - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          cpuTemperature: newTemp,
          powerSupplyVoltage: newVoltage,
          packetLoss: newLoss,
          portErrors: newErrors
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSwitchState({
      cpuTemperature: 40,
      packetLoss: 0,
      portErrors: 0,
      powerSupplyVoltage: 24.0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(87600);
  };

  const handleHeatwave = () => {
    setSwitchState(prev => ({
        ...prev,
        cpuTemperature: prev.cpuTemperature + 25, // Simulate cooling failure
        packetLoss: prev.packetLoss + 0.5
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 text-neutral-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-400 flex items-center gap-3">
            <Network className="w-8 h-8" />
            工业以太网交换机运行寿命预警
          </h1>
          <p className="text-neutral-400 mt-1">基于核心温度、丢包率与电源稳定性的电子元器件老化评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-neutral-400">设备健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-neutral-700"></div>
            <div className="text-center">
              <div className="text-sm text-neutral-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-violet-400">{estimatedLife.toLocaleString()} <span className="text-sm font-normal">h</span></div>
            </div>
          </div>
          <button onClick={handleHeatwave} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-rose-400" />
            <span>模拟散热失效/高温</span>
          </button>
          <button onClick={handleReset} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换交换机硬件</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-violet-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              硬件与环境参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="核心 CPU 温度 (°C)" value={switchState.cpuTemperature} max={100} color={switchState.cpuTemperature > 80 ? 'bg-rose-500' : switchState.cpuTemperature > 65 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSwitchState(s => ({...s, cpuTemperature: v}))} />
              <ParameterControl label="直流电源电压 (V)" value={switchState.powerSupplyVoltage} max={30} min={15} color={switchState.powerSupplyVoltage < 22 || switchState.powerSupplyVoltage > 26 ? 'bg-rose-500' : 'bg-emerald-500'} onChange={(v) => setSwitchState(s => ({...s, powerSupplyVoltage: v}))} />
              
              <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 flex justify-between items-center">
                <span className="text-sm text-neutral-400">累计运行时间</span>
                <span className={`font-mono font-bold ${switchState.operatingHours > 70000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {switchState.operatingHours.toLocaleString()} h
                </span>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-violet-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              网络传输质量
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">丢包率 (%)</span>
                <span className={`font-mono font-bold text-2xl ${switchState.packetLoss > 1.0 ? 'text-rose-500 animate-pulse' : switchState.packetLoss > 0.1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {switchState.packetLoss.toFixed(3)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${switchState.packetLoss > 1.0 ? 'bg-rose-500' : switchState.packetLoss > 0.1 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${Math.min(100, (switchState.packetLoss / 2.0) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(0.1 / 2.0) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(1.0 / 2.0) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>警告: 0.1%</span>
                <span>危险: 1.0%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0a0a0a] border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(139,92,246,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-neutral-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
            交换机芯片热分布与数据流 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={switchState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${switchState.cpuTemperature > 80 ? 'text-rose-500 animate-bounce' : 'text-violet-400'}`} />
              <div>
                <div className="text-xs text-neutral-400">芯片热击穿/死机风险</div>
                <div className={`text-xl font-mono ${switchState.cpuTemperature > 80 ? 'text-rose-500 animate-pulse' : 'text-neutral-200'}`}>
                  {Math.min(100, (switchState.cpuTemperature / 100) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 text-right">
              <div className="text-xs text-neutral-400">端口错误率</div>
              <div className={`text-xl font-mono ${switchState.portErrors > 50 ? 'text-rose-400' : 'text-neutral-300'}`}>
                {switchState.portErrors.toFixed(0)} <span className="text-sm">err/s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-violet-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="芯片热老化 (高温)" value={(switchState.cpuTemperature / 90) * 100} critical={85} />
              <DiagnosticItem label="电容干涸/电源失效 (电压异常)" value={(Math.abs(switchState.powerSupplyVoltage - 24) / 4) * 100} critical={75} />
              <DiagnosticItem label="端口物理老化/氧化 (误码率)" value={(switchState.portErrors / 100) * 100} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-neutral-800/40 rounded-lg border border-neutral-700 text-sm text-neutral-300 leading-relaxed">
              <p className="mb-2"><strong className="text-violet-400">诊断结论与建议：</strong></p>
              {switchState.cpuTemperature > 80 ? (
                <span className="text-rose-400 font-bold">【危急】 核心芯片温度过高，极易导致交换机死机、重启或永久性热击穿。工业控制网络面临瘫痪风险。请立即检查机柜散热风扇和环境温度！</span>
              ) : switchState.packetLoss > 1.0 || switchState.portErrors > 50 ? (
                <span className="text-rose-400 font-bold">【危急】 网络传输质量严重下降，丢包率和误码率超标。可能导致 PLC 通信中断。请检查网线连接、端口氧化情况或电磁干扰。</span>
              ) : switchState.powerSupplyVoltage < 22 || switchState.powerSupplyVoltage > 26 ? (
                <span className="text-amber-400">【警告】 直流供电电压异常，可能导致内部电源模块过载或工作不稳定。请检查前端导轨电源。</span>
              ) : switchState.operatingHours > 70000 ? (
                <span className="text-yellow-400">【注意】 设备已运行超过 8 年，内部电解电容可能出现干涸老化，建议列入年度更换计划。</span>
              ) : (
                <span className="text-emerald-400">【正常】 工业交换机运行稳定，散热良好，网络传输质量高。</span>
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
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-violet-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
