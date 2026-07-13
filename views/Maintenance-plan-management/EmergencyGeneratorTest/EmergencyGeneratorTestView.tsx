import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/EmergencyGeneratorTest/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-63]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-63';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Power, Activity } from 'lucide-react';

export const EmergencyGeneratorTestView: React.FC = () => {
  const [data, setData] = useState({
    loadPercentage: 0,
    rpm: 0,
    isTesting: false,
    voltage: 0,
    frequency: 0,
    oilPressure: 0,
    fuelConsumption: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isTesting) {
          // Ramp up load in steps
          const targetLoad = prev.loadPercentage < 25 ? 25 : 
                             prev.loadPercentage < 50 ? 50 : 
                             prev.loadPercentage < 75 ? 75 : 
                             prev.loadPercentage < 100 ? 100 : 110; // 110% overload test
          
          const newLoad = Math.min(targetLoad, prev.loadPercentage + 2);
          
          return {
            ...prev,
            loadPercentage: newLoad,
            rpm: 1500 + (Math.random() - 0.5) * 5, // 1500 RPM for 50Hz
            voltage: 400 + (Math.random() - 0.5) * 2,
            frequency: 50 + (Math.random() - 0.5) * 0.1,
            oilPressure: 4.5 + (Math.random() - 0.5) * 0.1,
            fuelConsumption: 50 + (newLoad * 1.5) + (Math.random() - 0.5) * 2
          };
        }
        
        // Cooldown
        return {
          ...prev,
          loadPercentage: Math.max(0, prev.loadPercentage - 5),
          rpm: prev.loadPercentage > 0 ? 1500 : 0,
          voltage: prev.loadPercentage > 0 ? 400 : 0,
          frequency: prev.loadPercentage > 0 ? 50 : 0,
          oilPressure: prev.loadPercentage > 0 ? 4.5 : 0,
          fuelConsumption: 0
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTest = () => {
    setData(prev => {
      if (!prev.isTesting && prev.loadPercentage >= 110) {
        return { ...prev, loadPercentage: 0, isTesting: true };
      }
      return { ...prev, isTesting: !prev.isTesting };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-amber-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-wider uppercase">
            应急柴油发电机带载测试
          </h1>
          <p className="text-amber-500/70 mt-2 font-mono text-sm">EMERGENCY DIESEL GENERATOR LOAD BANK TESTING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleTest}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isTesting 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Power size={18} />
            {data.isTesting ? '假负载阶跃测试中' : data.loadPercentage >= 110 ? '重新开始测试' : '启动假负载测试'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left: Telemetry Data */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6">
          <SciFiCard title="发电机组遥测核心数据" className="flex-1">
            <div className="flex flex-col h-full justify-around py-4">
              <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
                <span className="text-slate-400 text-lg">输出功率负载</span>
                <span className={`text-5xl font-bold ${data.loadPercentage > 100 ? 'text-red-500' : 'text-amber-400'}`}>
                  {data.loadPercentage.toFixed(0)} <span className="text-xl">%</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
                <span className="text-slate-400 text-lg">机组转速</span>
                <span className="text-4xl font-bold text-yellow-500">
                  {data.rpm.toFixed(0)} <span className="text-xl">RPM</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
                <span className="text-slate-400 text-lg">输出电压 (L-L)</span>
                <span className={`text-4xl font-bold ${data.voltage < 380 && data.isTesting ? 'text-red-500' : 'text-amber-400'}`}>
                  {data.voltage.toFixed(1)} <span className="text-xl">V</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
                <span className="text-slate-400 text-lg">输出频率</span>
                <span className={`text-4xl font-bold ${Math.abs(data.frequency - 50) > 1 && data.isTesting ? 'text-red-500' : 'text-amber-400'}`}>
                  {data.frequency.toFixed(2)} <span className="text-xl">Hz</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
                <span className="text-slate-400 text-lg">燃油消耗率</span>
                <span className="text-4xl font-bold text-orange-400">
                  {data.fuelConsumption.toFixed(1)} <span className="text-xl">L/h</span>
                </span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="负载测试流程" className="flex-1 overflow-y-auto">
            <TimelineWidget steps={[
              { time: '08:00', title: '连接假负载箱，检查燃油及冷却液位', status: data.isTesting ? 'done' : 'pending' },
              { time: '09:00', title: '空载启动，暖机运行并检查油压', status: data.loadPercentage > 0 ? 'done' : data.isTesting ? 'active' : 'pending' },
              { time: '09:30', title: '25% 负载阶跃测试 (运行 30 分钟)', status: data.loadPercentage >= 25 ? 'done' : data.loadPercentage > 0 ? 'active' : 'pending' },
              { time: '10:00', title: '50% 负载阶跃测试 (运行 30 分钟)', status: data.loadPercentage >= 50 ? 'done' : data.loadPercentage >= 25 ? 'active' : 'pending' },
              { time: '10:30', title: '75% 负载阶跃测试 (运行 60 分钟)', status: data.loadPercentage >= 75 ? 'done' : data.loadPercentage >= 50 ? 'active' : 'pending' },
              { time: '11:30', title: '100% 满载测试及 110% 超载测试', status: data.loadPercentage >= 110 ? 'done' : data.loadPercentage >= 75 ? 'active' : 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Right: 3D Scene & Widgets */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          <SciFiCard title="发电机组 3D 运行监控" className="flex-1 relative min-h-[400px]">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <Activity size={14} className={data.loadPercentage > 100 ? 'text-red-500' : 'text-amber-500'} />
                <span className="text-xs text-slate-300">机油压力: {data.oilPressure.toFixed(2)} Bar</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 mt-12 border border-amber-500/20 rounded-lg overflow-hidden bg-[#1a1505]">
              <ThreeScene 
                loadPercentage={data.loadPercentage} 
                rpm={data.rpm} 
                isTesting={data.isTesting}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="测试资源调配">
              <ResourceWidget resources={[
                { name: '1000kW 智能假负载箱', allocated: 1, total: 1, unit: '台' },
                { name: '高压耐火电缆', allocated: 100, total: 100, unit: '米' },
                { name: '柴油发电机组维保专员', allocated: 2, total: 2, unit: '人' }
              ]} />
            </SciFiCard>
            <SciFiCard title="高负荷运行风险">
              <RiskWidget risks={[
                { level: data.loadPercentage > 100 ? 'high' : 'medium', desc: `当前负载 ${data.loadPercentage.toFixed(0)}%，${data.loadPercentage > 100 ? '超载运行，密切关注排气温度' : '正常测试范围'}` },
                { level: 'high', desc: '高温烫伤风险：排气管及涡轮增压器区域禁止触摸' },
                { level: 'medium', desc: '噪音危害：进入机房必须佩戴防噪音耳罩' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
