import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ShipLoaderChute/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-50]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-50';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { CloudRain, Wind } from 'lucide-react';

export const ShipLoaderChuteView: React.FC = () => {
  const [data, setData] = useState({
    chuteExtension: 40,
    dustLevel: 85,
    isSpraying: false,
    waterPressure: 0,
    materialFlow: 4500
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isSpraying) {
          return {
            ...prev,
            dustLevel: Math.max(15, prev.dustLevel - 5),
            waterPressure: 4.5 + (Math.random() - 0.5) * 0.2,
            chuteExtension: Math.min(100, prev.chuteExtension + 1)
          };
        }
        return {
          ...prev,
          dustLevel: Math.min(95, prev.dustLevel + 2),
          waterPressure: 0,
          chuteExtension: Math.max(0, prev.chuteExtension - 1)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSpray = () => {
    setData(prev => ({ ...prev, isSpraying: !prev.isSpraying }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            装船机溜筒及防尘系统维护
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">SHIP LOADER CHUTE & DUST SUPPRESSION SYSTEM MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleSpray}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isSpraying 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <CloudRain size={18} />
            {data.isSpraying ? '防尘水雾系统运行中' : '启动防尘水雾系统'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
        <SciFiCard title="3D 溜筒形态监控" className="h-full relative flex flex-col">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
              <Wind size={14} className={data.dustLevel > 70 ? 'text-orange-500' : 'text-cyan-500'} />
              <span className="text-xs text-slate-300">粉尘浓度: {data.dustLevel.toFixed(1)} mg/m³</span>
            </div>
          </div>
          <div className="flex-1 relative border border-cyan-500/20 rounded-lg overflow-hidden bg-[#0a192f] mt-4 h-full">
            <ThreeScene 
              chuteExtension={data.chuteExtension} 
              dustLevel={data.dustLevel} 
              isSpraying={data.isSpraying}
            />
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
          <SciFiCard title="防尘系统参数">
            <ParameterWidget parameters={[
              { label: '水泵供水压力', value: data.waterPressure.toFixed(2), unit: 'MPa', status: data.isSpraying && data.waterPressure < 4.0 ? 'warning' : 'normal' },
              { label: '溜筒伸缩行程', value: data.chuteExtension.toFixed(0), unit: '%', status: 'normal' },
              { label: '物料下料流量', value: data.materialFlow.toFixed(0), unit: 't/h', status: 'normal' }
            ]} />
          </SciFiCard>
          
          <SciFiCard title="溜筒及防尘系统维护计划">
            <TimelineWidget steps={[
              { time: '08:00', title: '停止装船作业，排空溜筒物料', status: 'done' },
              { time: '09:30', title: '溜筒伸缩机构润滑与钢丝绳检查', status: 'active' },
              { time: '11:00', title: '防尘水雾喷嘴拆卸与超声波清洗', status: 'pending' },
              { time: '13:30', title: '水泵压力测试与管路防漏检查', status: 'pending' },
              { time: '15:00', title: '溜筒耐磨衬板厚度测量与更换', status: 'pending' },
              { time: '17:00', title: '系统联动空载测试，恢复作业', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="维保资源调配">
            <ResourceWidget resources={[
              { name: '高压水雾喷嘴', allocated: 24, total: 24, unit: '个' },
              { name: '聚氨酯耐磨衬板', allocated: 12, total: 15, unit: '块' },
              { name: '高空作业车', allocated: 1, total: 1, unit: '台' },
              { name: '防尘系统维保专员', allocated: 3, total: 3, unit: '人' }
            ]} />
          </SciFiCard>

          <SciFiCard title="环境与安全监控">
            <RiskWidget risks={[
              { level: data.dustLevel > 80 ? 'high' : 'medium', desc: `当前粉尘浓度 ${data.dustLevel.toFixed(1)} mg/m³，${data.dustLevel > 80 ? '超标，请立即开启水雾' : '在可控范围内'}` },
              { level: 'medium', desc: '高空作业风险：溜筒检修需佩戴防坠器' },
              { level: 'low', desc: '喷嘴堵塞风险：定期清理水雾喷嘴' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
