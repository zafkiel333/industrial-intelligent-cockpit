import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, CloudRain, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/sprinkler-nozzle-clogging/ThreeScene';
import { NozzleState } from '../../../components/life-warning/sprinkler-nozzle-clogging/three-types';

export const View: React.FC = () => {
  const [nozzleState, setNozzleState] = useState<NozzleState>({
    waterPressure: 0.8, // MPa
    flowRate: 85, // L/min
    waterTurbidity: 15, // NTU
    cloggingRate: 10, // %
    operatingHours: 1200, // hours
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(3800); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setNozzleState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate water quality changes
        const newTurbidity = Math.max(5, Math.min(100, prev.waterTurbidity + (Math.random() * 4 - 2)));
        
        // Clogging increases based on turbidity
        let clogRate = 0.01;
        if (newTurbidity > 30) clogRate *= 2;
        if (newTurbidity > 60) clogRate *= 5;
        const newClogging = Math.min(100, prev.cloggingRate + clogRate);

        // As clogging increases, pressure goes up and flow goes down
        const basePressure = 0.8;
        const newPressure = basePressure * (1 + (newClogging / 100) * 1.5);
        
        const baseFlow = 90;
        const newFlow = baseFlow * (1 - (newClogging / 100) * 0.8);

        const clogPenalty = Math.max(0, (newClogging / 100) * 70);
        const pressurePenalty = Math.max(0, (newPressure - 1.5) / 0.5) * 30;

        const health = Math.max(0, Math.floor(100 - clogPenalty - pressurePenalty));
        
        const baseLife = 5000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          waterTurbidity: newTurbidity,
          cloggingRate: newClogging,
          waterPressure: newPressure,
          flowRate: newFlow,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setNozzleState({
      waterPressure: 0.8,
      flowRate: 90,
      waterTurbidity: 10,
      cloggingRate: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(5000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <CloudRain className="w-8 h-8" />
            自动喷淋系统喷头堵塞预警
          </h1>
          <p className="text-slate-400 mt-1">基于管网压力、流量与水质浊度的喷嘴结垢与堵塞评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">喷头通畅度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计清洗倒计时</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>酸洗/更换喷头</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              管网水力监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="供水压力 (MPa)" value={nozzleState.waterPressure} max={2.5} color={nozzleState.waterPressure > 1.8 ? 'bg-rose-500' : nozzleState.waterPressure > 1.2 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setNozzleState(s => ({...s, waterPressure: v}))} />
              <ParameterControl label="单孔流量 (L/min)" value={nozzleState.flowRate} max={100} color={nozzleState.flowRate < 40 ? 'bg-rose-500' : nozzleState.flowRate < 70 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setNozzleState(s => ({...s, flowRate: v}))} />
              <ParameterControl label="水质浊度 (NTU)" value={nozzleState.waterTurbidity} max={100} color={nozzleState.waterTurbidity > 60 ? 'bg-rose-500' : nozzleState.waterTurbidity > 30 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setNozzleState(s => ({...s, waterTurbidity: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              结垢堵塞状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">喷孔截面堵塞率 (%)</span>
                <span className={`font-mono font-bold text-lg ${nozzleState.cloggingRate > 70 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {nozzleState.cloggingRate.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${nozzleState.cloggingRate > 70 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${nozzleState.cloggingRate}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '70%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">雾化失效临界值: 70%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(56,189,248,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
            喷嘴结垢与雾化锥角畸变 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={nozzleState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${nozzleState.cloggingRate > 70 ? 'text-rose-500' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">降尘失效风险指数</div>
                <div className={`text-xl font-mono ${nozzleState.cloggingRate > 70 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (nozzleState.cloggingRate / 80) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {nozzleState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="钙镁离子结垢 (硬水)" value={nozzleState.cloggingRate * 0.8} critical={60} />
              <DiagnosticItem label="颗粒物物理堵塞 (高浊度)" value={(nozzleState.waterTurbidity / 80) * 100} critical={75} />
              <DiagnosticItem label="管网憋压爆管风险" value={(nozzleState.waterPressure / 2.0) * 100} critical={90} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {nozzleState.cloggingRate > 70 ? (
                <span className="text-rose-400 font-bold">【危急】 喷嘴堵塞严重，雾化锥角急剧缩小，已形成水柱，完全丧失降尘能力！必须立即进行酸洗或更换喷头。</span>
              ) : nozzleState.waterPressure > 1.8 ? (
                <span className="text-rose-400 font-bold">【危急】 管网压力异常升高，表明大面积喷头发生严重堵塞，存在管路憋爆风险。请立即停泵泄压。</span>
              ) : nozzleState.waterTurbidity > 60 ? (
                <span className="text-amber-400">【警告】 供水浊度过高，含有大量悬浮颗粒，极易造成喷孔物理堵塞。建议反冲洗前端过滤器。</span>
              ) : nozzleState.cloggingRate > 40 ? (
                <span className="text-yellow-400">【注意】 喷头已出现明显结垢，流量开始下降，雾化效果减弱。建议计划在近期进行管网除垢作业。</span>
              ) : (
                <span className="text-emerald-400">【正常】 喷淋系统水压、流量稳定，雾化效果良好。</span>
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
