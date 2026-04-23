//import React, { useState } from 'react'; /////
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { SmartOperationsView } from './views/SmartOperationsView';

import { InspectionOverviewView } from './views/InspectionOverviewView';
import { MaintenancePlanOverviewView } from './views/MaintenancePlanOverviewView';

import { AdvancedGenericView } from './views/AdvancedGenericView';
import { CockpitView } from './views/CockpitView';
import { PredictiveMaintenanceView } from './views/PredictiveMaintenanceView';
import { SparePartsView } from './views/SparePartsView';

import { ProductKnowledgeBaseOverviewView } from './views/ProductKnowledgeBaseOverviewView';
import { IndexAnalysisOverviewView } from './views/IndexAnalysisOverviewView';
import { DigitalDeliveryOverviewView } from './views/DigitalDeliveryOverviewView';
import { SimulationOverviewView } from './views/SimulationOverviewView';
import { CustomerDataOverviewView } from './views/CustomerDataOverviewView';
import { RemoteExpertOverviewView } from './views/RemoteExpertOverviewView';
import { AppMaintenanceOverviewView } from './views/AppMaintenanceOverviewView';
import { MockMaintenanceOverviewView } from './views/MockMaintenanceOverviewView';
import { OpsKnowledgeOverviewView } from './views/OpsKnowledgeOverviewView';
import { ServiceDataOverviewView } from './views/ServiceDataOverviewView';
import { LifeWarningOverviewView } from './views/LifeWarningOverviewView';
import { CVMonitorOverviewView } from './views/CVMonitorOverviewView';
import { VibrationMonitorOverviewView } from './views/VibrationMonitorOverviewView';
import { MaintenanceTrainingOverviewView } from './views/MaintenanceTrainingOverviewView';

//add testDataViews
import { Unit1PredictiveView } from './views/cockpit/unit1-predictive';

import { EquipmentView } from './views/EquipmentView';
import { GeneratorView } from './views/GeneratorView';
import { TransmissionView } from './views/TransmissionView';
import { PumpStationView } from './views/PumpStationView';
import { OutfallView } from './views/OutfallView';
import { WastewaterView } from './views/WastewaterView';
import { WindTurbineView } from './views/WindTurbineView';
import { ShipView } from './views/ShipView';
import { BerthingView } from './views/BerthingView';
import { CraneView } from './views/CraneView';
import { NavigationMarkView } from './views/NavigationMarkView';
import { TachometerView } from './views/TachometerView';
import { MineHoistView } from './views/MineHoistView';
import { TunnelBoringMachineView } from './views/TunnelBoringMachineView';
import { DrillingRigView } from './views/DrillingRigView';
import { CrushingEquipmentView } from './views/CrushingEquipmentView';
import { MineralProcessingView } from './views/MineralProcessingView';
import { SandMakingView } from './views/SandMakingView';
// Knowledge Base Views
import { ShipPowerKbView } from './views/knowledge-base/ShipPowerKbView';
import { ChannelEquipKbView } from './views/knowledge-base/ChannelEquipKbView';
import { PortMachineryKbView } from './views/knowledge-base/PortMachineryKbView';
import { PortChannelSystemKbView } from './views/knowledge-base/PortChannelSystemKbView';
import { ShipLockKbView } from './views/knowledge-base/ShipLockKbView';
import { DispatchRulesKbView } from './views/knowledge-base/DispatchRulesKbView';
import { ShipChannelAdaptKbView } from './views/knowledge-base/ShipChannelAdaptKbView';
import { PortComboKbView } from './views/knowledge-base/PortComboKbView';
import { MiningEquipKbView } from './views/knowledge-base/MiningEquipKbView';
import { TransportEquipKbView } from './views/knowledge-base/TransportEquipKbView';
import { CrushingKbView } from './views/knowledge-base/CrushingKbView';
import { HydroGenKbView } from './views/knowledge-base/HydroGenKbView';
import { PumpedStorageKbView } from './views/knowledge-base/PumpedStorageKbView';
import { HydroAuxKbView } from './views/knowledge-base/HydroAuxKbView';
import { WaterConveyanceKbView } from './views/knowledge-base/WaterConveyanceKbView';

//import { MaritimeSafetyView } from './views/cockpit/MaritimeSafetyView';
// Index Analysis Views
import { MiningRecoveryView } from './views/index-analysis/MiningRecoveryView';
import { MineralRecoveryView as MineralRecoveryAnalysisView } from './views/index-analysis/MineralRecoveryView';
import { MiningOeeView } from './views/index-analysis/MiningOeeView';
import { MiningTruckCycleView } from './views/index-analysis/MiningTruckCycleView';
import { BlastingQualityView } from './views/index-analysis/BlastingQualityView';
import { MiningEnergyView } from './views/index-analysis/MiningEnergyView';
import { VentilationEfficiencyView } from './views/index-analysis/VentilationEfficiencyView';
import { HydroUtilView } from './views/index-analysis/HydroUtilView';
import { SpillageLossView } from './views/index-analysis/SpillageLossView';
import { TurbineWearView } from './views/index-analysis/TurbineWearView';
import { ReservoirBenefitView } from './views/index-analysis/ReservoirBenefitView';
import { DamHealthView } from './views/index-analysis/DamHealthView';
import { PumpedStorageEfficiencyView } from './views/index-analysis/PumpedStorageEfficiencyView';
import { PowerRamView } from './views/index-analysis/PowerRamView';
import { BerthUtilView } from './views/index-analysis/BerthUtilView';
import { CraneEfficiencyView } from './views/index-analysis/CraneEfficiencyView';
import { ShipEeoiView } from './views/index-analysis/ShipEeoiView';
import { ShipCiiView } from './views/index-analysis/ShipCiiView';
import { LockEfficiencyView } from './views/index-analysis/LockEfficiencyView';
import { TransportConnectView } from './views/index-analysis/TransportConnectView';
import { ChannelSafetyView } from './views/index-analysis/ChannelSafetyView';

// Digital Delivery Views
import { HydroCompletionView } from './views/digital-delivery/HydroCompletionView';
import { HydroTwinDeliveryView } from './views/digital-delivery/HydroTwinDeliveryView';
import { HydroBimDeliveryView } from './views/digital-delivery/HydroBimDeliveryView';
import { HydroDispatchDeliveryView } from './views/digital-delivery/HydroDispatchDeliveryView';
import { HydroEquipLifecycleView } from './views/digital-delivery/HydroEquipLifecycleView';
import { DamSafetyDeliveryView } from './views/digital-delivery/DamSafetyDeliveryView';
import { HydroMonitorDeliveryView } from './views/digital-delivery/HydroMonitorDeliveryView';
import { FloodDispatchDeliveryView } from './views/digital-delivery/FloodDispatchDeliveryView';
import { HydroAssetDeliveryView } from './views/digital-delivery/HydroAssetDeliveryView';
import { MineConstructionDeliveryView } from './views/digital-delivery/MineConstructionDeliveryView';
import { MineBimDeliveryView } from './views/digital-delivery/MineBimDeliveryView';
import { MineProcessDeliveryView } from './views/digital-delivery/MineProcessDeliveryView';
import { MineProcessingDeliveryView } from './views/digital-delivery/MineProcessingDeliveryView';
import { MineEquipLifecycleView } from './views/digital-delivery/MineEquipLifecycleView';
import { MineSafetyDeliveryView } from './views/digital-delivery/MineSafetyDeliveryView';
import { MineEnergyDeliveryView } from './views/digital-delivery/MineEnergyDeliveryView';
import { MineEcoDeliveryView } from './views/digital-delivery/MineEcoDeliveryView';
import { PortCompletionDeliveryView } from './views/digital-delivery/PortCompletionDeliveryView';
import { PortBimDeliveryView } from './views/digital-delivery/PortBimDeliveryView';
import { ChannelRegulationDeliveryView } from './views/digital-delivery/ChannelRegulationDeliveryView';
import { ShipLockDeliveryView } from './views/digital-delivery/ShipLockDeliveryView';
import { SmartPortDeliveryView } from './views/digital-delivery/SmartPortDeliveryView';
import { NavDispatchDeliveryView } from './views/digital-delivery/NavDispatchDeliveryView';
import { ShipLifecycleDeliveryView } from './views/digital-delivery/ShipLifecycleDeliveryView';
import { PortAssetDeliveryView } from './views/digital-delivery/PortAssetDeliveryView';
import { ChannelMonitorDeliveryView } from './views/digital-delivery/ChannelMonitorDeliveryView';
import { NavSafetyDeliveryView } from './views/digital-delivery/NavSafetyDeliveryView';

// Simulation Views
import { MineVentilationSimView } from './views/simulation/MineVentilationSimView';
import { MineRoofStabilitySimView } from './views/simulation/MineRoofStabilitySimView';
import { MineBlastSimView } from './views/simulation/MineBlastSimView';
import { MineTruckRoutingSimView } from './views/simulation/MineTruckRoutingSimView';
import { MineSlopeStabilitySimView } from './views/simulation/MineSlopeStabilitySimView';
import { MineEquipStrengthSimView } from './views/simulation/MineEquipStrengthSimView';
import { MineBeltConveyorSimView } from './views/simulation/MineBeltConveyorSimView';
import { MineEvacuationSimView } from './views/simulation/MineEvacuationSimView';
import { MineWaterSimView } from './views/simulation/MineWaterSimView';
import { MinePowerSimView } from './views/simulation/MinePowerSimView';
import { MineCoopSimView } from './views/simulation/MineCoopSimView';
import { MineHoistSimView } from './views/simulation/MineHoistSimView';
import { MineDustSimView } from './views/simulation/MineDustSimView';
import { MineFreezeSimView } from './views/simulation/MineFreezeSimView';
import { MineCrashSimView } from './views/simulation/MineCrashSimView';
import { MineSlurrySimView } from './views/simulation/MineSlurrySimView';
import { MineDispatchSimView } from './views/simulation/MineDispatchSimView';
import { MineEcoSimView } from './views/simulation/MineEcoSimView';
import { HydroFloodSimView } from './views/simulation/HydroFloodSimView';
import { HydroSpillSimView } from './views/simulation/HydroSpillSimView';
import { HydroDamSimView } from './views/simulation/HydroDamSimView';
import { HydroGateSimView } from './views/simulation/HydroGateSimView';
import { HydroTurbineSimView } from './views/simulation/HydroTurbineSimView';
import { HydroRiverSimView } from './views/simulation/HydroRiverSimView';
import { HydroUrbanSimView } from './views/simulation/HydroUrbanSimView';
import { HydroSedimentSimView } from './views/simulation/HydroSedimentSimView';
import { HydroBreakSimView } from './views/simulation/HydroBreakSimView';
import { HydroTransitionSimView } from './views/simulation/HydroTransitionSimView';
import { HydroGroupDispatchSimView } from './views/simulation/HydroGroupDispatchSimView';
import { HydroPumpSimView } from './views/simulation/HydroPumpSimView';
import { HydroFishSimView } from './views/simulation/HydroFishSimView';
import { HydroGridDispatchSimView } from './views/simulation/HydroGridDispatchSimView';
import { HydroDamBreakSimView } from './views/simulation/HydroDamBreakSimView';
import { HydroIceFloodSimView } from './views/simulation/HydroIceFloodSimView';
import { HydroVibrationSimView } from './views/simulation/HydroVibrationSimView';
import { PortTrafficFlowSimView } from './views/simulation/PortTrafficFlowSimView';
import { ShipLockDispatchSimView } from './views/simulation/ShipLockDispatchSimView';
import { PortMotionSimView } from './views/simulation/PortMotionSimView';
import { PortTerminalLoadingSimView } from './views/simulation/PortTerminalLoadingSimView';
import { PortMultimodalSimView } from './views/simulation/PortMultimodalSimView';
import { ChannelRegulationSimView } from './views/simulation/ChannelRegulationSimView';
import { PortCollisionSimView } from './views/simulation/PortCollisionSimView';
import { PortSpillSimView } from './views/simulation/PortSpillSimView';
import { PortBerthingSimView } from './views/simulation/PortBerthingSimView';
import { PortDredgingSimView } from './views/simulation/PortDredgingSimView';
import { PortSchedSimView } from './views/simulation/PortSchedSimView';
import { PortBridgeSimView } from './views/simulation/PortBridgeSimView';
import { PortSurgeSimView } from './views/simulation/PortSurgeSimView';

//custom views
import { CustomerMasterDataView } from './views/cdm/CustomerMasterDataView';
import { CustomerOrgStructureView } from './views/cdm/CustomerOrgStructureView';
import { CustomerContactsView } from './views/cdm/CustomerContactsView';
import { CustomerCertificatesView } from './views/cdm/CustomerCertificatesView';
import { CustomerAssetsView } from './views/cdm/CustomerAssetsView';
import { CustomerSitesView } from './views/cdm/CustomerSitesView';
import { CustomerContractsView } from './views/cdm/CustomerContractsView';
import { CustomerWorkOrdersView } from './views/cdm/CustomerWorkOrdersView';
import { CustomerWarrantyView } from './views/cdm/CustomerWarrantyView';
import { CustomerPartsView } from './views/cdm/CustomerPartsView';
import { CustomerComplaintsView } from './views/cdm/CustomerComplaintsView';
import { CustomerFinanceView } from './views/cdm/CustomerFinanceView';
import { CustomerCreditView } from './views/cdm/CustomerCreditView';
import { CustomerSecurityView } from './views/cdm/CustomerSecurityView';
import { CustomerIntegrationView } from './views/cdm/CustomerIntegrationView';
import { CustomerLifecycleView } from './views/cdm/CustomerLifecycleView';
import { CustomerBehaviorView } from './views/cdm/CustomerBehaviorView';
import { CustomerSatisfactionView } from './views/cdm/CustomerSatisfactionView';
import { CustomerRiskComplianceView } from './views/cdm/CustomerRiskComplianceView';
import { CustomerDeliveryView } from './views/cdm/CustomerDeliveryView';
import { CustomerContractPerformanceView } from './views/cdm/CustomerContractPerformanceView';
import { CustomerDataPrivacyView } from './views/cdm/CustomerDataPrivacyView';
import { CustomerFinancePaymentView } from './views/cdm/CustomerFinancePaymentView';
import { CustomerSupportTrainingView } from './views/cdm/CustomerSupportTrainingView';
import { CustomerReportingView } from './views/cdm/CustomerReportingView';
import { CustomerSocialAnalysisView } from './views/cdm/CustomerSocialAnalysisView';
import { CustomerLoyaltyView } from './views/cdm/CustomerLoyaltyView';
import { CustomerServiceKbView } from './views/cdm/CustomerServiceKbView';
import { CustomerSupplyChainView } from './views/cdm/CustomerSupplyChainView';
import { CustomerPortalView } from './views/cdm/CustomerPortalView';
import { CustomerTenderingView } from './views/cdm/CustomerTenderingView';
import { CustomerCompetitorAnalysisView } from './views/cdm/CustomerCompetitorAnalysisView';
import { CustomerDecisionChainView } from './views/cdm/CustomerDecisionChainView';
import { CustomerMarketingActivityView } from './views/cdm/CustomerMarketingActivityView';
import { CustomerWhiteSpaceView } from './views/cdm/CustomerWhiteSpaceView';
import { CustomerStrategicPlanningView } from './views/cdm/CustomerStrategicPlanningView';
import { CustomerBenchmarkCasesView } from './views/cdm/CustomerBenchmarkCasesView';
import { CustomerCustomDevView } from './views/cdm/CustomerCustomDevView';
import { CustomerChannelAuthView } from './views/cdm/CustomerChannelAuthView';
import { CustomerChurnModelView } from './views/cdm/CustomerChurnModelView';
import { CustomerReverseLogisticsView } from './views/cdm/CustomerReverseLogisticsView';
import { CustomerSiteVisitsView } from './views/cdm/CustomerSiteVisitsView';
import { CustomerTrialEquipmentView } from './views/cdm/CustomerTrialEquipmentView';
import { CustomerShippingConfigView } from './views/cdm/CustomerShippingConfigView';
import { CustomerEsgProfileView } from './views/cdm/CustomerEsgProfileView';
import { CustomerBusinessIntelView } from './views/cdm/CustomerBusinessIntelView';
import { CustomerIpNdaView } from './views/cdm/CustomerIpNdaView';
import { CustomerCrisisResponseView } from './views/cdm/CustomerCrisisResponseView';
import { CustomerDigitalTouchpointsView } from './views/cdm/CustomerDigitalTouchpointsView';
import { CustomerFaqKbView } from './views/cdm/CustomerFaqKbView';
//expert views
import { RemoteExpertProfileView } from './views/cdm/RemoteExpertProfileView';
import { RemoteExpertMatchingView } from './views/cdm/RemoteExpertMatchingView';
import { RemoteExpertConsultationView } from './views/cdm/RemoteExpertConsultationView';
import { RemoteExpertDiagnosisView } from './views/cdm/RemoteExpertDiagnosisView';
import { RemoteExpertDecisionView } from './views/cdm/RemoteExpertDecisionView';
import { RemoteExpertTicketsView } from './views/cdm/RemoteExpertTicketsView';
import { RemoteExpertCollaborationView } from './views/cdm/RemoteExpertCollaborationView';
import { RemoteExpertGuidanceView } from './views/cdm/RemoteExpertGuidanceView';
import { RemoteExpertConclusionView } from './views/cdm/RemoteExpertConclusionView';
import { RemoteExpertKnowledgeView } from './views/cdm/RemoteExpertKnowledgeView';
import { RemoteExpertComplianceView } from './views/cdm/RemoteExpertComplianceView';
import { RemoteExpertEvaluationView } from './views/cdm/RemoteExpertEvaluationView';
import { EquipmentFaultConsultationView } from './views/remote-expert/EquipmentFaultConsultationView';
import { OperationAnomalyAnalysisView } from './views/remote-expert/OperationAnomalyAnalysisView';
import { EmergencySupportView } from './views/remote-expert/EmergencySupportView';
import { AccidentReviewView } from './views/remote-expert/AccidentReviewView';
import { EquipmentHealthEvaluationView } from './views/remote-expert/EquipmentHealthEvaluationView';
import { FailureAnalysisView } from './views/remote-expert/FailureAnalysisView';
import { LifePredictionView } from './views/remote-expert/LifePredictionView';
import { OperationOptimizationView } from './views/remote-expert/OperationOptimizationView';
import { ComplexDiagnosisView } from './views/remote-expert/ComplexDiagnosisView';
import { ParameterTuningView } from './views/remote-expert/ParameterTuningView';
import { MaintenanceReviewView } from './views/remote-expert/MaintenanceReviewView';
import { DowntimeAnalysisView } from './views/remote-expert/DowntimeAnalysisView';
import { SystemFaultDiagnosisView } from './views/remote-expert/SystemFaultDiagnosisView';
import { ExtremeConditionView } from './views/remote-expert/ExtremeConditionView';
import { SafetyRiskAssessmentView } from './views/remote-expert/SafetyRiskAssessmentView';
import { SafetyAccidentIdentificationView } from './views/remote-expert/SafetyAccidentIdentificationView';
import { StrategySimulationView } from './views/remote-expert/StrategySimulationView';
import { ProcessOptimizationView } from './views/remote-expert/ProcessOptimizationView';
import { EnergyEfficiencyDiagnosisView } from './views/remote-expert/EnergyEfficiencyDiagnosisView';
import { EnvironmentalComplianceView } from './views/remote-expert/EnvironmentalComplianceView';
import { UpgradeArgumentationView } from './views/remote-expert/UpgradeArgumentationView';
import { TechRouteConsultationView } from './views/remote-expert/TechRouteConsultationView';
import { DigitalTwinCalibrationView } from './views/remote-expert/DigitalTwinCalibrationView';
import { RemoteDataAnalysisView } from './views/remote-expert/RemoteDataAnalysisView';
import { MajorProjectReviewView } from './views/remote-expert/MajorProjectReviewView';
import { NewEquipmentCommissioningView } from './views/remote-expert/NewEquipmentCommissioningView';
import { RemoteCommissioningView } from './views/remote-expert/RemoteCommissioningView';
import { SystemStabilityEvaluationView } from './views/remote-expert/SystemStabilityEvaluationView';
import { ProductionOptimizationView } from './views/remote-expert/ProductionOptimizationView';
import { DisasterWarningView } from './views/remote-expert/DisasterWarningView';
import { InspectionReviewView } from './views/remote-expert/InspectionReviewView';
import { UnmannedOpsSupportView } from './views/remote-expert/UnmannedOpsSupportView';
import { StandardInterpretationView } from './views/remote-expert/StandardInterpretationView';
import { TechConsultationView } from './views/remote-expert/TechConsultationView';
// Predictive Maintenance Views
import { JawCrusherPmView } from './views/predictive/JawCrusherPmView';
import { ConeCrusherWearPmView } from './views/predictive/ConeCrusherWearPmView';
import { ConeEccentricPmView } from './views/predictive/ConeEccentricPmView';
import { ImpactCrusherCrackPmView } from './views/predictive/ImpactCrusherCrackPmView';
import { ExciterHealthPmView } from './views/predictive/ExciterHealthPmView';
import { ScreenBearingPmView } from './views/predictive/ScreenBearingPmView';
import { ScreenStructurePmView } from './views/predictive/ScreenStructurePmView';
import { ScreenWearPmView } from './views/predictive/ScreenWearPmView';
import { ScreenSystemComparePmView } from './views/predictive/ScreenSystemComparePmView';
import { BeltConveyorPmView } from './views/predictive/BeltConveyorPmView';
import { BeltTearPmView } from './views/predictive/BeltTearPmView';
import { PulleyWearPmView } from './views/predictive/PulleyWearPmView';
import { GearboxPmView } from './views/predictive/GearboxPmView';
import { IdlerFaultPmView } from './views/predictive/IdlerFaultPmView';
import { HoistHealthPmView } from './views/predictive/HoistHealthPmView';
import { HoistRopePmView } from './views/predictive/HoistRopePmView';
import { HoistBrakePmView } from './views/predictive/HoistBrakePmView';
import { HoistShaftBearingPmView } from './views/predictive/HoistShaftBearingPmView';
import { HoistFailureWindowPmView } from './views/predictive/HoistFailureWindowPmView';
import { BallMillHealthPmView } from './views/predictive/BallMillHealthPmView';
import { BallMillLubePmView } from './views/predictive/BallMillLubePmView';
import { BallMillLinerWearPmView } from './views/predictive/BallMillLinerWearPmView';
import { FlotationAgitatorPmView } from './views/predictive/FlotationAgitatorPmView';
import { ThickenerDrivePmView } from './views/predictive/ThickenerDrivePmView';
import { ShipMainEngineHealthPmView } from './views/predictive/ShipMainEngineHealthPmView';
import { ShipCrankshaftPmView } from './views/predictive/ShipCrankshaftPmView';
import { ShipCylinderLinerPmView } from './views/predictive/ShipCylinderLinerPmView';
import { ShipPistonPmView } from './views/predictive/ShipPistonPmView';
import { ShipEngineRiskOverviewPmView } from './views/predictive/ShipEngineRiskOverviewPmView';
import { ShipEngineFaultProbPmView } from './views/predictive/ship-engine-fault-prob/ShipEngineFaultProbPmView';
import { ShipEngineFailureWindowPmView } from './views/predictive/ship-engine-failure/ShipEngineFailureWindowPmView';
import { ShipEngineRulPmView } from './views/predictive/ship-engine-rul/ShipEngineRulPmView';
import { ShipEngineRulConfidencePmView } from './views/predictive/ship-engine-rul-confidence/ShipEngineRulConfidencePmView';
import { ShipEngineTypicalFailurePmView } from './views/predictive/ship-engine-typical-failure/ShipEngineTypicalFailurePmView';
import { ShipShaftSystemPmView } from './views/predictive/ShipShaftSystemPmView';
import { PropulsionBearingVibTempPmView } from './views/predictive/PropulsionBearingVibTempPmView';
import { PropulsionShaftMisalignmentPmView } from './views/predictive/PropulsionShaftMisalignmentPmView';
import { PropellerCrackCorrosionPmView } from './views/predictive/PropellerCrackCorrosionPmView';
import { PropulsionDegradationRatePmView } from './views/predictive/PropulsionDegradationRatePmView';
import { ShipAuxGeneratorPmView } from './views/predictive/ShipAuxGeneratorPmView';
import { ShipAuxSystemComparePmView } from './views/predictive/ShipAuxSystemComparePmView';
import { ShipSwitchboardOverheatPmView } from './views/predictive/ShipSwitchboardOverheatPmView';
import { ShipElectricalLoadPmView } from './views/predictive/ShipElectricalLoadPmView';
import { ShipElectricalFailureModePmView } from './views/predictive/ShipElectricalFailureModePmView';
import { FuelSystemHealthPmView } from './views/predictive/FuelSystemHealthPmView';
import { FuelInjectorDegradationPmView } from './views/predictive/FuelInjectorDegradationPmView';
import { FuelSystemClogLeakPmView } from './views/predictive/FuelSystemClogLeakPmView';
import { LubeDeteriorationPmView } from './views/predictive/LubeDeteriorationPmView';
import { LubeSystemRulPmView } from './views/predictive/LubeSystemRulPmView';
import { CoolingWaterPumpPmView } from './views/predictive/CoolingWaterPumpPmView';
import { SeawaterCoolingPmView } from './views/predictive/SeawaterCoolingPmView';
import { HeatExchangerClogPmView } from './views/predictive/HeatExchangerClogPmView';
import { CompressedAirPmView } from './views/predictive/CompressedAirPmView';
import { SteeringGearPmView } from './views/predictive/SteeringGearPmView';
import { SteeringPumpActuatorPmView } from './views/predictive/SteeringPumpActuatorPmView';
import { SteeringJamPmView } from './views/predictive/SteeringJamPmView';
import { SteeringFailureWindowPmView } from './views/predictive/steering-failure-window/SteeringFailureWindowPmView';
import { SteeringRulPmView } from './views/predictive/steering-rul/SteeringRulPmView';
import { WinchHealthPmView } from './views/predictive/winch-health/WinchHealthPmView';
import { WinchGearboxBrakePmView } from './views/predictive/winch-gearbox-brake/WinchGearboxBrakePmView';
import { HatchCoverPmView } from './views/predictive/hatch-cover/HatchCoverPmView';
import { MarineCraneSlewingPmView } from './views/predictive/marine-crane/MarineCraneSlewingPmView';
import { DeckMachineryFailurePmView } from './views/predictive/deck-machinery/DeckMachineryFailurePmView';
import { PortCraneHealthPmView } from './views/predictive/port-crane/PortCraneHealthPmView';
import { CraneTrolleyPmView } from './views/predictive/crane-trolley/CraneTrolleyPmView';
import { RtgTravelPmView } from './views/predictive/rtg-travel/RtgTravelPmView';
import { LighthousePowerPmView } from './views/predictive/lighthouse-power/LighthousePowerPmView';
import { NavMarkRiskPmView } from './views/predictive/nav-mark-risk/NavMarkRiskPmView';
import { HeavyLoadDegradationPmView } from './views/predictive/heavy-load/HeavyLoadDegradationPmView';
import { SevereSeaPropulsionPmView } from './views/predictive/severe-sea/SevereSeaPropulsionPmView';
import { HighSaltCorrosionPmView } from './views/predictive/salt-spray/HighSaltCorrosionPmView';
import { ExtremeWeatherPmView } from './views/predictive/extreme-weather/ExtremeWeatherPmView';
import { ContinuousVoyageFatiguePmView } from './views/predictive/continuous-voyage/ContinuousVoyageFatiguePmView';
import { MultiShipJointFailurePmView } from './views/predictive/multi-ship-joint-failure/MultiShipJointFailurePmView';
import { ShipCascadingFailurePmView } from './views/predictive/ShipCascadingFailurePmView';
import { ShipSystemFaultPropagationPmView } from './views/predictive/ShipSystemFaultPropagationPmView';
import { ShippingComprehensivePmView } from './views/predictive/ShippingComprehensivePmView';
import { PortCallMaintenancePmView } from './views/predictive/port-call-maintenance/PortCallMaintenancePmView';
// Mining Predictive
import { ElectricShovelHealthView } from './views/predictive/mining/ElectricShovelHealthView';
import { SwingMechanismHealthView } from './views/predictive/mining/SwingMechanismHealthView';
import { HoistRopeHealthView } from './views/predictive/mining/HoistRopeHealthView';
import { HoistGearboxHealthView } from './views/predictive/mining/HoistGearboxHealthView';
import { MainMotorInsulationView } from './views/predictive/mining/MainMotorInsulationView';
import { HydraulicExcavatorHealthView } from './views/predictive/mining/HydraulicExcavatorHealthView';
import { ExcavatorPumpHealthView } from './views/predictive/mining/ExcavatorPumpHealthView';
import { ExcavatorValveStictionView } from './views/predictive/mining/ExcavatorValveStictionView';
import { ExcavatorSwingBearingRulView } from './views/predictive/mining/ExcavatorSwingBearingRulView';
import { ExcavatorBoomFatigueView } from './views/predictive/mining/ExcavatorBoomFatigueView';
import { MiningTruckHealthView } from './views/predictive/mining/MiningTruckHealthView';
import { MiningTruckEngineHealthView } from './views/predictive/mining/MiningTruckEngineHealthView';
import { MiningTransmissionHealthView } from './views/predictive/mining/MiningTransmissionHealthView';
import { MiningWheelHubReducerRiskView } from './views/predictive/mining/MiningWheelHubReducerRiskView';
import { MiningBrakeFailureView } from './views/predictive/mining/MiningBrakeFailureView';
import { MiningLocomotiveHealthView } from './views/predictive/mining/MiningLocomotiveHealthView';
import { LocomotiveGearboxWearView } from './views/predictive/mining/LocomotiveGearboxWearView';
import { LocomotiveBrakingReliabilityView } from './views/predictive/mining/LocomotiveBrakingReliabilityView';
import { MiningLocomotiveRulView } from './views/predictive/mining/MiningLocomotiveRulView';
import { JawCrusherHealthView } from './views/predictive/mining/JawCrusherHealthView';


import { PortGroupSimulationView } from './views/simulation/port-group';
import { PortAutoSimulationView } from './views/simulation/port-auto';
import { PortCarbonSimulationView } from './views/simulation/port-carbon';
import { PortEvacSimulationView } from './views/simulation/port-evac';



//Service data management view, 2026.01.19, update
import { MiningServiceDataView } from './views/MiningServiceDataView';
import { MiningCrushingOandMView } from './views/ServiceDataManagement/MiningCrushingOandMView';
import { MiningExtractionServiceView } from './views/ServiceDataManagement/MiningExtractionServiceView';
import { MiningDustVibrationServiceView } from './views/ServiceDataManagement/MiningDustVibrationServiceView';
import { MiningEmergencyRepairView } from './views/ServiceDataManagement/MiningEmergencyRepairView';
import { MiningMultiFaceCollabView } from './views/ServiceDataManagement/MiningMultiFaceCollabView';
import { MiningComponentLifeView } from './views/ServiceDataManagement/MiningComponentLifeView';
import { MiningRemoteOMView } from './views/ServiceDataManagement/MiningRemoteOMView';
import { MiningMultiVendorView } from './views/ServiceDataManagement/MiningMultiVendorView';
import { MiningMaintenancePlanView } from './views/ServiceDataManagement/MiningMaintenancePlanView';
import { MiningInspectionServiceView } from './views/ServiceDataManagement/MiningInspectionServiceView';
import { MiningExtremeConditionView } from './views/ServiceDataManagement/MiningExtremeConditionView';
import { MiningEnergyServiceView } from './views/ServiceDataManagement/MiningEnergyServiceView';
import { ShipEngineServiceView } from './views/ServiceDataManagement/ShipEngineServiceView';
import { ShipNavigationEfficiencyView } from './views/ServiceDataManagement/ShipNavigationEfficiencyView';
import { ShipSeaConditionAdaptabilityView } from './views/ServiceDataManagement/ShipSeaConditionAdaptabilityView';
import { ShipPredictiveMaintenanceView } from './views/ServiceDataManagement/ShipPredictiveMaintenanceView';
import { ShipBerthingCollaborationView } from './views/ServiceDataManagement/ShipBerthingCollaborationView';
import { PortLoadingServiceDataView } from './views/ServiceDataManagement/PortLoadingServiceDataView';
import { ChannelInspectionServiceView } from './views/ServiceDataManagement/ChannelInspectionServiceView';
import { ShipShoreCollaborationView } from './views/ServiceDataManagement/ShipShoreCollaborationView';
import { MultiFleetRouteView } from './views/ServiceDataManagement/MultiFleetRouteView';
import { ShipEmergencyRepairView } from './views/ServiceDataManagement/ShipEmergencyRepairView';
import { ShipEnergyEfficiencyView } from './views/ServiceDataManagement/ShipEnergyEfficiencyView';
import { ShipReliabilityAssessmentView } from './views/ServiceDataManagement/ShipReliabilityAssessmentView';
import { ShipCrossCycleServiceView } from './views/ServiceDataManagement/ShipCrossCycleServiceView';
import { HydroUnitStatusView } from './views/ServiceDataManagement/HydroUnitStatusView';
import { HydroSystemOMView } from './views/ServiceDataManagement/HydroSystemOMView';
import { HydroLongTermOperationView } from './views/ServiceDataManagement/HydroLongTermOperationView';
import { HydroMaintenanceScheduleView } from './views/ServiceDataManagement/HydroMaintenanceScheduleView';
import { HydroDispatchView } from './views/ServiceDataManagement/HydroDispatchView';
import { HydroStructureHealthView } from './views/ServiceDataManagement/HydroStructureHealthView';
import { HydroIncidentView } from './views/ServiceDataManagement/HydroIncidentView';
import { HydroCascadeServiceView } from './views/ServiceDataManagement/HydroCascadeView';
import { CrossRegionWaterView } from './views/ServiceDataManagement/CrossRegionWaterView';
import { HydroDigitalHandoverView } from './views/ServiceDataManagement/HydroDigitalHandoverView';
import { HydroHealthAssessmentView } from './views/ServiceDataManagement/HydroHealthAssessmentView';
import { HydroLifespanPredictionView } from './views/ServiceDataManagement/HydroLifespanPredictionView';
import { HydroEmergencyDispatchView } from './views/ServiceDataManagement/HydroEmergencyDispatchView';
import { UnifiedGovernanceView } from './views/ServiceDataManagement/UnifiedGovernanceView';
import { ConditionCollaborationView } from './views/ServiceDataManagement/ConditionCollaborationView';
import { DecisionSupportView } from './views/ServiceDataManagement/DecisionSupportView';
import { KnowledgeReuseView } from './views/ServiceDataManagement/KnowledgeReuseView';
import { LifecycleFeedbackView } from './views/ServiceDataManagement/LifecycleFeedbackView';
import { DataQualityGovernanceView } from './views/ServiceDataManagement/DataQualityGovernanceView';
import { DataClassificationPermissionView } from './views/ServiceDataManagement/DataClassificationPermissionView';
import { DataSecurityComplianceView } from './views/ServiceDataManagement/DataSecurityComplianceView';
import { MultiSourceFusionView } from './views/ServiceDataManagement/MultiSourceFusionView';
import { IntelligentAnalysisView } from './views/ServiceDataManagement/IntelligentAnalysisView';
import { ServiceModeOptimizationView } from './views/ServiceDataManagement/ServiceModeOptimizationView';


// Hydro Predictive
import { HydroUnitHealthView } from './views/predictive/hydro/HydroUnitHealthView';
import { ShaftBearingHealthView } from './views/predictive/hydro/ShaftBearingHealthView';
import { StatorWindingHealthView } from './views/predictive/hydro/StatorWindingHealthView';
import { RotorUnbalanceView } from './views/predictive/hydro/RotorUnbalanceView';
import { ShaftVibrationTrendView } from './views/predictive/hydro/ShaftVibrationTrendView';
import { TurbineRunnerCavitationView } from './views/predictive/hydro/TurbineRunnerCavitationView';
import { BearingLifePredictionView } from './views/predictive/hydro/BearingLifePredictionView';
import { UnitRiskPredictionView } from './views/predictive/hydro/UnitRiskPredictionView';
import { FailureProbabilityView } from './views/predictive/hydro/FailureProbabilityView';
import { DegradationEvolutionView } from './views/predictive/hydro/DegradationEvolutionView';
import { GovernorHealthView } from './views/predictive/hydro/GovernorHealthView';
import { PumpVibrationTrendView } from './views/predictive/hydro/PumpVibrationTrendView';
import { GuideVaneDegradationView } from './views/predictive/hydro/GuideVaneDegradationView';
import { ValveStictionView } from './views/predictive/hydro/ValveStictionView';
import { GovernorRulView } from './views/predictive/hydro/GovernorRulView';
import { MainTransformerHealthView } from './views/predictive/hydro/MainTransformerHealthView';
import { TransformerWindingView } from './views/predictive/hydro/TransformerWindingView';
import { TransformerOilAnalysisView } from './views/predictive/hydro/TransformerOilAnalysisView';
import { BushingInsulationView } from './views/predictive/hydro/BushingInsulationView';
import { TransformerFaultPredictionView } from './views/predictive/hydro/TransformerFaultPredictionView';
import { GisSwitchgearHealthView } from './views/predictive/hydro/GisSwitchgearHealthView';
import { BreakerMechanicalView } from './views/predictive/hydro/BreakerMechanicalView';
import { DisconnectSwitchWearView } from './views/predictive/hydro/DisconnectSwitchWearView';
import { BusbarHeatRiskView } from './views/predictive/hydro/BusbarHeatRiskView';
import { SwitchStationFailureView } from './views/predictive/hydro/SwitchStationFailureView';
import { GateStructureHealthView } from './views/predictive/hydro/GateStructureHealthView';
import { GateHoistDegradationView } from './views/predictive/hydro/GateHoistDegradationView';
import { GateStructureCorrosionFatigueView } from './views/predictive/hydro/GateStructureCorrosionFatigueView';
import { GateRollerSliderWearView } from './views/predictive/hydro/GateRollerSliderWearView';
import { GateStictionRiskView } from './views/predictive/hydro/GateStictionRiskView';
import { PumpStationHealthView } from './views/predictive/hydro/PumpStationHealthView';
import { PumpBearingImpellerView } from './views/predictive/hydro/PumpBearingImpellerView';
import { CoolingWaterPumpRiskView } from './views/predictive/hydro/CoolingWaterPumpRiskView';
import { AirCompressorOilHealthView } from './views/predictive/hydro/AirCompressorOilHealthView';
import { AuxSystemComparisonView } from './views/predictive/hydro/AuxSystemComparisonView';
import { PenstockHealthView } from './views/predictive/hydro/PenstockHealthView';
import { PenstockWeldFatigueView } from './views/predictive/hydro/PenstockWeldFatigueView';
import { HydraulicPulsationView } from './views/predictive/hydro/HydraulicPulsationView';
import { WaterLevelSurgeRiskView } from './views/predictive/hydro/WaterLevelSurgeRiskView';
import { ExtremeFloodFailureView } from './views/predictive/hydro/ExtremeFloodFailureView';
import { MultiUnitJointRiskView } from './views/predictive/hydro/MultiUnitJointRiskView';
import { SystemFailurePropagationView } from './views/predictive/hydro/SystemFailurePropagationView';
import { HydroMechanicalCouplingView } from './views/predictive/hydro/HydroMechanicalCouplingView';
import { ElecMechSystemRiskView } from './views/predictive/hydro/ElecMechSystemRiskView';
import { CascadeFailurePredictionView } from './views/predictive/hydro/CascadeFailurePredictionView';
import { PredictionAccuracyView } from './views/predictive/hydro/PredictionAccuracyView';
import { FaultDistributionView } from './views/predictive/hydro/FaultDistributionView';
import { MaintenancePlanOptimizationView } from './views/predictive/hydro/MaintenancePlanOptimizationView';
import { EconomyEvaluationView } from './views/predictive/hydro/EconomyEvaluationView';
import { HydroComprehensiveEvaluationView } from './views/predictive/hydro/HydroComprehensiveEvaluationView';
// --- 维护服务视图 ---
import { PortalView } from './views/maintenance/PortalView';
import { DispatchConsoleView } from './views/maintenance/DispatchConsoleView';
import { EmergencyChannelView } from './views/maintenance/EmergencyChannelView';
import { PendingManagementView } from './views/maintenance/PendingManagementView';
import { CloseoutView } from './views/maintenance/CloseoutView';
import { OutsourcingTrackerView } from './views/maintenance/OutsourcingTrackerView';
import { MergeSplitView } from './views/maintenance/MergeSplitView';
import { TimelineView } from './views/maintenance/TimelineView';
import { PtwApplicationView } from './views/maintenance/PtwApplicationView';
import { LotoManagementView } from './views/maintenance/LotoManagementView';
import { MobileCheckinView } from './views/maintenance/MobileCheckinView';
import { ArExpertView } from './views/maintenance/ArExpertView';
import { SopGuideView } from './views/maintenance/SopGuideView';
import { ExplodedView } from './views/maintenance/ExplodedView';
import { MediaCaptureView } from './views/maintenance/MediaCaptureView';
import { TestRunRecordView } from './views/maintenance/TestRunRecordView';
import { PartsCartView } from './views/maintenance/PartsCartView';
import { SnTrackingView } from './views/maintenance/SnTrackingView';
import { StockAlertView } from './views/maintenance/StockAlertView';
import { ToolsLoanView } from './views/maintenance/ToolsLoanView';
import { PartsSubstituteView } from './views/maintenance/PartsSubstituteView';
import { ReverseLogisticsView } from './views/maintenance/ReverseLogisticsView';
import { LubricationRecordView } from './views/maintenance/LubricationRecordView';
import { BomCheckView } from './views/maintenance/BomCheckView';
import { GanttPlanView } from './views/maintenance/GanttPlanView';
import { RouteConfigView } from './views/maintenance/RouteConfigView';
import { LubCalendarView } from './views/maintenance/LubCalendarView';
import { CbmCorrectionView } from './views/maintenance/CbmCorrectionView';
import { CalibrationRecordView } from './views/maintenance/CalibrationRecordView';
import { AnnualInspectView } from './views/maintenance/AnnualInspectView';
import { SkillMatrixView } from './views/maintenance/SkillMatrixView';
import { ShiftRosterView } from './views/maintenance/ShiftRosterView';
import { VendorPerformanceView } from './views/maintenance/VendorPerformanceView';
import { LaborKpiView } from './views/maintenance/LaborKpiView';
import { TrainingAnalysisView } from './views/maintenance/TrainingAnalysisView';
import { AssetLccView } from './views/maintenance/AssetLccView';
import { BudgetMonitorView } from './views/maintenance/BudgetMonitorView';
import { WarrantyMgmtView } from './views/maintenance/WarrantyMgmtView';
import { RoiAnalysisView } from './views/maintenance/RoiAnalysisView';
import { CostCompareView } from './views/maintenance/CostCompareView';
import { IncidentRecordView } from './views/maintenance/IncidentRecordView';
import { WasteDeclareView } from './views/maintenance/WasteDeclareView';
import { FiveSScoreView } from './views/maintenance/FiveSScoreView';
import { RcfaReportView } from './views/maintenance/RcfaReportView';
import { PPEMgmtView } from './views/maintenance/PPEMgmtView';
import { MtbfMttrAnalysisView } from './views/maintenance/MtbfMttrAnalysisView';
import { RepeatFaultView } from './views/maintenance/RepeatFaultView';
import { KnowledgeBackflowView } from './views/maintenance/KnowledgeBackflowView';
import { SurveyView } from './views/maintenance/SurveyView';
import { DowntimeCodingView } from './views/maintenance/DowntimeCodingView';

// --- 备件服务视图 ---
import { DemandForecastView } from './views/spare-parts/DemandForecastView';
import { LifeEvaluationView } from './views/spare-parts/LifeEvaluationView';
import { CriticalListView } from './views/spare-parts/CriticalListView';
import { StandardizationView } from './views/spare-parts/StandardizationView';
import { InventoryOptView } from './views/spare-parts/InventoryOptView';
import { SafetyStockConfigView } from './views/spare-parts/SafetyStockConfigView';
import { SubstituteMatchingView } from './views/spare-parts/SubstituteMatchingView';
import { PartsCertificationView } from './views/spare-parts/PartsCertificationView';
import { QualityTraceView } from './views/spare-parts/QualityTraceView';
import { ArrivalInspectionView } from './views/spare-parts/ArrivalInspectionView';
import { InServiceMonitorView } from './views/spare-parts/InServiceMonitorView';
import { FailurespareAnalysisView } from './views/spare-parts/FailureAnalysisView';
import { PartsRefurbishView } from './views/spare-parts/PartsRefurbishView';
import { ReManufacturingView } from './views/spare-parts/ReManufacturingView';
import { LifecycleMgmtView } from './views/spare-parts/LifecycleMgmtView';
import { PriceEvalView } from './views/spare-parts/PriceEvalView';
import { RiskEvalView } from './views/spare-parts/RiskEvalView';
import { EmergencyspareSupportView } from './views/spare-parts/EmergencySupportView';
import { TurbinePartsView } from './views/spare-parts/TurbinePartsView';
import { GenStatorRotorView } from './views/spare-parts/GenStatorRotorView';
import { GateHoistPartsView } from './views/spare-parts/GateHoistPartsView';
import { BearingSealPartsView } from './views/spare-parts/BearingSealPartsView';
import { HydroHydraulicPartsView } from './views/spare-parts/HydroHydraulicPartsView';
import { GovernorSupportView } from './views/spare-parts/GovernorSupportView';
import { AutomationSysView } from './views/spare-parts/AutomationSysView';
import { HydroSensorsView } from './views/spare-parts/HydroSensorsView';
import { FloodEmergencyView } from './views/spare-parts/FloodEmergencyView';
import { LocalizationSubView } from './views/spare-parts/LocalizationSubView';
import { MaintenancePlanningView } from './views/spare-parts/MaintenancePlanningView';
import { ShipMainEngineView } from './views/spare-parts/ShipMainEngineView';
import { ShipAuxiliaryView } from './views/spare-parts/ShipAuxiliaryView';
import { ShipPropulsionView } from './views/spare-parts/ShipPropulsionView';
import { ShipElectricalView } from './views/spare-parts/ShipElectricalView';
import { ShipAutomationNavView } from './views/spare-parts/ShipAutomationNavView'; 
import { ShipSafetyPartsView } from './views/spare-parts/ShipSafetyPartsView';
import { ClassCertView } from './views/spare-parts/ClassCertView';
import { ShippingEmergencyView } from './views/spare-parts/ShippingEmergencyView'; // 新增导入
import { MiningCriticalView } from './views/spare-parts/MiningCriticalView';
import { CrushingScreeningPartsView } from './views/spare-parts/CrushingScreeningPartsView';
import { ConveyingSystemPartsView } from './views/spare-parts/ConveyingSystemPartsView';
import { MineHydraulicPartsView } from './views/spare-parts/MineHydraulicPartsView';
import { MineMotorInverterView } from './views/spare-parts/MineMotorInverterView';
import { MiningBearingServiceView } from './views/spare-parts/MiningBearingServiceView';
import { MiningSafetyServiceView } from './views/spare-parts/MiningSafetyServiceView';
import { MiningWearPartsView } from './views/spare-parts/MiningWearPartsView';
import { UndergroundEmergencyView } from './views/spare-parts/UndergroundEmergencyView';
import { MineLocalizationView } from './views/spare-parts/MineLocalizationView';
import { ProcurementCollabView } from './views/spare-parts/ProcurementCollabView';
import { WarehouseAutomationView } from './views/spare-parts/WarehouseAutomationView';
import { MetalStructurePartsView } from './views/spare-parts/MetalStructurePartsView';


import { HydroTurbineDisassemblyView } from './views/maintenance/HydroTurbineDisassemblyView';
import { HydroTransformerMaintenanceView } from './views/maintenance/HydroTransformerMaintenanceView';
import { GateHoistMaintenanceView } from './views/maintenance/GateHoistMaintenanceView';
import { TurbineBladeRepairView } from './views/maintenance/TurbineBladeRepairView';
import { HydroBearingView } from './views/maintenance/HydroBearingView';
import { MarineEngineMaintenanceView } from './views/maintenance/MarineEngineMaintenanceView';
import { MarineShaftMaintenanceView } from './views/maintenance/MarineShaftMaintenanceView';
import { ShipPowerSystemMaintenanceView } from './views/maintenance/ShipPowerSystemMaintenanceView';
import { PortCraneMaintenanceView } from './views/maintenance/PortCraneMaintenanceView';
import { DredgingHydraulicMaintenanceView } from './views/maintenance/DredgingHydraulicMaintenanceView';
import { ShipLockMaintenanceView } from './views/maintenance/ShipLockMaintenanceView';
import { MiningCrusherMaintenanceView } from './views/maintenance/MiningCrusherMaintenanceView';
import { MineHoistRopeView } from './views/maintenance/MineHoistRopeView';
import { MiningConveyorMaintenanceView } from './views/maintenance/MiningConveyorMaintenanceView';
import { MineVentilationView } from './views/maintenance/MineVentilationView';
import { MiningHydraulicSupportView } from './views/maintenance/MiningHydraulicSupportView';
import { MineDrainagePumpView } from './views/maintenance/MineDrainagePumpView';
import { MiningDrillingRigRepairView } from './views/maintenance/MiningDrillingRigRepairView';
import { MiningShovelMaintenanceView } from './views/maintenance/MiningShovelMaintenanceView';
import { MiningEngineRepairView } from './views/maintenance/MiningEngineRepairView';
import { HydroAnnualPlanView } from './views/maintenance/HydroAnnualPlanView';
import { ShipDryDockDrillView } from './views/maintenance/ShipDryDockDrillView';
import { PortCollaborativeRepairView } from './views/maintenance/PortCollaborativeRepairView';
import { MiningOverhaulSimView } from './views/maintenance/MiningOverhaulSimView';
import { HydroRapidDecisionSimView } from './views/maintenance/HydroRapidDecisionSimView';
import { ShipEmergencyRepairSimView } from './views/maintenance/ShipEmergencyRepairSimView';
import { MiningEmergencyDrillView } from './views/maintenance/MiningEmergencyDrillView';
import { HydroRemoteExpertSimView } from './views/maintenance/HydroRemoteExpertSimView';
import { ShipCrossRegionalCollabView } from './views/maintenance/ShipCrossRegionalCollabView';
import { UnmannedMiningMaintView } from './views/maintenance/UnmannedMiningMaintView';
import { HydroStandardProcessView } from './views/maintenance/HydroStandardProcessView';
import { ShipAgingFeasibilityView } from './views/maintenance/ShipAgingFeasibilityView';
import { MinePathSimulationView } from './views/maintenance/MinePathSimulationView';
import { HydroTrainingSystemView } from './views/maintenance/HydroTrainingSystemView';
import { MaritimeNoviceTrainingView } from './views/maintenance/MaritimeNoviceTrainingView';
import { MiningMultiScenarioComparisonView } from './views/maintenance/MiningMultiScenarioComparisonView';
import { MiningFaultComparisonSimView } from './views/maintenance/MiningFaultComparisonSimView';
import { HydroSparePartsSequenceView } from './views/maintenance/HydroSparePartsSequenceView';
import { ShipEOLStrategyInferenceView } from './views/maintenance/ShipEOLStrategyInferenceView';
import { MiningLifecycleCostSimView } from './views/maintenance/MiningLifecycleCostSimView';
import { HydroDigitalTwinSceneView } from './views/maintenance/HydroDigitalTwinSceneView';
import { ShipRiskAssessmentView } from './views/maintenance/ShipRiskAssessmentView';
import { MiningSafetyDrillView } from './views/maintenance/MiningSafetyDrillView';
import { HydroRapidReturnView } from './views/maintenance/HydroRapidReturnView';
import { PortWeatherSimView } from './views/maintenance/PortWeatherSimView';
import { MiningProcessConflictView } from './views/maintenance/MiningProcessConflictView';
import { CrossSystemJointMaintView } from './views/maintenance/CrossSystemJointMaintView';
// --- 驾驶舱视图导入 ---
import { MaritimeSafetyView } from './views/cockpit/MaritimeSafetyView';
import { MiningDispatchView } from './views/cockpit/MiningDispatchView';
import { MiningSafetyView } from './views/cockpit/MiningSafetyView';
import { MiningEcoView } from './views/cockpit/MiningEcoView';
import { MiningEmergencyView } from './views/cockpit/MiningEmergencyView';
import { TailingsSafetyView } from './views/cockpit/TailingsSafetyView';
import { DamSafetyView } from './views/cockpit/DamSafetyView';
import { FloodControlView } from './views/cockpit/FloodControlView';
import { HydroCascadeView } from './views/cockpit/HydroCascadeView';
import { PumpedStorageCockpitView } from './views/cockpit/PumpedStorageCockpitView';
import { SmartWaterCockpitView } from './views/cockpit/SmartWaterCockpitView';
import { IrrigationCockpitView } from './views/cockpit/IrrigationCockpitView';
import { GlobalFleetCockpitView } from './views/cockpit/GlobalFleetCockpitView';
import { ContainerTerminalCockpitView } from './views/cockpit/ContainerTerminalCockpitView';
import { BulkTerminalCockpitView } from './views/cockpit/BulkTerminalCockpitView';
import { InlandWaterwayCockpitView } from './views/cockpit/InlandWaterwayCockpitView';
import { GreenPortCockpitView } from './views/cockpit/GreenPortCockpitView';

// --- 知识管理视图导入 ---
import { KnowledgeManageView } from './views/knowledge-manage/KnowledgeManageView';
import { DangerousGoodsKbView } from './views/knowledge-manage/DangerousGoodsKbView';
import { AgvDeadlockKbView } from './views/knowledge-manage/AgvDeadlockKbView';
import { BuoyDriftKbView } from './views/knowledge-manage/BuoyDriftKbView';
import { ShipImpactKbView } from './views/knowledge-manage/ShipImpactKbView';
import { VtsPlanKbView } from './views/knowledge-manage/VtsPlanKbView';
import { GreenPortPowerKbView } from './views/knowledge-manage/GreenPortPowerKbView';
import { MaritimeAccidentKbView } from './views/knowledge-manage/MaritimeAccidentKbView';
import { WatershedDispatchRulesView } from './views/knowledge-manage/WatershedDispatchRulesView';
import { DamSeepageModelView } from './views/knowledge-manage/DamSeepageModelView';
import { TurbineCavitationView } from './views/knowledge-manage/TurbineCavitationView';
import { FloodDischargeView } from './views/knowledge-manage/FloodDischargeView';
import { EcoFlowView } from './views/knowledge-manage/EcoFlowView';
import { GeneratorInsulationView } from './views/knowledge-manage/GeneratorInsulationView';
import { UnderwaterRobotView } from './views/knowledge-manage/UnderwaterRobotView';
import { Flood2EmergencyView } from './views/knowledge-manage/FloodEmergencyView';
import { SedimentationArchiveView } from './views/knowledge-manage/SedimentationArchiveView';
import { BlackStartKbView } from './views/knowledge-manage/BlackStartKbView';
import { TrashRackThresholdView } from './views/knowledge-manage/TrashRackThresholdView';
import { FreezeThawStandardsView } from './views/knowledge-manage/FreezeThawStandardsView';
import { HoistFaultTreeView } from './views/knowledge-manage/HoistFaultTreeView';
import { EconomicOperationView } from './views/knowledge-manage/EconomicOperationView';
import { SlopeDisasterKbView } from './views/knowledge-manage/SlopeDisasterKbView';
import { StillingBasinRepairKbView } from './views/knowledge-manage/StillingBasinRepairKbView';
import { FishPassagePerformanceView } from './views/knowledge-manage/FishPassagePerformanceView';
import { ShipLockJointDispatchView } from './views/knowledge-manage/ShipLockJointDispatchView';
import { ChannelShoalDredgingKbView } from './views/knowledge-manage/ChannelShoalDredgingKbView';
import { CraneFatigueArchiveView } from './views/knowledge-manage/CraneFatigueArchiveView';
import { AisAnomalyKbView } from './views/knowledge-manage/AisAnomalyKbView';
import { CraneWindKbView } from './views/knowledge-manage/CraneWindKbView';
import { DustSuppressionKbView } from './views/knowledge-manage/DustSuppressionKbView';
import { TunnelJointHealthView } from './views/knowledge-manage/TunnelJointHealthView';
import { PilotExperienceKbView } from './views/knowledge-manage/PilotExperienceKbView';
import { MultimodalTransportKbView } from './views/knowledge-manage/MultimodalTransportKbView';
import { UnmannedShipKbView } from './views/knowledge-manage/UnmannedShipKbView';
import { HydraulicSupportResistanceView } from './views/knowledge-manage/HydraulicSupportResistanceView';
import { TruckTireKbView } from './views/knowledge-manage/TruckTireKbView';
import { BeltTearKbView } from './views/knowledge-manage/BeltTearKbView';
import { VentilationNetworkKbView } from './views/knowledge-manage/VentilationNetworkKbView';
import { CrushingIndexKbView } from './views/knowledge-manage/CrushingIndexKbView';
import { ShovelToothKbView } from './views/knowledge-manage/ShovelToothKbView';
import { TailingsSafetyKbView } from './views/knowledge-manage/TailingsSafetyKbView';
import { GroundPressureKbView } from './views/knowledge-manage/GroundPressureKbView';
import { ExplosionProofKbView } from './views/knowledge-manage/ExplosionProofKbView';
import { FlotationReagentExpertSystemView } from './views/knowledge-manage/FlotationReagentExpertSystemView';
import { ShearerPickResistanceView } from './views/knowledge-manage/ShearerPickResistanceView';
import { UndergroundVehiclePathKbView } from './views/knowledge-manage/UndergroundVehiclePathKbView';
import { RopeNdtKbView } from './views/knowledge-manage/RopeNdtKbView';
import { SlopeRadarWarningView } from './views/knowledge-manage/SlopeRadarWarningView';
import { MillLinerOptimizationView } from './views/knowledge-manage/MillLinerOptimizationView';
import { WaterInrushKbView } from './views/knowledge-manage/WaterInrushKbView';
import { BlastingControlKbView } from './views/knowledge-manage/BlastingControlKbView';
import { UnmannedTruckEdgeScenarioView } from './views/knowledge-manage/UnmannedTruckEdgeScenarioView';
import { ScraperChainTensionView } from './views/knowledge-manage/ScraperChainTensionView';
import { GenericView } from './views/GenericView';
//2026.03.24
import { InspectionView } from './views/InspectionView';
import { MiningRailView } from './views/Equipment-Point-Inspection/MiningRailView';
import { MiningBlastingView } from './views/Equipment-Point-Inspection/BlastingArea/MiningBlastingView';
import { TailingsYardView } from './views/Equipment-Point-Inspection/TailingsYard/TailingsYardView';
import { MiningSupportView } from './views/Equipment-Point-Inspection/SupportStructure/MiningSupportView';
import { MiningVentilationView } from './views/Equipment-Point-Inspection/Ventilation/MiningVentilationView';
import { ExcavationFaceView } from './views/Equipment-Point-Inspection/ExcavationFace/ExcavationFaceView';
import { MiningHazardousAreaView } from './views/Equipment-Point-Inspection/HazardousArea/MiningHazardousAreaView';
import { MiningDrainageWellView } from './views/Equipment-Point-Inspection/DrainageWell/MiningDrainageWellView';
import { MiningEnergyControlView } from './views/Equipment-Point-Inspection/EnergyControl/MiningEnergyControlView';
import { MiningVehicleDispatchView } from './views/Equipment-Point-Inspection/VehicleDispatch/MiningVehicleDispatchView';
import { PortBerthInspectionView } from './views/Equipment-Point-Inspection/PortBerth/PortBerthInspectionView';
import { ChannelBuoyView } from './views/Equipment-Point-Inspection/ChannelBuoy/ChannelBuoyView';
import { ShipCargoHoldInspectionView } from './views/Equipment-Point-Inspection/ShipCargoHold/ShipCargoHoldInspectionView';
import { PassengerBoardingBridgeView } from './views/Equipment-Point-Inspection/PassengerBoardingBridge/PassengerBoardingBridgeView';
import { HullStructureInspectionView } from './views/Equipment-Point-Inspection/HullStructure/HullStructureInspectionView';
import { BallastWaterInspectionView } from './views/Equipment-Point-Inspection/BallastWater/BallastWaterInspectionView';
import { LightSignalsInspectionView } from './views/Equipment-Point-Inspection/LightSignals/LightSignalsInspectionView';
import { FuelTankInspectionView } from './views/Equipment-Point-Inspection/FuelTank/FuelTankInspectionView';
import { ChannelEmbankmentView } from './views/Equipment-Point-Inspection/ChannelEmbankment/ChannelEmbankmentView';
import { PortWaterQualityView } from './views/Equipment-Point-Inspection/PortWaterQuality/PortWaterQualityView';
import { GateBladeView } from './views/Equipment-Point-Inspection/GateBlade/GateBladeView';
import { SpillwayView } from './views/Equipment-Point-Inspection/Spillway/SpillwayView';
import { HydrologicalStationView } from './views/Equipment-Point-Inspection/HydrologicalStation/HydrologicalStationView';
import { TurbineBearingView } from './views/Equipment-Point-Inspection/TurbineBearing/TurbineBearingView';
import { PlantRoofView } from './views/Equipment-Point-Inspection/PlantRoof/PlantRoofView';
import { StoragePoolSlopeView } from './views/Equipment-Point-Inspection/StoragePoolSlope/StoragePoolSlopeView';
import { ControlRoomNetworkView } from './views/Equipment-Point-Inspection/ControlRoomNetwork/ControlRoomNetworkView';
import { SluiceGateCableView } from './views/Equipment-Point-Inspection/SluiceGateCable/SluiceGateCableView';
import { WaterQualitySamplingView } from './views/Equipment-Point-Inspection/WaterQualitySampling/WaterQualitySamplingView';
import { DamShoulderView } from './views/Equipment-Point-Inspection/DamShoulder/DamShoulderView';
import { HydraulicSupportRoofView } from './views/Equipment-Point-Inspection/HydraulicSupportRoof/HydraulicSupportRoofView';
import { VentilationDoorView } from './views/Equipment-Point-Inspection/VentilationDoor/VentilationDoorView';
import { FillingOperationAreaView } from './views/Equipment-Point-Inspection/FillingOperationArea/FillingOperationAreaView';
import { HazardousChemicalWarehouseView } from './views/Equipment-Point-Inspection/HazardousChemicalWarehouse/HazardousChemicalWarehouseView';
import { UndergroundTransportTrackView } from './views/Equipment-Point-Inspection/UndergroundTransportTrack/UndergroundTransportTrackView';
import { DeckLifesavingEquipmentView } from './views/Equipment-Point-Inspection/DeckLifesavingEquipment/DeckLifesavingEquipmentView';
import { PortLiftingOperationView } from './views/Equipment-Point-Inspection/PortLiftingOperation/PortLiftingOperationView';
import { ColdChainCabinView } from './views/Equipment-Point-Inspection/ColdChainCabin/ColdChainCabinView';
import { ChannelScourAreaView } from './views/Equipment-Point-Inspection/ChannelScourArea/ChannelScourAreaView';
import { PortWaterPumpView } from './views/Equipment-Point-Inspection/PortWaterPump/PortWaterPumpView';
import { TailraceChannelView } from './views/Equipment-Point-Inspection/TailraceChannel/TailraceChannelView';
import { MineGasView } from './views/Equipment-Point-Inspection/MineGas/MineGasView';
import { WaterLevelDamView } from './views/Equipment-Point-Inspection/WaterLevelDam/WaterLevelDamView';
import { WaterTunnelView } from './views/Equipment-Point-Inspection/WaterTunnel/WaterTunnelView';
import { DiversionChannelView } from './views/Equipment-Point-Inspection/DiversionChannel/DiversionChannelView';
import { SluiceGateView } from './views/Equipment-Point-Inspection/SluiceGate/SluiceGateView';
import { SurfaceSubsidenceView } from './views/Equipment-Point-Inspection/SurfaceSubsidence/SurfaceSubsidenceView';
import { UndergroundLightingView } from './views/Equipment-Point-Inspection/UndergroundLighting/UndergroundLightingView';
import { TailingsDamView } from './views/Equipment-Point-Inspection/TailingsDam/TailingsDamView';
import { ElectricalCabinetView } from './views/Equipment-Point-Inspection/ElectricalCabinet/ElectricalCabinetView';
import { HazardousGasView } from './views/Equipment-Point-Inspection/HazardousGas/HazardousGasView';


//Maintenance-plan-management
import { AirCompressorOverhaulView } from './views/Maintenance-plan-management/AirCompressorOverhaul/AirCompressorOverhaulView';
import { HVACSystemCleaningView } from './views/Maintenance-plan-management/HVACSystemCleaning/HVACSystemCleaningView';
import { FireExtinguishingSystemView } from './views/Maintenance-plan-management/FireExtinguishingSystem/FireExtinguishingSystemView';
import { EmergencyGeneratorTestView } from './views/Maintenance-plan-management/EmergencyGeneratorTest/EmergencyGeneratorTestView';
import { OverheadCraneTrackView } from './views/Maintenance-plan-management/OverheadCraneTrack/OverheadCraneTrackView';
import { PowerTransformerMaintenanceView } from './views/Maintenance-plan-management/PowerTransformerMaintenance/PowerTransformerMaintenanceView';

import * as MPMViews from './views/Maintenance-plan-management';



// Lazy load CV views
const CV_VIEWS: Record<string, any> = {
  'cv-dam-crack': lazy(() => import('./views/computer-visual-inspection/DamCrackDetection')),
  'cv-turbine-cavitation': lazy(() => import('./views/computer-visual-inspection/TurbineCavitation')),
  'cv-sluice-gate-seal': lazy(() => import('./views/computer-visual-inspection/SluiceGateSeal')),
  'cv-transformer-leak': lazy(() => import('./views/computer-visual-inspection/TransformerLeak')),
  'cv-insulator-flashover': lazy(() => import('./views/computer-visual-inspection/InsulatorDefect')),
  'cv-spillway-monitoring': lazy(() => import('./views/computer-visual-inspection/SpillwayMonitoring')),
  'cv-dam-seepage': lazy(() => import('./views/computer-visual-inspection/DamSeepage')),
  'cv-fish-way-status': lazy(() => import('./views/computer-visual-inspection/FishWayStatus')),
  'cv-solar-panel': lazy(() => import('./views/computer-visual-inspection/SolarPanelHotspot')),
  'cv-conveyor-tear': lazy(() => import('./views/computer-visual-inspection/ConveyorTear')),
  'cv-slope-stability': lazy(() => import('./views/computer-visual-inspection/SlopeStability')),
  'cv-crusher-liner-wear': lazy(() => import('./views/computer-visual-inspection/CrusherLinerWear')),
  'cv-shovel-tooth-loss': lazy(() => import('./views/computer-visual-inspection/ShovelToothLoss')),
  'cv-conveyor-alignment': lazy(() => import('./views/computer-visual-inspection/ConveyorAlignment')),
  'cv-crusher-feeding': lazy(() => import('./views/computer-visual-inspection/CrusherFeeding')),
  'cv-hydraulic-cylinder': lazy(() => import('./views/computer-visual-inspection/HydraulicCylinder')),
  'cv-mine-ventilation': lazy(() => import('./views/computer-visual-inspection/MineVentilation')),
  'cv-tailing-dam': lazy(() => import('./views/computer-visual-inspection/TailingDam')),
  'cv-belt-cleaner': lazy(() => import('./views/computer-visual-inspection/BeltCleaner')),
  'cv-excavator-bucket': lazy(() => import('./views/computer-visual-inspection/ExcavatorBucket')),
  'cv-open-pit-slope': lazy(() => import('./views/computer-visual-inspection/OpenPitSlope')),
  'cv-stockpile-volume': lazy(() => import('./views/computer-visual-inspection/StockpileVolume')),
  'cv-belt-foreign-object': lazy(() => import('./views/computer-visual-inspection/BeltForeignObject')),
  'cv-truck-tire': lazy(() => import('./views/computer-visual-inspection/TruckTire')),
  'cv-hoist-rope': lazy(() => import('./views/computer-visual-inspection/HoistRope')),
  'cv-drill-bit-wear': lazy(() => import('./views/computer-visual-inspection/DrillBitWear')),
  'cv-screen-mesh': lazy(() => import('./views/computer-visual-inspection/ScreenMesh')),
  'cv-conveyor-roller': lazy(() => import('./views/computer-visual-inspection/ConveyorRoller')),
  'cv-quay-crane-fatigue': lazy(() => import('./views/computer-visual-inspection/QuayCraneFatigue')),
  'cv-hull-biofouling': lazy(() => import('./views/computer-visual-inspection/HullBiofouling')),
  'cv-hull-damage': lazy(() => import('./views/computer-visual-inspection/HullDamage')),
  'cv-berthing-distance': lazy(() => import('./views/computer-visual-inspection/BerthingDistance')),
  'cv-ship-propeller': lazy(() => import('./views/computer-visual-inspection/ShipPropeller')),
  'cv-port-fender': lazy(() => import('./views/computer-visual-inspection/PortFender')),
  'cv-container-spreader': lazy(() => import('./views/computer-visual-inspection/ContainerSpreader')),
  'cv-engine-room-oil-mist': lazy(() => import('./views/computer-visual-inspection/EngineRoomOilMist')),
  'cv-ship-anchor-chain': lazy(() => import('./views/computer-visual-inspection/ShipAnchorChain')),
  'cv-mooring-tension': lazy(() => import('./views/computer-visual-inspection/MooringTension')),
  'cv-channel-obstacle': lazy(() => import('./views/computer-visual-inspection/ChannelObstacle')),
  'cv-motor-bearing': lazy(() => import('./views/computer-visual-inspection/MotorBearing')),
  'cv-pump-seal-leak': lazy(() => import('./views/computer-visual-inspection/PumpSealLeak')),
  'cv-hydraulic-hose': lazy(() => import('./views/computer-visual-inspection/HydraulicHose')),
  'cv-robot-joint-wear': lazy(() => import('./views/computer-visual-inspection/RobotJointWear')),
  'cv-hvac-cleanliness': lazy(() => import('./views/computer-visual-inspection/HVACCleanliness')),
  'cv-fire-extinguisher': lazy(() => import('./views/computer-visual-inspection/FireExtinguisher')),
  'cv-electrical-cabinet': lazy(() => import('./views/computer-visual-inspection/ElectricalCabinet')),
  'cv-flange-bolt-loosening': lazy(() => import('./views/computer-visual-inspection/FlangeBoltLoosening')),
  'cv-battery-corrosion': lazy(() => import('./views/computer-visual-inspection/BatteryCorrosion')),
  'cv-rack-integrity': lazy(() => import('./views/computer-visual-inspection/RackIntegrity')),
  'cv-generator-exhaust': lazy(() => import('./views/computer-visual-inspection/GeneratorExhaust')),
  'cv-cooling-tower-fan': lazy(() => import('./views/computer-visual-inspection/CoolingTowerFan')),
  'cv-steam-trap-status': lazy(() => import('./views/computer-visual-inspection/SteamTrapStatus')),
  'cv-lighting-failure': lazy(() => import('./views/computer-visual-inspection/LightingFailure')),
  'cv-workshop-floor': lazy(() => import('./views/computer-visual-inspection/WorkshopFloor')),
  'cv-ppe-compliance': lazy(() => import('./views/computer-visual-inspection/PPECompliance')),
  'cv-cable-tunnel': lazy(() => import('./views/computer-visual-inspection/CableTunnel')),
  'cv-warehouse-security': lazy(() => import('./views/computer-visual-inspection/WarehouseSecurity')),
  'cv-crane-rail-wear': lazy(() => import('./views/computer-visual-inspection/CraneRailWear')),
  'cv-gas-pipe-leak': lazy(() => import('./views/computer-visual-inspection/GasPipeLeak')),
  'cv-cooling-tower': lazy(() => import('./views/computer-visual-inspection/CoolingTower')),
  'cv-pump-vibration': lazy(() => import('./views/computer-visual-inspection/PumpVibration')),
  'cv-valve-position': lazy(() => import('./views/computer-visual-inspection/ValvePosition')),
  'cv-ladder-integrity': lazy(() => import('./views/computer-visual-inspection/LadderIntegrity')),
  'cv-oil-tank-corrosion': lazy(() => import('./views/computer-visual-inspection/OilTankCorrosion')),
  'cv-pipe-hanger': lazy(() => import('./views/computer-visual-inspection/PipeHanger')),
  'cv-dust-collector': lazy(() => import('./views/computer-visual-inspection/DustCollector')),
  'cv-conveyor-misalignment': lazy(() => import('./views/computer-visual-inspection/ConveyorMisalignment')),
};

// Lazy load Vibration views
const VIBE_VIEWS: Record<string, any> = {
  'vibe-TurbineShaft': lazy(() => import('./views/vibration-monitoring/TurbineShaft')),
  'vibe-StatorCore': lazy(() => import('./views/vibration-monitoring/StatorCore')),
  'vibe-GuideBearing': lazy(() => import('./views/vibration-monitoring/GuideBearing')),
  'vibe-ThrustBearing': lazy(() => import('./views/vibration-monitoring/ThrustBearing')),
  'vibe-VoluteHydraulic': lazy(() => import('./views/vibration-monitoring/VoluteHydraulic')),
  'vibe-DraftTubePulsation': lazy(() => import('./views/vibration-monitoring/DraftTubePulsation')),
  'vibe-DamGalleryMicroseism': lazy(() => import('./views/vibration-monitoring/DamGalleryMicroseism')),
  'vibe-SpillwayGate': lazy(() => import('./views/vibration-monitoring/SpillwayGate')),
  'vibe-SurgeTankVibration': lazy(() => import('./views/vibration-monitoring/SurgeTankVibration')),
  'vibe-PumpedStorageSwitch': lazy(() => import('./views/vibration-monitoring/PumpedStorageSwitch')),
  'vibe-MineHoist': lazy(() => import('./views/vibration-monitoring/MineHoist')),
  'vibe-ConveyorBeltVibration': lazy(() => import('./views/vibration-monitoring/ConveyorBeltVibration')),
  'vibe-JawCrusher': lazy(() => import('./views/vibration-monitoring/JawCrusher')),
  'vibe-ConeCrusherVibration': lazy(() => import('./views/vibration-monitoring/ConeCrusherVibration')),
  'vibe-BallMillVibration': lazy(() => import('./views/vibration-monitoring/BallMillVibration')),
  'vibe-VibratingScreen': lazy(() => import('./views/vibration-monitoring/VibratingScreen')),
  'vibe-MineVentilator': lazy(() => import('./views/vibration-monitoring/MineVentilator')),
  'vibe-SlurryPumpVibration': lazy(() => import('./views/vibration-monitoring/SlurryPumpVibration')),
  'vibe-UndergroundLoader': lazy(() => import('./views/vibration-monitoring/UndergroundLoader')),
  'vibe-MineTruckVibration': lazy(() => import('./views/vibration-monitoring/MineTruckVibration')),
  'vibe-DrillingRig': lazy(() => import('./views/vibration-monitoring/DrillingRig')),
  'vibe-MineSubstationVibration': lazy(() => import('./views/vibration-monitoring/MineSubstationVibration')),
  'vibe-TailingsDam': lazy(() => import('./views/vibration-monitoring/TailingsDam')),
  'vibe-MineExcavatorVibration': lazy(() => import('./views/vibration-monitoring/MineExcavatorVibration')),
  'vibe-PortCraneVibration': lazy(() => import('./views/vibration-monitoring/PortCraneVibration')),
  'vibe-ShipPropulsionVibration': lazy(() => import('./views/vibration-monitoring/ShipPropulsionVibration')),
  'vibe-ContainerSpreader': lazy(() => import('./views/vibration-monitoring/ContainerSpreader')),
  'vibe-ShipUnloaderVibration': lazy(() => import('./views/vibration-monitoring/ShipUnloaderVibration')),
  'vibe-PortTugboat': lazy(() => import('./views/vibration-monitoring/PortTugboat')),
  'vibe-DredgerVibration': lazy(() => import('./views/vibration-monitoring/DredgerVibration')),
  'vibe-PortConveyor': lazy(() => import('./views/vibration-monitoring/PortConveyor')),
  'vibe-ShipGeneratorVibration': lazy(() => import('./views/vibration-monitoring/ShipGeneratorVibration')),
  'vibe-PortOilPump': lazy(() => import('./views/vibration-monitoring/PortOilPump')),
  'vibe-ShipCraneVibration': lazy(() => import('./views/vibration-monitoring/ShipCraneVibration')),
  'vibe-PortStackerReclaimer': lazy(() => import('./views/vibration-monitoring/PortStackerReclaimer')),
  'vibe-ShipCompressorVibration': lazy(() => import('./views/vibration-monitoring/ShipCompressorVibration')),
  'vibe-PortShipLoader': lazy(() => import('./views/vibration-monitoring/PortShipLoader')),
  'vibe-ShipBoilerVibration': lazy(() => import('./views/vibration-monitoring/ShipBoilerVibration')),
  'vibe-PortBeltScale': lazy(() => import('./views/vibration-monitoring/PortBeltScale')),
  'vibe-ShipThrusterVibration': lazy(() => import('./views/vibration-monitoring/ShipThrusterVibration')),
  'vibe-PortTugboatEngine': lazy(() => import('./views/vibration-monitoring/PortTugboatEngine')),
  'vibe-ShipPropellerShaft': lazy(() => import('./views/vibration-monitoring/ShipPropellerShaft')),
  'vibe-PortQuayCrane': lazy(() => import('./views/vibration-monitoring/PortQuayCrane')),
  'vibe-ShipAuxiliaryEngine': lazy(() => import('./views/vibration-monitoring/ShipAuxiliaryEngine')),
  'vibe-PortUnloader': lazy(() => import('./views/vibration-monitoring/PortUnloader')),
  'vibe-ShipMainEngine': lazy(() => import('./views/Vibration monitoring/ShipMainEngineShafting')),
  'vibe-PortConveyorBelt': lazy(() => import('./views/vibration-monitoring/PortConveyorBelt')),
  'vibe-ShipGenerator': lazy(() => import('./views/vibration-monitoring/ShipGenerator')),
  'vibe-PortStacker': lazy(() => import('./views/vibration-monitoring/PortStacker')),
  'vibe-ShipCompressor': lazy(() => import('./views/Vibration monitoring/ShipCompressor')),
  'vibe-PortWinch': lazy(() => import('./views/Vibration monitoring/WindlassOpeningClosing')),
  'vibe-ShipPump': lazy(() => import('./views/Vibration monitoring/ShipPump')),
  'vibe-PortHopper': lazy(() => import('./views/vibration-monitoring/PortHopper')),
  'vibe-ShipFan': lazy(() => import('./views/vibration-monitoring/ShipFan')),
  'vibe-PortFender': lazy(() => import('./views/vibration-monitoring/PortFender')),
  'vibe-ShipHull': lazy(() => import('./views/Vibration monitoring/ShipHullVerticalVibration')),
  'vibe-PortPipeline': lazy(() => import('./views/Vibration monitoring/PortPipeline')),
  'vibe-ShipSeparator': lazy(() => import('./views/Vibration monitoring/ShipSeparator')),
  'vibe-PortSubstation': lazy(() => import('./views/Vibration monitoring/PortSubstation')),
  'vibe-ShipSteering': lazy(() => import('./views/Vibration monitoring/ShipSteering')),
  'vibe-PortConveyorIdler': lazy(() => import('./views/Vibration monitoring/PortConveyorIdler')),
  'vibe-ShipWaterMaker': lazy(() => import('./views/Vibration monitoring/ShipWaterMaker')),
  'vibe-PortHighMast': lazy(() => import('./views/Vibration monitoring/PortHighMast')),
  'vibe-PortLightingTower': lazy(() => import('./views/Vibration monitoring/PortHighMastVortexVibration')),
  'vibe-ShipAirConditioning': lazy(() => import('./views/Vibration monitoring/ShipAirConditioningFanCoil')),
  'vibe-PortFirePump': lazy(() => import('./views/Vibration monitoring/PortFirePumpEmergencyStart')),
};


import { MaintenanceTrainingView } from './views/MaintenanceTrainingView';
import { LIFE_WARNING_CHILDREN, MAINTENANCE_TRAINING_CHILDREN } from './constants';
const maintenanceViews = import.meta.glob('./views/life-warning/*/View.tsx');
const maintenanceTrainingViews = import.meta.glob('./views/Maintenance-Training/*/index.tsx');

import { SIMULATION_CHILDREN } from './constants';
// import { EQUIPMENT_LIST } from './constants';
import { MENU_ITEMS } from './constants';
import { MenuItem } from './types';
import { Globe, Clock, Settings, Bell, Loader2 } from 'lucide-react';
export const App = () => {
  //const [activeTabId, setActiveTabId] = useState('smart-ops');

  const [activeTabId, setActiveTabId] = useState<string>(MENU_ITEMS[0].id);
  const [currentTime, setCurrentTime] = useState<string>('');

  const [LoadedMaintenanceView, setLoadedMaintenanceView] = useState<React.ComponentType | null>(null);
  const [LoadedMaintenanceTrainingView, setLoadedMaintenanceTrainingView] = useState<React.ComponentType | null>(null);
  const [LoadedMockMaintenanceView, setLoadedMockMaintenanceView] = useState<React.ComponentType | null>(null);



  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-CN', { 
        hour12: false, 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Helper to find item by ID in nested structure
  const findItemById = (items: MenuItem[], id: string): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  
  useEffect(() => {
    const isLifeWarning = LIFE_WARNING_CHILDREN.some(child => child.id === activeTabId);
    if (isLifeWarning) {
      const viewPath = `./views/life-warning/${activeTabId}/View.tsx`;
      const loader = maintenanceViews[viewPath];
      if (loader) {
        loader().then((module: any) => {
          setLoadedMaintenanceView(() => module.View);
        });
      }
    } else {
      setLoadedMaintenanceView(null);
    }
  }, [activeTabId]);

  // Handle dynamic view loading for maintenance training
  useEffect(() => {
    const isMaintenanceTrainingChild = MAINTENANCE_TRAINING_CHILDREN.some(child => child.id === activeTabId);
    if (isMaintenanceTrainingChild) {
      const viewPath = `./views/Maintenance-Training/${activeTabId}/index.tsx`;
      const loader = maintenanceTrainingViews[viewPath];
      if (loader) {
        loader().then((module: any) => {
          setLoadedMaintenanceTrainingView(() => module.default);
        });
      }
    } else {
      setLoadedMaintenanceTrainingView(null);
    }
  }, [activeTabId]);

  const activeItem = useMemo(() => findItemById(MENU_ITEMS, activeTabId), [activeTabId]);

  const renderContent = () => {
    //if (!activeItem) return <GenericView title="Loading..." />;
    if (!activeItem) return <AdvancedGenericView title="Loading..." id="loading" />;

    // Smart Ops
    if (activeTabId === 'smart-ops') return <SmartOperationsView />;
    if (activeTabId.startsWith('eq-')) {
        const id = parseInt(activeTabId.split('-')[1]);
        // const titles = [
        //     "水轮机", "发电机", "输电装置", "泵站", "排污口检测", 
        //     "污水处理", "风机电组", "船舶", "靠泊系统", "起重设备", 
        //     "航标", "测速仪", "矿山提升机", "掘进设备", "钻孔设备", 
        //     "破碎设备", "选矿设备", "制砂机"
        // ];
        // Route to specific equipment views based on ID index
        if (id === 0) return <EquipmentView title="水轮机智能运维" />;
        if (id === 1) return <GeneratorView />;
        if (id === 2) return <TransmissionView />;
        if (id === 3) return <PumpStationView />;
        if (id === 4) return <OutfallView />;
        if (id === 5) return <WastewaterView />;
        if (id === 6) return <WindTurbineView />;
        if (id === 7) return <ShipView />;
        if (id === 8) return <BerthingView />;
        if (id === 9) return <CraneView />;
        if (id === 10) return <NavigationMarkView />;
        if (id === 11) return <TachometerView />;
        if (id === 12) return <MineHoistView />;
        if (id === 13) return <TunnelBoringMachineView />;
        if (id === 14) return <DrillingRigView />;
        if (id === 15) return <CrushingEquipmentView />;
        if (id === 16) return <MineralProcessingView />;
        if (id === 17) return <SandMakingView />;
        if (id === 18) return <Unit1PredictiveView />;
        
        //return <GenericView title={`${titles[id] || '设备'}智能运维`} />;
    }

    // Knowledge Base
    if (activeTabId === 'kb-ship-power') return <ShipPowerKbView />;
    if (activeTabId === 'kb-channel-equip') return <ChannelEquipKbView />;
    if (activeTabId === 'kb-port-machinery') return <PortMachineryKbView />;
    if (activeTabId === 'kb-port-channel-sys') return <PortChannelSystemKbView />;
    if (activeTabId === 'kb-ship-lock') return <ShipLockKbView />;
    if (activeTabId === 'kb-dispatch-rules') return <DispatchRulesKbView />;
    if (activeTabId === 'kb-ship-adapt') return <ShipChannelAdaptKbView />;
    if (activeTabId === 'kb-port-combo') return <PortComboKbView />;
    if (activeTabId === 'kb-mining-equip') return <MiningEquipKbView />;
    if (activeTabId === 'kb-transport-equip') return <TransportEquipKbView />;
    if (activeTabId === 'kb-crushing-equip') return <CrushingKbView />;
    if (activeTabId === 'kb-hydro-gen') return <HydroGenKbView />;
    if (activeTabId === 'kb-pumped-storage') return <PumpedStorageKbView />;
    if (activeTabId === 'kb-hydro-aux') return <HydroAuxKbView />;
    if (activeTabId === 'kb-water-conveyance') return <WaterConveyanceKbView />;

    // Cockpit
    if (activeTabId === 'cp-mining-dispatch') return <MiningDispatchView />;
    if (activeTabId === 'cp-mining-safety') return <MiningSafetyView />;
    if (activeTabId === 'cp-tailings-safety') return <TailingsSafetyView />;
    if (activeTabId === 'cp-mining-eco') return <MiningEcoView />;
    if (activeTabId === 'cp-mining-emergency') return <MiningEmergencyView />;
    if (activeTabId === 'cp-hydro-cascade') return <HydroCascadeView />;
    if (activeTabId === 'cp-dam-safety') return <DamSafetyView />;
    if (activeTabId === 'cp-flood-control') return <FloodControlView />;
    if (activeTabId === 'cp-pumped-storage') return <PumpedStorageCockpitView />;
    if (activeTabId === 'cp-smart-water') return <SmartWaterCockpitView />;
    if (activeTabId === 'cp-irrigation') return <IrrigationCockpitView />;
    if (activeTabId === 'cp-ocean-fleet') return <GlobalFleetCockpitView />;
    if (activeTabId === 'cp-container-terminal') return <ContainerTerminalCockpitView />;
    if (activeTabId === 'cp-bulk-terminal') return <BulkTerminalCockpitView />;
    if (activeTabId === 'cp-inland-waterway') return <InlandWaterwayCockpitView />;
    if (activeTabId === 'cp-green-port') return <GreenPortCockpitView />;
    if (activeTabId === 'cp-maritime-safety') return <MaritimeSafetyView />;

    // Index Analysis
    if (activeTabId === 'ia-mining-recovery') return <MiningRecoveryView />;
    if (activeTabId === 'ia-mineral-recovery') return <MineralRecoveryAnalysisView />;
    if (activeTabId === 'ia-mining-oee') return <MiningOeeView />;
    if (activeTabId === 'ia-truck-cycle') return <MiningTruckCycleView />;
    if (activeTabId === 'ia-blasting-quality') return <BlastingQualityView />;
    if (activeTabId === 'ia-mining-energy') return <MiningEnergyView />;
    if (activeTabId === 'ia-ventilation') return <VentilationEfficiencyView />;
    if (activeTabId === 'ia-hydro-util') return <HydroUtilView />;
    if (activeTabId === 'ia-spillage-loss') return <SpillageLossView />;
    if (activeTabId === 'ia-turbine-wear') return <TurbineWearView />;
    if (activeTabId === 'ia-reservoir-benefit') return <ReservoirBenefitView />;
    if (activeTabId === 'ia-dam-health') return <DamHealthView />;
    if (activeTabId === 'ia-ps-efficiency') return <PumpedStorageEfficiencyView />;
    if (activeTabId === 'ia-power-ram') return <PowerRamView />;
    if (activeTabId === 'ia-berth-util') return <BerthUtilView />;
    if (activeTabId === 'ia-crane-efficiency') return <CraneEfficiencyView />;
    if (activeTabId === 'ia-ship-eeoi') return <ShipEeoiView />;
    if (activeTabId === 'ia-ship-cii') return <ShipCiiView />;
    if (activeTabId === 'ia-lock-efficiency') return <LockEfficiencyView />;
    if (activeTabId === 'ia-transport-connect') return <TransportConnectView />;
    if (activeTabId === 'ia-channel-safety') return <ChannelSafetyView />;

    // Digital Delivery
    if (activeTabId === 'dd-hydro-completion') return <HydroCompletionView />;
    if (activeTabId === 'dd-hydro-twin') return <HydroTwinDeliveryView />;
    if (activeTabId === 'dd-hydro-bim') return <HydroBimDeliveryView />;
    if (activeTabId === 'dd-hydro-dispatch') return <HydroDispatchDeliveryView />;
    if (activeTabId === 'dd-hydro-equip-lifecycle') return <HydroEquipLifecycleView />;
    if (activeTabId === 'dd-dam-safety') return <DamSafetyDeliveryView />;
    if (activeTabId === 'dd-hydro-monitor') return <HydroMonitorDeliveryView />;
    if (activeTabId === 'dd-flood-control') return <FloodDispatchDeliveryView />;
    if (activeTabId === 'dd-hydro-asset') return <HydroAssetDeliveryView />;
    if (activeTabId === 'dd-mine-construction') return <MineConstructionDeliveryView />;
    if (activeTabId === 'dd-mine-bim') return <MineBimDeliveryView />;
    if (activeTabId === 'dd-mine-process') return <MineProcessDeliveryView />;
    if (activeTabId === 'dd-mine-processing') return <MineProcessingDeliveryView />;
    if (activeTabId === 'dd-mine-equip-lifecycle') return <MineEquipLifecycleView />;
    if (activeTabId === 'dd-mine-safety') return <MineSafetyDeliveryView />;
    if (activeTabId === 'dd-mine-energy') return <MineEnergyDeliveryView />;
    if (activeTabId === 'dd-mine-eco') return <MineEcoDeliveryView />;
    if (activeTabId === 'dd-port-completion') return <PortCompletionDeliveryView />;
    if (activeTabId === 'dd-port-bim') return <PortBimDeliveryView />;
    if (activeTabId === 'dd-channel-regulation') return <ChannelRegulationDeliveryView />;
    if (activeTabId === 'dd-ship-lock') return <ShipLockDeliveryView />;
    if (activeTabId === 'dd-smart-port') return <SmartPortDeliveryView />;
    if (activeTabId === 'dd-nav-dispatch') return <NavDispatchDeliveryView />;
    if (activeTabId === 'dd-ship-lifecycle') return <ShipLifecycleDeliveryView />;
    if (activeTabId === 'dd-port-asset') return <PortAssetDeliveryView />;
    if (activeTabId === 'dd-channel-monitor') return <ChannelMonitorDeliveryView />;
    if (activeTabId === 'dd-nav-safety') return <NavSafetyDeliveryView />;

    // Simulation
    if (activeTabId === 'sim-mine-vent') return <MineVentilationSimView />;
    if (activeTabId === 'sim-mine-roof') return <MineRoofStabilitySimView />;
    if (activeTabId === 'sim-mine-blast') return <MineBlastSimView />;
    if (activeTabId === 'sim-mine-truck') return <MineTruckRoutingSimView />;
    if (activeTabId === 'sim-mine-slope') return <MineSlopeStabilitySimView />;
    if (activeTabId === 'sim-mine-equip') return <MineEquipStrengthSimView />;
    if (activeTabId === 'sim-mine-belt') return <MineBeltConveyorSimView />;
    if (activeTabId === 'sim-mine-evac') return <MineEvacuationSimView />;
    if (activeTabId === 'sim-mine-water') return <MineWaterSimView />;
    if (activeTabId === 'sim-mine-power') return <MinePowerSimView />;
    if (activeTabId === 'sim-mine-coop') return <MineCoopSimView />;
    if (activeTabId === 'sim-mine-hoist') return <MineHoistSimView />;
    if (activeTabId === 'sim-mine-dust') return <MineDustSimView />;
    if (activeTabId === 'sim-mine-freeze') return <MineFreezeSimView />;
    if (activeTabId === 'sim-mine-crash') return <MineCrashSimView />;
    if (activeTabId === 'sim-mine-slurry') return <MineSlurrySimView />;
    if (activeTabId === 'sim-mine-dispatch') return <MineDispatchSimView />;
    if (activeTabId === 'sim-mine-eco') return <MineEcoSimView />;
    if (activeTabId === 'sim-hydro-flood') return <HydroFloodSimView />;
    if (activeTabId === 'sim-hydro-spill') return <HydroSpillSimView />;
    if (activeTabId === 'sim-hydro-dam') return <HydroDamSimView />;
    if (activeTabId === 'sim-hydro-gate') return <HydroGateSimView />;
    if (activeTabId === 'sim-hydro-turb') return <HydroTurbineSimView />;
    if (activeTabId === 'sim-hydro-river') return <HydroRiverSimView />;
    if (activeTabId === 'sim-hydro-urban') return <HydroUrbanSimView />;
    if (activeTabId === 'sim-hydro-sedi') return <HydroSedimentSimView />;
    if (activeTabId === 'sim-hydro-break') return <HydroBreakSimView />;
    if (activeTabId === 'sim-hydro-trans') return <HydroTransitionSimView />;
    if (activeTabId === 'sim-hydro-group') return <HydroGroupDispatchSimView />;
    if (activeTabId === 'sim-hydro-pump') return <HydroPumpSimView />;
    if (activeTabId === 'sim-hydro-fish') return <HydroFishSimView />;
    if (activeTabId === 'sim-hydro-grid') return <HydroGridDispatchSimView />;
    if (activeTabId === 'sim-hydro-emer') return <HydroDamBreakSimView />;
    if (activeTabId === 'sim-hydro-ice') return <HydroIceFloodSimView />;
    if (activeTabId === 'sim-hydro-vib') return <HydroVibrationSimView />;
    if (activeTabId === 'sim-port-flow') return <PortTrafficFlowSimView />;
    if (activeTabId === 'sim-port-lock') return <ShipLockDispatchSimView />;
    if (activeTabId === 'sim-port-motion') return <PortMotionSimView />;
    if (activeTabId === 'sim-port-load') return <PortTerminalLoadingSimView />;
    if (activeTabId === 'sim-port-multi') return <PortMultimodalSimView />;
    if (activeTabId === 'sim-port-reg') return <ChannelRegulationSimView />;
    if (activeTabId === 'sim-port-coll') return <PortCollisionSimView />;
    if (activeTabId === 'sim-port-spill') return <PortSpillSimView />;
    if (activeTabId === 'sim-port-berth') return <PortBerthingSimView />;
    if (activeTabId === 'sim-port-dredge') return <PortDredgingSimView />;
    if (activeTabId === 'sim-port-sched') return <PortSchedSimView />;
    if (activeTabId === 'sim-port-bridge') return <PortBridgeSimView />;
    if (activeTabId === 'sim-port-surge') return <PortSurgeSimView />;
    if (activeTabId === 'sim-port-group') return <PortGroupSimulationView />;
    if (activeTabId === 'sim-port-auto') return <PortAutoSimulationView />;
    if (activeTabId === 'sim-port-carbon') return <PortCarbonSimulationView />;
    if (activeTabId === 'sim-port-evac') return <PortEvacSimulationView />;

    
    //CDM views
    if (activeTabId === 'cdm-master') {
      return <CustomerMasterDataView />;
    }
    if (activeTabId === 'cdm-org') {
      return <CustomerOrgStructureView />;
    }
    if (activeTabId === 'cdm-contacts') {
      return <CustomerContactsView />;
    }
    if (activeTabId === 'cdm-certs') {
      return <CustomerCertificatesView />;
    }
    if (activeTabId === 'cdm-assets') {
      return <CustomerAssetsView />;
    }
    if (activeTabId === 'cdm-sites') {
      return <CustomerSitesView />;
    }
    if (activeTabId === 'cdm-contracts') {
      return <CustomerContractsView />;
    }
    if (activeTabId === 'cdm-workorders') {
      return <CustomerWorkOrdersView />;
    }
    if (activeTabId === 'cdm-warranty') {
      return <CustomerWarrantyView />;
    }
    if (activeTabId === 'cdm-parts') {
      return <CustomerPartsView />;
    }
    if (activeTabId === 'cdm-complaints') {
      return <CustomerComplaintsView />;
    }
    if (activeTabId === 'cdm-finance') {
      return <CustomerFinanceView />;
    }
    if (activeTabId === 'cdm-credit') {
      return <CustomerCreditView />;
    }
    if (activeTabId === 'cdm-security') {
      return <CustomerSecurityView />;
    }
    if (activeTabId === 'cdm-integration') {
      return <CustomerIntegrationView />;
    }
    if (activeTabId === 'cdm-lifecycle') {
      return <CustomerLifecycleView />;
    }
    if (activeTabId === 'cdm-behavior') {
      return <CustomerBehaviorView />;
    }
    if (activeTabId === 'cdm-satisfaction') {
      return <CustomerSatisfactionView />;
    }
    if (activeTabId === 'cdm-risk-compliance') {
      return <CustomerRiskComplianceView />;
    }
    if (activeTabId === 'cdm-delivery') {
      return <CustomerDeliveryView />;
    }
    if (activeTabId === 'cdm-contract-perf') {
      return <CustomerContractPerformanceView />;
    }
    if (activeTabId === 'cdm-privacy') {
      return <CustomerDataPrivacyView />;
    }
    if (activeTabId === 'cdm-finance-payment') {
      return <CustomerFinancePaymentView />;
    }
    if (activeTabId === 'cdm-training') {
      return <CustomerSupportTrainingView />;
    }
    if (activeTabId === 'cdm-reporting') {
      return <CustomerReportingView />;
    }
    if (activeTabId === 'cdm-social') {
      return <CustomerSocialAnalysisView />;
    }
    if (activeTabId === 'cdm-loyalty') {
      return <CustomerLoyaltyView />;
    }
    if (activeTabId === 'cdm-kb') {
      return <CustomerServiceKbView />;
    }
    if (activeTabId === 'cdm-supply-chain') {
      return <CustomerSupplyChainView />;
    }
    if (activeTabId === 'cdm-portal') {
      return <CustomerPortalView />;
    }
    if (activeTabId === 'cdm-tendering') {
      return <CustomerTenderingView />;
    }
    if (activeTabId === 'cdm-competitors') {
      return <CustomerCompetitorAnalysisView />;
    }
    if (activeTabId === 'cdm-decision-chain') {
      return <CustomerDecisionChainView />;
    }
    if (activeTabId === 'cdm-marketing-activity') {
      return <CustomerMarketingActivityView />;
    }
    if (activeTabId === 'cdm-white-space') {
      return <CustomerWhiteSpaceView />;
    }
    if (activeTabId === 'cdm-strategic-planning') {
      return <CustomerStrategicPlanningView />;
    }
    if (activeTabId === 'cdm-benchmark-cases') {
      return <CustomerBenchmarkCasesView />;
    }
    if (activeTabId === 'cdm-custom-dev') {
      return <CustomerCustomDevView />;
    }
    if (activeTabId === 'cdm-channel-auth') {
      return <CustomerChannelAuthView />;
    }
    if (activeTabId === 'cdm-churn-model') {
      return <CustomerChurnModelView />;
    }
    if (activeTabId === 'cdm-reverse-logistics') {
      return <CustomerReverseLogisticsView />;
    }
    if (activeTabId === 'cdm-site-visits') {
      return <CustomerSiteVisitsView />;
    }
    if (activeTabId === 'cdm-trial-equipment') {
      return <CustomerTrialEquipmentView />;
    }
    if (activeTabId === 'cdm-shipping-config') {
      return <CustomerShippingConfigView />;
    }
    if (activeTabId === 'cdm-esg-profile') {
      return <CustomerEsgProfileView />;
    }
    if (activeTabId === 'cdm-business-intel') {
      return <CustomerBusinessIntelView />;
    }
    if (activeTabId === 'cdm-ip-nda') {
      return <CustomerIpNdaView />;
    }
    if (activeTabId === 'cdm-crisis-response') {
      return <CustomerCrisisResponseView />;
    }
    if (activeTabId === 'cdm-digital-touchpoints') {
      return <CustomerDigitalTouchpointsView />;
    }
    if (activeTabId === 'cdm-faq-kb') {
      return <CustomerFaqKbView />;
    }


    //Remote Expert Platform Capabilities (Core Views)
    if (activeTabId === 're-profile') {
        return <RemoteExpertProfileView />;
    }
    if (activeTabId === 're-matching') {
        return <RemoteExpertMatchingView />;
    }
    if (activeTabId === 're-consultation') {
        return <RemoteExpertConsultationView />;
    }
    if (activeTabId === 're-diagnosis') {
        return <RemoteExpertDiagnosisView />;
    }
    if (activeTabId === 're-decision') {
        return <RemoteExpertDecisionView />;
    }
    if (activeTabId === 're-tickets') {
        return <RemoteExpertTicketsView />;
    }
    if (activeTabId === 're-collaboration') {
        return <RemoteExpertCollaborationView />;
    }
    if (activeTabId === 're-guidance') {
        return <RemoteExpertGuidanceView />;
    }
    if (activeTabId === 're-conclusion') {
        return <RemoteExpertConclusionView />;
    }
    if (activeTabId === 're-knowledge') {
        return <RemoteExpertKnowledgeView />;
    }
    if (activeTabId === 're-compliance') {
        return <RemoteExpertComplianceView />;
    }
    if (activeTabId === 're-evaluation') {
        return <RemoteExpertEvaluationView />;
    }

    //Remote Expert Service Scenarios (Mapped to Core Views)
    if (activeTabId === 'res-device-fault') {
       return <EquipmentFaultConsultationView />; 
    }
    if (activeTabId === 'res-ops-anomaly') {
       return <OperationAnomalyAnalysisView />;
    }
    if (activeTabId === 'res-expert-collab') {
       return <RemoteExpertCollaborationView />;
    }
    if (activeTabId === 'res-maintenance-guide') {
       return <RemoteExpertGuidanceView />;
    }
    if (activeTabId === 'res-fault-kb') {
       return <RemoteExpertKnowledgeView />;
    }
    if (activeTabId === 'res-emergency-support') {
       return <EmergencySupportView />;
    }
    if (activeTabId === 'res-extreme-condition') {
       return <ExtremeConditionView />;
    }
    if (activeTabId === 'res-accident-review') {
       return <AccidentReviewView />;
    }
    if (activeTabId === 'res-compliance-check') {
       return <RemoteExpertComplianceView />;
    }
    if (activeTabId === 'res-cross-region') {
        return <RemoteExpertMatchingView />;
    }
    if (activeTabId === 'res-training') {
        return <CustomerSupportTrainingView />;
    }
    if (activeTabId === 'res-health-eval') {
        return <EquipmentHealthEvaluationView />;
    }
    if (activeTabId === 'res-failure-analysis') {
        return <FailureAnalysisView />;
    }
    if (activeTabId === 'res-life-prediction') {
        return <LifePredictionView />;
    }
    if (activeTabId === 'res-ops-optimization') {
        return <OperationOptimizationView />;
    }
    if (activeTabId === 'res-complex-diag') {
        return <ComplexDiagnosisView />;
    }
    if (activeTabId === 'res-param-tuning') {
        return <ParameterTuningView />;
    }
    if (activeTabId === 'res-maintenance-review') {
        return <MaintenanceReviewView />;
    }
    if (activeTabId === 'res-downtime-analysis') {
        return <DowntimeAnalysisView />;
    }
    if (activeTabId === 'res-system-fault') {
        return <SystemFaultDiagnosisView />;
    }
    if (activeTabId === 'res-safety-risk') {
       return <SafetyRiskAssessmentView />;
    }
    if (activeTabId === 'res-safety-accident') {
       return <SafetyAccidentIdentificationView />;
    }
    if (activeTabId === 'res-strategy-sim') {
       return <StrategySimulationView />;
    }
    if (activeTabId === 'res-process-optimize') {
        return <ProcessOptimizationView />;
    }
    if (activeTabId === 'res-energy-diag') {
        return <EnergyEfficiencyDiagnosisView />;
    }
    if (activeTabId === 'res-env-compliance') {
        return <EnvironmentalComplianceView />;
    }
    if (activeTabId === 'res-upgrade-arg') {
        return <UpgradeArgumentationView />;
    }
    if (activeTabId === 'res-tech-route') {
        return <TechRouteConsultationView />;
    }
    if (activeTabId === 'res-dt-calibration') {
        return <DigitalTwinCalibrationView />;
    }
    if (activeTabId === 'res-data-analysis') {
        return <RemoteDataAnalysisView />;
    }
    if (activeTabId === 'res-major-project') {
        return <MajorProjectReviewView />;
    }
    if (activeTabId === 'res-new-equipment') {
        return <NewEquipmentCommissioningView />;
    }
    if (activeTabId === 'res-commissioning') {
        return <RemoteCommissioningView />;
    }
    if (activeTabId === 'res-stability-eval') {
        return <SystemStabilityEvaluationView />;
    }
    if (activeTabId === 'res-production-opt') {
        return <ProductionOptimizationView />;
    }
    if (activeTabId === 'res-disaster-warning') {
        return <DisasterWarningView />;
    }
    if (activeTabId === 'res-inspection-review') {
        return <InspectionReviewView />;
    }
    if (activeTabId === 'res-unmanned-ops') {
        return <UnmannedOpsSupportView />;
    }
    if (activeTabId === 'res-standard-guide') {
        return <StandardInterpretationView />;
    }
    if (activeTabId === 'res-tech-consult') {
        return <TechConsultationView />;
    }

    //
    // Generic fallback for other Remote Expert Service items
    if (activeTabId.startsWith('res-')) {
       return <GenericView title={activeItem.label} />;
    }

    
    // 预测性维护
    if (activeTabId === 'pm-pmOther-0') return <JawCrusherPmView />;
    if (activeTabId === 'pm-pmOther-1') return <ConeCrusherWearPmView />;
    if (activeTabId === 'pm-pmOther-2') return <ConeEccentricPmView />;
    if (activeTabId === 'pm-pmOther-3') return <ImpactCrusherCrackPmView />;
    if (activeTabId === 'pm-pmOther-4') return <ExciterHealthPmView />;
    if (activeTabId === 'pm-pmOther-5') return <ScreenBearingPmView />;
    if (activeTabId === 'pm-pmOther-6') return <ScreenStructurePmView />;
    if (activeTabId === 'pm-pmOther-7') return <ScreenWearPmView />;
    if (activeTabId === 'pm-pmOther-8') return <ScreenSystemComparePmView />;
    if (activeTabId === 'pm-pmOther-9') return <BeltConveyorPmView />;
    if (activeTabId === 'pm-pmOther-10') return <BeltTearPmView />;
    if (activeTabId === 'pm-pmOther-11') return <PulleyWearPmView />;
    if (activeTabId === 'pm-pmOther-12') return <GearboxPmView />;
    if (activeTabId === 'pm-pmOther-13') return <IdlerFaultPmView />;
    if (activeTabId === 'pm-pmOther-14') return <HoistHealthPmView />;
    if (activeTabId === 'pm-pmOther-15') return <HoistRopePmView />;
    if (activeTabId === 'pm-pmOther-16') return <HoistBrakePmView />;
    if (activeTabId === 'pm-pmOther-17') return <HoistShaftBearingPmView />;
    if (activeTabId === 'pm-pmOther-18') return <HoistFailureWindowPmView />;
    if (activeTabId === 'pm-pmOther-19') return <BallMillHealthPmView />;
    if (activeTabId === 'pm-pmOther-20') return <BallMillLubePmView />;
    if (activeTabId === 'pm-pmOther-21') return <BallMillLinerWearPmView />;
    if (activeTabId === 'pm-pmOther-22') return <FlotationAgitatorPmView />;
    if (activeTabId === 'pm-pmOther-23') return <ThickenerDrivePmView />;
    if (activeTabId === 'pm-pmOther-24') return <ShipMainEngineHealthPmView />;
    if (activeTabId === 'pm-pmOther-25') return <ShipCrankshaftPmView />;
    if (activeTabId === 'pm-pmOther-26') return <ShipCylinderLinerPmView />;
    if (activeTabId === 'pm-pmOther-27') return <ShipPistonPmView />;
    if (activeTabId === 'pm-pmOther-28') return <ShipEngineRiskOverviewPmView />;
    if (activeTabId === 'pm-pmOther-29') return <ShipEngineFaultProbPmView />;
    if (activeTabId === 'pm-pmOther-30') return <ShipEngineFailureWindowPmView />;
    if (activeTabId === 'pm-pmOther-31') return <ShipEngineRulPmView />;
    if (activeTabId === 'pm-pmOther-32') return <ShipEngineRulConfidencePmView />;
    if (activeTabId === 'pm-pmOther-33') return <ShipEngineTypicalFailurePmView />;
    if (activeTabId === 'pm-pmOther-34') return <ShipShaftSystemPmView />;
    if (activeTabId === 'pm-pmOther-35') return <PropulsionBearingVibTempPmView />;
    if (activeTabId === 'pm-pmOther-36') return <PropulsionShaftMisalignmentPmView />;
    if (activeTabId === 'pm-pmOther-37') return <PropellerCrackCorrosionPmView />;
    if (activeTabId === 'pm-pmOther-38') return <PropulsionDegradationRatePmView />;
    if (activeTabId === 'pm-pmOther-39') return <ShipAuxGeneratorPmView />;
    if (activeTabId === 'pm-pmOther-40') return <ShipAuxSystemComparePmView />;
    if (activeTabId === 'pm-pmOther-41') return <ShipSwitchboardOverheatPmView />;
    if (activeTabId === 'pm-pmOther-42') return <ShipElectricalLoadPmView />;
    if (activeTabId === 'pm-pmOther-43') return <ShipElectricalFailureModePmView />;
    if (activeTabId === 'pm-pmOther-44') return <FuelSystemHealthPmView />;
    if (activeTabId === 'pm-pmOther-45') return <FuelInjectorDegradationPmView />;
    if (activeTabId === 'pm-pmOther-46') return <FuelSystemClogLeakPmView />;
    if (activeTabId === 'pm-pmOther-47') return <LubeDeteriorationPmView />;
    if (activeTabId === 'pm-pmOther-48') return <LubeSystemRulPmView />;
    if (activeTabId === 'pm-pmOther-49') return <CoolingWaterPumpPmView />;
    if (activeTabId === 'pm-pmOther-50') return <SeawaterCoolingPmView />;
    if (activeTabId === 'pm-pmOther-51') return <HeatExchangerClogPmView />;
    if (activeTabId === 'pm-pmOther-52') return <CompressedAirPmView />;
    if (activeTabId === 'pm-pmOther-53') return <ShipAuxSystemComparePmView />;
    if (activeTabId === 'pm-pmOther-54') return <SteeringGearPmView />;
    if (activeTabId === 'pm-pmOther-55') return <SteeringPumpActuatorPmView />;
    if (activeTabId === 'pm-pmOther-56') return <SteeringJamPmView />;
    if (activeTabId === 'pm-pmOther-57') return <SteeringFailureWindowPmView />;
    if (activeTabId === 'pm-pmOther-58') return <SteeringRulPmView />;
    if (activeTabId === 'pm-pmOther-59') return <WinchHealthPmView />;
    if (activeTabId === 'pm-pmOther-60') return <WinchGearboxBrakePmView />;
    if (activeTabId === 'pm-pmOther-61') return <HatchCoverPmView />;
    if (activeTabId === 'pm-pmOther-62') return <MarineCraneSlewingPmView />;
    if (activeTabId === 'pm-pmOther-63') return <DeckMachineryFailurePmView />;
    if (activeTabId === 'pm-pmOther-64') return <PortCraneHealthPmView />;
    if (activeTabId === 'pm-pmOther-65') return <CraneTrolleyPmView />;
    if (activeTabId === 'pm-pmOther-66') return <RtgTravelPmView />;
    if (activeTabId === 'pm-pmOther-67') return <LighthousePowerPmView />;
    if (activeTabId === 'pm-pmOther-68') return <NavMarkRiskPmView />;
    if (activeTabId === 'pm-pmOther-69') return <HeavyLoadDegradationPmView />;
    if (activeTabId === 'pm-pmOther-70') return <SevereSeaPropulsionPmView />;
    if (activeTabId === 'pm-pmOther-71') return <HighSaltCorrosionPmView />;
    if (activeTabId === 'pm-pmOther-72') return <ExtremeWeatherPmView />;
    if (activeTabId === 'pm-pmOther-73') return <ContinuousVoyageFatiguePmView />;
    if (activeTabId === 'pm-pmOther-74') return <MultiShipJointFailurePmView />;
    if (activeTabId === 'pm-pmOther-75') return <ShipSystemFaultPropagationPmView />;
    if (activeTabId === 'pm-pmOther-76') return <ShipCascadingFailurePmView />; 
    if (activeTabId === 'pm-pmOther-77') return <PortCallMaintenancePmView />;
    if (activeTabId === 'pm-pmOther-78') return <ShippingComprehensivePmView />;

    //PM-hydro
    if (activeTabId.startsWith('pm-hydro-')) {
        const idx = parseInt(activeTabId.replace('pm-hydro-', ''));
        switch (idx) {
            case 0: return <HydroUnitHealthView />;
            case 1: return <ShaftBearingHealthView />;
            case 2: return <StatorWindingHealthView />;
            case 3: return <RotorUnbalanceView />;
            case 4: return <ShaftVibrationTrendView />;
            case 5: return <TurbineRunnerCavitationView />;
            case 6: return <BearingLifePredictionView />;
            case 7: return <UnitRiskPredictionView />;
            case 8: return <FailureProbabilityView />;
            case 9: return <DegradationEvolutionView />;
            case 10: return <GovernorHealthView />;
            case 11: return <PumpVibrationTrendView />;
            case 12: return <GuideVaneDegradationView />;
            case 13: return <ValveStictionView />;
            case 14: return <GovernorRulView />;
            case 15: return <MainTransformerHealthView />;
            case 16: return <TransformerWindingView />;
            case 17: return <TransformerOilAnalysisView />;
            case 18: return <BushingInsulationView />;
            case 19: return <TransformerFaultPredictionView />;
            case 20: return <GisSwitchgearHealthView />;
            case 21: return <BreakerMechanicalView />;
            case 22: return <DisconnectSwitchWearView />;
            case 23: return <BusbarHeatRiskView />;
            case 24: return <SwitchStationFailureView />;
            case 25: return <GateStructureHealthView />;
            case 26: return <GateHoistDegradationView />;
            case 27: return <GateStructureCorrosionFatigueView />;
            case 28: return <GateRollerSliderWearView />;
            case 29: return <GateStictionRiskView />;
            case 30: return <PumpStationHealthView />;
            case 31: return <PumpBearingImpellerView />;
            case 32: return <CoolingWaterPumpRiskView />;
            case 33: return <AirCompressorOilHealthView />;
            case 34: return <AuxSystemComparisonView />;
            case 35: return <PenstockHealthView />;
            case 36: return <PenstockWeldFatigueView />;
            case 37: return <HydraulicPulsationView />;
            case 38: return <WaterLevelSurgeRiskView />;
            case 39: return <ExtremeFloodFailureView />;
            case 40: return <MultiUnitJointRiskView />;
            case 41: return <SystemFailurePropagationView />;
            case 42: return <HydroMechanicalCouplingView />;
            case 43: return <ElecMechSystemRiskView />;
            case 44: return <CascadeFailurePredictionView />;
            case 45: return <PredictionAccuracyView />;
            case 46: return <FaultDistributionView />;
            case 47: return <MaintenancePlanOptimizationView />;
            case 48: return <EconomyEvaluationView />;
            case 49: return <HydroComprehensiveEvaluationView />;
            default: return <GenericView title={activeTabId} />;
        }
    }
    //PM-MInin
    if (activeTabId.startsWith('pm-mining-')) {
        console.log("a56s4f658a4f64f6a8g64sad6f4ad6sf4fa46dfa6sfs4f635af");
        const idx = parseInt(activeTabId.replace('pm-mining-', ''));
        switch (idx) {
          case 0: return <ElectricShovelHealthView />;
          case 1: return <SwingMechanismHealthView />;
          case 2: return <HoistRopeHealthView />;
          case 3: return <HoistGearboxHealthView />;
          case 4: return <MainMotorInsulationView />;
          case 5: return <HydraulicExcavatorHealthView />;
          case 6: return <ExcavatorPumpHealthView />;
          case 7: return <ExcavatorValveStictionView />;
          case 8: return <ExcavatorSwingBearingRulView />;
          case 9: return <ExcavatorBoomFatigueView />;
          case 10: return <MiningTruckHealthView />;
          case 11: return <MiningTruckEngineHealthView />;
          case 12: return <MiningTransmissionHealthView />;
          case 13: return <MiningWheelHubReducerRiskView />;
          case 14: return <MiningBrakeFailureView />;
          case 15: return <MiningLocomotiveHealthView />;
          case 16: return <MiningLocomotiveHealthView />; 
          case 17: return <LocomotiveGearboxWearView />;
          case 18: return <LocomotiveBrakingReliabilityView />;
          case 19: return <MiningLocomotiveRulView />;
          case 20: return <JawCrusherHealthView />;
          default: return <GenericView title={activeTabId} />;
        }
    }
    //应用服务路由
    switch (activeTabId) {
      case 'smart-ops': return <SmartOperationsView />;
      
      // 应用维修服务路由
      case 'am-portal': return <PortalView />;
      case 'am-dispatch': return <DispatchConsoleView />;
      case 'am-emergency': return <EmergencyChannelView />;
      case 'am-pending': return <PendingManagementView />;
      case 'am-closeout': return <CloseoutView />;
      case 'am-outsourcing': return <OutsourcingTrackerView />;
      case 'am-merge-split': return <MergeSplitView />;
      case 'am-timeline': return <TimelineView />;
      case 'am-ptw': return <PtwApplicationView />;
      case 'am-loto': return <LotoManagementView />;
      case 'am-checkin': return <MobileCheckinView />;
      case 'am-ar-expert': return <ArExpertView />;
      case 'am-sop-guide': return <SopGuideView />;
      case 'am-3d-explode': return <ExplodedView />;
      case 'am-media-capture': return <MediaCaptureView />;
      case 'am-test-run': return <TestRunRecordView />;
      case 'am-parts-cart': return <PartsCartView />;
      case 'am-sn-tracking': return <SnTrackingView />;
      case 'am-stock-alert': return <StockAlertView />;
      case 'am-tools-loan': return <ToolsLoanView />;
      case 'am-parts-substitute': return <PartsSubstituteView />;
      case 'am-reverse-logistics': return <ReverseLogisticsView />;
      case 'am-oil-record': return <LubricationRecordView />;
      case 'am-bom-check': return <BomCheckView />;
      case 'am-gantt-plan': return <GanttPlanView />;
      case 'am-route-config': return <RouteConfigView />;
      case 'am-lub-calendar': return <LubCalendarView />;
      case 'am-cbm-correction': return <CbmCorrectionView />;
      case 'am-calibration': return <CalibrationRecordView />;
      case 'am-annual-inspect': return <AnnualInspectView />;
      case 'am-skill-matrix': return <SkillMatrixView />;
      case 'am-shift-roster': return <ShiftRosterView />;
      case 'am-vendor-eval': return <VendorPerformanceView />;
      case 'am-labor-kpi': return <LaborKpiView />;
      case 'am-training-analysis': return <TrainingAnalysisView />;
      case 'am-asset-lcc': return <AssetLccView />;
      case 'am-budget-monitor': return <BudgetMonitorView />;
      case 'am-warranty-mgmt': return <WarrantyMgmtView />;
      case 'am-roi-analysis': return <RoiAnalysisView />;
      case 'am-cost-compare': return <CostCompareView />;
      case 'am-incident-record': return <IncidentRecordView />;
      case 'am-waste-declare': return <WasteDeclareView />;
      case 'am-5s-score': return <FiveSScoreView />;
      case 'am-ppe-mgmt': return <PPEMgmtView />;
      case 'am-rcfa-report': return <RcfaReportView />;
      case 'am-mtbf-mttr': return <MtbfMttrAnalysisView />;
      case 'am-repeat-fault': return <RepeatFaultView />;
      case 'am-knowledge-back': return <KnowledgeBackflowView />;
      case 'am-survey': return <SurveyView />;
      case 'am-downtime-coding': return <DowntimeCodingView />;

      // 备品备件服务路由
      case 'sp-demand-forecast': return <DemandForecastView />;
      case 'sp-life-eval': return <LifeEvaluationView />;
      case 'sp-critical-list': return <CriticalListView />;
      case 'sp-std-coding': return <StandardizationView />;
      case 'sp-stock-opt': return <InventoryOptView />;
      case 'sp-safety-stock': return <SafetyStockConfigView />;
      case 'sp-substitute-match': return <SubstituteMatchingView />;
      case 'sp-cert-service': return <PartsCertificationView />;
      case 'sp-quality-trace': return <QualityTraceView />;
      case 'sp-arrival-inspect': return <ArrivalInspectionView />;
      case 'sp-in-service-monitor': return <InServiceMonitorView />;
      case 'sp-failure-analysis': return <FailurespareAnalysisView />;
      case 'sp-refurbish': return <PartsRefurbishView />;
      case 'sp-re-manufacturing': return <ReManufacturingView />;
      case 'sp-lifecycle-mgmt': return <LifecycleMgmtView />;
      case 'sp-price-eval': return <PriceEvalView />;
      case 'sp-risk-eval': return <RiskEvalView />;
      case 'sp-emergency-support': return <EmergencyspareSupportView />;
      case 'sp-turbine-parts': return <TurbinePartsView />;
      case 'sp-gen-stator-rotor': return <GenStatorRotorView />;
      case 'sp-gate-hoist': return <GateHoistPartsView />;
      case 'sp-bearing-seal': return <BearingSealPartsView />;
      case 'sp-hydro-hydraulic': return <HydroHydraulicPartsView />;
      case 'sp-governor-support': return <GovernorSupportView />;
      case 'sp-automation-sys': return <AutomationSysView />;
      case 'sp-sensors': return <HydroSensorsView />;
      case 'sp-metal-structure': return <MetalStructurePartsView />;
      case 'sp-flood-emergency': return <FloodEmergencyView />;
      case 'sp-localization-sub': return <LocalizationSubView />;
      case 'sp-maintenance-planning': return <MaintenancePlanningView />;
      case 'sp-ship-main-engine': return <ShipMainEngineView />;
      case 'sp-ship-auxiliary': return <ShipAuxiliaryView />;
      case 'sp-ship-propulsion': return <ShipPropulsionView />;
      case 'sp-ship-electrical': return <ShipElectricalView />;
      case 'sp-ship-automation-nav': return <ShipAutomationNavView />; 
      case 'sp-ship-safety-parts': return <ShipSafetyPartsView />;
      case 'sp-class-cert': return <ClassCertView />;
      case 'sp-shipping-emergency': return <ShippingEmergencyView />; // 注册新路由
      case 'sp-mining-critical': return <MiningCriticalView />;
      case 'sp-crush-screen': return <CrushingScreeningPartsView />;
      case 'sp-conveying-sys': return <ConveyingSystemPartsView />;
      case 'sp-mine-hydraulic': return <MineHydraulicPartsView />;
      case 'sp-mine-motor-inv': return <MineMotorInverterView />;
      case 'sp-mine-bearing': return <MiningBearingServiceView />;
      case 'sp-mine-monitor': return <MiningSafetyServiceView />;
      case 'sp-mine-wear-parts': return <MiningWearPartsView />;
      case 'sp-underground-emergency': return <UndergroundEmergencyView />;
      case 'sp-mine-localization': return <MineLocalizationView />;
      case 'sp-procurement-collab': return <ProcurementCollabView />;
      case 'sp-warehouse-automation': return <WarehouseAutomationView />;

      

      //default: return <GenericView title={activeItem.label} />;
    }
    // --- CONTENT ROUTING ---
    if (activeTabId === 'smart-ops') return <SmartOperationsView />;
    if (activeTabId === 'cp-maritime-safety') return <MaritimeSafetyView />;
    if (activeTabId === 'mm-01') return <HydroTurbineDisassemblyView />;
    if (activeTabId === 'mm-02') return <HydroTransformerMaintenanceView />;
    if (activeTabId === 'mm-03') return <GateHoistMaintenanceView />;
    if (activeTabId === 'mm-04') return <TurbineBladeRepairView />;
    if (activeTabId === 'mm-05') return <HydroBearingView />;
    if (activeTabId === 'mm-06') return <MarineEngineMaintenanceView />;
    if (activeTabId === 'mm-07') return <MarineShaftMaintenanceView />;
    if (activeTabId === 'mm-08') return <ShipPowerSystemMaintenanceView />;
    if (activeTabId === 'mm-09') return <PortCraneMaintenanceView />;
    if (activeTabId === 'mm-10') return <DredgingHydraulicMaintenanceView />;
    if (activeTabId === 'mm-11') return <ShipLockMaintenanceView />;
    if (activeTabId === 'mm-12') return <MiningCrusherMaintenanceView />;
    if (activeTabId === 'mm-13') return <MineHoistRopeView />;
    if (activeTabId === 'mm-14') return <MiningConveyorMaintenanceView />;
    if (activeTabId === 'mm-15') return <MineVentilationView />;
    if (activeTabId === 'mm-16') return <MiningHydraulicSupportView />;
    if (activeTabId === 'mm-17') return <MineDrainagePumpView />;
    if (activeTabId === 'mm-18') return <MiningDrillingRigRepairView />;
    if (activeTabId === 'mm-19') return <MiningShovelMaintenanceView />;
    if (activeTabId === 'mm-20') return <MiningEngineRepairView />;
    if (activeTabId === 'mm-21') return <HydroAnnualPlanView />;
    if (activeTabId === 'mm-22') return <ShipDryDockDrillView />;
    if (activeTabId === 'mm-23') return <PortCollaborativeRepairView />;
    if (activeTabId === 'mm-24') return <MiningOverhaulSimView />;
    if (activeTabId === 'mm-25') return <HydroRapidDecisionSimView />;
    if (activeTabId === 'mm-26') return <ShipEmergencyRepairSimView />;
    if (activeTabId === 'mm-27') return <MiningEmergencyDrillView />;
    if (activeTabId === 'mm-28') return <HydroRemoteExpertSimView />;
    if (activeTabId === 'mm-29') return <ShipCrossRegionalCollabView />;
    if (activeTabId === 'mm-30') return <UnmannedMiningMaintView />;
    if (activeTabId === 'mm-31') return <HydroStandardProcessView />;
    if (activeTabId === 'mm-32') return <ShipAgingFeasibilityView />;
    if (activeTabId === 'mm-33') return <MinePathSimulationView />;
    if (activeTabId === 'mm-34') return <HydroTrainingSystemView />;
    if (activeTabId === 'mm-35') return <MaritimeNoviceTrainingView />;
    if (activeTabId === 'mm-36') return <MiningMultiScenarioComparisonView />;
    if (activeTabId === 'mm-37') return <HydroSparePartsSequenceView />;
    if (activeTabId === 'mm-38') return <ShipEOLStrategyInferenceView />;
    if (activeTabId === 'mm-39') return <MiningLifecycleCostSimView />;
    if (activeTabId === 'mm-40') return <HydroDigitalTwinSceneView />;
    if (activeTabId === 'mm-41') return <ShipRiskAssessmentView />;
    if (activeTabId === 'mm-42') return <MiningSafetyDrillView />;
    if (activeTabId === 'mm-43') return <HydroRapidReturnView />;
    if (activeTabId === 'mm-44') return <PortWeatherSimView />;
    if (activeTabId === 'mm-45') return <MiningProcessConflictView />;
    if (activeTabId === 'mm-46') return <CrossSystemJointMaintView />;

    // 2. 驾驶舱视图
    const cockpitMap: Record<string, React.ReactNode> = {
      'cp-maritime-safety': <MaritimeSafetyView />,
      'cp-mining-dispatch': <MiningDispatchView />,
      'cp-mining-safety': <MiningSafetyView />,
      'cp-mining-eco': <MiningEcoView />,
      'cp-mining-emergency': <MiningEmergencyView />,
      'cp-tailings-safety': <TailingsSafetyView />,
      'cp-dam-safety': <DamSafetyView />,
      'cp-flood-control': <FloodControlView />,
      'cp-hydro-cascade': <HydroCascadeView />,
      'cp-pumped-storage': <PumpedStorageCockpitView />,
      'cp-city-water': <SmartWaterCockpitView />,
      'cp-irrigation': <IrrigationCockpitView />,
      'cp-global-fleet': <GlobalFleetCockpitView />,
      'cp-container-terminal': <ContainerTerminalCockpitView />,
      'cp-bulk-terminal': <BulkTerminalCockpitView />,
      'cp-inland-waterway': <InlandWaterwayCockpitView />,
      'cp-green-port': <GreenPortCockpitView />,
    };
    if (cockpitMap[activeTabId]) return cockpitMap[activeTabId];

    // 3. 知识管理视图
    const kmMap: Record<string, React.ReactNode> = {
      'km-dangerous-goods': <DangerousGoodsKbView />,
      'km-agv-deadlock': <AgvDeadlockKbView />,
      'km-buoy-drift': <BuoyDriftKbView />,
      'km-ship-impact': <ShipImpactKbView />,
      'km-vts-plan': <VtsPlanKbView />,
      'km-green-port-power': <GreenPortPowerKbView />,
      'km-maritime-accident': <MaritimeAccidentKbView />,
      'km-watershed-dispatch': <WatershedDispatchRulesView />,
      'km-dam-seepage': <DamSeepageModelView />,
      'km-turbine-cavitation': <TurbineCavitationView />,
      'km-flood-discharge': <FloodDischargeView />,
      'km-eco-flow': <EcoFlowView />,
      'km-generator-insulation': <GeneratorInsulationView />,
      'km-underwater-robot': <UnderwaterRobotView />,
      'km-flood-emergency': <FloodEmergencyView />,
      'km-sedimentation': <SedimentationArchiveView />,
      'km-black-start': <BlackStartKbView />,
      'km-trash-rack': <TrashRackThresholdView />,
      'km-freeze-thaw': <FreezeThawStandardsView />,
      'km-hoist-fault': <HoistFaultTreeView />,
      'km-economic-operation': <EconomicOperationView />,
      'km-slope-disaster': <SlopeDisasterKbView />,
      'km-stilling-basin': <StillingBasinRepairKbView />,
      'km-fish-passage': <FishPassagePerformanceView />,
      'km-lock-dispatch': <ShipLockJointDispatchView />,
      'km-channel-shoal': <ChannelShoalDredgingKbView />,
      'km-crane-fatigue': <CraneFatigueArchiveView />,
      'km-ais-behavior': <AisAnomalyKbView />,
      'km-crane-wind': <CraneWindKbView />,
      'km-dust-suppression': <DustSuppressionKbView />,
      'km-tunnel-joint': <TunnelJointHealthView />,
      'km-pilot-exp': <PilotExperienceKbView />,
      'km-multimodal': <MultimodalTransportKbView />,
      'km-unmanned-ship': <UnmannedShipKbView />,
      'km-hydraulic-support': <HydraulicSupportResistanceView />,
      'km-truck-tire': <TruckTireKbView />,
      'km-belt-tear': <BeltTearKbView />,
      'km-ventilation-network': <VentilationNetworkKbView />,
      'km-crushing-index': <CrushingIndexKbView />,
      'km-shovel-tooth': <ShovelToothKbView />,
      'km-tailings-safety': <TailingsSafetyKbView />,
      'km-ground-pressure': <GroundPressureKbView />,
      'km-explosion-proof': <ExplosionProofKbView />,
      'km-flotation-reagent': <FlotationReagentExpertSystemView />,
      'km-shearer-pick': <ShearerPickResistanceView />,
      'km-vehicle-path': <UndergroundVehiclePathKbView />,
      'km-rope-ndt': <RopeNdtKbView />,
      'km-slope-radar': <SlopeRadarWarningView />,
      'km-mill-liner': <MillLinerOptimizationView />,
      'km-water-inrush': <WaterInrushKbView />,
      'km-blasting-control': <BlastingControlKbView />,
      'km-truck-edge': <UnmannedTruckEdgeScenarioView />,
      'km-scraper-chain': <ScraperChainTensionView />,
    };
    if (kmMap[activeTabId]) return kmMap[activeTabId];

    // 4. 动态规则视图 (Fallback for KM)
    if (activeTabId.startsWith('km-')) {
       return <KnowledgeManageView id={activeTabId} title={activeItem.label} />;
    }

    // 5. 故障/专业运维视图 Fallback
    // const label = activeItem.label;
    // if (label.includes('船') && !label.includes('闸')) return <ShipView />;
    // if (label.includes('发电机')) return <GeneratorView />;
    // if (label.includes('水轮机')) return <EquipmentView title={label} />;
    // if (label.includes('起重') || label.includes('吊')) return <CraneView />;
    // if (label.includes('泵站')) return <PumpStationView />;
    // if (label.includes('风力')) return <WindTurbineView />;
    // if (label.includes('污水')) return <WastewaterView />;
    // if (label.includes('排污')) return <OutfallView />;
    // if (label.includes('钻孔') || label.includes('钻机')) return <DrillingRigView />;
    // if (label.includes('掘进')) return <TunnelBoringMachineView />;
    // if (label.includes('提升机')) return <MineHoistView />;
    // if (label.includes('破碎')) return <CrushingEquipmentView />;
    // if (label.includes('制砂')) return <SandMakingView />;
    // if (label.includes('选矿')) return <MineralProcessingView />;
    // if (label.includes('靠泊')) return <BerthingView />;
    // if (label.includes('航标')) return <NavigationMarkView />;
    // if (label.includes('测速')) return <TachometerView />;
    // if (label.includes('输电')) return <TransmissionView />;


    // Special Case Registry for Equipment Point Inspection，2026.03.24
    if (activeTabId === 'ins-0') return <MiningRailView />;
    if (activeTabId === 'ins-1') return <MiningBlastingView />;
    if (activeTabId === 'ins-2') return <TailingsYardView />;
    if (activeTabId === 'ins-3') return <MiningSupportView />;
    if (activeTabId === 'ins-4') return <MiningVentilationView />;
    if (activeTabId === 'ins-5') return <ExcavationFaceView />;
    if (activeTabId === 'ins-6') return <MiningHazardousAreaView />;
    if (activeTabId === 'ins-7') return <MiningDrainageWellView />;
    if (activeTabId === 'ins-8') return <MiningEnergyControlView />;
    if (activeTabId === 'ins-9') return <MiningVehicleDispatchView />;
    if (activeTabId === 'ins-10') return <PortBerthInspectionView />;
    if (activeTabId === 'ins-11') return <ChannelBuoyView />;
    if (activeTabId === 'ins-12') return <ShipCargoHoldInspectionView />;
    if (activeTabId === 'ins-13') return <PassengerBoardingBridgeView />;
    if (activeTabId === 'ins-14') return <HullStructureInspectionView />;
    if (activeTabId === 'ins-15') return <BallastWaterInspectionView />;
    if (activeTabId === 'ins-16') return <LightSignalsInspectionView />;
    if (activeTabId === 'ins-17') return <FuelTankInspectionView />;
    if (activeTabId === 'ins-18') return <ChannelEmbankmentView />;
    if (activeTabId === 'ins-19') return <PortWaterQualityView />;
    if (activeTabId === 'ins-20') return <GateBladeView />;
    if (activeTabId === 'ins-21') return <SpillwayView />;
    if (activeTabId === 'ins-22') return <HydrologicalStationView />;
    if (activeTabId === 'ins-23') return <TurbineBearingView />;
    if (activeTabId === 'ins-24') return <PlantRoofView />;
    if (activeTabId === 'ins-25') return <StoragePoolSlopeView />;
    if (activeTabId === 'ins-26') return <ControlRoomNetworkView />;
    if (activeTabId === 'ins-27') return <SluiceGateCableView />;
    if (activeTabId === 'ins-28') return <WaterQualitySamplingView />;
    if (activeTabId === 'ins-29') return <DamShoulderView />;
    if (activeTabId === 'ins-30') return <HydraulicSupportRoofView />;
    if (activeTabId === 'ins-31') return <VentilationDoorView />;
    if (activeTabId === 'ins-32') return <FillingOperationAreaView />;
    if (activeTabId === 'ins-33') return <HazardousChemicalWarehouseView />;
    if (activeTabId === 'ins-34') return <UndergroundTransportTrackView />;
    if (activeTabId === 'ins-35') return <DeckLifesavingEquipmentView />;
    if (activeTabId === 'ins-36') return <PortLiftingOperationView />;
    if (activeTabId === 'ins-37') return <ColdChainCabinView />;
    if (activeTabId === 'ins-38') return <ChannelScourAreaView />;
    if (activeTabId === 'ins-39') return <PortWaterPumpView />;
    if (activeTabId === 'ins-40') return <TailraceChannelView />;
    if (activeTabId === 'ins-41') return <WaterLevelDamView />;
    if (activeTabId === 'ins-42') return <WaterTunnelView />;
    if (activeTabId === 'ins-43') return <DiversionChannelView />;
    if (activeTabId === 'ins-44') return <SluiceGateView />;
    if (activeTabId === 'ins-45') return <SurfaceSubsidenceView />;
    if (activeTabId === 'ins-46') return <UndergroundLightingView />;
    if (activeTabId === 'ins-47') return <TailingsDamView />;
    if (activeTabId === 'ins-48') return <ElectricalCabinetView />;
    if (activeTabId === 'ins-49') return <HazardousGasView />;



    // Handle Maintenance Plan Management Sub-items
    if (activeTabId.startsWith('mpm-')) {
      const index = parseInt(activeTabId.replace('mpm-', ''), 10);
      const scenarios = [
        'HydroTurbineOverhaulView',
        'SpillwayGateMaintenanceView',
        'DamStructureReinforcementView',
        'PenstockAntiCorrosionView',
        'TransformerPreventiveView',
        'PumpStationAnnualView',
        'ReservoirDesiltingView',
        'NavigationLockOverhaulView',
        'HydraulicHoistMaintenanceView',
        'TailraceTunnelInspectionView',
        'GeneratorRotorReplacementView',
        'GovernorSystemCalibrationView',
        'ExcitationSystemUpgradeView',
        'CoolingWaterSystemCleaningView',
        'SluiceGateSealReplacementView',
        'TrashRackCleaningView',
        'SurgeChamberInspectionView',
        'PenstockValveMaintenanceView',
        'HydrologicalStationCalibrationView',
        'DamSeepageMonitoringView',
        'MainHoistRopeReplacementView',
        'VentilationFanOverhaulView',
        'ConveyorBeltSplicingView',
        'CrusherLinerReplacementView',
        'BallMillGearLubricationView',
        'UndergroundSubstationMaintenanceView',
        'DrainagePumpOverhaulView',
        'ElectricShovelMaintenanceView',
        'HaulTruckFleetScheduleView',
        'DrillingRigHydraulicView',
        'FlotationMachineRotorView',
        'ThickenerDriveMaintenanceView',
        'TailingsDamReinforcementView',
        'MineLocomotiveOverhaulView',
        'RoadheaderCutterReplacementView',
        'ShearerDrumMaintenanceView',
        'HydraulicSupportOverhaulView',
        'ScraperConveyorChainView',
        'UndergroundRefugeChamberView',
        'GasMonitoringCalibrationView',
        'STSCraneWireRopeView',
        'RTGEngineOverhaulView',
        'AGVFleetBatteryView',
        'ShipMainEngineMaintenanceView',
        'PropellerPolishingView',
        'HullAntiFoulingPaintView',
        'BallastWaterSystemView',
        'MooringWinchBrakeView',
        'NavigationalRadarCalibrationView',
        'PortConveyorBeltView',
        'ShipLoaderChuteView',
        'BerthFenderReplacementView',
        'TugboatPropulsionView',
        'ReeferContainerRackView',
        'PortSubstationPreventiveView',
        'DredgerCutterHeadView',
        'VTSRadarTowerView',
        'MarineBoilerCleaningView',
        'LifeboatDavitTestView',
        'PortGateAutomationView',
        'AirCompressorOverhaulView',
        'HVACSystemCleaningView',
        'FireExtinguishingSystemView',
        'EmergencyGeneratorTestView',
        'OverheadCraneTrackView',
        'PowerTransformerMaintenanceView'
      ];
      const viewName = scenarios[index];
      const ViewComponent = (MPMViews as any)[viewName];
      if (ViewComponent) return <ViewComponent />;
    }



    // Handle CV Views
    if (activeTabId.startsWith('cv-') && CV_VIEWS[activeTabId]) {
      const CVComponent = CV_VIEWS[activeTabId];
      return (
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        }>
          <CVComponent />
        </Suspense>
      );
    }

    // Handle Vibration Views
    if (activeTabId.startsWith('vibe-') && VIBE_VIEWS[activeTabId]) {
      const VibeComponent = VIBE_VIEWS[activeTabId];
      return (
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        }>
          <VibeComponent />
        </Suspense>
      );
    }



    if (LoadedMaintenanceView) {
      return <LoadedMaintenanceView />;
    }

    if (LoadedMaintenanceTrainingView) {
      return <LoadedMaintenanceTrainingView />;
    }
    // Handle Maintenance Training View
    if (activeTabId === 'maintenance-training') {
      return <MaintenanceTrainingView />;
    }




    //服务数据管理, 2026.01.19, update
    // Special Case: Mining Service Data Management (Page 1)
    if (activeTabId === 'sm-1') {
      return <MiningServiceDataView />;
    }

    // Special Case: Mining Crushing, Conveying, Hoisting (Page 2)
    if (activeTabId === 'sm-2') {
      return <MiningCrushingOandMView />;
    }

    // Special Case: Mining Extraction (Shovel, Support, Shearer) (Page 3)
    if (activeTabId === 'sm-3') {
      return <MiningExtractionServiceView />;
    }

    // Special Case: Mining Dust & Vibration (Page 4)
    if (activeTabId === 'sm-4') {
      return <MiningDustVibrationServiceView />;
    }

    // Special Case: Mining Emergency Repair (Page 5)
    if (activeTabId === 'sm-5') {
      return <MiningEmergencyRepairView />;
    }

    // Special Case: Mining Multi-Face Collaboration (Page 6)
    if (activeTabId === 'sm-6') {
      return <MiningMultiFaceCollabView />;
    }

    // Special Case: Mining Component Life & Replacement (Page 7)
    if (activeTabId === 'sm-7') {
      return <MiningComponentLifeView />;
    }

    // Special Case: Mining Remote Unmanned O&M (Page 8)
    if (activeTabId === 'sm-8') {
      return <MiningRemoteOMView />;
    }

    // Special Case: Mining Multi-Vendor Data Unified (Page 9)
    if (activeTabId === 'sm-9') {
      return <MiningMultiVendorView />;
    }

    // Special Case: Mining Maintenance Plan & Execution (Page 10)
    if (activeTabId === 'sm-10') {
      return <MiningMaintenancePlanView />;
    }

    // Special Case: Mining Intelligent Inspection (Page 11)
    if (activeTabId === 'sm-11') {
      return <MiningInspectionServiceView />;
    }

    // Special Case: Mining Extreme Conditions & Safety (Page 12)
    if (activeTabId === 'sm-12') {
      return <MiningExtremeConditionView />;
    }

    // Special Case: Mining Energy & Equipment Service (Page 13)
    if (activeTabId === 'sm-13') {
      return <MiningEnergyServiceView />;
    }

    // Special Case: Ship Main & Aux Engine Service Data (Page sh-1)
    if (activeTabId === 'sh-1') {
      return <ShipEngineServiceView />;
    }

    // Special Case: Ship Navigation & Efficiency Service Data (Page sh-2)
    if (activeTabId === 'sh-2') {
      return <ShipNavigationEfficiencyView />;
    }

    // Special Case: Ship Sea Condition Adaptability Service Data (Page sh-3)
    if (activeTabId === 'sh-3') {
      return <ShipSeaConditionAdaptabilityView />;
    }

    // Special Case: Ship In-Service Monitoring & Predictive Maintenance (Page sh-4)
    if (activeTabId === 'sh-4') {
      return <ShipPredictiveMaintenanceView />;
    }

    // Special Case: Ship Berthing & Port Collaboration (Page sh-5)
    if (activeTabId === 'sh-5') {
      return <ShipBerthingCollaborationView />;
    }

    // Special Case: Port Loading & Aux Equipment O&M (Page sh-6)
    if (activeTabId === 'sh-6') {
      return <PortLoadingServiceDataView />;
    }

    // Special Case: Channel Facility Inspection & Maintenance (Page sh-7)
    if (activeTabId === 'sh-7') {
      return <ChannelInspectionServiceView />;
    }

    // Special Case: Ship-Shore Collaboration (Page sh-8)
    if (activeTabId === 'sh-8') {
      return <ShipShoreCollaborationView />;
    }

    // Special Case: Multi-Fleet Multi-Route (Page sh-9)
    if (activeTabId === 'sh-9') {
      return <MultiFleetRouteView />;
    }

    // Special Case: Ship Emergency Repair (Page sh-10)
    if (activeTabId === 'sh-10') {
      return <ShipEmergencyRepairView />;
    }

    // Special Case: Ship Energy Efficiency (Page sh-11)
    if (activeTabId === 'sh-11') {
      return <ShipEnergyEfficiencyView />;
    }

    // Special Case: Ship Reliability Assessment (Page sh-12)
    if (activeTabId === 'sh-12') {
      return <ShipReliabilityAssessmentView />;
    }

    // Special Case: Ship Cross-Cycle Service (Page sh-13)
    if (activeTabId === 'sh-13') {
      return <ShipCrossCycleServiceView />;
    }

    // Special Case: Hydro Unit Operation Status (Page hd-1)
    if (activeTabId === 'hd-1') {
      return <HydroUnitStatusView />;
    }

    // Special Case: Hydro Turbine & Generator O&M (Page hd-2)
    if (activeTabId === 'hd-2') {
      return <HydroSystemOMView />;
    }

    // Special Case: Hydro Long-term Operation (Page hd-3)
    if (activeTabId === 'hd-3') {
      return <HydroLongTermOperationView />;
    }

    // Special Case: Hydro Maintenance Schedule (Page hd-4)
    if (activeTabId === 'hd-4') {
      return <HydroMaintenanceScheduleView />;
    }

    // Special Case: Reservoir Dispatch (Page hd-5)
    if (activeTabId === 'hd-5') {
      return <HydroDispatchView />;
    }

    // Special Case: Hydro Structure Health (Page hd-6)
    if (activeTabId === 'hd-6') {
      return <HydroStructureHealthView />;
    }

    // Special Case: Hydro Incident Handling (Page hd-7)
    if (activeTabId === 'hd-7') {
      return <HydroIncidentView />;
    }

    // Special Case: Hydro Cascade Operation (Page hd-8)
    if (activeTabId === 'hd-8') {
      return <HydroCascadeView />;
    }

    // Special Case: Cross-Region Water Project (Page hd-9)
    if (activeTabId === 'hd-9') {
      return <CrossRegionWaterView />;
    }

    // Special Case: Hydro Digital Handover (Page hd-10)
    if (activeTabId === 'hd-10') {
      return <HydroDigitalHandoverView />;
    }

    // Special Case: Hydro Health Assessment (Page hd-11)
    if (activeTabId === 'hd-11') {
      return <HydroHealthAssessmentView />;
    }

    // Special Case: Hydro Lifespan Prediction (Page hd-12)
    if (activeTabId === 'hd-12') {
      return <HydroLifespanPredictionView />;
    }

    // Special Case: Hydro Emergency Dispatch (Page hd-13)
    if (activeTabId === 'hd-13') {
      return <HydroEmergencyDispatchView />;
    }

    // Special Case: Unified Data Governance (Page int-1)
    if (activeTabId === 'int-1') {
      return <UnifiedGovernanceView />;
    }

    // Special Case: Condition Collaboration (Page int-2)
    if (activeTabId === 'int-2') {
      return <ConditionCollaborationView />;
    }

    // Special Case: Decision Support (Page int-3)
    if (activeTabId === 'int-3') {
      return <DecisionSupportView />;
    }

    // Special Case: Knowledge Reuse (Page int-4)
    if (activeTabId === 'int-4') {
      return <KnowledgeReuseView />;
    }

    // Special Case: Lifecycle Feedback (Page int-5)
    if (activeTabId === 'int-5') {
      return <LifecycleFeedbackView />;
    }

    // Special Case: Data Quality Governance (Page int-6)
    if (activeTabId === 'int-6') {
      return <DataQualityGovernanceView />;
    }

    // Special Case: Data Classification & Permission (Page int-7)
    if (activeTabId === 'int-7') {
      return <DataClassificationPermissionView />;
    }

    // Special Case: Data Security & Compliance (Page int-8)
    if (activeTabId === 'int-8') {
      return <DataSecurityComplianceView />;
    }

    // Special Case: Multi-Source Fusion & Sharing (Page int-9)
    if (activeTabId === 'int-9') {
      return <MultiSourceFusionView />;
    }

    // Special Case: Intelligent Analysis (Page int-10)
    if (activeTabId === 'int-10') {
      return <IntelligentAnalysisView />;
    }

    // Special Case: Service Mode Optimization (Page int-11)
    if (activeTabId === 'int-11') {
      return <ServiceModeOptimizationView />;
    }


    // Handle Inspection Sub-items，2026.03.24
    if (activeTabId.startsWith('ins-')) {
      return <InspectionView title={activeItem.label} />;
    }

    // // Handle other Sub-items of Smart Ops (Equipment Views)
    // if (activeTabId.startsWith('eq-')) {
    //   return <EquipmentView title={activeItem.label} />;
    // }


    // Handle Maintenance Training View
    if (activeTabId === 'maintenance-training') {
      return <MaintenanceTrainingView />;
    }

    //侧边栏父级页面拦截
    if (activeTabId === 'maintenance-plan') {
      return <MaintenancePlanOverviewView />;
    }

    if (activeTabId === 'inspection') {
      return <InspectionOverviewView />;
    }
    if (activeTabId === 'cockpit') return <CockpitView />;
    if (activeTabId === 'predictive-maintenance') return <PredictiveMaintenanceView />;
    if (activeTabId === 'spare-parts') return <SparePartsView />;
    if (activeTabId === 'product-kb') return <ProductKnowledgeBaseOverviewView />;
    if (activeTabId === 'index-analysis') return <IndexAnalysisOverviewView />;
    if (activeTabId === 'digital-delivery') return <DigitalDeliveryOverviewView />;
    if (activeTabId === 'simulation') return <SimulationOverviewView />;
    if (activeTabId === 'customer-data') return <CustomerDataOverviewView />;
    if (activeTabId === 'remote-expert') return <RemoteExpertOverviewView />;
    if (activeTabId === 'app-maintenance') return <AppMaintenanceOverviewView />;
    if (activeTabId === 'mock-maintenance') return <MockMaintenanceOverviewView />;
    if (activeTabId === 'ops-knowledge') return <OpsKnowledgeOverviewView />;
    if (activeTabId === 'service-data') return <ServiceDataOverviewView />;
    if (activeTabId === 'life-warning') return <LifeWarningOverviewView />;
    if (activeTabId === 'cv-monitor') return <CVMonitorOverviewView />;
    if (activeTabId === 'vibration-monitor') return <VibrationMonitorOverviewView />;
    if (activeTabId === 'maintenance-training') return <MaintenanceTrainingOverviewView />;

    // // Handle other Sub-items of Smart Ops (Equipment Views)
    // if (activeTabId.startsWith('eq-')) {
    //   return <EquipmentView title={activeItem.label} />;
    // }
    // Default catch-all
    if (activeTabId.startsWith('sim-')) {
        const sim = SIMULATION_CHILDREN.find(s => s.id === activeTabId);
        return <GenericView title={sim ? sim.label : 'Simulation Analysis'} />;
    }

    // // Default Fallback
    // return <GenericView title={activeItem.label} />;
    // Default Fallback
    return <AdvancedGenericView title={activeItem.label} id={activeItem.id} />;


    

    //return <GenericView title={activeTabId} />;
  };

//   return (
//     <div className="flex h-screen bg-[#020617] text-white">
//       <Sidebar activeId={activeTabId} onSelect={setActiveTabId} />
//       <div className="flex-1 overflow-hidden">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };
  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* Sidebar Navigation */}
      <Sidebar activeId={activeTabId} onSelect={setActiveTabId} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#020617] to-[#020617]">
        
        {/* Top Header Bar - Simplified to blend in */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4">
             {/* Logo or Brand Area */}
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-cyan-600 rounded-sm flex items-center justify-center font-bold text-white">IT</div>
               <div className="leading-tight">
                 <div className="text-sm font-bold tracking-wider text-slate-100">INDUST TECH</div>
                 <div className="text-[10px] text-slate-500 tracking-widest uppercase">Intelligent O&M Platform</div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
              <Clock size={14} className="text-cyan-600" />
              <span>{currentTime}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500 transition-colors cursor-pointer">
               <Bell size={14} />
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500 transition-colors cursor-pointer">
               <Settings size={14} />
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 p-6 overflow-y-auto relative scroll-smooth">
           <div className="h-full max-w-[1920px] mx-auto">
             {renderContent()}
           </div>
        </div>

      </main>
    </div>
  );
};

//export default App;