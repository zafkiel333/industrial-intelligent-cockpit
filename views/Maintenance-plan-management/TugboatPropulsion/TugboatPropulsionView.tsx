import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/TugboatPropulsion/ThreeScene';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, AlertTriangle } from 'lucide-react';

export const TugboatPropulsionView: React.FC = () => {
  const [data, setData] = useState({
    rpm: 1200,
    azimuthAngle: 0,
    isInspecting: false,
    oilTemp: 65,
    vibration: 2.1
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isInspecting) {
          return {
            ...prev,
            rpm: 0,
            oilTemp: Math.max(25, prev.oilTemp - 2),
            vibration: 0
          };
        }
        return {
          ...prev,
          rpm: 1200 + (Math.random() - 0.5) * 100,
          azimuthAngle: (prev.azimuthAngle + 5) % 360,
          oilTemp: Math.min(85, prev.oilTemp + Math.random() * 0.5),
          vibration: 2.0 + Math.random() * 0.5
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleInspect = () => {
    setData(prev => ({ ...prev, isInspecting: !prev.isInspecting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-indigo-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 tracking-wider uppercase">
            拖轮全回转推进器维保
          </h1>
          <p className="text-indigo-500/70 mt-2 font-mono text-sm">TUGBOAT Z-DRIVE PROPULSION SYSTEM MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleInspect}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isInspecting 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Settings size={18} />
            {data.isInspecting ? '透视检测模式已开启' : '开启透视检测模式'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="动力输出参数" className="flex-1">
            <ParameterWidget parameters={[
              { label: '主轴转速 (RPM)', value: data.rpm.toFixed(0), unit: 'rpm', status: 'normal' },
              { label: '回转角度', value: data.azimuthAngle.toFixed(0), unit: '°', status: 'normal' },
              { label: '齿轮箱油温', value: data.oilTemp.toFixed(1), unit: '°C', status: data.oilTemp > 80 ? 'warning' : 'normal' },
              { label: '轴系振动烈度', value: data.vibration.toFixed(2), unit: 'mm/s', status: data.vibration > 2.5 ? 'warning' : 'normal' }
            ]} />
          </SciFiCard>
          <SciFiCard title="健康与风险评估" className="flex-1">
            <RiskWidget risks={[
              { level: data.oilTemp > 80 ? 'high' : 'low', desc: `齿轮箱油温 ${data.oilTemp.toFixed(1)}°C，${data.oilTemp > 80 ? '偏高，需检查冷却系统' : '正常'}` },
              { level: data.vibration > 2.5 ? 'medium' : 'low', desc: `振动烈度 ${data.vibration.toFixed(2)}mm/s，${data.vibration > 2.5 ? '偏大，可能存在轴承磨损' : '正常'}` },
              { level: 'medium', desc: '水下密封件老化风险：需定期进行内窥镜检查' }
            ]} />
          </SciFiCard>
        </div>

        <div className="lg:col-span-6">
          <SciFiCard title="Z-Drive 核心透视" className="h-[650px] relative">
            <div className="absolute inset-0 m-4 border border-indigo-500/20 rounded-lg overflow-hidden bg-[#050a15]">
              <ThreeScene 
                rpm={data.rpm} 
                azimuthAngle={data.azimuthAngle} 
                isInspecting={data.isInspecting} 
              />
            </div>
          </SciFiCard>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="维保作业流程" className="flex-1 overflow-y-auto">
            <TimelineWidget steps={[
              { time: '08:00', title: '拖轮进坞，排空坞内积水', status: 'done' },
              { time: '10:00', title: '拆卸导流罩及螺旋桨叶片', status: 'active' },
              { time: '13:00', title: '抽出尾轴，检查轴承及密封件', status: 'pending' },
              { time: '15:30', title: '更换损坏的密封圈及润滑油', status: 'pending' },
              { time: '17:00', title: '回装轴系及螺旋桨，进行探伤', status: 'pending' },
              { time: '19:00', title: '坞内注水，进行系泊试车', status: 'pending' }
            ]} />
          </SciFiCard>
          <SciFiCard title="特种作业资源" className="flex-none">
            <ResourceWidget resources={[
              { name: '特种艉轴密封件', allocated: 2, total: 2, unit: '套' },
              { name: '高性能齿轮油', allocated: 200, total: 200, unit: 'L' },
              { name: '超声波探伤仪', allocated: 1, total: 1, unit: '台' },
              { name: '推进器维保专家', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
