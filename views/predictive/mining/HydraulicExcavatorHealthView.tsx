import React, { useState, useEffect } from 'react';
import { ExcavatorThreeScene } from '../../../components/predictive/mining-excavator/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-5]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-5';
import { ExcavatorComponent } from '../../../components/predictive/mining-excavator/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { Activity, Gauge } from 'lucide-react';

const COMPONENTS: ExcavatorComponent[] = [
    { id: 'boom', name: '动臂', health: 90, riskLevel: 'normal', temperature: 45 },
    { id: 'arm', name: '斗杆', health: 85, riskLevel: 'normal', temperature: 48 },
    { id: 'bucket', name: '铲斗', health: 70, riskLevel: 'warning', temperature: 40 },
    { id: 'swing', name: '回转台', health: 95, riskLevel: 'normal', temperature: 55 },
];

export const HydraulicExcavatorHealthView: React.FC = () => {
    const [boomAngle, setBoomAngle] = useState(0);
    const [armAngle, setArmAngle] = useState(0);
    const [swingAngle, setSwingAngle] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const t = Date.now() / 2000;
            setBoomAngle(Math.sin(t) * 0.5);
            setArmAngle(Math.cos(t) * 0.8);
            setSwingAngle(Math.sin(t * 0.5) * 30);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    液压挖掘机 <span className="text-blue-500">整机健康状态总览</span>
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                <div className="w-full lg:w-3/4 flex flex-col gap-5 relative">
                    <div className="flex-1 min-h-[450px] bg-[#050205] border border-blue-800/40 relative rounded-lg overflow-hidden">
                        <ExcavatorThreeScene 
                            components={COMPONENTS}
                            boomAngle={boomAngle}
                            armAngle={armAngle}
                            bucketAngle={0}
                            swingAngle={swingAngle}
                            oilFlowIntensity={0.8}
                            viewMode="structural"
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/4 flex flex-col gap-5">
                    <SciFiCard title="部件状态列表" className="flex-1 border-blue-900/50">
                        <div className="flex flex-col gap-2">
                            {COMPONENTS.map(c => (
                                <div key={c.id} onClick={() => setSelectedId(c.id)} className={`p-3 rounded border cursor-pointer ${selectedId === c.id ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/50 border-slate-800'}`}>
                                    <div className="font-bold text-white">{c.name}</div>
                                    <div className="text-xs text-slate-400">Health: {c.health}%</div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>
            </div>
        </div>
    );
};

export default HydraulicExcavatorHealthView;