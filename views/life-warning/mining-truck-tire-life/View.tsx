import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Truck, ThermometerSun, Gauge } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/mining-truck-tire-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mining-truck-tire-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mining-truck-tire-life';
import { TireState } from '../../../components/life-warning/mining-truck-tire-life/three-types';

export const View: React.FC = () => {
  const [tireState, setTireState] = useState<TireState>({
    pressure: 100, // psi
    temperature: 45, // Celsius
    treadDepth: 95, // mm
    load: 250, // tons
    tkph: 400, // Ton-Kilometers Per Hour
    operatingHours: 500, // hours
  });

  const [healthScore, setHealthScore] = useState(95);
  const [estimatedLife, setEstimatedLife] = useState(4500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setTireState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Load fluctuates
        const newLoad = Math.max(100, Math.min(350, prev.load + (Math.random() - 0.5) * 20));
        
        // TKPH fluctuates with load and speed
        const newTkph = Math.max(200, Math.min(800, prev.tkph + (newLoad - prev.load) * 1.5 + (Math.random() - 0.5) * 10));

        // Pressure drops slowly over time, drops faster if hot
        let pressureDrop = 0.01;
        if (prev.temperature > 80) pressureDrop += 0.05;
        const newPressure = Math.max(50, prev.pressure - pressureDrop);

        // Temperature rises with TKPH and low pressure
        let tempTarget = 30 + (newTkph / 10);
        if (newPressure < 90) tempTarget += (90 - newPressure) * 1.5; // Under-inflation causes heat
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        // Tread wear increases with hours, load, and heat
        const wearRate = 0.01 + (newLoad / 10000) + (newTemp > 90 ? 0.02 : 0);
        const newTreadDepth = Math.max(0, prev.treadDepth - wearRate);

        // Health Index Calculation
        // Tread: < 20mm is warning, < 10mm is critical
        const treadPenalty = Math.max(0, (30 - newTreadDepth) / 20) * 40;
        
        // Temperature: > 90C is warning, > 105C is critical (separation risk)
        const tempPenalty = Math.max(0, (newTemp - 80) / 25) * 40;
        
        // Pressure: < 90 is warning, < 80 is critical
        const pressurePenalty = Math.max(0, (95 - newPressure) / 15) * 20;

        const health = Math.max(0, Math.floor(100 - treadPenalty - tempPenalty - pressurePenalty));
        
        // Estimated Life (Hours) - Base 5000 hours
        const baseLife = 5000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.8)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          load: newLoad,
          tkph: newTkph,
          pressure: newPressure,
          temperature: newTemp,
          treadDepth: newTreadDepth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setTireState({
      pressure: 105,
      temperature: 40,
      treadDepth: 100,
      load: 250,
      tkph: 350,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(5000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-400 flex items-center gap-3">
            <Truck className="w-8 h-8" />
            矿用卡车轮胎寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于TKPH、胎温胎压与花纹磨损的巨型轮胎健康评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轮胎健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-violet-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换新轮胎</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              实时工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="胎内压力 (psi)" value={tireState.pressure} max={120} min={40} color={tireState.pressure < 80 ? 'bg-rose-500' : tireState.pressure < 95 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTireState(s => ({...s, pressure: v}))} />
              <ParameterControl label="内部温度 (°C)" value={tireState.temperature} max={120} color={tireState.temperature > 100 ? 'bg-rose-500' : tireState.temperature > 85 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTireState(s => ({...s, temperature: v}))} />
              <ParameterControl label="综合做功指数 (TKPH)" value={tireState.tkph} max={1000} color={tireState.tkph > 800 ? 'bg-rose-500' : tireState.tkph > 600 ? 'bg-amber-500' : 'bg-violet-500'} onChange={(v) => setTireState(s => ({...s, tkph: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-violet-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">剩余花纹深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${tireState.treadDepth < 15 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {tireState.treadDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${tireState.treadDepth < 15 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(tireState.treadDepth / 100) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(10 / 100) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废极限: 10 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            轮胎热力学与形变 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={tireState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Gauge className={`w-6 h-6 ${tireState.pressure < 80 ? 'text-rose-500' : 'text-violet-400'}`} />
              <div>
                <div className="text-xs text-slate-400">欠压变形指数</div>
                <div className={`text-xl font-mono ${tireState.pressure < 80 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.max(0, ((100 - tireState.pressure) / 40) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {tireState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="胎面磨平 (抓地力丧失)" value={Math.max(0, (100 - tireState.treadDepth) / 90) * 100} critical={88} />
              <DiagnosticItem label="热分离/爆胎风险 (高温)" value={(tireState.temperature / 110) * 100} critical={90} />
              <DiagnosticItem label="胎侧屈曲疲劳 (低压/超载)" value={Math.max(0, (100 - tireState.pressure) / 30) * 100} critical={66} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-violet-400">诊断结论与建议：</strong></p>
              {tireState.temperature > 105 ? (
                <span className="text-rose-400 font-bold">【危急】 胎温极高，内部橡胶极易发生热分离导致灾难性爆胎！必须立即停车散热，并降低车速或载荷。</span>
              ) : tireState.pressure < 80 ? (
                <span className="text-rose-400 font-bold">【危急】 胎压严重不足，胎侧过度屈曲将产生大量热量并破坏帘布层。请立即充气并检查漏气点。</span>
              ) : tireState.treadDepth < 12 ? (
                <span className="text-amber-400">【警告】 花纹深度已接近报废极限，制动距离显著增加，雨雪天气极易打滑。建议安排更换。</span>
              ) : tireState.tkph > 700 ? (
                <span className="text-yellow-400">【注意】 当前TKPH值偏高，轮胎生热量大，建议优化运输路线或适当降低车速。</span>
              ) : (
                <span className="text-emerald-400">【正常】 胎压胎温正常，磨损在预期范围内，可继续安全作业。</span>
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
      <span className="font-mono text-violet-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
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
