export interface BoardingBridgeStatus {
  telescopicLength: number; // 伸缩长度 0-1
  cabRotation: number; // 接船口旋转角度
  tunnelAngle: number; // 坡度
  isDocked: boolean;
  inspectingPart?: string;
}

export type StructuralMarker = {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'error';
  stress: number;
  position: [number, number, number];
};
