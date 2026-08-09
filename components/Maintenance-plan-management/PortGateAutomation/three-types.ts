export interface PortGateAutomationProps {
  truckPosition: number;
  gateStatus: 'closed' | 'opening' | 'open' | 'closing';
  isInspecting: boolean;
}
