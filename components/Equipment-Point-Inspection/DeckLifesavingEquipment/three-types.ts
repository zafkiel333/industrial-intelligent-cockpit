export interface DeckLifesavingEquipmentProps {
  equipmentStatus: number; // 0: Normal, 1: Warning, 2: Error
  weatherCondition: number; // 0: Clear, 1: Rain, 2: Storm
  releaseMechanismReady: boolean;
  isAlert: boolean;
}
