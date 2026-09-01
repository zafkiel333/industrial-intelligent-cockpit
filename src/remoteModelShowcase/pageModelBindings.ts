// 2026-08-27 新增：由已审核的页面—模型配对表生成；2026-09-01 扩展为 102 个展示页；
// 注意：eq-18（1号机组异常预测分析）不在本表中，必须保持原页面和原位置不变。
export type ModelAdaptationGrade = 'A' | 'B' | 'C';

export interface PageModelBinding {
  viewId: string;
  modelId: number;
  pageTitle: string;
  modelName: string;
  grade: ModelAdaptationGrade;
  fileSize: string;
  adaptation: string;
  note?: string;
}

export const PAGE_MODEL_BINDINGS = [
  {"viewId":"eq-0","modelId":2363,"pageTitle":"水轮机智能运维","modelName":"轴流式水轮机","grade":"A","fileSize":"7.31 MiB","adaptation":"直接匹配","note":"替换上游端点已不再返回有效 FBX 的 2353；新模型文件头、完整下载和缩略图均已核验，蜗壳、导水结构与机组外形清楚。"},
  {"viewId":"eq-1","modelId":7192,"pageTitle":"发电机智能运维","modelName":"混流式水轮发电机组","grade":"A","fileSize":"8.51 MiB","adaptation":"轻量适配","note":"模型包含发电机组结构，适合水电语境；页面名称可不变，设备信息改为水轮发电机组。"},
  {"viewId":"eq-2","modelId":2364,"pageTitle":"输电装置智能运维","modelName":"输电塔","grade":"A","fileSize":"0.57 MiB","adaptation":"直接匹配","note":"现有页面的覆冰、舞动、弧垂、绝缘子和线路负荷均是输电线路语义；模型虽为单色桁架，但结构清楚，开发时用材质、灯光和边缘线增强层次。"},
  {"viewId":"eq-3","modelId":2324,"pageTitle":"泵站智能运维","modelName":"水泵站","grade":"A","fileSize":"12.74 MiB","adaptation":"直接匹配","note":"模型含多泵、管路、阀门和底座，细节丰富，和现有泵站页面指标一致。"},
  {"viewId":"eq-5","modelId":2327,"pageTitle":"污水处理智能运维","modelName":"污水处理设备","grade":"A","fileSize":"10.80 MiB","adaptation":"直接匹配","note":"替换运行时近黑的 2304；新模型含处理池、管路和设备柜，蓝、青、白等 114 组材质层次清楚，保留水质与核心设备指标。"},
  {"viewId":"eq-7","modelId":2373,"pageTitle":"船舶智能运维","modelName":"集装箱式远航跨洋货轮","grade":"A","fileSize":"2.82 MiB","adaptation":"直接匹配","note":"替换运行时近黑的 2374；新模型无需外部贴图，船体、甲板、驾驶台和集装箱采用 24 组多色材质，现有主机、航行与海况指标可直接承接。"},
  {"viewId":"eq-8","modelId":2357,"pageTitle":"靠泊系统智能运维","modelName":"船舶码头","grade":"A","fileSize":"0.36 MiB","adaptation":"直接匹配","note":"模型同时包含港池、船舶和码头结构，场景完整，适合靠泊距离、角度和缆绳张力展示。"},
  {"viewId":"eq-9","modelId":2308,"pageTitle":"起重设备智能运维","modelName":"抓斗桥式起重机","grade":"A","fileSize":"28.77 MiB","adaptation":"直接匹配","note":"与页面载荷、驱动和防撞指标一致；比通用吊机更符合现有页面逻辑。"},
  {"viewId":"eq-10","modelId":5466,"pageTitle":"航标智能运维","modelName":"太阳能浮标设计模型","grade":"A","fileSize":"4.20 MiB","adaptation":"直接匹配","note":"具备浮体、信号灯和太阳能板，和页面电池、灯器、定位及海况指标高度一致。"},
  {"viewId":"eq-14","modelId":8688,"pageTitle":"钻孔设备智能运维","modelName":"12-Track_Drill 履带式钻机","grade":"A","fileSize":"20.94 MiB","adaptation":"直接匹配","note":"新模型外形完整、钻架和履带细节丰富，和钻压、转速、泥浆/动力监测语义接近。"},
  {"viewId":"eq-15","modelId":8741,"pageTitle":"破碎设备智能运维","modelName":"粗粉碎机","grade":"A","fileSize":"7.81 MiB","adaptation":"直接匹配","note":"2026-08-28 新增模型；整机含进料箱、粉碎腔、传动轴和支架，文件小于 50 MiB 且 FBX 已完整校验。"},
  {"viewId":"eq-16","modelId":8736,"pageTitle":"选矿设备智能运维","modelName":"矿石球磨机","grade":"A","fileSize":"20.83 MiB","adaptation":"轻量适配","note":"2026-08-28 新增模型；球磨机属于选矿磨矿核心设备，页面收敛到筒体、齿圈、轴承和驱动系统指标，不泛化为整条选矿线。"},
  {"viewId":"eq-17","modelId":8740,"pageTitle":"制砂机智能运维","modelName":"筛沙机","grade":"B","fileSize":"21.15 MiB","adaptation":"相关工序适配","note":"2026-08-28 新增模型；筛沙机与制砂后段筛分直接相关，页面改为制砂筛分单元，指标限定到筛面、输送、给料和振动，不冒充破碎主机。"},
  {"viewId":"eq-unit1-model","modelId":6691,"pageTitle":"1号水轮发电机组模型展示","modelName":"1号水轮发电机组","grade":"A","fileSize":"2.04 MiB","adaptation":"新建直配","note":"新建独立页面，仅使用主项目模型 API 的模拟 Dashboard 与模型交互；不得复用、嵌入或改写现有 `eq-18` 的单独数据展示逻辑。"},
  {"viewId":"pm-mining-10","modelId":8690,"pageTitle":"矿用自卸卡车整车健康状态总览","modelName":"14-OffHighway_Truck","grade":"A","fileSize":"8.98 MiB","adaptation":"直接匹配","note":"新模型是完整非公路矿用自卸车，车架、货箱和轮胎细节清晰。"},
  {"viewId":"pm-mining-5","modelId":8682,"pageTitle":"液压挖掘机整机健康状态总览","modelName":"06-Track_Excavator","grade":"A","fileSize":"16.46 MiB","adaptation":"直接匹配","note":"履带、动臂、铲斗和驾驶室完整，页面整机健康指标无需改变主题。"},
  {"viewId":"mpm-27","modelId":8693,"pageTitle":"矿用电铲挖掘机定期维保","modelName":"17-Electric_Rope_Shovel","grade":"A","fileSize":"16.57 MiB","adaptation":"直接匹配","note":"电动绳铲结构复杂、视觉辨识度高，与页面维保对象直接一致。"},
  {"viewId":"ForkliftHydraulicValveLeakSim","modelId":2293,"pageTitle":"厂内叉车液压多路阀内泄检测实训","modelName":"叉车","grade":"A","fileSize":"0.76 MiB","adaptation":"轻量适配","note":"模型质感好且整车完整；页面需把 3D 热点聚焦到液压阀所在区域，不能把整车状态替代阀故障教学。"},
  {"viewId":"cv-robot-joint-wear","modelId":2276,"pageTitle":"工业机器人关节磨损与定位精度监测","modelName":"机械臂","grade":"A","fileSize":"10.47 MiB","adaptation":"直接匹配","note":"六轴工业机械臂外形完整，适合关节热点、磨损等级和定位误差叠加。"},
  {"viewId":"sim-hydro-gate","modelId":6648,"pageTitle":"闸门启闭过程流固耦合仿真","modelName":"水坝泄洪闸","grade":"A","fileSize":"0.36 MiB","adaptation":"直接匹配","note":"闸门与水工环境直接对应；模型较轻，适合叠加开度、流量和受力动画。"},
  {"viewId":"cv-ship-propeller","modelId":2354,"pageTitle":"船舶螺旋桨空泡与损伤监测","modelName":"船用螺旋桨","grade":"A","fileSize":"6.33 MiB","adaptation":"直接匹配","note":"螺旋桨材质和轮廓清楚，适合缺陷框、空泡区域和叶片编号标注。"},
  {"viewId":"MarineRadarMagnetronRepair","modelId":5283,"pageTitle":"船用雷达天线收发机磁控管更换教学","modelName":"船用雷达","grade":"A","fileSize":"1.00 MiB","adaptation":"轻量适配","note":"整机对象正确；教学步骤需通过热点和说明聚焦收发机/磁控管，不虚构可拆部件。"},
  {"viewId":"LifeboatDavitLimitSwitchSim","modelId":5339,"pageTitle":"救生艇降放装置限位开关校验实操","modelName":"吊艇架模型","grade":"A","fileSize":"1.51 MiB","adaptation":"直接匹配","note":"模型包含艇架、吊臂、钢丝绳与小艇，和降放装置页面高度一致。"},
  {"viewId":"vibe-PortSubstation","modelId":2303,"pageTitle":"港口变电站变压器电磁震动监测","modelName":"工业变压器","grade":"A","fileSize":"4.57 MiB","adaptation":"直接匹配","note":"变压器外形完整；页面保留港口场景，3D 中仅表现核心变压器设备。"},
  {"viewId":"SpillwayGateHoistStdOps","modelId":2368,"pageTitle":"溢洪道闸门启闭机维护标准作业","modelName":"门式启闭机","grade":"A","fileSize":"4.75 MiB","adaptation":"直接匹配","note":"启闭机主体、吊钩和门架清楚，适合维护点位与标准步骤展示。"},
  {"viewId":"InletValveHydraulicRepairSim","modelId":6893,"pageTitle":"进水蝶阀液压系统检修演练","modelName":"进水蝶阀","grade":"A","fileSize":"6.84 MiB","adaptation":"直接匹配","note":"阀体和液压执行机构完整；材质偏浅，开发时需调整灯光、环境色与边缘线。"},
  {"viewId":"sim-hydro-turb","modelId":2339,"pageTitle":"水电站机组水力性能仿真","modelName":"混流式水轮机蜗壳","grade":"B","fileSize":"0.98 MiB","adaptation":"3D 区聚焦蜗壳流道，保留压力、流速和效率；隐藏模型无法表达的导叶联动动画。"},
  {"viewId":"ia-turbine-wear","modelId":2338,"pageTitle":"水轮机气蚀与磨损指数分析","modelName":"混流式水轮机","grade":"B","fileSize":"0.54 MiB","adaptation":"增加蜗壳/转轮风险分区和磨损指数热点。"},
  {"viewId":"pm-hydro-1","modelId":7251,"pageTitle":"水轮机主轴与推力轴承健康监测","modelName":"水轮机主轴","grade":"B","fileSize":"0.05 MiB","adaptation":"以主轴为中心映射摆度、轴向位移、温度和振动。"},
  {"viewId":"pm-hydro-3","modelId":7244,"pageTitle":"发电机转子不平衡劣化评估","modelName":"发电机主轴","grade":"C","fileSize":"0.04 MiB","adaptation":"页面标题收敛为“转子轴系不平衡评估”，删除模型不能支撑的定子可视化。"},
  {"viewId":"pm-hydro-5","modelId":2285,"pageTitle":"水轮机转轮空蚀与裂纹劣化预测","modelName":"冲击式水轮机","grade":"B","fileSize":"19.75 MiB","adaptation":"明确机型为冲击式，热点集中到转轮水斗和轴系。"},
  {"viewId":"turbine-blade-erosion","modelId":2306,"pageTitle":"水轮机转轮叶片冲蚀预警","modelName":"弗朗西斯水轮机转轮","grade":"A","fileSize":"8.28 MiB","adaptation":"直接聚焦转轮叶片，以叶片级热区、冲蚀深度和剩余寿命替代原整机示意；原模型 2286 的上游文件不是有效 FBX，已停用。"},
  {"viewId":"TurbineRunnerHoistingTraining","modelId":7193,"pageTitle":"水轮机转轮吊装与拆卸实训","modelName":"混流式转轮","grade":"B","fileSize":"1.08 MiB","adaptation":"直接以混流式转轮设置吊点、重心和拆装步骤热点；模型轮廓清楚且体积较小，材质由展示端补光增强，不虚构模型中不存在的吊具。"},
  {"viewId":"mpm-0","modelId":6694,"pageTitle":"水轮发电机组大修计划","modelName":"4号水轮发电机组","grade":"B","fileSize":"9.54 MiB","adaptation":"资产编号改为 4 号机组，计划节点绑定到机组区域。"},
  {"viewId":"pm-hydro-0","modelId":6692,"pageTitle":"水轮发电机组整机健康状态总览","modelName":"2号水轮发电机组","grade":"B","fileSize":"2.16 MiB","adaptation":"资产编号改为 2 号机组，保留整机健康指标。"},
  {"viewId":"cv-turbine-cavitation","modelId":2287,"pageTitle":"水轮机叶片空蚀智能检测","modelName":"冲击式水轮机转轮","grade":"B","fileSize":"1.70 MiB","adaptation":"视觉框定位到水斗边缘，增加缺陷编号与置信度。"},
  {"viewId":"pm-hydro-30","modelId":7230,"pageTitle":"排水泵站整机健康状态总览","modelName":"长轴透平泵","grade":"C","fileSize":"1.08 MiB","adaptation":"页面改为“长轴泵机组健康总览”，补充长径比相机预设和分段轴系热点。"},
  {"viewId":"pm-hydro-31","modelId":2329,"pageTitle":"水泵轴承与叶轮劣化趋势预测","modelName":"污水泵叶轮","grade":"B","fileSize":"3.29 MiB","adaptation":"重点展示叶轮磨损；轴承指标作为关联趋势，不在模型上虚构轴承结构。"},
  {"viewId":"mm-17","modelId":7190,"pageTitle":"矿山排水泵站故障诊断与维修模拟","modelName":"深井潜水泵","grade":"C","fileSize":"0.84 MiB","adaptation":"场景收敛为深井排水泵单机检修，重做长轴模型取景和拆检步骤。"},
  {"viewId":"SubmersiblePumpMotorDryingSim","modelId":7197,"pageTitle":"矿用潜水泵电机烘干实操","modelName":"潜水排污泵","grade":"B","fileSize":"1.25 MiB","adaptation":"将步骤热点放在电机壳体、接线和密封位置。"},
  {"viewId":"cooling-pump-bearing-life","modelId":7214,"pageTitle":"冷却水泵轴承寿命预警","modelName":"端吸式卧式离心泵","grade":"B","fileSize":"1.67 MiB","adaptation":"增加驱动端/非驱动端轴承热点并调整寿命指标名称。"},
  {"viewId":"ship-steering-pump-life","modelId":2322,"pageTitle":"船舶舵机液压泵寿命预警","modelName":"液压泵","grade":"C","fileSize":"10.83 MiB","adaptation":"明确为舵机液压动力单元代表模型，保留船舶背景但不展示整套舵机。"},
  {"viewId":"fire-fighting-pump-seal-life","modelId":6731,"pageTitle":"消防泵组机械密封寿命预警","modelName":"多级管道离心泵","grade":"C","fileSize":"0.50 MiB","adaptation":"页面改为管道消防增压泵，密封热点与寿命曲线绑定。"},
  {"viewId":"vibe-ShipPump","modelId":2349,"pageTitle":"船舶泵组震动监测","modelName":"离心泵","grade":"C","fileSize":"6.54 MiB","adaptation":"增加“船用场景适配模型”说明，指标限定为泵体、轴承和叶轮振动。"},
  {"viewId":"drainage-motor-winding-life","modelId":2343,"pageTitle":"排水泵站电机绕组寿命预警","modelName":"电机电动机","grade":"B","fileSize":"1.19 MiB","adaptation":"用定子绕组、轴承端和温升热点替换泵站总览图。"},
  {"viewId":"pm-hydro-26","modelId":2319,"pageTitle":"弧形闸门启闭机构劣化趋势预测","modelName":"水坝泄洪闸","grade":"B","fileSize":"0.36 MiB","adaptation":"页面改为泄洪闸启闭机构，保留开度、载荷和卡阻趋势。"},
  {"viewId":"mpm-17","modelId":7255,"pageTitle":"进水蝶阀球阀检修排期","modelName":"进水球阀装配","grade":"B","fileSize":"42.53 MiB","adaptation":"主题聚焦球阀，增加加载进度和低配降级提示。"},
  {"viewId":"cv-valve-position","modelId":6860,"pageTitle":"阀门开关状态与开度视觉识别","modelName":"电动蝶阀","grade":"B","fileSize":"0.93 MiB","adaptation":"以阀板角度驱动开度标注，保留视觉识别置信度。"},
  {"viewId":"ValvePositionerPIDTuningVR","modelId":6862,"pageTitle":"阀门定位器 PID 参数整定","modelName":"电动调节阀","grade":"B","fileSize":"0.29 MiB","adaptation":"将 PID 输出映射到阀位，明确为二通型 DN50 调节阀。"},
  {"viewId":"eq-12","modelId":2318,"pageTitle":"矿山提升机智能运维","modelName":"液压站","grade":"C","fileSize":"20.34 MiB","adaptation":"保留页面入口，但标题区增加“液压制动站子系统”；中央 3D 和指标聚焦制动压力、油温、蓄能器与阀组。"},
  {"viewId":"mpm-8","modelId":2336,"pageTitle":"液压启闭机系统维保","modelName":"液压阀","grade":"C","fileSize":"0.58 MiB","adaptation":"页面收敛为启闭机液压阀组维保，调整任务、备件和点检字段。"},
  {"viewId":"eq-4","modelId":6849,"pageTitle":"排污口检测智能运维","modelName":"流量传感器","grade":"C","fileSize":"0.53 MiB","adaptation":"页面副标题改为“排污口流量监测单元”；保留水质数据面板，但 3D 与诊断只绑定流量、压力和通信状态。"},
  {"viewId":"cv-transformer-leak","modelId":2346,"pageTitle":"变压器渗漏油视觉监测","modelName":"电线杆变压器","grade":"B","fileSize":"2.28 MiB","adaptation":"增加油箱、套管和法兰视觉热点及渗漏框。"},
  {"viewId":"pm-hydro-15","modelId":2375,"pageTitle":"主变压器运行健康状态总览","modelName":"高压电力变压器","grade":"B","fileSize":"0.41 MiB","adaptation":"保留油温、负载、套管和局放指标。"},
  {"viewId":"mpm-4","modelId":2352,"pageTitle":"主变压器预防性检修","modelName":"箱式变压器","grade":"C","fileSize":"0.77 MiB","adaptation":"页面明确为箱式变压器检修，重命名与主变压器容量相关的字段。"},
  {"viewId":"pm-hydro-19","modelId":2296,"pageTitle":"变压器故障发生概率预测","modelName":"变压器装置","grade":"C","fileSize":"0.16 MiB","adaptation":"标题收敛为“变压器辅助电控装置故障概率预测”，指标改为柜内温升、绝缘和开关状态。"},
  {"viewId":"GISBreakerTestingSim","modelId":6633,"pageTitle":"GIS 开关站断路器机械特性测试","modelName":"断路器","grade":"B","fileSize":"2.21 MiB","adaptation":"保留分合闸时间、行程和同期性；开发时用边缘线改善浅色模型辨识度。"},
  {"viewId":"pm-pmOther-64","modelId":2367,"pageTitle":"港口岸桥起重机健康状态总览","modelName":"门座起重机","grade":"C","fileSize":"5.24 MiB","adaptation":"页面明确改为“港口门座起重机健康总览”，同步变幅、回转和起升指标。"},
  {"viewId":"RTGTravelMotorSyncTuningSim","modelId":2371,"pageTitle":"场桥大车行走电机同步控制调试","modelName":"门式起重机","grade":"B","fileSize":"3.66 MiB","adaptation":"将四角行走机构设为热点，保留同步偏差与电机电流。"},
  {"viewId":"QuayCraneHoistGearboxRepairEdu","modelId":2370,"pageTitle":"岸桥起升机构减速箱检修教学","modelName":"门式起重机","grade":"C","fileSize":"0.79 MiB","adaptation":"标题改为“门式起重机起升机构检修”，步骤聚焦起升小车和减速箱。"},
  {"viewId":"OverheadCraneDeflectionMeasurementEdu","modelId":2315,"pageTitle":"桥式起重机主梁下挠度测量教学","modelName":"桥式起重机","grade":"B","fileSize":"3.31 MiB","adaptation":"增加主梁测点、跨中挠度线和载荷工况。"},
  {"viewId":"vibe-ShipCraneVibration","modelId":2335,"pageTitle":"船舶起重机震动监测","modelName":"液压起重机","grade":"B","fileSize":"7.16 MiB","adaptation":"以回转底座、液压缸和吊臂为振动测点。"},
  {"viewId":"mpm-64","modelId":6720,"pageTitle":"厂房桥式起重机轨道校正","modelName":"厂房桥式起重机","grade":"B","fileSize":"4.78 MiB","adaptation":"增加轨道偏差、轮压和跨距校正热点。"},
  {"viewId":"cv-excavator-bucket","modelId":8685,"pageTitle":"挖掘机铲斗结构疲劳裂缝监测","modelName":"轮式挖掘机","grade":"B","fileSize":"13.42 MiB","adaptation":"视觉检测范围锁定铲斗、斗杆连接和焊缝。"},
  {"viewId":"cv-truck-tire","modelId":8677,"pageTitle":"矿用卡车胎压与磨损视觉监测","modelName":"铰接式自卸卡车","grade":"B","fileSize":"13.65 MiB","adaptation":"增加轮位编号、胎压和磨损热区。"},
  {"viewId":"sim-mine-coop","modelId":8686,"pageTitle":"自卸卡车—装载机协同作业效率仿真","modelName":"轮式装载机","grade":"B","fileSize":"9.89 MiB","adaptation":"3D 主体聚焦装载机；卡车继续用路径/状态图标表达，不伪造第二个模型。"},
  {"viewId":"underground-loader-gear-life","modelId":8684,"pageTitle":"地下装载机变速箱齿轮寿命预警","modelName":"履带式装载机","grade":"B","fileSize":"9.76 MiB","adaptation":"标明模型是履带式替代样机，指标聚焦传动箱和行走机构。"},
  {"viewId":"cp-ocean-fleet","modelId":5571,"pageTitle":"全球远洋船队监控驾驶舱","modelName":"重型运输船","grade":"B","fileSize":"25.20 MiB","adaptation":"作为当前选中船舶，船队其余对象继续在地图上表达。"},
  {"viewId":"ia-ship-eeoi","modelId":2362,"pageTitle":"船舶能效营运指数 EEOI 分析","modelName":"超大型远航货轮集装箱轮船","grade":"B","fileSize":"1.81 MiB","adaptation":"模型绑定航速、载重、油耗和 EEOI 指标。"},
  {"viewId":"ia-ship-cii","modelId":2283,"pageTitle":"船舶 CII 评级分析","modelName":"万吨级排水作业货轮","grade":"B","fileSize":"4.15 MiB","adaptation":"为释放高可视化集装箱船给智能运维首页，改用无需外部贴图的多色货轮；绑定航速、载重、油耗和 CII 等级。"},
  {"viewId":"dd-ship-lifecycle","modelId":6649,"pageTitle":"船舶全生命周期数字交付","modelName":"游轮船模型","grade":"B","fileSize":"3.40 MiB","adaptation":"模型作为交付对象，阶段节点关联船体、舱室和上层建筑。"},
  {"viewId":"sim-port-motion","modelId":6639,"pageTitle":"复杂海况下船舶运动仿真","modelName":"三体式高速竞速帆船","grade":"B","fileSize":"40.51 MiB","adaptation":"明确船型为三体帆船，保留六自由度运动并限制并发下载。"},
  {"viewId":"sim-port-berth","modelId":5492,"pageTitle":"船舶靠离泊与拖轮协同仿真","modelName":"拖船设计三维模型","grade":"B","fileSize":"17.49 MiB","adaptation":"3D 主体显示拖轮，目标船与泊位继续用简化图元表达。"},
  {"viewId":"ChillerRefrigerantRecoverySim","modelId":7122,"pageTitle":"离心式冷水机组冷媒回收与加注","modelName":"变频离心式水冷冷水机组","grade":"B","fileSize":"1.42 MiB","adaptation":"增加冷媒回路、压缩机和换热器步骤热点。"},
  {"viewId":"central-air-conditioning-compressor-life","modelId":7123,"pageTitle":"中央空调压缩机寿命预警","modelName":"变频螺杆式水冷冷水机组","grade":"C","fileSize":"1.49 MiB","adaptation":"页面改为“螺杆冷水机组压缩机寿命预警”，整机模型只绑定压缩机子系统。"},
  {"viewId":"vibe-ShipAirConditioning","modelId":7200,"pageTitle":"船舶中央空调风机盘管异常震动","modelName":"立式明装风机盘管机组","grade":"B","fileSize":"0.10 MiB","adaptation":"保留船舶使用场景，振动测点限定到风机、电机和管路连接。"},
  {"viewId":"vibe-MineVentilator","modelId":6918,"pageTitle":"井下通风机叶片不平衡振动","modelName":"4-79 离心风机","grade":"C","fileSize":"0.15 MiB","adaptation":"标题改为“井下离心通风机不平衡振动”，删除轴流主通风机特有指标。"},
  {"viewId":"cp-dam-safety","modelId":2337,"pageTitle":"大坝安全与水工建筑驾驶舱","modelName":"混凝土水坝结构","grade":"B","fileSize":"0.95 MiB","adaptation":"将模型作为当前重点坝段，绑定坝体位移、渗压、裂缝和风险等级；流域态势继续由原地图表达。"},
  {"viewId":"dd-hydro-bim","modelId":2302,"pageTitle":"水工建筑物 BIM 模型交付","modelName":"大坝水电站","grade":"B","fileSize":"9.42 MiB","adaptation":"把模型作为交付对象，增加坝体、厂房、廊道和交付阶段热点，不把模拟 Dashboard 写成竣工实测数据。"},
  {"viewId":"cv-flange-bolt-loosening","modelId":6637,"pageTitle":"管道法兰螺栓松动视觉监测","modelName":"六角头法兰面螺栓","grade":"B","fileSize":"1.18 MiB","adaptation":"页面改为部件级检测视图，展示螺栓转角、位移、置信度和松动等级；管道法兰继续用二维示意表达。"},
  {"viewId":"sim-hydro-pump","modelId":7085,"pageTitle":"泵站运行工况与能耗优化仿真","modelName":"中开蜗壳式离心泵（带底座）","grade":"B","fileSize":"1.09 MiB","adaptation":"以单泵代表当前选中机组，绑定流量、扬程、效率和能耗；泵站并联系统继续由原工况图表达。"},
  {"viewId":"sim-hydro-trans","modelId":6693,"pageTitle":"水电机组启停过渡过程联合仿真","modelName":"3号水轮发电机组","grade":"B","fileSize":"9.50 MiB","adaptation":"明确仿真对象为 3 号机组，将转速、功率、水压和振动与启动阶段联动。"},
  {"viewId":"sim-mine-truck","modelId":8689,"pageTitle":"矿山卡车运输路径与拥堵仿真","modelName":"轮式牵引铲运机","grade":"C","fileSize":"12.03 MiB","adaptation":"页面标题收敛为“轮式铲运机运输路径与拥堵仿真”，保留车辆路径、排队和效率逻辑。"},
  {"viewId":"sim-mine-equip","modelId":8696,"pageTitle":"采矿设备结构强度与疲劳寿命仿真","modelName":"履带式推土机","grade":"C","fileSize":"11.39 MiB","adaptation":"页面明确设备为履带式推土机，热点聚焦铲刀、履带、车架和液压连杆，不再使用泛设备部件名称。"},
  {"viewId":"sim-port-dredge","modelId":5462,"pageTitle":"航道疏浚施工船机布置与效率仿真","modelName":"吸入式挖泥船","grade":"B","fileSize":"9.41 MiB","adaptation":"模型结构包含吸入头和浮箱，绑定疏浚深度、泵送流量、航速与施工效率。"},
  {"viewId":"mpm-40","modelId":8704,"pageTitle":"岸桥起重机钢丝绳探伤更换","modelName":"Kitbash3D 吊机起重机","grade":"B","fileSize":"1.41 MiB","adaptation":"以吊臂和起升绳为维护热点，保留探伤、报废阈值和更换计划；页面注明为代表性臂架起重机。"},
  {"viewId":"pm-hydro-4","modelId":7117,"pageTitle":"机组轴系振动趋势预测","modelName":"发电机主轴","grade":"B","fileSize":"0.05 MiB","adaptation":"采用轴系专用长构件取景，绑定径向振动、轴向位移、转速和趋势预测。"},
  {"viewId":"pm-hydro-6","modelId":7243,"pageTitle":"导轴承与推力轴承剩余寿命预测","modelName":"下机架与推力轴承座","grade":"B","fileSize":"1.46 MiB","adaptation":"将下机架、轴承座和支撑点设置为热点，保留温度、振动、载荷和剩余寿命。"},
  {"viewId":"pm-hydro-13","modelId":6844,"pageTitle":"调速系统阀组卡涩风险预测","modelName":"法兰型电动调节阀（二通型）","grade":"C","fileSize":"0.29 MiB","adaptation":"标题收敛为“调速辅助电动调节阀卡涩风险预测”，指标限定为阀位、响应时间、压差和动作次数。"},
  {"viewId":"mpm-26","modelId":7228,"pageTitle":"主排水泵解体大修排程","modelName":"长轴深井泵","grade":"B","fileSize":"0.73 MiB","adaptation":"页面明确为长轴深井泵，增加分段轴系、泵头和电机拆检步骤，并采用长构件相机预设。"},
  {"viewId":"cv-pump-seal-leak","modelId":7213,"pageTitle":"泵组机械密封泄漏监测","modelName":"端吸式卧式离心泵","grade":"B","fileSize":"1.33 MiB","adaptation":"视觉热点限定到轴封与泵壳连接区，保留泄漏面积、速率和置信度。"},
  {"viewId":"DraftTubePumpSealRepair","modelId":7205,"pageTitle":"尾水管排水泵机械密封更换教学","modelName":"立式离心泵","grade":"B","fileSize":"0.41 MiB","adaptation":"把拆装步骤聚焦到泵盖、轴封和电机连接处；尾水管系统继续由原示意图表达。"},
  {"viewId":"vibe-PortOilPump","modelId":7240,"pageTitle":"港口输油泵震动监测","modelName":"齿轮油泵","grade":"B","fileSize":"2.62 MiB","adaptation":"以齿轮啮合、泵轴和底座为测点，调整频谱特征名称并保留港口输油场景。"},
  {"viewId":"vibe-PortFirePump","modelId":7215,"pageTitle":"港口消防泵组紧急启动震动监测","modelName":"便拆式立式离心泵","grade":"B","fileSize":"0.20 MiB","adaptation":"绑定启动冲击、轴承振动、出口压力和稳态时间；模型代表当前启动泵。"},
  {"viewId":"mpm-60","modelId":7080,"pageTitle":"空压机站主机大修计划","modelName":"中压空压机（带底座）","grade":"B","fileSize":"0.15 MiB","adaptation":"维护任务聚焦主机、底座、联接和管口，按大修阶段关联备件与工期。"},
  {"viewId":"vibe-ShipCompressor","modelId":2292,"pageTitle":"船舶压缩机震动监测","modelName":"压缩机组","grade":"C","fileSize":"0.13 MiB","adaptation":"页面注明为船用系统代表性双机组，指标限定到压缩机、电机、储气部件和底座振动。"},
  {"viewId":"mpm-48","modelId":2356,"pageTitle":"船舶导航雷达校准维保","modelName":"船用雷达卫星通信天线","grade":"B","fileSize":"0.17 MiB","adaptation":"增加方位、俯仰、零位、回波和通信校准步骤；不把天线外观替代内部收发机维修。"},
  {"viewId":"cv-berthing-distance","modelId":5552,"pageTitle":"船舶靠泊距离与姿态视觉测量","modelName":"货船设计模型","grade":"B","fileSize":"12.23 MiB","adaptation":"以船艏、船舷和基准线设置测距热点，泊位与传感器继续使用二维叠加。"},
  {"viewId":"cv-cooling-tower-fan","modelId":2289,"pageTitle":"冷却塔风机叶片结冰与振动视觉监测","modelName":"冷却塔","grade":"B","fileSize":"0.74 MiB","adaptation":"选择冷却塔整机，中央模型聚焦顶部风机与平台，叠加结冰区域、振动和环境温湿度。"},
  {"viewId":"IndustrialRobotServoRepair","modelId":2281,"pageTitle":"工业机器人六轴伺服电机更换教学","modelName":"机械臂工作站","grade":"B","fileSize":"18.79 MiB","adaptation":"模型含机械臂和安全围栏，按六轴设置更换热点；只演示模型可识别的外部拆装位置。"},
  {"viewId":"cv-hull-damage","modelId":5548,"pageTitle":"船体结构破损与变形视觉检测","modelName":"船体建造放样模型","grade":"B","fileSize":"0.89 MiB","adaptation":"以船体骨架和肋板为检测对象，展示变形、裂纹和腐蚀热区；页面副标题注明结构分段模型。"},
  {"viewId":"vibe-PortTugboat","modelId":5561,"pageTitle":"港口拖轮震动监测","modelName":"迷你遥控拖船","grade":"B","fileSize":"3.37 MiB","adaptation":"作为拖轮代表模型，测点限定到机舱、甲板和船体；明确模型比例不代表实际拖轮尺寸。"},
] as const satisfies readonly PageModelBinding[];

export type PageModelBindingViewId = (typeof PAGE_MODEL_BINDINGS)[number]['viewId'];

export const PAGE_MODEL_BINDING_MAP = Object.fromEntries(
  PAGE_MODEL_BINDINGS.map((binding) => [binding.viewId, binding]),
) as Record<PageModelBindingViewId, (typeof PAGE_MODEL_BINDINGS)[number]>;

export function getPageModelBinding(viewId: string): PageModelBinding | undefined {
  return PAGE_MODEL_BINDING_MAP[viewId as PageModelBindingViewId];
}
