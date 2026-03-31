import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PortSubstationPreventive/ThreeScene';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Zap, AlertOctagon } from 'lucide-react';

export const PortSubstationPreventiveView: React.FC = () => {
  const [data, setData] = useState({
    voltage: 110,
    temperature: 45,
    isTesting: false,
    oilLevel: 85,
    gasPressure: 0.4
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isTesting) {
          return {
            ...prev,
            voltage: 110 + (Math.random() - 0.5) * 50, // Simulated test spikes
            temperature: Math.min(85, prev.temperature + 2),
            gasPressure: 0.4 + (Math.random() - 0.5) * 0.1
          };
        }
        return {
          ...prev,
          voltage: 110 + (Math.random() - 0.5) * 2,
          temperature: Math.max(45, prev.temperature - 1),
          gasPressure: 0.4
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTest = () => {
    setData(prev => ({ ...prev, isTesting: !prev.isTesting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            港区高压变电站预防性试验
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">PORT HIGH-VOLTAGE SUBSTATION PREVENTIVE TESTING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleTest}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isTesting 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <AlertOctagon size={18} />
            {data.isTesting ? '高压试验进行中' : '启动高压预防性试验'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className={`p-6 rounded-lg border transition-colors duration-500 ${data.isTesting ? 'bg-red-900/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-cyan-900/20 border-cyan-500/30'}`}>
            <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${data.isTesting ? 'text-red-400' : 'text-cyan-400'}`}>
              {data.isTesting ? <><AlertOctagon size={24} /> 警告：高压试验进行中</> : <><Zap size={24} /> 变电站运行正常</>}
            </h3>
            <p className="text-sm text-slate-300 opacity-80 mt-2">
              {data.isTesting 
                ? '当前正在进行耐压试验，请严格遵守《电气安全工作规程》，非试验人员禁止靠近警戒区域。' 
                : '系统处于正常监控状态，各项参数平稳，随时可启动预防性试验程序。'}
            </p>
          </div>

          <SciFiCard title="电气试验实时数据">
            <ParameterWidget parameters={[
              { label: '运行/试验电压', value: data.voltage.toFixed(1), unit: 'kV', status: data.isTesting ? 'warning' : 'normal' },
              { label: '变压器油温', value: data.temperature.toFixed(1), unit: '°C', status: data.temperature > 75 ? 'critical' : 'normal' },
              { label: 'SF6 气体压力', value: data.gasPressure.toFixed(2), unit: 'MPa', status: data.gasPressure < 0.35 ? 'warning' : 'normal' },
              { label: '油位指示', value: data.oilLevel.toFixed(0), unit: '%', status: 'normal' }
            ]} />
          </SciFiCard>

          <SciFiCard title="试验设备与人员调配">
            <ResourceWidget resources={[
              { name: '串联谐振耐压装置', allocated: 1, total: 1, unit: '套' },
              { name: '介质损耗测试仪', allocated: 1, total: 1, unit: '台' },
              { name: '绝缘防护服', allocated: 4, total: 4, unit: '套' },
              { name: '高压试验工程师', allocated: 3, total: 3, unit: '人' }
            ]} />
          </SciFiCard>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="主变压器 3D 状态监控" className="h-[450px] relative">
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-[#0a0a1a]">
              <ThreeScene 
                voltage={data.voltage} 
                temperature={data.temperature} 
                isTesting={data.isTesting} 
              />
            </div>
          </SciFiCard>

          <SciFiCard title="预防性试验标准流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '办理第一种工作票，布置安全措施', status: 'done' },
              { time: '09:00', title: '断开主变压器各侧断路器及隔离开关', status: 'active' },
              { time: '10:30', title: '进行绝缘电阻及吸收比测量', status: 'pending' },
              { time: '13:00', title: '介质损耗角正切值(tanδ)测量', status: 'pending' },
              { time: '15:00', title: '交流耐压试验 (核心环节)', status: 'pending' },
              { time: '17:30', title: '拆除试验接线，恢复设备，终结工作票', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
