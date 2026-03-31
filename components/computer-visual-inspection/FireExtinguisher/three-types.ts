export interface ExtinguisherStatus {
  pressure: number; // 0-2 MPa, normal is 1.2-1.5
  expiryDate: string;
  isExpired: boolean;
  corrosionLevel: number; // 0-1
  location: string;
  lastInspected: string;
}
