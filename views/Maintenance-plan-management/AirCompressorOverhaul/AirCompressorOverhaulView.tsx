import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/AirCompressorOverhaul/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-60]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-60';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity } from 'lucide-react';

export const AirCompressorOverhaulView: React.FC = () => {
  const [data, setData] = useState({
    rpm: 2950,
    pressure: 8.5,
    isOverhauling: false,
    temperature: 85,
    vibration: 3.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isOverhauling) {
          return {
            ...prev,
            rpm: Math.max(0, prev.rpm - 100),
            pressure: Math.max(0, prev.pressure - 0.5),
            temperature: Math.max(25, prev.temperature - 2),
            vibration: 0
          };
        }
        return {
          ...prev,
          rpm: 2950 + (Math.random() - 0.5) * 50,
          pressure: 8.5 + (Math.random() - 0.5) * 0.2,
          temperature: 85 + (Math.random() - 0.5) * 1,
          vibration: 3.2 + (Math.random() - 0.5) * 0.3
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOverhaul = () => {
    setData(prev => ({ ...prev, isOverhauling: !prev.isOverhauling }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col">
      <div className="mb-6 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            空压机站主机大修计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">AIR COMPRESSOR STATION MAIN UNIT OVERHAUL</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleOverhaul}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isOverhauling 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Settings size={18} />
            {data.isOverhauling ? '主机解体检修中' : '启动主机大修程序'}
          </button>
        </div>
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden border border-cyan-500/30 min-h-[700px]">
        {/* Central 3D Background */}
        <div className="absolute inset-0 z-0 bg-[#05101a]">
          <ThreeScene
            rpm={data.rpm}
            pressure={data.pressure}
            isOverhauling={data.isOverhauling}
          />
        </div>
        <div className="absolute top-4 right-4 z-20">
          <ModelLibraryLink url={MODEL_LIB_URL} />
        </div>

        {/* Top Floating Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex gap-6 pointer-events-none">
           <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/50 px-6 py-3 rounded-full text-cyan-400 font-bold flex items-center gap-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
             <Activity size={20} />
             <div className="flex flex-col">
               <span className="text-xs text-slate-400">排气压力</span>
               <span className="text-xl">{data.pressure.toFixed(2)} MPa</span>
             </div>
             <div className="w-px h-8 bg-cyan-500/30 mx-2"></div>
             <div className="flex flex-col">
               <span className="text-xs text-slate-400">主机转速</span>
               <span className="text-xl">{data.rpm.toFixed(0)} RPM</span>
             </div>
           </div>
        </div>

        {/* Left Floating Panel */}
        <div className="absolute top-24 left-6 bottom-6 w-80 z-10 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur border border-cyan-500/30 p-5 rounded-lg flex-1 overflow-y-auto custom-scrollbar shadow-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-cyan-500/30 pb-2">设备运行状态</h3>
            <ParameterWidget parameters={[
              { label: '排气温度', value: data.temperature.toFixed(1), unit: '°C', status: data.temperature > 95 ? 'warning' : 'normal' },
              { label: '机头振动', value: data.vibration.toFixed(2), unit: 'mm/s', status: data.vibration > 4.0 ? 'critical' : 'normal' },
              { label: '转子间隙', value: data.isOverhauling ? '测量中' : '0.05', unit: 'mm', status: 'normal' }
            ]} />
            
            <h3 className="text-lg font-bold text-cyan-400 mt-6 mb-4 border-b border-cyan-500/30 pb-2">安全与风险管控</h3>
            <RiskWidget risks={[
              { level: data.vibration > 4.0 ? 'high' : 'medium', desc: `机头振动 ${data.vibration.toFixed(2)}mm/s，${data.vibration > 4.0 ? '轴承磨损严重，需立即大修' : '在允许范围内'}` },
              { level: 'high', desc: '高压释放风险：解体前必须确认系统压力为零' },
              { level: 'medium', desc: '重物吊装风险：转子吊出需使用专用平衡吊具' }
            ]} />
          </div>
        </div>

        {/* Right Floating Panel */}
        <div className="absolute top-24 right-6 bottom-6 w-96 z-10 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur border border-cyan-500/30 p-5 rounded-lg flex-1 overflow-y-auto custom-scrollbar shadow-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-cyan-500/30 pb-2">主机大修标准流程</h3>
            <TimelineWidget steps={[
              { time: 'Day 1', title: '停机断电，排空润滑油及系统余压', status: data.isOverhauling ? 'done' : 'pending' },
              { time: 'Day 2', title: '拆卸进排气管路，吊出压缩机主机', status: data.isOverhauling ? 'active' : 'pending' },
              { time: 'Day 3', title: '主机解体，转子及壳体清洗探伤', status: data.isOverhauling ? 'active' : 'pending' },
              { time: 'Day 4', title: '更换全套轴承、轴封及调整垫片', status: 'pending' },
              { time: 'Day 5', title: '转子间隙测量调整，主机回装', status: 'pending' },
              { time: 'Day 6', title: '系统复位，加注新油，开机调试', status: 'pending' }
            ]} />

            <h3 className="text-lg font-bold text-cyan-400 mt-6 mb-4 border-b border-cyan-500/30 pb-2">大修资源调配</h3>
            <ResourceWidget resources={[
              { name: '原厂大修包 (轴承/密封)', allocated: 1, total: 1, unit: '套' },
              { name: '全合成空压机油', allocated: 80, total: 80, unit: 'L' },
              { name: '专用转子拔出工具', allocated: 1, total: 1, unit: '套' },
              { name: '原厂认证维修工程师', allocated: 2, total: 2, unit: '人' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
};
