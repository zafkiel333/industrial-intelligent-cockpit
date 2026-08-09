import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/MotorBearing/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-motor-bearing]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-motor-bearing';
import { MotorState } from '@/components/computer-visual-inspection/MotorBearing/three-types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Activity, AlertCircle, CheckCircle2, Droplets, Thermometer, Zap } from 'lucide-react';

const MotorBearingView: React.FC = () => {
  const [state, setState] = useState<MotorState>({
    bearingDE: { temperature: 65.4, vibration: 2.8, oilLeakLevel: 'trace', leakArea: 12.5 },
    bearingNDE: { temperature: 58.2, vibration: 1.5, oilLeakLevel: 'none', leakArea: 0 },
    rpm: 1485,
    load: 82.5
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        bearingDE: {
          ...prev.bearingDE,
          temperature: prev.bearingDE.temperature + (Math.random() - 0.5) * 0.2,
          vibration: prev.bearingDE.vibration + (Math.random() - 0.5) * 0.1,
          leakArea: prev.bearingDE.leakArea + (Math.random() > 0.8 ? 0.1 : 0)
        },
        bearingNDE: {
          ...prev.bearingNDE,
          temperature: prev.bearingNDE.temperature + (Math.random() - 0.5) * 0.1,
          vibration: prev.bearingNDE.vibration + (Math.random() - 0.5) * 0.05
        }
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg text-slate-100">
      {/* Header with Status Bar */}
      <div className="flex justify-between items-center bg-slate-900/80 p-4 border border-cyan-500/30 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-full border border-cyan-500/50">
            <Droplets className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">电机轴承端盖渗油视觉监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">MOTOR BEARING OIL LEAK VISUAL MONITORING v2.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">运行状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.bearingDE.oilLeakLevel !== 'none' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.bearingDE.oilLeakLevel !== 'none' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.bearingDE.oilLeakLevel !== 'none' ? '检测到轻微渗油' : '运行正常'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">转速 / 负载</span>
            <span className="text-sm font-mono text-cyan-300">{state.rpm} RPM / {state.load}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="电机 3D 数字孪生与热成像叠加" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换热成像</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">爆破视图</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  <span className="text-[10px] text-slate-300">最高温: <span className="text-rose-400 font-mono">{state.bearingDE.temperature.toFixed(1)}°C</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-slate-300">振动值: <span className="text-amber-400 font-mono">{state.bearingDE.vibration.toFixed(2)} mm/s</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Leak Detection Overlay */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="p-3 bg-slate-900/60 border border-amber-500/30 rounded backdrop-blur-sm">
                <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">视觉识别结果</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
                    <Droplets className="w-2 h-2 text-amber-400" />
                  </div>
                  <span className="text-xs text-slate-200">DE 端盖处发现油渍 (面积: {state.bearingDE.leakArea.toFixed(1)} cm²)</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-4 gap-6">
            <SciFiCard title="DE 轴承温度" className="h-32">
              <div className="flex flex-col justify-center h-full">
                <div className="text-2xl font-mono text-rose-400">{state.bearingDE.temperature.toFixed(1)}°C</div>
                <div className="text-[10px] text-slate-500 uppercase">阈值: 85°C</div>
              </div>
            </SciFiCard>
            <SciFiCard title="NDE 轴承温度" className="h-32">
              <div className="flex flex-col justify-center h-full">
                <div className="text-2xl font-mono text-cyan-400">{state.bearingNDE.temperature.toFixed(1)}°C</div>
                <div className="text-[10px] text-slate-500 uppercase">阈值: 85°C</div>
              </div>
            </SciFiCard>
            <SciFiCard title="振动幅值 (DE)" className="h-32">
              <div className="flex flex-col justify-center h-full">
                <div className="text-2xl font-mono text-amber-400">{state.bearingDE.vibration.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 uppercase">单位: mm/s</div>
              </div>
            </SciFiCard>
            <SciFiCard title="绝缘电阻" className="h-32">
              <div className="flex flex-col justify-center h-full">
                <div className="text-2xl font-mono text-emerald-400">450 MΩ</div>
                <div className="text-[10px] text-slate-500 uppercase">状态: 良好</div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="视觉诊断报告" className="flex-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">驱动端 (DE)</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">轻微渗油</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="text-slate-500">渗油面积: <span className="text-slate-200">{state.bearingDE.leakArea.toFixed(1)} cm²</span></div>
                    <div className="text-slate-500">扩散速度: <span className="text-slate-200">0.05 cm²/h</span></div>
                    <div className="text-slate-500">油渍颜色: <span className="text-slate-200">深褐色 (氧化)</span></div>
                    <div className="text-slate-500">置信度: <span className="text-slate-200">96.8%</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">非驱动端 (NDE)</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">无异常</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="text-slate-500">渗油面积: <span className="text-slate-200">0 cm²</span></div>
                    <div className="text-slate-500">表面状态: <span className="text-slate-200">干燥清洁</span></div>
                    <div className="text-slate-500">密封完整性: <span className="text-slate-200">100%</span></div>
                    <div className="text-slate-500">置信度: <span className="text-slate-200">99.2%</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2">维护建议</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  DE 端盖处存在微量渗油，可能与轴承温度升高导致的润滑脂稀释有关。建议在下次停机维护时检查骨架油封磨损情况，并清理现有油渍以便持续观察。
                </p>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="系统告警" className="h-48">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${state.bearingDE.oilLeakLevel !== 'none' ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.bearingDE.oilLeakLevel !== 'none' ? (
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.bearingDE.oilLeakLevel !== 'none' ? '端盖渗油预警' : '系统运行平稳'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.bearingDE.oilLeakLevel !== 'none' 
                    ? '视觉系统捕捉到驱动端盖边缘存在油渍扩散迹象。已自动创建维护工单，等级：低。' 
                    : '所有监测指标均在正常范围内。视觉算法未发现渗漏油、松动或变色等异常现象。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MotorBearingView;
