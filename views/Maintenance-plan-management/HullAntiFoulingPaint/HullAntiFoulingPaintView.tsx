import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HullAntiFoulingPaint/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HullAntiFoulingPaintView: React.FC = () => {
  const [data, setData] = useState({
    paintProgress: 15,
    isPainting: false,
    humidity: 65,
    temperature: 22,
    paintConsumption: 450,
    vocEmissions: 12.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isPainting) {
          return {
            ...prev,
            paintProgress: Math.min(100, prev.paintProgress + 0.5),
            humidity: Math.min(95, prev.humidity + (Math.random() - 0.2)), // Spraying might increase local humidity slightly
            paintConsumption: prev.paintConsumption + 5.5,
            vocEmissions: prev.vocEmissions + 0.8
          };
        }
        return {
          ...prev,
          humidity: 65 + (Math.random() - 0.5) * 5,
          temperature: 22 + (Math.random() - 0.5) * 2,
          vocEmissions: Math.max(0, prev.vocEmissions - 0.1) // Dissipates over time
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePaint = () => {
    setData(prev => ({ ...prev, isPainting: !prev.isPainting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-red-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600 tracking-wider uppercase">
            船体防污漆进坞重涂排程
          </h1>
          <p className="text-red-500/70 mt-2 font-mono text-sm">DRYDOCK HULL ANTI-FOULING COATING SCHEDULE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleTogglePaint}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isPainting 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
            }`}
          >
            {data.isPainting ? '暂停喷涂 (检查漆膜)' : '启动喷涂 (自动爬壁机器人)'}
          </button>
        </div>
      </div>

      {/* Top Half: Wide 3D View */}
      <div className="mb-6">
        <SciFiCard title="干船坞涂装 3D 进度可视化" className="h-[400px] relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.isPainting ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-slate-300">{data.isPainting ? '无气喷涂作业中' : '表面处理/固化等待'}</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 border border-red-500/20 rounded-lg overflow-hidden bg-[#1a1a1a]">
            <ThreeScene 
              paintProgress={data.paintProgress} 
              isPainting={data.isPainting} 
              humidity={data.humidity} 
            />
          </div>
        </SciFiCard>
      </div>

      {/* Bottom Half: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SciFiCard title="环境与涂料参数" className="h-full">
          <div className="space-y-4">
            <ParameterWidget parameters={[
              { label: '环境温度', value: data.temperature.toFixed(1), unit: '°C', status: (data.temperature < 5 || data.temperature > 35) ? 'critical' : 'normal' },
              { label: '相对湿度', value: data.humidity.toFixed(1), unit: '%', status: data.humidity > 85 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '涂装总进度', value: data.paintProgress.toFixed(1), unit: '%', status: 'normal' },
              { label: '防污漆消耗量', value: data.paintConsumption.toFixed(0), unit: 'L', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: 'VOC 排放浓度', value: data.vocEmissions.toFixed(1), unit: 'ppm', status: data.vocEmissions > 50 ? 'warning' : 'normal' },
              { label: '干膜厚度 (DFT)', value: '150', unit: 'μm', status: 'normal' }
            ]} />
          </div>
        </SciFiCard>

        <SciFiCard title="涂装工艺流程" className="h-full">
          <TimelineWidget steps={[
            { time: 'Day 1', title: '高压水洗除海生物 (UHP)', status: data.paintProgress > 0 ? 'done' : 'active' },
            { time: 'Day 2-3', title: '喷砂除锈至 SA2.5 级', status: data.paintProgress > 0 ? 'done' : 'pending' },
            { time: 'Day 4', title: '环氧防锈底漆喷涂', status: data.paintProgress > 10 ? 'done' : data.paintProgress > 0 ? 'active' : 'pending' },
            { time: 'Day 5-6', title: '自抛光防污漆 (SPC) 喷涂', status: data.isPainting ? 'active' : data.paintProgress >= 100 ? 'done' : 'pending' },
            { time: 'Day 7', title: '漆膜固化与 DFT 测量', status: data.paintProgress >= 100 ? 'active' : 'pending' },
            { time: 'Day 8', title: '坞内注水、船舶出坞', status: 'pending' }
          ]} />
        </SciFiCard>

        <div className="flex flex-col gap-6">
          <SciFiCard title="物料与设备" className="flex-1">
            <ResourceWidget resources={[
              { name: 'SPC 防污漆 (红)', allocated: 8000, total: 10000, unit: 'L' },
              { name: '高压无气喷涂机', allocated: 4, total: 4, unit: '台' },
              { name: '磁吸式爬壁机器人', allocated: 2, total: 2, unit: '台' },
              { name: '涂装质检员 (NACE)', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>

          <SciFiCard title="HSE 风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '高空坠落：登高车作业必须系挂安全带' },
              { level: 'high', desc: '火灾爆炸：坞内严禁明火，加强通风排气' },
              { level: 'medium', desc: '职业健康：必须佩戴防毒面具与防护服' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
