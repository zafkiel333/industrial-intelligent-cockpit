import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HVACSystemCleaning/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-61]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-61';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Wind, Bot } from 'lucide-react';

export const HVACSystemCleaningView: React.FC = () => {
  const [data, setData] = useState({
    robotPosition: 0, // 0 to 100%
    dustLevel: 85,
    isCleaning: false,
    pm25: 120,
    airVelocity: 2.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isCleaning) {
          const newPos = Math.min(100, prev.robotPosition + 1);
          return {
            ...prev,
            robotPosition: newPos,
            dustLevel: Math.max(10, 85 - (newPos * 0.75)),
            pm25: Math.max(15, 120 - newPos),
            airVelocity: Math.min(6.5, 2.5 + (newPos * 0.04))
          };
        }
        return {
          ...prev,
          pm25: prev.pm25 + (Math.random() - 0.5) * 5,
          airVelocity: prev.airVelocity + (Math.random() - 0.5) * 0.2
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleClean = () => {
    setData(prev => {
      if (!prev.isCleaning && prev.robotPosition >= 100) {
        // Reset if finished
        return { ...prev, robotPosition: 0, dustLevel: 85, pm25: 120, airVelocity: 2.5, isCleaning: true };
      }
      return { ...prev, isCleaning: !prev.isCleaning };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-teal-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 tracking-wider uppercase">
            中央空调通风系统清洗维保
          </h1>
          <p className="text-teal-500/70 mt-2 font-mono text-sm">HVAC DUCT ROBOTIC CLEANING & MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleClean}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isCleaning 
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bot size={18} />
            {data.isCleaning ? '清洁机器人作业中' : data.robotPosition >= 100 ? '重新开始清洁' : '启动管道清洁机器人'}
          </button>
        </div>
      </div>

      {/* Top Half: Full Width 3D View */}
      <SciFiCard title="通风管道 3D 机器人作业视图" className="w-full h-[400px] relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
            <Wind size={14} className={data.pm25 > 50 ? 'text-orange-500' : 'text-teal-500'} />
            <span className="text-xs text-slate-300">清洁进度: {data.robotPosition.toFixed(0)}%</span>
          </div>
        </div>
        <div className="absolute inset-0 m-4 mt-12 border border-teal-500/20 rounded-lg overflow-hidden bg-[#0a1515]">
          <ThreeScene 
            robotPosition={data.robotPosition} 
            dustLevel={data.dustLevel} 
            isCleaning={data.isCleaning}
          />
        </div>
        <div className="absolute bottom-4 right-4 z-20">
          <ModelLibraryLink url={MODEL_LIB_URL} />
        </div>
      </SciFiCard>

      {/* Bottom Half: 4 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
        <SciFiCard title="空气质量与风速" className="h-full">
          <ParameterWidget parameters={[
            { label: '管道内 PM2.5', value: data.pm25.toFixed(0), unit: 'μg/m³', status: data.pm25 > 75 ? 'warning' : 'normal' },
            { label: '末端送风风速', value: data.airVelocity.toFixed(1), unit: 'm/s', status: data.airVelocity < 4.0 ? 'warning' : 'normal' },
            { label: '滤网压差', value: data.isCleaning ? '120' : '350', unit: 'Pa', status: 'normal' }
          ]} />
        </SciFiCard>

        <SciFiCard title="机器人遥测数据" className="h-full">
          <ParameterWidget parameters={[
            { label: '作业深度', value: (data.robotPosition * 0.5).toFixed(1), unit: 'm', status: 'normal' },
            { label: '毛刷转速', value: data.isCleaning ? '800' : '0', unit: 'rpm', status: 'normal' },
            { label: '电池电量', value: (100 - data.robotPosition * 0.4).toFixed(0), unit: '%', status: 'normal' }
          ]} />
        </SciFiCard>

        <SciFiCard title="清洗作业流程" className="h-full overflow-y-auto">
          <TimelineWidget steps={[
            { time: '08:00', title: '关闭空调主机，切断风机电源', status: data.robotPosition > 0 ? 'done' : 'active' },
            { time: '09:00', title: '拆卸风口百叶，放入清洁机器人', status: data.robotPosition > 0 ? 'done' : 'pending' },
            { time: '10:00', title: '机器人管道内刷洗及负压吸尘', status: data.isCleaning ? 'active' : data.robotPosition >= 100 ? 'done' : 'pending' },
            { time: '14:00', title: '喷洒二氧化氯消毒剂进行消毒', status: data.robotPosition >= 100 ? 'active' : 'pending' },
            { time: '16:00', title: '更换初效/中效过滤网', status: 'pending' },
            { time: '17:30', title: '恢复供电，测定风量及空气质量', status: 'pending' }
          ]} />
        </SciFiCard>

        <SciFiCard title="资源与安全管控" className="h-full">
          <ResourceWidget resources={[
            { name: '智能管道清洁机器人', allocated: 1, total: 1, unit: '台' },
            { name: '大功率负压吸尘器', allocated: 2, total: 2, unit: '台' },
            { name: '初效/中效过滤网', allocated: 24, total: 24, unit: '片' }
          ]} />
          <div className="mt-4">
            <RiskWidget risks={[
              { level: 'medium', desc: '粉尘外溢：作业区域必须做好塑料薄膜密封隔离' },
              { level: 'low', desc: '高处作业：拆卸天花板风口需使用合格人字梯' }
            ]} />
          </div>
        </SciFiCard>
      </div>
    </div>
  );
};
