export interface BearingState {
  scrapingProgress: number; // 0 to 100
  contactPoints: number; // 0 to 100 (high spots)
  isScraping: boolean;
  isRotating: boolean;
}
