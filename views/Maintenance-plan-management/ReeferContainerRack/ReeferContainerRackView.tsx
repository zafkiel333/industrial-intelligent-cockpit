import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ReeferContainerRack/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-53]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-53';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Zap, Thermometer } from 'lucide-react';

export const ReeferContainerRackView: React.FC = () => {
  const [data, setData] = useState({
    activePlugs: 24,
    avgTemp: -18,
    isTesting: false,
    voltage: 400,
    powerLoad: 75
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isTesting) {
          return {
            ...prev,
            activePlugs: Math.max(0, prev.activePlugs - 2),
            avgTemp: Math.min(5, prev.avgTemp + 1),
            voltage: 0,
            powerLoad: 0
          };
        }
        return {
          ...prev,
          activePlugs: Math.min(32, prev.activePlugs + 1),
          avgTemp: Math.max(-22, prev.avgTemp - 0.5),
          voltage: 400 + (Math.random() - 0.5) * 10,
          powerLoad: 75 + (Math.random() - 0.5) * 5
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
      <div className="mb-6 flex justify-between items-end border-b border-blue-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 tracking-wider uppercase">
            冷藏集装箱插座架检修
          </h1>
          <p className="text-blue-500/70 mt-2 font-mono text-sm">REEFER CONTAINER RACK ELECTRICAL MAINTENANCE</p>
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
            <Zap size={18} />
            {data.isTesting ? '断电检修模式进行中' : '启动断电检修模式'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4">
        <SciFiCard className="lg:col-span-3">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-slate-400 text-sm mb-2">供电电压</span>
            <span className={`text-4xl font-bold ${data.voltage < 380 && !data.isTesting ? 'text-red-500' : 'text-blue-400'}`}>
              {data.voltage.toFixed(0)} <span className="text-lg">V</span>
            </span>
          </div>
        </SciFiCard>
        <SciFiCard className="lg:col-span-3">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-slate-400 text-sm mb-2">总负载率</span>
            <span className={`text-4xl font-bold ${data.powerLoad > 90 ? 'text-orange-500' : 'text-blue-400'}`}>
              {data.powerLoad.toFixed(1)} <span className="text-lg">%</span>
            </span>
          </div>
        </SciFiCard>
        <SciFiCard className="lg:col-span-3">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-slate-400 text-sm mb-2">活跃插头数</span>
            <span className="text-4xl font-bold text-cyan-400">
              {data.activePlugs} <span className="text-lg">/ 32</span>
            </span>
          </div>
        </SciFiCard>
        <SciFiCard className="lg:col-span-3">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-slate-400 text-sm mb-2">平均箱温</span>
            <span className={`text-4xl font-bold ${data.avgTemp > -10 ? 'text-red-500' : 'text-blue-400'}`}>
              {data.avgTemp.toFixed(1)} <span className="text-lg">°C</span>
            </span>
          </div>
        </SciFiCard>

        <SciFiCard title="冷藏箱架 3D 供电拓扑监控" className="lg:col-span-8 h-[500px] relative">
          <div className="absolute inset-0 m-4 border border-blue-500/20 rounded-lg overflow-hidden bg-[#0a1128]">
            <ThreeScene
              activePlugs={data.activePlugs}
              avgTemp={data.avgTemp}
              isTesting={data.isTesting}
            />
          </div>
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>
        
        <SciFiCard title="插座架检修流程" className="lg:col-span-4 h-[500px] overflow-y-auto">
          <TimelineWidget steps={[
            { time: '09:00', title: '通知货主，冷藏箱短时断电预警', status: 'done' },
            { time: '09:30', title: '切断主电源，悬挂"禁止合闸"标示牌', status: 'active' },
            { time: '10:00', title: '使用万用表确认无电压，开始检修', status: 'pending' },
            { time: '11:30', title: '更换老化插座及防水密封圈', status: 'pending' },
            { time: '14:00', title: '测量绝缘电阻及接地电阻', status: 'pending' },
            { time: '15:30', title: '拆除接地线，恢复供电，逐个送电测试', status: 'pending' }
          ]} />
        </SciFiCard>

        <SciFiCard title="电气维保物资" className="lg:col-span-6">
          <ResourceWidget resources={[
            { name: 'IP67 工业插座', allocated: 8, total: 10, unit: '个' },
            { name: '防水密封胶圈', allocated: 32, total: 50, unit: '套' },
            { name: '绝缘电阻测试仪', allocated: 1, total: 1, unit: '台' },
            { name: '高压电工', allocated: 2, total: 2, unit: '人' }
          ]} />
        </SciFiCard>
        
        <SciFiCard title="电气作业安全管控" className="lg:col-span-6">
          <RiskWidget risks={[
            { level: data.avgTemp > -10 ? 'high' : 'medium', desc: `冷藏箱平均温度 ${data.avgTemp.toFixed(1)}°C，${data.avgTemp > -10 ? '温度过高，可能导致货物变质' : '在安全范围内'}` },
            { level: 'high', desc: '触电风险：必须严格执行断电、验电、接地程序' },
            { level: 'medium', desc: '高空作业风险：插座架高层检修需系好安全带' }
          ]} />
        </SciFiCard>
      </div>
    </div>
  );
};
