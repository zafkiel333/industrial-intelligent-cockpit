import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/UndergroundRefugeChamber/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-38]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-38';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const UndergroundRefugeChamberView: React.FC = () => {
  const [data, setData] = useState({
    oxygenLevel: 20.9,
    pressure: 101.3,
    isTesting: false,
    coLevel: 0,
    temp: 22.5,
    battery: 100
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isTesting) {
          return {
            ...prev,
            oxygenLevel: Math.max(18, prev.oxygenLevel - 0.1),
            pressure: Math.min(120, prev.pressure + 1),
            coLevel: Math.max(0, prev.coLevel - 1),
            temp: 22.5 + Math.random(),
            battery: Math.max(0, prev.battery - 0.5)
          };
        }
        return {
          ...prev,
          oxygenLevel: 20.9,
          pressure: 101.3 + Math.random() * 0.5,
          coLevel: 0 + Math.random() * 2,
          temp: 22.5 + Math.random() * 0.5,
          battery: Math.min(100, prev.battery + 1)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTesting = () => {
    setData(prev => ({ ...prev, isTesting: !prev.isTesting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            井下避难硐室维保计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">UNDERGROUND REFUGE CHAMBER MAINTENANCE PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleTesting}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isTesting 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isTesting ? '结束密闭测试 (开启舱门)' : '启动密闭测试 (关闭舱门)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="避难硐室 3D 剖面监测" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isTesting ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isTesting ? '密闭承压测试中' : '待机值守模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                oxygenLevel={data.oxygenLevel} 
                pressure={data.pressure} 
                isTesting={data.isTesting}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '舱内氧气浓度', value: data.oxygenLevel.toFixed(1), unit: '%', status: data.oxygenLevel < 19.5 ? 'critical' : 'normal' },
              { label: '舱内正压值', value: data.pressure.toFixed(1), unit: 'kPa', status: data.pressure < 100 && data.isTesting ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '一氧化碳浓度', value: data.coLevel.toFixed(1), unit: 'ppm', status: data.coLevel > 24 ? 'critical' : 'normal' },
              { label: '舱内温度', value: data.temp.toFixed(1), unit: '°C', status: data.temp > 30 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '备用电源电量', value: data.battery.toFixed(0), unit: '%', status: data.battery < 80 ? 'warning' : 'normal' },
              { label: '额定避险人数', value: '50', unit: '人', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="维保测试流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'T-0', title: '检查硐室外部结构及防护门', status: data.isTesting ? 'done' : 'pending' },
              { time: 'T+15m', title: '关闭过渡室及主舱防护门', status: data.isTesting ? 'active' : 'pending' },
              { time: 'T+30m', title: '启动压风供氧系统测试', status: 'pending' },
              { time: 'T+60m', title: '检查环境监测系统联动', status: 'pending' },
              { time: 'T+90m', title: '测试备用电源及通讯系统', status: 'pending' },
              { time: 'T+120m', title: '开启舱门、恢复待机状态', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="维保资源配置" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '通风安全员', allocated: 2, total: 2, unit: '人' },
              { name: '机电维修工', allocated: 1, total: 1, unit: '人' },
              { name: '医用氧气瓶', allocated: 10, total: 10, unit: '瓶' },
              { name: 'CO2吸收剂', allocated: 50, total: 50, unit: 'kg' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '密闭失效风险：重点检查门封胶条老化' },
              { level: 'high', desc: '供氧中断风险：确认压风管路无泄漏' },
              { level: 'medium', desc: '通讯中断：测试直通地面电话及广播' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
