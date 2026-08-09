import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/FireExtinguishingSystem/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-62]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-62';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Flame, ScanLine } from 'lucide-react';

export const FireExtinguishingSystemView: React.FC = () => {
  const [data, setData] = useState({
    scanIndex: 0,
    pressureLevel: 100, // %
    isScanning: false,
    roomTemp: 22,
    systemStatus: 'Standby'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isScanning) {
          const nextIndex = (prev.scanIndex + 1) % 6;
          // Simulate cylinder #3 having low pressure
          const newPressure = nextIndex === 3 ? 75 : 100 + (Math.random() - 0.5) * 2;
          return {
            ...prev,
            scanIndex: nextIndex,
            pressureLevel: newPressure,
            systemStatus: newPressure < 80 ? 'Warning: Low Pressure Detected' : 'Scanning...'
          };
        }
        return {
          ...prev,
          roomTemp: 22 + (Math.random() - 0.5) * 1,
          systemStatus: 'Standby'
        };
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleScan = () => {
    setData(prev => ({ ...prev, isScanning: !prev.isScanning, scanIndex: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-red-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 tracking-wider uppercase">
            气体灭火系统钢瓶检测排期
          </h1>
          <p className="text-red-500/70 mt-2 font-mono text-sm">IG541 / FM200 FIRE EXTINGUISHING CYLINDER INSPECTION</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleScan}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isScanning 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ScanLine size={18} />
            {data.isScanning ? '停止超声波探伤扫描' : '启动钢瓶矩阵自动扫描'}
          </button>
        </div>
      </div>

      {/* 2x2 Grid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Top Left: 3D Scene */}
        <SciFiCard title="钢瓶矩阵 3D 扫描监控" className="h-[400px] relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className={`border px-3 py-1 rounded flex items-center gap-2 ${data.pressureLevel < 80 ? 'bg-red-900/80 border-red-500 text-red-400' : 'bg-emerald-900/80 border-emerald-500 text-emerald-400'}`}>
              <Flame size={14} />
              <span className="text-xs">{data.systemStatus}</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 mt-12 border border-red-500/20 rounded-lg overflow-hidden bg-[#110505]">
            <ThreeScene 
              scanIndex={data.scanIndex} 
              pressureLevel={data.pressureLevel} 
              isScanning={data.isScanning}
            />
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>

        {/* Top Right: Cylinder Status Matrix */}
        <SciFiCard title="钢瓶阵列实时参数" className="h-[400px] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 p-2">
            {[0, 1, 2, 3, 4, 5].map(i => {
              const isCurrent = data.isScanning && data.scanIndex === i;
              const isWarning = i === 3 && data.isScanning; // Simulate cylinder 3 issue
              return (
                <div key={i} className={`p-4 rounded-lg border transition-all ${
                  isCurrent ? 'bg-rose-900/40 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
                  isWarning ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/50 border-slate-700'
                }`}>
                  <div className="text-slate-400 text-xs mb-1">Cylinder #{i + 1}</div>
                  <div className={`text-2xl font-bold ${isWarning ? 'text-red-500' : 'text-emerald-400'}`}>
                    {isCurrent ? data.pressureLevel.toFixed(1) : isWarning ? '75.2' : '100.0'} <span className="text-sm">%</span>
                  </div>
                  <div className="text-xs mt-2 text-slate-500">15.0 MPa (20°C)</div>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <ParameterWidget parameters={[
              { label: '钢瓶间环境温度', value: data.roomTemp.toFixed(1), unit: '°C', status: 'normal' },
              { label: '启动气瓶压力', value: '6.0', unit: 'MPa', status: 'normal' }
            ]} />
          </div>
        </SciFiCard>

        {/* Bottom Left: Timeline */}
        <SciFiCard title="年度检测与充装流程" className="h-[350px] overflow-y-auto">
          <TimelineWidget steps={[
            { time: '08:00', title: '系统切换至手动模式，断开启动电磁阀', status: data.isScanning ? 'done' : 'pending' },
            { time: '09:00', title: '使用超声波液位计检测灭火剂余量', status: data.isScanning ? 'active' : 'pending' },
            { time: '11:00', title: '拆卸失压钢瓶 (#4)，运往专业充装站', status: 'pending' },
            { time: '14:00', title: '钢瓶水压试验及气密性检测', status: 'pending' },
            { time: '16:00', title: '重新充装 IG541 气体，运回并安装', status: 'pending' },
            { time: '17:30', title: '连接启动管路，恢复系统自动状态', status: 'pending' }
          ]} />
        </SciFiCard>

        {/* Bottom Right: Resources & Risks */}
        <div className="flex flex-col gap-6">
          <SciFiCard title="维保资源调配" className="flex-1">
            <ResourceWidget resources={[
              { name: '超声波液位计/探伤仪', allocated: 1, total: 1, unit: '台' },
              { name: 'IG541 备用钢瓶', allocated: 2, total: 2, unit: '瓶' },
              { name: '特种设备检验员', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>
          <SciFiCard title="高压气体作业管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '物理爆炸风险：搬运钢瓶必须佩戴安全帽，严禁撞击' },
              { level: 'high', desc: '误喷放风险：检修前必须物理断开启动电磁阀连线' },
              { level: 'medium', desc: '窒息风险：钢瓶间必须保持通风良好' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
