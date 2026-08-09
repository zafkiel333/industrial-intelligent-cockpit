import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/GasMonitoringCalibration/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-39]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-39';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const GasMonitoringCalibrationView: React.FC = () => {
  const [data, setData] = useState({
    gasLevel: 0.45,
    isCalibrating: false,
    accuracy: 92,
    sensorLife: 65,
    responseDelay: 1.2,
    lastCalibrated: '14天前'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isCalibrating) {
          return {
            ...prev,
            accuracy: Math.min(99.9, prev.accuracy + 0.5),
            gasLevel: 1.0, // Standard gas concentration
            responseDelay: Math.max(0.5, prev.responseDelay - 0.1)
          };
        }
        return {
          ...prev,
          gasLevel: Math.max(0, 0.45 + (Math.random() - 0.5) * 0.2),
          accuracy: Math.max(80, prev.accuracy - 0.01),
          sensorLife: Math.max(0, prev.sensorLife - 0.05),
          responseDelay: Math.min(3.0, prev.responseDelay + 0.01)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleCalibration = () => {
    setData(prev => ({ ...prev, isCalibrating: !prev.isCalibrating }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            瓦斯监控系统探头标定计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">GAS MONITORING SYSTEM PROBE CALIBRATION PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleCalibration}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isCalibrating 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isCalibrating ? '完成标定 (恢复监测)' : '启动标定 (通入标准气)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="瓦斯探头 3D 标定模拟" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isCalibrating ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isCalibrating ? '标准气标定模式' : '环境监测模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                gasLevel={data.gasLevel} 
                isCalibrating={data.isCalibrating} 
                accuracy={data.accuracy}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '实时瓦斯浓度', value: data.gasLevel.toFixed(2), unit: '%', status: data.gasLevel > 1.0 && !data.isCalibrating ? 'critical' : data.gasLevel > 0.8 && !data.isCalibrating ? 'warning' : 'normal' },
              { label: '测量准确度', value: data.accuracy.toFixed(1), unit: '%', status: data.accuracy < 95 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '传感器剩余寿命', value: data.sensorLife.toFixed(1), unit: '%', status: data.sensorLife < 20 ? 'warning' : 'normal' },
              { label: '响应延迟', value: data.responseDelay.toFixed(1), unit: 's', status: data.responseDelay > 2.0 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '报警阈值设定', value: '1.0', unit: '%', status: 'normal' },
              { label: '断电阈值设定', value: '1.5', unit: '%', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="标定作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'T-0', title: '系统解除报警及断电控制', status: data.isCalibrating ? 'done' : 'pending' },
              { time: 'T+5m', title: '清洁探头防尘罩', status: data.isCalibrating ? 'active' : 'pending' },
              { time: 'T+10m', title: '通入新鲜空气调零', status: 'pending' },
              { time: 'T+15m', title: '通入1.0%标准瓦斯气', status: 'pending' },
              { time: 'T+20m', title: '调节电位器校准示值', status: 'pending' },
              { time: 'T+25m', title: '恢复系统联动控制', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="标定资源配置" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '监控维护工', allocated: 2, total: 2, unit: '人' },
              { name: '1.0%标准气样', allocated: 1, total: 1, unit: '瓶' },
              { name: '便携式校验仪', allocated: 1, total: 1, unit: '台' },
              { name: '备用催化元件', allocated: 5, total: 5, unit: '个' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '误断电风险：标定前必须解除控制逻辑' },
              { level: 'high', desc: '漏报风险：标定期间需安排专人便携检测' },
              { level: 'medium', desc: '标准气泄漏：保持通风良好' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
