import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/LifeboatDavitTest/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-58]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-58';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Anchor, ShieldAlert } from 'lucide-react';

export const LifeboatDavitTestView: React.FC = () => {
  const [data, setData] = useState({
    loadWeight: 0,
    loweringSpeed: 0,
    isTesting: false,
    brakeHold: 100,
    cableTension: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isTesting) {
          return {
            ...prev,
            loadWeight: Math.min(110, prev.loadWeight + 5), // Testing up to 110% SWL
            loweringSpeed: prev.loadWeight > 50 ? 0.8 + (Math.random() - 0.5) * 0.1 : 0,
            brakeHold: Math.max(85, prev.brakeHold - 1),
            cableTension: prev.loadWeight * 9.8
          };
        }
        return {
          ...prev,
          loadWeight: Math.max(0, prev.loadWeight - 10),
          loweringSpeed: 0,
          brakeHold: 100,
          cableTension: Math.max(0, prev.cableTension - 98)
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
      <div className="mb-6 flex justify-between items-end border-b border-orange-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 tracking-wider uppercase">
            救生艇降放装置承重测试
          </h1>
          <p className="text-orange-500/70 mt-2 font-mono text-sm">LIFEBOAT DAVIT LOAD & LOWERING TEST (SOLAS)</p>
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
            <ShieldAlert size={18} />
            {data.isTesting ? '动态负荷测试进行中' : '启动 1.1 倍动态负荷测试'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="SOLAS 规范测试流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '检查吊艇架结构、钢丝绳及滑轮组', status: 'done' },
              { time: '09:00', title: '救生艇入水，安装水袋并注水至满载', status: 'active' },
              { time: '10:30', title: '进行 1.1 倍安全工作负荷(SWL)动态测试', status: 'pending' },
              { time: '11:00', title: '测试绞车刹车性能 (最大降放速度急停)', status: 'pending' },
              { time: '13:00', title: '进行 2.2 倍 SWL 静态承重测试 (如适用)', status: 'pending' },
              { time: '15:00', title: '排空水袋，回收救生艇，出具测试报告', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="高危测试安全管控" className="flex-none">
            <RiskWidget risks={[
              { level: data.loadWeight > 100 ? 'high' : 'medium', desc: `当前负荷 ${data.loadWeight.toFixed(1)}% SWL，${data.loadWeight > 100 ? '超载测试中，严禁人员逗留艇下' : '正常范围内'}` },
              { level: 'high', desc: '钢丝绳断裂风险：测试区域必须设置隔离带' },
              { level: 'medium', desc: '刹车失效风险：准备应急手动刹车方案' }
            ]} />
          </SciFiCard>
          
          <SciFiCard title="测试检验资源" className="flex-none">
            <ResourceWidget resources={[
              { name: '标准测试水袋 (5t)', allocated: 2, total: 2, unit: '个' },
              { name: '高精度测力计', allocated: 1, total: 1, unit: '台' },
              { name: '船级社验船师', allocated: 1, total: 1, unit: '人' },
              { name: '甲板操作人员', allocated: 3, total: 3, unit: '人' }
            ]} />
          </SciFiCard>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="降放装置 3D 动态受力监控" className="flex-1 relative">
            <div className="absolute inset-0 m-4 border border-orange-500/20 rounded-lg overflow-hidden bg-[#0a1a2a]">
              <ThreeScene
                loadWeight={data.loadWeight}
                loweringSpeed={data.loweringSpeed}
                isTesting={data.isTesting}
              />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <SciFiCard title="当前测试负荷">
              <div className="flex items-end gap-2 mt-2">
                <span className={`text-4xl font-bold ${data.loadWeight > 100 ? 'text-red-500' : 'text-orange-500'}`}>
                  {data.loadWeight.toFixed(1)}
                </span>
                <span className="text-sm text-slate-400 mb-1">% SWL</span>
              </div>
            </SciFiCard>
            <SciFiCard title="降放速度监控">
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold text-orange-500">
                  {data.loweringSpeed.toFixed(2)}
                </span>
                <span className="text-sm text-slate-400 mb-1">m/s</span>
              </div>
            </SciFiCard>
            <SciFiCard title="刹车保持力评估">
              <div className="flex items-end gap-2 mt-2">
                <span className={`text-4xl font-bold ${data.brakeHold < 90 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {data.brakeHold.toFixed(1)}
                </span>
                <span className="text-sm text-slate-400 mb-1">%</span>
              </div>
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
