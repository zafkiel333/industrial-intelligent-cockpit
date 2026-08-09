export interface DiversionChannelProps {
  flowRate: number; // m³/s
  sedimentLevel: number; // 0-100%
  gateStatus: 'open' | 'closed' | 'partial';
  isAlert: boolean;
}
