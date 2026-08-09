import React, { useState, Suspense } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Construction, Database, ShieldCheck, ArrowLeft, BookOpen } from 'lucide-react';

const MOCK_RADAR_DATA = [
  { subject: '可用性', A: 120, fullMark: 150 },
  { subject: '可靠性', A: 98, fullMark: 150 },
  { subject: '安全性', A: 86, fullMark: 150 },
  { subject: '维护性', A: 99, fullMark: 150 },
  { subject: '经济性', A: 85, fullMark: 150 },
  { subject: '环保性', A: 65, fullMark: 150 },
];

const modulesMap = import.meta.glob('./Maintenance-Training/*/index.tsx');

const lazyModules = Object.fromEntries(
  Object.entries(modulesMap).map(([path, importFn]) => {
    const id = path.split('/')[2];
    return [id, React.lazy(importFn as any)];
  })
);

const TRAINING_MODULES = [
  { id: 'TurbineRunnerHoistingTraining', title: '水轮机转轮吊装与拆卸虚拟实训', category: '水利水电' },
  { id: 'StatorInsulationTestSim', title: '发电机定子线圈绝缘测试模拟操作', category: '水利水电' },
  { id: 'GovernorValveDiagTraining', title: '调速器电液伺服阀故障诊断教学', category: '水利水电' },
  { id: 'InletValveHydraulicRepairSim', title: '进水蝶阀液压系统检修演练', category: '水利水电' },
  { id: 'SpillwayGateHoistStdOps', title: '溢洪道闸门启闭机维护标准作业', category: '水利水电' },
  { id: 'HydroBearingTempTroubleshoot', title: '水导轴承瓦温异常排查全景模拟', category: '水利水电' },
  { id: 'ExcitationBrushReplacementOps', title: '励磁系统碳刷在线更换实操', category: '水利水电' },
  { id: 'TransformerCoolerCleaningEdu', title: '主变压器冷却器清洗工艺教学', category: '水利水电' },
  { id: 'GISBreakerTestingSim', title: 'GIS开关站断路器机械特性测试实训', category: '水利水电' },
  { id: 'StationPowerWiringTroubleshoot', title: '厂用电盘柜二次回路接线排故', category: '水利水电' },
  { id: 'PenstockLeakageEmergencyDrill', title: '压力钢管伸缩节漏水应急封堵演练', category: '水利水电' },
  { id: 'DraftTubePumpSealRepair', title: '尾水管排水泵机械密封更换教学', category: '水利水电' },
  { id: 'SCADASystemRecoverySim', title: '计算机监控系统死机恢复模拟', category: '水利水电' },
  { id: 'TrashRackRopeRepairTraining', title: '拦污栅清污机钢丝绳断裂抢修实训', category: '水利水电' },
  { id: 'GuideVaneShearPinHandling', title: '导水机构剪断销剪断故障处理演练', category: '水利水电' },

  { id: 'ShearerGearbox3DTraining', title: '采煤机截割部减速箱拆解3D教学', category: '矿山' },
  { id: 'HydraulicSupportLeakSim', title: '液压支架立柱窜液故障排查模拟', category: '矿山' },
  { id: 'ScraperConveyorChainRepairDrill', title: '刮板输送机断链事故应急抢修演练', category: '矿山' },
  { id: 'HoistBrakeClearanceTuning', title: '矿井提升机盘形制动器间隙调校实操', category: '矿山' },
  { id: 'MiningTruckWheelAssemblySim', title: '露天矿卡车电动轮总成拆装实训', category: '矿山' },
  { id: 'RotaryDrillLubeMaintenance', title: '牙轮钻机回转机构润滑保养教学', category: '矿山' },
  { id: 'JawCrusherPlateReplacementSim', title: '颚式破碎机动颚板翻转更换演练', category: '矿山' },
  { id: 'BallMillBearingScrapingVR', title: '球磨机中空轴瓦刮研工艺虚拟实训', category: '矿山' },
  { id: 'FlotationMachineSealStdOps', title: '浮选机主轴承座密封更换标准作业', category: '矿山' },
  { id: 'ExplosionProofInverterRepairEdu', title: '井下防爆变频器IGBT模块维修教学', category: '矿山' },
  { id: 'SubmersiblePumpMotorDryingSim', title: '矿用隔爆型潜水泵电机烘干实操', category: '矿山' },
  { id: 'GasPumpVacuumTroubleshoot', title: '瓦斯抽放泵水环真空度异常排查', category: '矿山' },
  { id: 'VentilatorBladeAngleTuning', title: '矿井主通风机叶片角度调整实训', category: '矿山' },
  { id: 'BeltConveyorDeviationTuningSim', title: '井下胶带输送机跑偏自动纠偏调试', category: '矿山' },
  { id: 'MicroseismicSensorCalibrationEdu', title: '矿山微震监测系统传感器标定教学', category: '矿山' },

  { id: 'MarineDieselCylinderHeadVR', title: '船舶低速柴油机气缸盖拆装虚拟实训', category: '港航船舶' },
  { id: 'MarinePurifierOilLeakSim', title: '船用分油机跑油故障排查全景模拟', category: '港航船舶' },
  { id: 'SteeringGearPumpZeroTuning', title: '舵机液压泵变量机构零位调校实操', category: '港航船舶' },
  { id: 'QuayCraneHoistGearboxRepairEdu', title: '岸桥起升机构减速箱高速轴检修教学', category: '港航船舶' },
  { id: 'RTGTravelMotorSyncTuningSim', title: '场桥大车行走电机同步控制调试', category: '港航船舶' },
  { id: 'BallastWaterUVLampRepair', title: '船舶压载水处理系统UV灯管更换演练', category: '港航船舶' },
  { id: 'FreshWaterGeneratorVacuumDiag', title: '船用造水机真空度不足故障诊断', category: '港航船舶' },
  { id: 'PortConveyorFluidCouplingMaint', title: '港口带式输送机液力偶合器维护实训', category: '港航船舶' },
  { id: 'ShipLoaderChuteRopeTuning', title: '装船机溜筒伸缩机构钢丝绳调整', category: '港航船舶' },
  { id: 'MarineGeneratorReversePowerSim', title: '船舶电站发电机逆功率保护测试模拟', category: '港航船舶' },
  { id: 'MarineRadarMagnetronRepair', title: '船用雷达天线收发机磁控管更换教学', category: '港航船舶' },
  { id: 'LifeboatDavitLimitSwitchSim', title: '救生艇降放装置限位开关校验实操', category: '港航船舶' },
  { id: 'PortAGVLidarCalibrationEdu', title: '港口AGV自动导引车激光雷达标定', category: '港航船舶' },
  { id: 'ReeferCompressorValveRepairDrill', title: '船舶冷藏集装箱压缩机阀板检修演练', category: '港航船舶' },
  { id: 'ICCPReferenceElectrodeCheckSim', title: '船体外加电流阴极保护参比电极检查', category: '港航船舶' },

  { id: 'ScrewCompressorRotorClearanceSim', title: '螺杆式空压机转子间隙测量实训', category: '通用/辅助类设备' },
  { id: 'IndustrialRobotServoRepair', title: '工业机器人六轴伺服电机更换教学', category: '通用/辅助类设备' },
  { id: 'ChillerRefrigerantRecoverySim', title: '离心式冷水机组冷媒回收与加注实操', category: '通用/辅助类设备' },
  { id: 'ValvePositionerPIDTuningVR', title: '智能阀门定位器PID参数整定模拟', category: '通用/辅助类设备' },
  { id: 'LubeSystemValveUnblockingDrill', title: '集中润滑系统分配阀堵塞疏通演练', category: '通用/辅助类设备' },
  { id: 'FirePumpPressureSwitchTestSim', title: '消防稳压泵压力开关动作值校验', category: '通用/辅助类设备' },
  { id: 'UPSInverterModuleDiag', title: 'UPS不间断电源逆变模块故障排查', category: '通用/辅助类设备' },
  { id: 'OverheadCraneDeflectionMeasurementEdu', title: '桥式起重机主梁下挠度测量教学', category: '通用/辅助类设备' },
  { id: 'ForkliftHydraulicValveLeakSim', title: '厂内叉车液压多路阀内泄检测实训', category: '通用/辅助类设备' },
  { id: 'WeldingRobotCollisionSensorResetSim', title: '焊接机器人焊枪防碰撞传感器复位', category: '通用/辅助类设备' },
  { id: 'IndustrialCameraStrobeTuningEdu', title: '工业视觉检测相机光源频闪调试', category: '通用/辅助类设备' },
  { id: 'HighVoltageMotorBearingHeatingSim', title: '高压电机轴承加热器规范使用实训', category: '通用/辅助类设备' },
  { id: 'ElectromagneticFlowmeterElectrodeTestSim', title: '电磁流量计电极极化电压测量', category: '通用/辅助类设备' },
  { id: 'StandbyGeneratorGovernorTuningSim', title: '备用柴油发电机调速板增益调校', category: '通用/辅助类设备' },
  { id: 'GroundingResistanceTestVR', title: '厂区防雷接地网接地电阻测试模拟', category: '通用/辅助类设备' },
  { id: 'MaintenanceToolsInsulationTestEdu', title: '维修工器具绝缘耐压测试规范教学', category: '通用/辅助类设备' }
];

export const MaintenanceTrainingView: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  if (selectedModuleId) {
    const SelectedComponent = lazyModules[selectedModuleId];
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <button 
            onClick={() => setSelectedModuleId(null)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回培训列表</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50 relative">
          <Suspense fallback={<div className="p-8 text-cyan-400 flex items-center justify-center h-full">加载实训模块中...</div>}>
            {SelectedComponent ? <SelectedComponent /> : <div className="p-8 text-red-400">模块未找到</div>}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <SciFiCard title="维修培训" highlight>
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
                <p className="text-lg text-slate-300 mb-4">
                    维修培训 模块正在运行中。系统已连接到工业数据总线，正在实时采集相关节点数据。
                    该模块集成最新的AI分析算法，为工业现场提供决策支持。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 border border-slate-700 bg-slate-900/40 rounded flex items-center gap-3">
                        <Construction className="text-orange-400" />
                        <div>
                            <div className="text-xs text-slate-500">模块状态</div>
                            <div className="font-bold text-cyan-100">功能正常</div>
                        </div>
                    </div>
                     <div className="p-4 border border-slate-700 bg-slate-900/40 rounded flex items-center gap-3">
                        <Database className="text-blue-400" />
                        <div>
                            <div className="text-xs text-slate-500">数据源</div>
                            <div className="font-bold text-cyan-100">Cloud-IOT-Core</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-900/50 rounded border border-slate-700/50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/60 to-slate-950"></div>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_RADAR_DATA}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Performance" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </SciFiCard>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {['水利水电', '矿山', '港航船舶', '通用/辅助类设备'].map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
              <BookOpen size={20} />
              {category}领域实训
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {TRAINING_MODULES.filter(m => m.category === category).map(module => (
                <div 
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className="bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-800 group"
                >
                  <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 h-10">
                    {module.title}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{module.id}</span>
                    <span className="text-[10px] px-2 py-1 bg-cyan-950 text-cyan-400 rounded border border-cyan-800/50 whitespace-nowrap">
                      进入实训
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
