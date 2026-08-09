import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/BerthFenderReplacement/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-51]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-51';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Anchor, ShieldAlert } from 'lucide-react';

export const BerthFenderReplacementView: React.FC = () => {
  const [data, setData] = useState({
    compression: 0,
    wearLevel: 85,
    isReplacing: false,
    impactForce: 0,
    vesselDistance: 15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReplacing) {
          return {
            ...prev,
            wearLevel: Math.max(0, prev.wearLevel - 2),
            compression: 0,
            impactForce: 0,
            vesselDistance: 20
          };
        }
        
        // Simulate berthing
        const newDistance = Math.max(0, prev.vesselDistance - 0.5);
        const newCompression = newDistance < 2 ? (2 - newDistance) * 20 : 0;
        
        return {
          ...prev,
          vesselDistance: newDistance <= 0 ? 15 : newDistance,
          compression: newCompression,
          impactForce: newCompression * 15,
          wearLevel: Math.min(100, prev.wearLevel + (newCompression > 0 ? 0.1 : 0))
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReplace = () => {
    setData(prev => ({ ...prev, isReplacing: !prev.isReplacing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-teal-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 tracking-wider uppercase">
            港口泊位防冲板/护舷更换
          </h1>
          <p className="text-teal-500/70 mt-2 font-mono text-sm">BERTH FENDER REPLACEMENT & IMPACT MONITORING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleReplace}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isReplacing 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Anchor size={18} />
            {data.isReplacing ? '更换作业进行中' : '启动护舷更换作业'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SciFiCard title="全景泊位 3D 视图" className="h-[450px] w-full relative">
          <div className="absolute inset-0 m-4 border border-teal-500/20 rounded-lg overflow-hidden bg-[#0a1118]">
            <ThreeScene
              compression={data.compression}
              wearLevel={data.wearLevel}
              isReplacing={data.isReplacing}
            />
          </div>
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SciFiCard title="受力与状态参数" className="h-full">
            <ParameterWidget parameters={[
              { label: '实时撞击力', value: data.impactForce.toFixed(0), unit: 'kN', status: data.impactForce > 400 ? 'warning' : 'normal' },
              { label: '护舷压缩量', value: data.compression.toFixed(1), unit: '%', status: data.compression > 30 ? 'warning' : 'normal' },
              { label: '船舶靠泊距离', value: data.vesselDistance.toFixed(1), unit: 'm', status: 'normal' },
              { label: '护舷磨损度', value: data.wearLevel.toFixed(1), unit: '%', status: data.wearLevel > 80 ? 'critical' : 'normal' }
            ]} />
          </SciFiCard>

          <SciFiCard title="标准更换作业流程" className="h-full">
            <TimelineWidget steps={[
              { time: '07:00', title: '封锁泊位，设置水上警戒线', status: 'done' },
              { time: '08:30', title: '起重船就位，拆卸旧护舷紧固件', status: 'active' },
              { time: '11:00', title: '吊装移除旧防冲板及橡胶体', status: 'pending' },
              { time: '14:00', title: '清理码头壁，安装新护舷支架', status: 'pending' },
              { time: '16:30', title: '吊装新护舷并进行扭矩紧固', status: 'pending' },
              { time: '18:00', title: '验收测试，恢复泊位使用', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="作业资源调配" className="h-full">
            <ResourceWidget resources={[
              { name: '超级鼓型橡胶护舷', allocated: 2, total: 2, unit: '套' },
              { name: 'UHMW-PE 防冲板', allocated: 2, total: 2, unit: '块' },
              { name: '500吨级起重船', allocated: 1, total: 1, unit: '艘' },
              { name: '水下潜水作业组', allocated: 1, total: 1, unit: '组' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全与风险评估" className="h-full">
            <RiskWidget risks={[
              { level: data.wearLevel > 80 ? 'high' : 'medium', desc: `护舷磨损度 ${data.wearLevel.toFixed(1)}%，${data.wearLevel > 80 ? '存在破裂风险，需立即更换' : '持续监测中'}` },
              { level: 'high', desc: '水上起重作业风险：需密切关注风浪情况' },
              { level: 'medium', desc: '潜水作业风险：水下能见度低，需加强通讯' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
