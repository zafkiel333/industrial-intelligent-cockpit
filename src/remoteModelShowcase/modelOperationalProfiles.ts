import { PAGE_MODEL_BINDINGS } from './pageModelBindings';
import type { ModelShowcaseSceneId, RiskDirection } from './types';

export interface OperationalField {
  field: string; label: string; unit: string; normalMin: number; normalMax: number;
  base: number; amplitude: number; decimals: number; modbusAddress: number;
  iec61850Path: string; riskDirection: RiskDirection; weight: number; part: string;
}
export interface OperationalFaultProfile {
  code: string; name: string; fields: string[]; part: string; recommendation: string; serious?: boolean;
}
export interface ModelOperationalProfile {
  family: string; familyLabel: string; sampleIntervalSeconds: number; forecastSteps: number;
  forecastLabel: string; thresholdModel: { name: string; version: string };
  fields: OperationalField[]; faultProfiles: OperationalFaultProfile[]; normalLog: string; reviewTarget: string;
}
type FieldInput = [string,string,string,number,number,number,number,number,RiskDirection,number,string,string?];
const fieldRows = (rows: FieldInput[]): OperationalField[] => rows.map((row, index) => ({
  field:row[0],label:row[1],unit:row[2],normalMin:row[3],normalMax:row[4],base:row[5],amplitude:row[6],
  decimals:row[7],riskDirection:row[8],weight:row[9],part:row[10],modbusAddress:40001+index*2,
  iec61850Path:`LD0/${row[11]||`GGIO1.AnIn${index+1}`}.mag.f`,
}));
const profile=(family:string,familyLabel:string,sampleIntervalSeconds:number,forecastSteps:number,forecastLabel:string,version:string,rows:FieldInput[],faultProfiles:OperationalFaultProfile[],normalLog:string,reviewTarget:string):ModelOperationalProfile=>({
  family,familyLabel,sampleIntervalSeconds,forecastSteps,forecastLabel,thresholdModel:{name:'阈值诊断模型',version},fields:fieldRows(rows),faultProfiles,normalLog,reviewTarget,
});

const PROFILES: Record<string, ModelOperationalProfile> = {
  hydro: profile('hydro','水轮发电机组',60,360,'未来 6 小时','HYD-TD v2.2.0',[
    ['rpm','转速','r/min',140,160,150,3.2,1,'both',.12,'调速器与旋转轴系','MMXU1.RotSpd'],
    ['temperature','轴承温度','°C',35,75,54,5,1,'high',.2,'主轴承及润滑冷却回路','TTMP1.Tmp'],
    ['vibration','主轴振动','mm/s',0,4.5,1.6,.55,2,'high',.25,'主轴、联轴器与转轮','SVBR1.Vbr'],
    ['pressure','水压','MPa',1.1,2.4,1.75,.18,2,'both',.14,'引水流道与导叶机构','MMXU1.HydPres'],
    ['flow_rate','流量','m³/s',18,42,31,3.5,2,'both',.12,'进水口、导叶与转轮流道','MMXU1.Flwrte'],
    ['power_output','输出功率','MW',12,32,23,3.2,2,'both',.17,'发电机及励磁系统','MMXU1.TotW'],
  ],[
    {code:'SHAFT_IMBALANCE',name:'轴系不平衡风险',fields:['vibration','rpm'],part:'主轴、联轴器与转轮',recommendation:'复核主轴振动频谱、联轴器同轴度和转轮动平衡状态。'},
    {code:'BEARING_OVERHEAT',name:'轴承温升异常',fields:['temperature','vibration'],part:'主轴承及润滑冷却回路',recommendation:'检查轴承润滑、冷却回路及推力瓦温度分布。'},
    {code:'HYDRAULIC_INSTABILITY',name:'水力工况失稳',fields:['pressure','flow_rate','vibration'],part:'引水流道、导叶与转轮',recommendation:'核对导叶开度与流量匹配，排查空化和压力脉动。'},
    {code:'POWER_DEGRADATION',name:'机组出力衰减',fields:['power_output','flow_rate','rpm'],part:'水力通道与发电机',recommendation:'检查水头、流量利用率及发电机负荷响应。'},
  ],'运行趋势处于机组参考范围，未形成持续越界。','轴系、水力通道、轴承及发电响应'),
  pump: profile('pump','泵组及流体输送设备',60,240,'未来 4 小时','PMP-TD v2.1.0',[
    ['rpm','泵轴转速','r/min',1380,1520,1450,22,1,'both',.1,'驱动电机与联轴器','MMXU1.RotSpd'],
    ['temperature','轴承温度','°C',25,75,46,5,1,'high',.2,'泵组轴承与润滑系统','TTMP1.Tmp'],
    ['vibration','泵体振动','mm/s',0,4.5,1.5,.55,2,'high',.24,'叶轮、泵轴与安装基础','SVBR1.Vbr'],
    ['pressure','出口压力','MPa',.28,.78,.52,.06,3,'both',.16,'出口管路与止回阀','MMXU1.Pres'],
    ['flow_rate','输送流量','m³/h',45,125,86,9,2,'both',.15,'吸入口、叶轮与输送管路','MMXU1.Flwrte'],
    ['power_output','电机功率','kW',18,62,38,5,2,'high',.15,'驱动电机及供电回路','MMXU1.TotW'],
  ],[
    {code:'PUMP_CAVITATION',name:'泵组汽蚀风险',fields:['vibration','pressure','flow_rate'],part:'吸入口与叶轮流道',recommendation:'检查入口液位、吸入管路阻力和叶轮汽蚀痕迹。'},
    {code:'PUMP_BLOCKAGE',name:'吸入口或叶轮堵塞',fields:['flow_rate','pressure','power_output'],part:'格栅、吸入口与叶轮',recommendation:'检查格栅、吸入口和叶轮流道是否存在沉积或异物。'},
    {code:'PUMP_BEARING_SEAL',name:'轴承与密封异常',fields:['temperature','vibration'],part:'轴承、泵轴及机械密封',recommendation:'检查轴承润滑、机械密封泄漏和轴系对中。'},
  ],'泵组压力、流量、温升与振动关系稳定。','吸入口、叶轮、轴承密封及驱动电机'),
  crane: profile('crane','起重及启闭设备',10,180,'未来 30 分钟','CRN-TD v2.0.0',[
    ['load_weight','载荷','t',0,20,8.5,2.2,2,'high',.25,'吊具、钢丝绳与起升机构','MMXU1.Load'],
    ['travel_position','运行位置','m',0,28,13.5,8,2,'both',.08,'行走机构与限位装置'],
    ['travel_speed','运行速度','m/min',0,40,18,4.5,2,'high',.17,'大车、小车驱动与制动机构','MMXU1.Spd'],
    ['motor_current','驱动电流','A',18,86,48,8,2,'high',.18,'起升及运行电机','MMXU1.A'],
    ['motor_temperature','电机温度','°C',25,80,51,6,1,'high',.14,'驱动电机与散热系统','TTMP1.Tmp'],
    ['vibration','结构振动','mm/s',0,5,1.8,.65,2,'high',.18,'主梁、端梁、轨道与基础','SVBR1.Vbr'],
  ],[
    {code:'CRANE_OVERLOAD',name:'起升载荷异常',fields:['load_weight','motor_current','travel_speed'],part:'吊具、钢丝绳与起升机构',recommendation:'核对载荷、限载保护、钢丝绳和起升制动状态。',serious:true},
    {code:'DRIVE_OVERHEAT',name:'驱动系统过热',fields:['motor_temperature','motor_current'],part:'起升及运行电机',recommendation:'检查电机散热、制动间隙及频繁启停工况。'},
    {code:'STRUCTURAL_VIBRATION',name:'结构或轨道振动异常',fields:['vibration','load_weight','travel_position'],part:'主梁、端梁与轨道连接',recommendation:'检查轨道接头、车轮啃轨、主梁连接和载荷摆动。'},
  ],'起升载荷、驱动与结构响应处于参考范围。','吊具、钢丝绳、驱动制动及承载结构'),
  vehicle: profile('vehicle','矿山车辆及移动装备',30,240,'未来 2 小时','VEH-TD v2.3.0',[
    ['engine_rpm','发动机转速','r/min',650,2100,1320,210,1,'both',.12,'发动机与传动系统','MMXU1.RotSpd'],
    ['coolant_temperature','冷却液温度','°C',65,105,86,4.8,1,'high',.2,'发动机冷却系统','TTMP1.Tmp'],
    ['body_vibration','车体振动','mm/s',0,7,2.7,.8,2,'high',.18,'传动轴、悬挂与车架','SVBR1.Vbr'],
    ['hydraulic_pressure','液压压力','MPa',12,28,20,2.2,2,'both',.16,'液压泵阀与执行管路','MMXU1.Pres'],
    ['payload','有效载荷','t',0,95,54,12,1,'high',.17,'车架、货箱与悬挂系统','MMXU1.Load'],
    ['tractive_power','牵引功率','kW',120,380,250,38,2,'both',.17,'发动机、变速箱与驱动桥','MMXU1.TotW'],
  ],[
    {code:'ENGINE_THERMAL',name:'动力系统温升风险',fields:['coolant_temperature','engine_rpm','tractive_power'],part:'发动机冷却与动力系统',recommendation:'检查冷却液、散热器、风扇和持续高负载工况。'},
    {code:'HYDRAULIC_ANOMALY',name:'液压系统压力异常',fields:['hydraulic_pressure','tractive_power'],part:'液压泵阀与执行管路',recommendation:'检查液压油位、泵阀、管路泄漏和执行机构响应。'},
    {code:'CHASSIS_VIBRATION',name:'传动或底盘振动异常',fields:['body_vibration','engine_rpm','payload'],part:'传动轴、悬挂与车架',recommendation:'检查传动轴、轮胎、悬挂连接及车架紧固状态。'},
  ],'车辆动力、液压与承载状态保持协调。','动力系统、液压回路、传动底盘及承载结构'),
  electrical: profile('electrical','电气设备及输变电装置',60,240,'未来 4 小时','ELE-TD v2.4.0',[
    ['load_current','负载电流','A',45,420,230,42,1,'high',.18,'一次回路与负载侧','MMXU1.A'],
    ['voltage','运行电压','kV',9.6,10.8,10.2,.18,2,'both',.15,'母线、套管与连接端子','MMXU1.PhV'],
    ['oil_temperature','油温','°C',25,85,52,6,1,'high',.2,'油箱与冷却系统','TTMP1.Tmp'],
    ['winding_temperature','绕组温度','°C',30,105,68,8,1,'high',.2,'绕组及绝缘系统','TTMP2.Tmp'],
    ['partial_discharge','局部放电量','pC',0,80,24,9,1,'high',.17,'套管、绕组与绝缘连接'],
    ['vibration','电磁振动','mm/s',0,4.5,1.45,.45,2,'high',.1,'铁芯、夹件与安装基础','SVBR1.Vbr'],
  ],[
    {code:'INSULATION_DEGRADATION',name:'绝缘劣化风险',fields:['winding_temperature','partial_discharge','voltage'],part:'绕组、套管及绝缘连接',recommendation:'复核局放趋势、介损与绝缘油试验结果，检查套管和引线连接。',serious:true},
    {code:'THERMAL_OVERLOAD',name:'热负荷异常',fields:['load_current','oil_temperature','winding_temperature'],part:'绕组与冷却系统',recommendation:'核对负载曲线、冷却器投运状态和绕组热点温升。'},
    {code:'CORE_VIBRATION',name:'铁芯电磁振动异常',fields:['vibration','voltage','load_current'],part:'铁芯、夹件及基础',recommendation:'检查铁芯夹紧、谐波电流和设备基础连接。'},
  ],'电气负载、温升、绝缘与振动指标保持稳定。','绕组绝缘、套管连接、冷却系统及铁芯夹件'),
  valve: profile('valve','阀门及液压执行机构',10,180,'未来 30 分钟','VLV-TD v2.1.0',[
    ['valve_position','阀位开度','%',0,100,54,18,1,'both',.12,'阀板、阀杆与定位机构'],
    ['differential_pressure','阀前后压差','MPa',.02,1.2,.46,.12,3,'both',.18,'阀体与上下游管路','MMXU1.Pres'],
    ['actuation_time','动作时间','s',1.2,12,4.6,.8,2,'high',.2,'执行器与传动机构'],
    ['hydraulic_pressure','执行油压','MPa',7,16,11.5,1.2,2,'both',.2,'液压泵站、阀组与油缸','MMXU2.Pres'],
    ['motor_current','执行器电流','A',1,18,7.5,1.5,2,'high',.15,'驱动电机与控制回路','MMXU1.A'],
    ['position_error','阀位偏差','%',0,3,.8,.28,2,'high',.15,'定位器、反馈机构与阀杆'],
  ],[
    {code:'VALVE_STICTION',name:'阀门卡涩风险',fields:['actuation_time','position_error','motor_current'],part:'阀杆、传动机构与定位器',recommendation:'检查阀杆摩擦、填料压紧、执行器传动和定位反馈。'},
    {code:'HYDRAULIC_LEAK',name:'液压执行回路泄漏',fields:['hydraulic_pressure','actuation_time','valve_position'],part:'液压泵站、阀组与油缸',recommendation:'检查油路压力保持、密封件、管接头和执行油缸。'},
    {code:'FLOW_RESTRICTION',name:'阀体流阻异常',fields:['differential_pressure','valve_position','position_error'],part:'阀体、阀板及上下游流道',recommendation:'核对开度与压差关系，检查阀体沉积、异物和阀板变形。'},
  ],'阀位响应、压差与执行机构状态协调。','阀体、阀杆、定位反馈及液压执行回路'),
  process: profile('process','破碎筛分及矿物加工设备',30,240,'未来 2 小时','MPR-TD v2.0.0',[
    ['feed_rate','给料量','t/h',40,320,185,28,1,'both',.16,'给料口与输送装置'],
    ['drive_current','主机电流','A',35,360,205,34,1,'high',.2,'主驱动电机与传动系统','MMXU1.A'],
    ['bearing_temperature','轴承温度','°C',25,82,52,6,1,'high',.18,'主轴承与润滑系统','TTMP1.Tmp'],
    ['vibration','机体振动','mm/s',0,7.1,2.5,.75,2,'high',.22,'主轴、筛体或破碎腔及基础','SVBR1.Vbr'],
    ['product_size','出料粒度','mm',0,45,18,4.2,1,'high',.12,'破碎腔、筛面与排料口'],
    ['throughput_efficiency','处理效率','%',72,100,89,3.2,1,'low',.12,'给料、主机与排料系统'],
  ],[
    {code:'PROCESS_BLOCKAGE',name:'物料堵塞风险',fields:['feed_rate','drive_current','throughput_efficiency'],part:'给料口、工作腔与排料通道',recommendation:'核对给料均匀性，检查工作腔、筛面和排料通道积料。'},
    {code:'BEARING_WEAR',name:'主轴承磨损风险',fields:['bearing_temperature','vibration','drive_current'],part:'主轴承与传动系统',recommendation:'检查轴承游隙、润滑油状态、联轴器和基础紧固。'},
    {code:'PRODUCT_DEVIATION',name:'产品粒度偏离',fields:['product_size','feed_rate','throughput_efficiency'],part:'破碎腔、筛面与排料口',recommendation:'复核工作间隙、筛面完整性和给料粒度分布。'},
  ],'给料、驱动、振动与处理效率处于协调区间。','给排料通道、工作腔、主轴承及传动系统'),
  marine: profile('marine','船舶及港航装备',60,240,'未来 4 小时','MAR-TD v2.2.0',[
    ['shaft_speed','轴系转速','r/min',45,160,96,14,1,'both',.12,'主机、轴系与推进装置','MMXU1.RotSpd'],
    ['engine_load','主机负荷','%',18,92,58,10,1,'high',.18,'主机与推进系统'],
    ['lubricating_pressure','润滑油压力','MPa',.25,.62,.43,.04,3,'both',.17,'主机润滑与过滤回路','MMXU1.Pres'],
    ['bearing_temperature','轴承温度','°C',32,82,57,5,1,'high',.18,'轴承、艉轴与润滑系统','TTMP1.Tmp'],
    ['hull_vibration','船体振动','mm/s',0,6.3,2.2,.65,2,'high',.18,'机舱基座、轴系与船体结构','SVBR1.Vbr'],
    ['navigation_deviation','航行偏差','°',0,4,.9,.35,2,'high',.17,'操舵、导航与定位系统'],
  ],[
    {code:'PROPULSION_VIBRATION',name:'推进轴系振动异常',fields:['hull_vibration','shaft_speed','bearing_temperature'],part:'主机基座、轴系与推进装置',recommendation:'检查轴系对中、艉轴承、螺旋桨和主机基座连接。'},
    {code:'LUBRICATION_ANOMALY',name:'润滑状态异常',fields:['lubricating_pressure','bearing_temperature','engine_load'],part:'主机与轴系润滑回路',recommendation:'检查润滑油压力、温度、滤器压差和轴承供油状态。'},
    {code:'NAVIGATION_CONTROL',name:'航向控制偏差',fields:['navigation_deviation','engine_load','shaft_speed'],part:'操舵、导航与推进控制系统',recommendation:'复核舵角反馈、定位信号、推进响应和风流影响。'},
  ],'推进、润滑、结构与航向控制状态稳定。','推进轴系、润滑回路、机舱基座及导航控制'),
  hvac: profile('hvac','通风制冷及压缩设备',30,240,'未来 2 小时','HVC-TD v2.0.0',[
    ['suction_pressure','吸气压力','MPa',.18,.58,.36,.05,3,'both',.16,'吸气管路与蒸发器','MMXU1.Pres'],
    ['discharge_pressure','排气压力','MPa',.75,1.85,1.25,.13,3,'both',.18,'压缩机与冷凝器','MMXU2.Pres'],
    ['discharge_temperature','排气温度','°C',45,105,72,7,1,'high',.2,'压缩机排气腔与冷却回路','TTMP1.Tmp'],
    ['motor_current','电机电流','A',12,96,52,9,1,'high',.16,'驱动电机与变频器','MMXU1.A'],
    ['vibration','机组振动','mm/s',0,4.5,1.5,.5,2,'high',.18,'压缩机、风机与安装基础','SVBR1.Vbr'],
    ['efficiency','运行效率','%',68,100,86,3.5,1,'low',.12,'换热器与循环系统'],
  ],[
    {code:'REFRIGERANT_ANOMALY',name:'工质循环异常',fields:['suction_pressure','discharge_pressure','efficiency'],part:'蒸发器、冷凝器与工质回路',recommendation:'检查工质充注量、过滤器、换热器和节流部件。'},
    {code:'COMPRESSOR_OVERHEAT',name:'压缩机温升异常',fields:['discharge_temperature','motor_current','vibration'],part:'压缩机、电机与冷却回路',recommendation:'检查排气温度、润滑冷却、电机负荷及压缩机机械状态。'},
    {code:'FAN_IMBALANCE',name:'风机或旋转部件不平衡',fields:['vibration','motor_current','efficiency'],part:'叶轮、转子与安装基础',recommendation:'检查叶轮积尘结冰、转子平衡、轴承和基础紧固。'},
  ],'压力、温升、振动与换热效率保持稳定。','压缩机、风机、换热器及工质循环回路'),
  structural: profile('structural','水工及大型结构设施',300,144,'未来 12 小时','STR-TD v2.1.0',[
    ['displacement','结构位移','mm',-8,8,.6,1.1,2,'both',.2,'主体结构与变形缝'],
    ['seepage_pressure','渗压','kPa',20,180,92,14,1,'high',.2,'坝基、廊道与排水系统'],
    ['joint_opening','接缝开度','mm',0,2.8,.9,.22,2,'high',.16,'伸缩缝与结构接缝'],
    ['stress','结构应力','MPa',-4,18,6.5,2.1,2,'both',.18,'受力构件与基础连接'],
    ['temperature','结构温度','°C',4,38,21,4,1,'both',.1,'坝体与环境边界','TTMP1.Tmp'],
    ['crack_index','裂缝变化率','mm/d',0,.08,.018,.008,3,'high',.16,'表面裂缝与施工缝'],
  ],[
    {code:'SEEPAGE_RISE',name:'渗流状态升高',fields:['seepage_pressure','displacement','joint_opening'],part:'坝基、廊道与排水系统',recommendation:'复核上游水位、渗压测点、排水孔和廊道渗流状态。'},
    {code:'STRUCTURAL_DEFORMATION',name:'结构变形发展',fields:['displacement','stress','crack_index'],part:'主体结构、接缝与基础',recommendation:'核对位移、应力和裂缝趋势，检查相邻测点空间一致性。',serious:true},
    {code:'JOINT_ANOMALY',name:'结构接缝异常',fields:['joint_opening','temperature','displacement'],part:'伸缩缝与结构接缝',recommendation:'结合温度变化检查接缝开度、止水及邻近结构状态。'},
  ],'结构位移、渗压、接缝与应力变化保持协调。','主体结构、坝基排水、接缝及裂缝测区'),
  robot: profile('robot','工业机器人及自动化装备',5,240,'未来 20 分钟','ROB-TD v2.0.0',[
    ['joint_current','关节电流','A',.4,18,7.2,1.5,2,'high',.18,'伺服电机与驱动器','MMXU1.A'],
    ['joint_temperature','关节温度','°C',25,78,49,5,1,'high',.18,'伺服电机与减速器','TTMP1.Tmp'],
    ['position_error','定位误差','mm',0,.8,.19,.07,3,'high',.22,'编码器、减速器与关节机构'],
    ['repeatability','重复定位精度','mm',0,.5,.12,.05,3,'high',.16,'末端执行器与关节链'],
    ['vibration','关节振动','mm/s',0,4.5,1.2,.42,2,'high',.16,'关节轴承、减速器与底座','SVBR1.Vbr'],
    ['cycle_time','作业节拍','s',8,32,17,2.2,2,'high',.1,'控制程序与工作站协同'],
  ],[
    {code:'JOINT_WEAR',name:'关节传动磨损风险',fields:['position_error','vibration','joint_current'],part:'减速器、轴承与关节传动',recommendation:'检查关节回差、减速器润滑、轴承状态和负载分布。'},
    {code:'SERVO_THERMAL',name:'伺服驱动温升异常',fields:['joint_temperature','joint_current','cycle_time'],part:'伺服电机与驱动器',recommendation:'检查伺服负载、电机散热、制动状态和动作节拍。'},
    {code:'POSITION_ACCURACY',name:'定位精度下降',fields:['position_error','repeatability','cycle_time'],part:'编码器、标定参数与末端执行器',recommendation:'复核零点、编码器反馈、工具坐标和机械连接。'},
  ],'关节驱动、定位精度与作业节拍保持稳定。','伺服驱动、减速器、编码器及末端执行器'),
  inspection: profile('inspection','视觉检测及部件状态监测',10,180,'未来 30 分钟','VIS-TD v2.0.0',[
    ['defect_score','缺陷特征值','%',0,35,12,3.5,1,'high',.24,'目标检测区域'],
    ['deformation','形变幅值','mm',0,3.5,.9,.24,2,'high',.18,'结构边缘与连接区域'],
    ['surface_temperature','表面温度','°C',10,75,39,5,1,'high',.12,'目标表面与连接区域','TTMP1.Tmp'],
    ['displacement','相对位移','mm',0,2.4,.55,.16,2,'high',.18,'紧固与连接部位'],
    ['confidence','识别置信度','%',72,100,91,2.2,1,'low',.14,'成像与识别链路'],
    ['change_rate','缺陷变化率','%/h',0,6,1.2,.42,2,'high',.14,'缺陷区域与相邻结构'],
  ],[
    {code:'DEFECT_DEVELOPMENT',name:'缺陷特征持续发展',fields:['defect_score','change_rate','deformation'],part:'识别缺陷区域及相邻结构',recommendation:'复核原始图像、缺陷边界和相邻结构，安排近距离检查。'},
    {code:'CONNECTION_LOOSENING',name:'连接状态异常',fields:['displacement','deformation','defect_score'],part:'紧固件、连接面与焊缝区域',recommendation:'检查连接位移、紧固状态、焊缝或密封界面。'},
    {code:'INSPECTION_QUALITY',name:'识别质量下降',fields:['confidence','surface_temperature','change_rate'],part:'成像区域与识别链路',recommendation:'检查镜头清洁、照明、拍摄角度和目标遮挡情况。'},
  ],'目标区域特征、形变与识别质量保持稳定。','目标缺陷区域、连接界面及成像识别链路'),
  drilling: profile('drilling','钻孔及土方作业设备',30,240,'未来 2 小时','DRL-TD v2.0.0',[
    ['rotation_speed','回转速度','r/min',20,180,92,18,1,'both',.14,'回转机构与钻杆','MMXU1.RotSpd'],
    ['feed_pressure','推进压力','MPa',4,22,12.5,2.1,2,'both',.2,'推进油缸与液压回路','MMXU1.Pres'],
    ['motor_current','驱动电流','A',20,240,128,22,1,'high',.18,'回转电机与供电回路','MMXU1.A'],
    ['vibration','钻架振动','mm/s',0,8,3.1,.8,2,'high',.2,'钻杆、钻架与履带底盘','SVBR1.Vbr'],
    ['penetration_rate','钻进速度','m/min',.1,2.8,1.25,.28,2,'both',.14,'钻头、钻杆与岩层接触区'],
    ['hydraulic_temperature','液压油温','°C',28,82,52,6,1,'high',.14,'液压泵站与冷却回路','TTMP1.Tmp'],
  ],[
    {code:'BIT_WEAR',name:'钻具磨损风险',fields:['penetration_rate','motor_current','vibration'],part:'钻头与钻杆连接',recommendation:'核对钻进速度、回转负荷和振动，检查钻头磨损及钻杆连接。'},
    {code:'HYDRAULIC_FEED',name:'推进液压异常',fields:['feed_pressure','hydraulic_temperature','penetration_rate'],part:'推进油缸、泵阀与管路',recommendation:'检查推进压力、油温、泵阀泄漏和油缸响应。'},
    {code:'DRILL_STRUCTURE',name:'钻架振动异常',fields:['vibration','rotation_speed','feed_pressure'],part:'钻架、回转机构与底盘',recommendation:'检查钻架紧固、回转支承、履带底盘和作业姿态。'},
  ],'回转、推进、钻进与液压温升关系稳定。','钻具、推进液压、回转机构及钻架底盘'),
  instrumentation: profile('instrumentation','传感器及监测单元',60,240,'未来 4 小时','INS-TD v2.0.0',[
    ['flow_rate','瞬时流量','m³/h',8,280,126,20,2,'both',.22,'流量传感器与测量管段','MMXU1.Flwrte'],
    ['pressure','管路压力','MPa',.05,.82,.38,.07,3,'both',.16,'传感器安装管段与阀件','MMXU1.Pres'],
    ['conductivity','电导率','μS/cm',120,1800,760,95,1,'high',.16,'水质探头与取样点'],
    ['turbidity','浊度','NTU',0,80,18,4,1,'high',.18,'排口与水质探头'],
    ['signal_quality','信号质量','%',75,100,94,2,1,'low',.16,'采集终端与通信链路'],
    ['sensor_drift','零点漂移','%',-2.5,2.5,.2,.35,2,'both',.12,'传感器标定与补偿单元'],
  ],[
    {code:'DISCHARGE_ANOMALY',name:'排放工况异常',fields:['flow_rate','turbidity','conductivity'],part:'排口、测量管段与水质探头',recommendation:'复核流量、水质指标及工艺运行记录，检查排口工况。',serious:true},
    {code:'SENSOR_DRIFT',name:'传感器漂移风险',fields:['sensor_drift','signal_quality','flow_rate'],part:'传感器标定与采集终端',recommendation:'执行零点复核和比对测量，检查探头污染及补偿参数。'},
    {code:'COMMUNICATION_QUALITY',name:'采集链路质量下降',fields:['signal_quality','sensor_drift'],part:'采集终端、供电与通信链路',recommendation:'检查终端供电、通信质量、时钟同步和点位映射。'},
  ],'流量、水质与采集链路指标保持稳定。','排口测量管段、水质探头、采集终端及通信链路'),
  waterTreatment: profile('water-treatment','污水处理工艺设备',60,240,'未来 4 小时','WTR-TD v2.1.0',[
    ['inlet_flow','进水流量','m³/h',80,720,360,55,1,'both',.16,'进水管路与提升单元','MMXU1.Flwrte'],
    ['dissolved_oxygen','溶解氧','mg/L',1.5,4.5,2.8,.35,2,'both',.18,'曝气池与鼓风系统'],
    ['sludge_concentration','污泥浓度','mg/L',1800,4800,3200,280,1,'both',.17,'生化池与污泥回流系统'],
    ['effluent_turbidity','出水浊度','NTU',0,12,4.8,1.1,2,'high',.18,'沉淀池、过滤与出水单元'],
    ['blower_current','鼓风机电流','A',28,240,126,18,1,'high',.15,'鼓风机与曝气管路','MMXU1.A'],
    ['effluent_cod','出水 COD','mg/L',0,50,27,4,1,'high',.16,'生化处理与出水监测单元'],
  ],[
    {code:'AERATION_EFFICIENCY',name:'曝气效率下降',fields:['dissolved_oxygen','blower_current','effluent_cod'],part:'鼓风机、曝气管路与生化池',recommendation:'核对鼓风量、溶解氧分布、曝气头阻力和生化池负荷。'},
    {code:'SLUDGE_PROCESS',name:'污泥工况异常',fields:['sludge_concentration','inlet_flow','effluent_turbidity'],part:'生化池、回流污泥与沉淀单元',recommendation:'检查污泥浓度、回流比、沉降性能和进水负荷变化。'},
    {code:'EFFLUENT_QUALITY',name:'出水指标升高',fields:['effluent_cod','effluent_turbidity','dissolved_oxygen'],part:'生化处理、沉淀与出水监测单元',recommendation:'复核进出水水质、工艺参数和在线仪表，比对实验室检测结果。',serious:true},
  ],'进水负荷、生化处理与出水指标保持稳定。','进水提升、曝气系统、污泥回流及出水单元'),
  navigation: profile('navigation','航标及船舶电子设备',30,240,'未来 2 小时','NAV-TD v2.0.0',[
    ['supply_voltage','供电电压','V',21.6,28.8,25.2,.8,2,'both',.17,'电源、蓄电池与充电单元','MMXU1.PhV'],
    ['equipment_current','设备电流','A',.2,18,6.5,1.2,2,'high',.14,'信号灯、天线与收发单元','MMXU1.A'],
    ['enclosure_temperature','机箱温度','°C',-10,65,34,5,1,'high',.14,'电子机箱与散热部件','TTMP1.Tmp'],
    ['bearing_error','方位偏差','°',-2,2,.1,.28,2,'both',.2,'天线方位、姿态与标定机构'],
    ['signal_quality','信号质量','%',72,100,91,2.5,1,'low',.2,'天线、收发机与通信链路'],
    ['communication_delay','通信时延','ms',0,850,210,55,1,'high',.15,'通信终端与岸基链路'],
  ],[
    {code:'POWER_SUPPLY',name:'供电状态异常',fields:['supply_voltage','equipment_current','enclosure_temperature'],part:'蓄电池、充电控制与供电回路',recommendation:'检查供电电压、蓄电池容量、充电控制器和接线端子。'},
    {code:'BEARING_CALIBRATION',name:'方位标定偏差',fields:['bearing_error','signal_quality'],part:'天线方位、姿态传感与标定机构',recommendation:'复核方位零点、姿态安装、编码反馈和参考目标。'},
    {code:'COMMUNICATION_LINK',name:'通信链路质量下降',fields:['signal_quality','communication_delay','equipment_current'],part:'天线、收发机及岸基通信链路',recommendation:'检查天线连接、收发状态、链路时延和周边电磁环境。'},
  ],'供电、方位、信号与通信链路状态稳定。','供电单元、天线方位、收发机及通信链路'),
  general: profile('general','工业设备',30,240,'未来 2 小时','IND-TD v2.0.0',[
    ['load_rate','设备负载率','%',15,92,58,9,1,'high',.18,'主工作机构与承载部件'],
    ['drive_current','驱动电流','A',8,180,86,16,1,'high',.18,'驱动电机与电气回路','MMXU1.A'],
    ['temperature','关键部位温度','°C',20,82,49,6,1,'high',.18,'轴承、驱动与散热部位','TTMP1.Tmp'],
    ['vibration','机械振动','mm/s',0,5.6,1.9,.58,2,'high',.2,'传动部件与安装基础','SVBR1.Vbr'],
    ['response_time','动作响应时间','s',.2,12,4.2,.7,2,'high',.13,'控制器与执行机构'],
    ['operating_efficiency','运行效率','%',70,100,88,3.1,1,'low',.13,'主机与辅助系统'],
  ],[
    {code:'DRIVE_LOAD',name:'驱动负荷异常',fields:['load_rate','drive_current','temperature'],part:'主工作机构与驱动系统',recommendation:'核对负载、驱动电流、散热与连续运行工况。'},
    {code:'MECHANICAL_CONDITION',name:'机械状态异常',fields:['vibration','temperature','operating_efficiency'],part:'传动部件、轴承与安装基础',recommendation:'检查紧固、对中、轴承润滑和传动连接。'},
    {code:'CONTROL_RESPONSE',name:'控制响应偏离',fields:['response_time','load_rate','operating_efficiency'],part:'控制器、反馈元件与执行机构',recommendation:'复核控制设定、反馈信号和执行机构响应。'},
  ],'负载、驱动、温升与机械状态保持稳定。','主工作机构、驱动系统、传动部件及控制回路'),
};

function selectProfile(text:string):ModelOperationalProfile {
  if(/污水处理|水处理设备/.test(text))return PROFILES.waterTreatment;
  if(/航标|浮标|雷达|天线|磁控管/.test(text))return PROFILES.navigation;
  if(/水轮|水电|转轮|导轴承|推力轴承|调速系统|机组轴系|水轮发电机组/.test(text))return PROFILES.hydro;
  if(/泵|排水|消防增压/.test(text))return PROFILES.pump;
  if(/起重|吊|启闭机|钢丝绳|岸桥|场桥|桥式|门座/.test(text))return PROFILES.crane;
  if(/钻|钻孔/.test(text))return PROFILES.drilling;
  if(/卡车|车辆|挖掘|装载|推土|叉车|铲运|自卸|轮胎|履带/.test(text))return PROFILES.vehicle;
  if(/变压器|输电|断路器|GIS|电气|绕组|发电机/.test(text))return PROFILES.electrical;
  if(/阀|闸门|定位器|液压站/.test(text))return PROFILES.valve;
  if(/破碎|粉碎|球磨|选矿|筛砂|筛分|制砂/.test(text))return PROFILES.process;
  if(/船|港|泊|航标|浮标|雷达|螺旋桨|疏浚|挖泥/.test(text))return PROFILES.marine;
  if(/空调|冷水机|压缩机|通风|风机|冷却塔|冷媒/.test(text))return PROFILES.hvac;
  if(/大坝|水工建筑|坝体|BIM/.test(text))return PROFILES.structural;
  if(/机器人|机械臂|伺服/.test(text))return PROFILES.robot;
  if(/传感器|排污口|水质|监测单元/.test(text))return PROFILES.instrumentation;
  if(/视觉|缺陷|裂缝|渗漏|松动|磨损|损伤|变形|检测/.test(text))return PROFILES.inspection;
  return PROFILES.general;
}
const BINDING_TEXT=new Map(PAGE_MODEL_BINDINGS.map(binding=>[binding.viewId,`${binding.pageTitle} ${binding.modelName} ${binding.adaptation}`]));
const PROFILE_OVERRIDES:Partial<Record<ModelShowcaseSceneId,string>>={
  'ia-ship-cii':'marine','vibe-ShipAirConditioning':'hvac','sim-port-dredge':'marine','dd-hydro-bim':'structural',
  'pm-hydro-13':'valve','mpm-60':'hvac','vibe-ShipCompressor':'hvac','cv-excavator-bucket':'inspection',
  'cv-truck-tire':'inspection','cv-hull-damage':'inspection','cv-ship-propeller':'inspection','cv-cooling-tower-fan':'inspection',
};
export function getModelOperationalProfile(sceneId:ModelShowcaseSceneId):ModelOperationalProfile {
  if(sceneId==='sim-visual-hydro-turbine')return PROFILES.hydro;
  if(sceneId==='sim-visual-wastewater-pump')return PROFILES.pump;
  if(sceneId==='sim-visual-bridge-crane')return PROFILES.crane;
  if(sceneId==='sim-visual-haul-truck')return PROFILES.vehicle;
  const override=PROFILE_OVERRIDES[sceneId];
  return override?PROFILES[override]:selectProfile(BINDING_TEXT.get(sceneId)||sceneId);
}
export function operationalProfileEntries(){
  const fixed:ModelShowcaseSceneId[]=['sim-visual-hydro-turbine','sim-visual-wastewater-pump','sim-visual-bridge-crane','sim-visual-haul-truck'];
  return [...fixed,...PAGE_MODEL_BINDINGS.map(binding=>binding.viewId as ModelShowcaseSceneId)].map(sceneId=>({sceneId,profile:getModelOperationalProfile(sceneId)}));
}
