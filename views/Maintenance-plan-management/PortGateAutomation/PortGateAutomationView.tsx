import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PortGateAutomation/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-59]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-59';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { ScanLine, Truck } from 'lucide-react';

export const PortGateAutomationView: React.FC = () => {
  const [data, setData] = useState({
    truckPosition: 0,
    gateStatus: 'open' as 'open' | 'closed' | 'inspecting',
    isInspecting: false,
    ocrAccuracy: 99.5,
    rfidReadRate: 100
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isInspecting) {
          return {
            ...prev,
            truckPosition: 0,
            gateStatus: 'inspecting',
            ocrAccuracy: 0,
            rfidReadRate: 0
          };
        }
        
        // Simulate truck passing through
        const newPos = prev.truckPosition + 0.1;
        let newGateStatus = 'open' as 'open' | 'closed';
        if (newPos > 0.3 && newPos < 0.7) {
          newGateStatus = 'closed'; // Gate closes while processing
        }
        
        return {
          ...prev,
          truckPosition: newPos > 1 ? 0 : newPos,
          gateStatus: newGateStatus,
          ocrAccuracy: 98 + Math.random() * 1.5,
          rfidReadRate: 99 + Math.random() * 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleInspect = () => {
    setData(prev => ({ ...prev, isInspecting: !prev.isInspecting }));
  };

  const steps = [
    { time: '08:00', title: '封闭单侧车道，设置导流标识', status: 'done' },
    { time: '08:30', title: 'OCR 摄像头清洁与焦距校准', status: 'active' },
    { time: '09:30', title: 'RFID 天线发射功率测试', status: 'pending' },
    { time: '10:30', title: '地磅传感器标定与误差修正', status: 'pending' },
    { time: '11:30', title: '自动道闸电机及连杆润滑', status: 'pending' },
    { time: '13:00', title: '系统联调测试，恢复车道通行', status: 'pending' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-emerald-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 tracking-wider uppercase">
            港区自动化闸口系统巡检
          </h1>
          <p className="text-emerald-500/70 mt-2 font-mono text-sm">PORT AUTOMATED GATE SYSTEM INSPECTION</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleInspect}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isInspecting 
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ScanLine size={18} />
            {data.isInspecting ? '传感器深度巡检中' : '启动传感器深度巡检'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SciFiCard title="自动化闸口巡检流程" className="w-full">
          <div className="flex overflow-x-auto gap-4 pb-2 custom-scrollbar">
             {steps.map((step, i) => (
               <div key={i} className={`flex-none w-64 border p-4 rounded-lg transition-colors ${
                 step.status === 'done' ? 'bg-emerald-900/20 border-emerald-500/50' : 
                 step.status === 'active' ? 'bg-teal-900/40 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 
                 'bg-slate-900/50 border-slate-700'
               }`}>
                 <div className={`font-bold mb-2 ${step.status === 'done' ? 'text-emerald-500' : step.status === 'active' ? 'text-teal-400' : 'text-slate-500'}`}>
                   {step.time}
                 </div>
                 <div className="text-sm text-slate-300">{step.title}</div>
                 <div className={`mt-2 text-xs uppercase tracking-wider ${step.status === 'done' ? 'text-emerald-600' : step.status === 'active' ? 'text-teal-500' : 'text-slate-600'}`}>
                   {step.status}
                 </div>
               </div>
             ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="闸口 3D 交通流与传感器监控" className="h-[450px] relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className={`border px-3 py-1 rounded flex items-center gap-2 ${data.gateStatus === 'open' ? 'bg-emerald-900/80 border-emerald-500 text-emerald-400' : data.gateStatus === 'inspecting' ? 'bg-teal-900/80 border-teal-500 text-teal-400' : 'bg-red-900/80 border-red-500 text-red-400'}`}>
              <Truck size={14} />
              <span className="text-xs">闸口状态: {data.gateStatus.toUpperCase()}</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 mt-12 border border-emerald-500/20 rounded-lg overflow-hidden bg-[#1a2a2a]">
            <ThreeScene 
              truckPosition={data.truckPosition} 
              gateStatus={data.gateStatus} 
              isInspecting={data.isInspecting}
            />
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SciFiCard title="识别系统性能">
            <ParameterWidget parameters={[
              { label: 'OCR 车牌识别率', value: data.ocrAccuracy.toFixed(1), unit: '%', status: data.ocrAccuracy < 98 ? 'warning' : 'normal' },
              { label: 'RFID 标签读取率', value: data.rfidReadRate.toFixed(1), unit: '%', status: data.rfidReadRate < 99 ? 'warning' : 'normal' },
              { label: '平均过闸时间', value: '12.5', unit: 's', status: 'normal' }
            ]} />
          </SciFiCard>
          
          <SciFiCard title="机电设备状态">
            <ParameterWidget parameters={[
              { label: '道闸起落次数', value: '1452', unit: '次/日', status: 'normal' },
              { label: '地磅传感器偏差', value: '0.02', unit: '%', status: 'normal' },
              { label: '红外光幕状态', value: '正常', unit: '', status: 'normal' }
            ]} />
          </SciFiCard>

          <SciFiCard title="巡检工具与备件">
            <ResourceWidget resources={[
              { name: '高频 RFID 天线', allocated: 2, total: 2, unit: '个' },
              { name: '高清 OCR 摄像头', allocated: 1, total: 2, unit: '台' },
              { name: '道闸电机总成', allocated: 0, total: 1, unit: '套' },
              { name: '弱电系统工程师', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
