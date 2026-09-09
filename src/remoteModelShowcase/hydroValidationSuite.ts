export type HydroValidationTag = 'normal' | 'abnormal';
export type HydroFaultCode = 'SHAFT_IMBALANCE' | 'BEARING_OVERHEAT' | 'HYDRAULIC_INSTABILITY' | 'POWER_DEGRADATION';

export interface HydroValidationRow {
  case_id: string;
  timestamp: string;
  device_id: string;
  quality: 'good' | 'uncertain';
  rpm: number;
  temperature: number;
  vibration: number;
  pressure: number;
  flow_rate: number;
  power_output: number;
  actual_tag?: HydroValidationTag;
  actual_fault_code?: HydroFaultCode | '';
  actual_fault_name?: string;
  actual_fault_part?: string;
}

export interface HydroValidationCaseDefinition {
  caseId: string;
  deviceId: string;
  actualTag: HydroValidationTag;
  faultCode: HydroFaultCode | null;
  faultName: string;
  faultPart: string;
  observationCount: number;
  verificationCount: number;
  sampleIntervalSeconds: number;
  observationStart: string;
  observationEnd: string;
  verificationStart: string;
  verificationEnd: string;
}

export interface HydroValidationCaseData {
  definition: HydroValidationCaseDefinition;
  observation: HydroValidationRow[];
  verification: HydroValidationRow[];
}

export const HYDRO_VALIDATION_FIELDS = [
  { field: 'rpm', label: '转速', unit: 'r/min', normalMin: 140, normalMax: 160, base: 150, amplitude: 2.6, decimals: 1 },
  { field: 'temperature', label: '轴承温度', unit: '°C', normalMin: 35, normalMax: 75, base: 54, amplitude: 3.6, decimals: 1 },
  { field: 'vibration', label: '主轴振动', unit: 'mm/s', normalMin: 0, normalMax: 4.5, base: 1.65, amplitude: 0.42, decimals: 2 },
  { field: 'pressure', label: '水压', unit: 'MPa', normalMin: 1.1, normalMax: 2.4, base: 1.76, amplitude: 0.16, decimals: 2 },
  { field: 'flow_rate', label: '流量', unit: 'm³/s', normalMin: 18, normalMax: 42, base: 31, amplitude: 2.8, decimals: 2 },
  { field: 'power_output', label: '输出功率', unit: 'MW', normalMin: 12, normalMax: 32, base: 23.2, amplitude: 2.5, decimals: 2 },
] as const;

export const HYDRO_VALIDATION_FAULTS: Record<HydroFaultCode, { name: string; part: string }> = {
  SHAFT_IMBALANCE: { name: '轴系不平衡风险', part: '主轴、联轴器与转轮' },
  BEARING_OVERHEAT: { name: '轴承温升异常', part: '主轴承及润滑冷却回路' },
  HYDRAULIC_INSTABILITY: { name: '水力工况失稳', part: '引水流道与导叶机构' },
  POWER_DEGRADATION: { name: '机组出力衰减', part: '发电机及励磁系统' },
};

const ABNORMAL_CASES = new Set([2, 4, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 44, 48]);
const FAULT_SEQUENCE: HydroFaultCode[] = ['SHAFT_IMBALANCE', 'BEARING_OVERHEAT', 'HYDRAULIC_INSTABILITY', 'POWER_DEGRADATION'];

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function noise(random: () => number): number {
  return (random() + random() + random() + random() - 2) / 2;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function faultFor(index: number): HydroFaultCode | null {
  if (!ABNORMAL_CASES.has(index)) return null;
  const position = [...ABNORMAL_CASES].indexOf(index);
  return FAULT_SEQUENCE[position % FAULT_SEQUENCE.length];
}

function signalFault(index: number, actualFault: HydroFaultCode | null): HydroFaultCode | null {
  if (index === 46) return 'BEARING_OVERHEAT';
  if (index === 48) return null;
  if (index === 41) return 'BEARING_OVERHEAT';
  return actualFault;
}

function applyFault(values: Record<string, number>, fault: HydroFaultCode | null, strength: number, pulse: number): void {
  if (!fault || strength <= 0) return;
  if (fault === 'SHAFT_IMBALANCE') {
    values.vibration += 3.1 * strength + 0.55 * pulse * strength;
    values.rpm += 5.3 * strength + 1.8 * pulse * strength;
    values.temperature += 3.2 * strength;
  } else if (fault === 'BEARING_OVERHEAT') {
    values.temperature += 24 * strength;
    values.vibration += 1.45 * strength + 0.2 * pulse;
    values.power_output -= 1.8 * strength;
  } else if (fault === 'HYDRAULIC_INSTABILITY') {
    values.pressure -= 0.76 * strength + 0.1 * pulse;
    values.flow_rate -= 15.8 * strength + 1.8 * pulse;
    values.vibration += 2.15 * strength + 0.35 * pulse;
    values.power_output -= 5.1 * strength;
  } else {
    values.power_output -= 14.8 * strength;
    values.flow_rate -= 7.5 * strength;
    values.rpm -= 6.2 * strength;
    values.temperature += 2.8 * strength;
  }
}

function rowValues(caseIndex: number, absoluteIndex: number, observationCount: number, actualFault: HydroFaultCode | null, random: () => number): Record<string, number> {
  const phase = caseIndex * 0.47;
  const loadOffset = ((caseIndex % 7) - 3) / 3;
  const futureIndex = absoluteIndex - observationCount;
  const inVerification = futureIndex >= 0;
  const signal = signalFault(caseIndex, actualFault);
  const precursor = clamp((absoluteIndex - 118) / 61, 0, 1);
  let actualStrength = precursor;
  if (inVerification) {
    if (caseIndex === 46) actualStrength = Math.max(0, 1 - futureIndex / 54);
    else if (caseIndex === 48) actualStrength = clamp((futureIndex - 36) / 115, 0, 1.12);
    else actualStrength = clamp(1 + futureIndex / 210, 0, 1.42);
  }
  const activeFault = inVerification ? actualFault : signal;
  const phaseDrift = inVerification ? (caseIndex % 9 - 4) * 0.012 * futureIndex : 0;
  const cycle = Math.sin(absoluteIndex / 9.7 + phase + phaseDrift);
  const slow = Math.cos(absoluteIndex / 25.8 + phase * 0.6 + phaseDrift * 0.4);
  const pulse = Math.sin(absoluteIndex / 3.8 + phase * 1.7);
  const futureBias = inVerification ? Math.sin((caseIndex + 3) * 1.17) : 0;
  const values: Record<string, number> = {
    rpm: 150 + loadOffset * 0.9 + 2.6 * cycle + 0.45 * slow + noise(random) * 0.65 + futureBias * 3.3,
    temperature: 54 + loadOffset * 1.3 + 3.6 * Math.sin(absoluteIndex / 17.5 + phase * 0.7) + 0.8 * slow + noise(random) * 0.8 + futureBias * 7.2,
    vibration: 1.65 + loadOffset * 0.08 + 0.42 * Math.sin(absoluteIndex / 8.6 + phase * 1.2) + noise(random) * 0.16 + futureBias * 0.84,
    pressure: 1.76 + loadOffset * 0.04 + 0.16 * Math.cos(absoluteIndex / 14.2 + phase) + noise(random) * 0.045 + futureBias * 0.27,
    flow_rate: 31 + loadOffset * 0.8 + 2.8 * Math.sin(absoluteIndex / 15.2 + phase * 0.8) + noise(random) * 0.75 + futureBias * 6.3,
    power_output: 23.2 + loadOffset * 0.7 + 2.5 * Math.sin(absoluteIndex / 16.3 + phase * 0.82) + noise(random) * 0.65 + futureBias * 5.4,
  };
  applyFault(values, activeFault, actualStrength, pulse);
  return Object.fromEntries(HYDRO_VALIDATION_FIELDS.map((field) => [
    field.field,
    Number(Math.max(0, values[field.field]).toFixed(field.decimals)),
  ]));
}

export function hydroValidationDefinitions(): HydroValidationCaseDefinition[] {
  return Array.from({ length: 50 }, (_, offset) => {
    const caseIndex = offset + 1;
    const caseId = `HT-${String(caseIndex).padStart(2, '0')}`;
    const actualFault = faultFor(caseIndex);
    const start = Date.UTC(2026, 0, caseIndex, 0, 0, 0);
    const observationCount = 180;
    const verificationCount = 360;
    const interval = 60_000;
    return {
      caseId,
      deviceId: `2326-VAL-${String(caseIndex).padStart(2, '0')}`,
      actualTag: actualFault ? 'abnormal' : 'normal',
      faultCode: actualFault,
      faultName: actualFault ? HYDRO_VALIDATION_FAULTS[actualFault].name : '未发现故障状态',
      faultPart: actualFault ? HYDRO_VALIDATION_FAULTS[actualFault].part : '无',
      observationCount,
      verificationCount,
      sampleIntervalSeconds: 60,
      observationStart: new Date(start).toISOString(),
      observationEnd: new Date(start + (observationCount - 1) * interval).toISOString(),
      verificationStart: new Date(start + observationCount * interval).toISOString(),
      verificationEnd: new Date(start + (observationCount + verificationCount - 1) * interval).toISOString(),
    };
  });
}

export function generateHydroValidationCase(caseId: string): HydroValidationCaseData {
  const definition = hydroValidationDefinitions().find((item) => item.caseId === caseId);
  if (!definition) throw new Error(`未知水轮机验证组：${caseId}`);
  const caseIndex = Number(caseId.slice(-2));
  const random = seededRandom(232600 + caseIndex * 7919);
  const start = Date.parse(definition.observationStart);
  const total = definition.observationCount + definition.verificationCount;
  const rows = Array.from({ length: total }, (_, absoluteIndex) => {
    const values = rowValues(caseIndex, absoluteIndex, definition.observationCount, definition.faultCode, random);
    const base: HydroValidationRow = {
      case_id: definition.caseId,
      timestamp: new Date(start + absoluteIndex * definition.sampleIntervalSeconds * 1000).toISOString(),
      device_id: definition.deviceId,
      quality: absoluteIndex % 137 === 0 && absoluteIndex > 0 ? 'uncertain' : 'good',
      rpm: values.rpm,
      temperature: values.temperature,
      vibration: values.vibration,
      pressure: values.pressure,
      flow_rate: values.flow_rate,
      power_output: values.power_output,
    };
    if (absoluteIndex >= definition.observationCount) {
      base.actual_tag = definition.actualTag;
      base.actual_fault_code = definition.faultCode || '';
      base.actual_fault_name = definition.faultName;
      base.actual_fault_part = definition.faultPart;
    }
    return base;
  });
  return {
    definition,
    observation: rows.slice(0, definition.observationCount),
    verification: rows.slice(definition.observationCount),
  };
}

export function hydroValidationCsv(rows: HydroValidationRow[], includeTruth: boolean): string {
  const headers = [
    'case_id', 'timestamp', 'device_id', 'quality',
    ...HYDRO_VALIDATION_FIELDS.map((field) => field.field),
    ...(includeTruth ? ['actual_tag', 'actual_fault_code', 'actual_fault_name', 'actual_fault_part'] : []),
  ];
  const escape = (value: unknown) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => escape(row[header as keyof HydroValidationRow])).join(',')).join('\n')}\n`;
}
