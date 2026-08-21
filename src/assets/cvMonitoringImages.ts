const cvAsset = (fileName: string): string => (
  `${import.meta.env.BASE_URL}assets/computer-visual-inspection/${fileName}`
);

export const CV_MONITORING_IMAGES = Object.freeze({
  solarPanel: cvAsset('solar-panel-inspection.png'),
  transmissionInsulator: cvAsset('transmission-insulator-inspection.png'),
  transformerOilLeak: cvAsset('transformer-oil-leak-inspection.png'),
  sluiceGateSeal: cvAsset('sluice-gate-seal-inspection.png'),
  damConcreteCrack: cvAsset('dam-concrete-crack-inspection.png'),
  conveyorForeignObject: cvAsset('conveyor-foreign-object-inspection.png'),
});
