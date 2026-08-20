import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { createHash } from "crypto";
import xlsx from "xlsx";
// 2026-08-09 新增：引入外部模型场景白名单、诊断引擎及共享数据类型；
import {
  getModelShowcaseConfig,
  isModelShowcaseSceneId,
  MODEL_SHOWCASE_SCENE_IDS,
} from "./src/remoteModelShowcase/modelCatalog";
import {
  recordDiagnosticSnapshot,
  runDiagnosis,
} from "./src/remoteModelShowcase/diagnosticEngine";
// 2026-08-10 新增：接入跨项目通道状态采集与安全关系快照生成器；
import {
  getConnectionSnapshot,
  recordConnectionCacheHit,
  recordConnectionFailure,
  recordConnectionSuccess,
} from "./src/remoteModelShowcase/connectionRegistry";
import type {
  ModelConnectionChannel,
  ModelRefreshStatus,
  ModelShowcaseSceneId,
  RemoteDashboardData,
  RemoteDataMode,
  RemoteScenarioType,
} from "./src/remoteModelShowcase/types";

const app = express();
// 2026-08-17 调整：生产环境默认只监听回环地址，并允许部署配置覆盖。
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0");
const PUBLIC_URL = process.env.SCENE_LIBRARY_PUBLIC_URL || process.env.PUBLIC_URL || "";
const APP_VERSION = process.env.APP_VERSION || process.env.RELEASE_VERSION || "0.0.0";
const SCENE_DATA_DIRECTORY = path.resolve(
  process.env.SCENE_DATA_DIRECTORY || path.join(process.cwd(), "src", "data"),
);

// Need cors and body-parser for completeness? Express has them built or let's ignore if not cross-origin.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: APP_VERSION });
});

// Directories
// 2026-07-13 清理：powerExample/tempExample 两个目录是早期原型遗留的死代码（从未被读写），已移除。
const DIRS = {
  powerUnit1: path.join(SCENE_DATA_DIRECTORY, "Unit1Pred", "有功功率文件"),
  tempUnit1: path.join(SCENE_DATA_DIRECTORY, "Unit1Pred", "机组推力瓦温度数据"),
};

// Ensure directories exist
Object.values(DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Handle tmp upload dir
const tmpDir = path.join(SCENE_DATA_DIRECTORY, "tmp_uploads");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to temp directory first safely to avoid req.body race conditions during stream
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/upload", (req, res) => {
  upload.array("files")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ success: false, message: err.message || "文件解析失败" });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      // Fallback for single file upload compatibility if needed, or just reject
      if (req.file) {
        req.files = [req.file];
      } else {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }
    }
    
    try {
      const type = req.body.type;
      let targetDir = "";
      let typeLabel = "";

      if (type === "power") {
        targetDir = DIRS.powerUnit1;
        typeLabel = "有功功率文件";
      } else if (type === "temperature") {
        targetDir = DIRS.tempUnit1;
        typeLabel = "机组推力瓦温度数据";
      } else {
        (req.files as Express.Multer.File[]).forEach(f => fs.unlinkSync(f.path)); // clean up
        return res.status(400).json({ success: false, message: "未知的归档类型或前端漏传类型字段。" });
      }

      const uploadedNames: string[] = [];
      // Move files to final destination
      (req.files as Express.Multer.File[]).forEach((file) => {
        const targetPath = path.join(targetDir, file.originalname);
        try {
          fs.renameSync(file.path, targetPath);
        } catch (moveErr) {
          fs.copyFileSync(file.path, targetPath);
          fs.unlinkSync(file.path);
        }
        uploadedNames.push(file.originalname);
      });

      res.json({ success: true, message: `成功上传 ${uploadedNames.length} 个文件至【${typeLabel}】目录: ${uploadedNames.join(", ")}` });
    } catch (e: any) {
      console.error("Move file error:", e);
      res.status(500).json({ success: false, message: `落盘失败: ${e.message}` });
    }
  });
});

app.delete("/api/upload/clear", (req, res) => {
  try {
    const clearDir = (dir: string) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    };
    clearDir(DIRS.powerUnit1);
    clearDir(DIRS.tempUnit1);
    res.json({ success: true, message: "已清空所有上传的数据文件" });
  } catch (error: any) {
    console.error("Clear data error:", error);
    res.status(500).json({ success: false, message: `清空失败: ${error.message}` });
  }
});

// Build response dynamically
app.get("/api/data", (req, res) => {
  try {
    // 1. Get power files from user dir
    let powerFiles = fs.readdirSync(DIRS.powerUnit1).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
    let powerDirPath = DIRS.powerUnit1;
    
    // 2. Get temp files
    let tempFiles = fs.readdirSync(DIRS.tempUnit1).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
    let tempDirPath = DIRS.tempUnit1;

    if (powerFiles.length === 0 && tempFiles.length === 0) {
      return res.json({ unifiedData: [], historyDividerIndex: 0, isEmpty: true });
    }

    if (powerFiles.length === 0) {
      return res.status(404).json({ error: "No power data files found, but temperature files exist. Please upload power data." });
    }

    const readExcel = (filePath: string) => {
      const wb = xlsx.readFile(filePath);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = xlsx.utils.sheet_to_json<any>(ws);
      const data = [];
      for(let i=0; i<raw.length; i++) {
        const row = raw[i];
        if (row._1 && row._2 && typeof row._2 === 'string') {
          const val = parseFloat(row._1);
          if (!isNaN(val)) {
            data.push({
               time: new Date(row._2).toISOString(),
               val
            });
          }
        }
      }
      return data; 
    };

    const powerDataRaw = readExcel(path.join(powerDirPath, powerFiles[0]));
    
    // Create map for aligned temporal data
    const unifiedMap = new Map<string, any>();
    
    powerDataRaw.forEach(pd => {
      if (!unifiedMap.has(pd.time)) {
         unifiedMap.set(pd.time, { time: pd.time, activePower: pd.val, pads: Array(16).fill(null) });
      } else {
         unifiedMap.get(pd.time)!.activePower = pd.val;
      }
    });

    const padNumberRegex = /(\d+)#/;
    const extractPadNum = (fname: string) => {
        const m = fname.match(padNumberRegex);
        return m ? parseInt(m[1]) : 0;
    };
    tempFiles.sort((a,b) => extractPadNum(a) - extractPadNum(b));
    
    tempFiles.forEach((file, fileIdx) => {
       const padNum = extractPadNum(file);
       const padIdx = (padNum > 0 ? padNum : fileIdx + 1) - 1;
       if (padIdx >= 0 && padIdx < 16) {
           const tDataRaw = readExcel(path.join(tempDirPath, file));
           tDataRaw.forEach(td => {
               if (unifiedMap.has(td.time)) {
                   unifiedMap.get(td.time)!.pads[padIdx] = td.val;
               } else {
                   const newRow = { time: td.time, activePower: null, pads: Array(16).fill(null) };
                   newRow.pads[padIdx] = td.val;
                   unifiedMap.set(td.time, newRow);
               }
           });
       }
    });

    const sortedVals = Array.from(unifiedMap.values()).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    if (sortedVals.length === 0) {
      return res.json({ unifiedData: [], historyDividerIndex: 0 });
    }

    let lastPads = Array(16).fill(40);
    let lastPower = 100;
    for (let i = 0; i < sortedVals.length; i++) {
        const row = sortedVals[i];
        if (row.activePower === null) row.activePower = lastPower;
        else lastPower = row.activePower;
        
        for (let p=0; p<16; p++) {
           if (row.pads[p] === null) {
              row.pads[p] = lastPads[p];
           } else {
              lastPads[p] = row.pads[p];
           }
        }
    }

    // Set arbitrary history cut for demonstration if no distinct separation.
    // If we have actual real prediction logic, it would go here.
    // Let's assume the 75% mark divides history from pure predicted data (extrapolated).
    const historyDividerIndex = Math.floor(sortedVals.length * 0.75);

    res.json({ unifiedData: sortedVals, historyDividerIndex });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================
// 2026-07-13 新增：场景库测试方案 Phase 4.0 —— 通用化多场景数据接口。
// 不改动上面 unit1-predictive 专用的 /api/upload、/api/data、/api/upload/clear，
// 新增一套带 scenarioId 的参数化路由，供 Phase 4.1~4.10 的 10 个试点页面复用。
// 每个场景独立数据目录（src/data/<scenarioId>/uploads/），互不共用、不与 unit1-predictive 共用。
// ============================================================

interface ScenarioConfig {
  dir: string;
  // Excel 列顺序：第 1 列（_1）固定是时间，之后每一列（_2, _3, ...）按此数组顺序对应各指标数值。
  metrics: string[];
}

// 2026-07-13 修正：以下 10 个 scenarioId 均已对照 App.tsx 实际路由表核实（原开发计划草稿中
// 有 3 个 id 拼写/大小写有误、2 个指向的文件其实是已确认死代码的重复文件，均已修正为真实可路由的 id/文件）：
//   - cv-SpillwayMonitoring → cv-spillway-monitoring（大小写/连字符修正）
//   - cv-MooringTension → cv-mooring-tension（同上）
//   - lw-intake-trash-rack-life → intake-trash-rack-life（life-warning 分类路由不带 lw- 前缀）
//   - lw-mining-shovel-rope-life → mining-shovel-rope-life（同上）
//   - vibe-DamGalleryMicroseismic → vibe-DamGalleryMicroseism（原名对应的是 Step 2.2 已确认的死代码重复文件；
//     真正路由到的活文件是 views/vibration-monitoring/DamGalleryMicroseism，指标据此文件重新拟定）
//   - vibe-ConicalCrusher → vibe-ConeCrusherVibration（同上，真正活文件是 ConeCrusherVibration，指标重新拟定）
const SCENARIO_CONFIGS: Record<string, ScenarioConfig> = {
  "cv-spillway-monitoring": {
    dir: path.join(SCENE_DATA_DIRECTORY, "cv-spillway-monitoring", "uploads"),
    metrics: ["flowRate", "waterLevel", "vibrationLevel"],
  },
  "vibe-DamGalleryMicroseism": {
    dir: path.join(SCENE_DATA_DIRECTORY, "vibe-DamGalleryMicroseism", "uploads"),
    metrics: ["eventEnergy", "stabilityIndex", "waterLevel", "crackWidth", "seepageFlow"],
  },
  "intake-trash-rack-life": {
    dir: path.join(SCENE_DATA_DIRECTORY, "intake-trash-rack-life", "uploads"),
    metrics: ["flowVelocity", "waterLevelDiff", "vibrationAmplitude", "blockageRatio"],
  },
  "mpm-16": {
    dir: path.join(SCENE_DATA_DIRECTORY, "mpm-16", "uploads"),
    metrics: ["temperature", "pressure", "vibration"],
  },
  "pm-hydro-36": {
    dir: path.join(SCENE_DATA_DIRECTORY, "pm-hydro-36", "uploads"),
    metrics: ["pressure", "hoopStress"],
  },
  "eq-7": {
    dir: path.join(SCENE_DATA_DIRECTORY, "eq-7", "uploads"),
    metrics: ["speed", "rpm", "fuelConsumption", "exhaustTemp"],
  },
  "cv-mooring-tension": {
    dir: path.join(SCENE_DATA_DIRECTORY, "cv-mooring-tension", "uploads"),
    metrics: ["tensionL1", "tensionL2", "tensionL3", "tensionL4"],
  },
  "eq-12": {
    dir: path.join(SCENE_DATA_DIRECTORY, "eq-12", "uploads"),
    metrics: ["depth", "velocity", "payload", "brakePressure", "ropeTensionR1", "ropeTensionR2", "ropeTensionR3", "ropeTensionR4"],
  },
  "mining-shovel-rope-life": {
    dir: path.join(SCENE_DATA_DIRECTORY, "mining-shovel-rope-life", "uploads"),
    metrics: ["tension", "abrasion"],
  },
  "vibe-ConeCrusherVibration": {
    dir: path.join(SCENE_DATA_DIRECTORY, "vibe-ConeCrusherVibration", "uploads"),
    metrics: ["vibration", "oilPressure", "motorCurrent", "crushingForce"],
  },
};

// Ensure all scenario upload directories exist
Object.values(SCENARIO_CONFIGS).forEach((cfg) => {
  if (!fs.existsSync(cfg.dir)) fs.mkdirSync(cfg.dir, { recursive: true });
});

app.post("/api/scenarios/:scenarioId/upload", (req, res) => {
  const { scenarioId } = req.params;
  const config = SCENARIO_CONFIGS[scenarioId];
  if (!config) {
    return res.status(404).json({ success: false, message: `未知场景: ${scenarioId}` });
  }

  upload.array("files")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ success: false, message: err.message || "文件解析失败" });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      if (req.file) {
        req.files = [req.file];
      } else {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }
    }

    try {
      const uploadedNames: string[] = [];
      (req.files as Express.Multer.File[]).forEach((file) => {
        const targetPath = path.join(config.dir, file.originalname);
        try {
          fs.renameSync(file.path, targetPath);
        } catch (moveErr) {
          fs.copyFileSync(file.path, targetPath);
          fs.unlinkSync(file.path);
        }
        uploadedNames.push(file.originalname);
      });

      res.json({ success: true, message: `成功上传 ${uploadedNames.length} 个文件: ${uploadedNames.join(", ")}` });
    } catch (e: any) {
      console.error("Move file error:", e);
      res.status(500).json({ success: false, message: `落盘失败: ${e.message}` });
    }
  });
});

app.delete("/api/scenarios/:scenarioId/upload/clear", (req, res) => {
  const { scenarioId } = req.params;
  const config = SCENARIO_CONFIGS[scenarioId];
  if (!config) {
    return res.status(404).json({ success: false, message: `未知场景: ${scenarioId}` });
  }

  try {
    if (fs.existsSync(config.dir)) {
      const files = fs.readdirSync(config.dir);
      for (const file of files) {
        fs.unlinkSync(path.join(config.dir, file));
      }
    }
    res.json({ success: true, message: "已清空所有上传的数据文件" });
  } catch (error: any) {
    console.error("Clear data error:", error);
    res.status(500).json({ success: false, message: `清空失败: ${error.message}` });
  }
});

app.get("/api/scenarios/:scenarioId/data", (req, res) => {
  const { scenarioId } = req.params;
  const config = SCENARIO_CONFIGS[scenarioId];
  if (!config) {
    return res.status(404).json({ error: `未知场景: ${scenarioId}` });
  }

  try {
    const files = fs.readdirSync(config.dir).filter((f) => f.endsWith(".xls") || f.endsWith(".xlsx"));
    if (files.length === 0) {
      return res.json({ unifiedData: [], historyDividerIndex: 0, isEmpty: true });
    }

    // 沿用 unit1-predictive 的解析约定：第 1 列（_1）固定是时间，之后每一列（_2, _3, ...）
    // 按 config.metrics 声明的顺序依次对应各指标数值。
    const wb = xlsx.readFile(path.join(config.dir, files[0]));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json<any>(ws);

    const unifiedData: Array<Record<string, any>> = [];
    for (const row of raw) {
      const timeRaw = row._1;
      if (!timeRaw) continue;
      const timeMs = new Date(timeRaw).getTime();
      if (isNaN(timeMs)) continue;
      const entry: Record<string, any> = { time: new Date(timeMs).toISOString() };
      config.metrics.forEach((metricName, idx) => {
        const cell = row[`_${idx + 2}`];
        const val = parseFloat(cell);
        entry[metricName] = isNaN(val) ? null : val;
      });
      unifiedData.push(entry);
    }

    unifiedData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // 缺失值前向填充（沿用 unit1-predictive 现有做法）
    const lastValues: Record<string, number> = {};
    config.metrics.forEach((m) => {
      lastValues[m] = 0;
    });
    for (const row of unifiedData) {
      config.metrics.forEach((m) => {
        if (row[m] === null || row[m] === undefined) {
          row[m] = lastValues[m];
        } else {
          lastValues[m] = row[m] as number;
        }
      });
    }

    // 沿用 unit1-predictive 现有的"75% 位置"占位算法（该逻辑本来就是占位，非真实预测边界，Phase 4.0 不改动这部分）
    const historyDividerIndex = Math.floor(unifiedData.length * 0.75);

    res.json({ unifiedData, historyDividerIndex });
  } catch (error) {
    console.error("Scenario API error:", error);
    res.status(500).json({ error: String(error) });
  }
});

// -----------------------------------------------------------------------------
// External visual-model showcase BFF
// All upstream access is constrained to the documented API routes and the four
// approved model ids. The browser never receives the upstream object key.
// 2026-08-09 新增：实现四场景模型元数据、二进制代理、动态工况、诊断和一致性校验 BFF；
// -----------------------------------------------------------------------------

const VISUAL_MODEL_API_BASE_URL = (process.env.VISUAL_MODEL_API_BASE_URL
  || "http://8.146.211.204:3100/three-model-api").replace(/\/$/, "");
const MODEL_METADATA_TTL_MS = 5 * 60 * 1000;
const MAX_MODEL_FILE_BYTES = 50 * 1024 * 1024;
const MODEL_DOWNLOAD_TIMEOUT_MS = 30_000;
const MODEL_DOWNLOAD_ATTEMPTS = 2;
// 2026-08-12 新增：模型默认每 36 小时检查一次，可通过环境变量在 24～48 小时内调整；
const configuredModelRefreshHours = Number(
  process.env.MODEL_BINARY_REFRESH_HOURS || process.env.MODEL_REFRESH_INTERVAL_HOURS || 36,
);
const MODEL_REFRESH_INTERVAL_HOURS = Number.isFinite(configuredModelRefreshHours)
  ? Math.min(48, Math.max(24, configuredModelRefreshHours))
  : 36;
const MODEL_REFRESH_INTERVAL_MS = MODEL_REFRESH_INTERVAL_HOURS * 60 * 60 * 1000;
const MODEL_REFRESH_RETRY_MS = 6 * 60 * 60 * 1000;
const MODEL_REFRESH_SCHEDULER_MS = 30 * 60 * 1000;
const MODEL_MANUAL_REFRESH_COOLDOWN_MS = 10 * 60 * 1000;
// 2026-08-12 新增：在服务端磁盘保留最后一次校验成功的模型，进程重启或上游异常时仍可展示；
const MODEL_CACHE_DIRECTORY = process.env.MODEL_CACHE_DIRECTORY
  ? path.resolve(process.env.MODEL_CACHE_DIRECTORY)
  : path.join(process.cwd(), ".runtime-cache", "model-showcase");
if (!fs.existsSync(MODEL_CACHE_DIRECTORY)) fs.mkdirSync(MODEL_CACHE_DIRECTORY, { recursive: true });

interface UpstreamEnvelope<T> {
  code: number | string;
  data: T;
  message?: string;
}

interface UpstreamModelFile {
  file_id?: number;
  model_id?: number | string;
  file_name: string;
  file_url: string;
  file_size?: number;
}

interface UpstreamModelMetadata {
  model_id: number | string;
  model_name: string;
  model_description?: string;
  industry?: string;
  update_time?: string;
  edit_time?: string;
  model_file?: UpstreamModelFile[];
}

interface ResolvedModelAsset {
  metadata: UpstreamModelMetadata;
  file: UpstreamModelFile;
  format: "fbx" | "glb" | "gltf";
  fingerprint: string;
}

interface CachedModelBinary {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  fileSize: number;
  format: "fbx" | "glb" | "gltf";
  cachedAt: number;
  updatedAt: number;
  lastCheckedAt: number;
  nextRefreshAt: number;
  assetFingerprint: string;
  contentHash: string;
  version: string;
  persistent: boolean;
}

interface PersistedModelManifest {
  schemaVersion: 1;
  sceneId: ModelShowcaseSceneId;
  binaryFile: string;
  contentType: string;
  fileName: string;
  fileSize: number;
  format: "fbx" | "glb" | "gltf";
  cachedAt: number;
  updatedAt: number;
  lastCheckedAt: number;
  nextRefreshAt: number;
  assetFingerprint: string;
  contentHash: string;
  version: string;
}

interface ModelRefreshRuntimeState {
  state: ModelRefreshStatus["state"];
  candidateVersion: string | null;
  lastCheckedAt: number | null;
  nextRefreshAt: number | null;
  lastRefreshError: string | null;
}

interface ModelRefreshOperationResult {
  result: "updated" | "unchanged" | "failed";
  message: string;
}

// 2026-08-10 新增：将上游请求与具体场景、数据通道关联，供连接关系页面展示真实运行状态；
interface ConnectionObservation {
  sceneId: ModelShowcaseSceneId;
  channel: ModelConnectionChannel;
}

class UpstreamApiError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(message: string, status = 502, code = "UPSTREAM_ERROR", retryable = true) {
    super(message);
    this.name = "UpstreamApiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const modelMetadataCache = new Map<ModelShowcaseSceneId, { expiresAt: number; asset: ResolvedModelAsset }>();
const modelBinaryCache = new Map<ModelShowcaseSceneId, CachedModelBinary>();
const modelRefreshRequests = new Map<ModelShowcaseSceneId, Promise<ModelRefreshOperationResult>>();
const modelPersistenceRequests = new Map<ModelShowcaseSceneId, Promise<void>>();
const modelRefreshStates = new Map<ModelShowcaseSceneId, ModelRefreshRuntimeState>();
const modelManualRefreshAttempts = new Map<ModelShowcaseSceneId, number>();

// 2026-08-10 调整：在不改变原有 API 转发行为的前提下记录请求成功、延迟和脱敏错误；
async function fetchUpstreamJson<T>(
  pathname: string,
  init?: RequestInit,
  timeoutMs = 10_000,
  observation?: ConnectionObservation,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  let responseStatus: number | null = null;
  try {
    const response = await fetch(`${VISUAL_MODEL_API_BASE_URL}${pathname}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    responseStatus = response.status;
    const payload = await response.json() as UpstreamEnvelope<T>;
    if (!response.ok || Number(payload.code) !== 200) {
      // 2026-08-10 修复：HTTP 200 但业务 code 失败时仍向前端返回 502，避免错误正文被当作成功响应；
      throw new UpstreamApiError(
        payload.message || `Remote API returned ${response.status}`,
        response.ok ? 502 : response.status,
      );
    }
    if (observation) {
      recordConnectionSuccess(observation.sceneId, observation.channel, {
        latencyMs: Date.now() - startedAt,
        httpStatus: response.status,
      });
    }
    return payload.data;
  } catch (error) {
    const normalized = error instanceof UpstreamApiError
      ? error
      : error instanceof Error && error.name === "AbortError"
        ? new UpstreamApiError("Remote model API request timed out", 504, "UPSTREAM_TIMEOUT")
        : new UpstreamApiError("Remote model API is temporarily unavailable");
    if (observation) {
      recordConnectionFailure(observation.sceneId, observation.channel, {
        latencyMs: Date.now() - startedAt,
        httpStatus: responseStatus ?? normalized.status,
        errorCode: normalized.code,
        errorMessage: normalized.message,
      });
    }
    throw normalized;
  } finally {
    clearTimeout(timer);
  }
}

// 2026-08-10 调整：兼容 Express 5 路由参数的 string/string[] 类型并统一规范为单个场景 ID；
function getShowcaseScene(sceneId: string | string[]) {
  const normalizedSceneId = Array.isArray(sceneId) ? sceneId[0] : sceneId;
  if (!isModelShowcaseSceneId(normalizedSceneId)) {
    throw new UpstreamApiError("Unknown model showcase scene", 404, "SCENE_NOT_FOUND", false);
  }
  return { sceneId: normalizedSceneId, config: getModelShowcaseConfig(normalizedSceneId)! };
}

function resolveFormat(fileName: string): ResolvedModelAsset["format"] | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension === "fbx" || extension === "glb" || extension === "gltf" ? extension : null;
}

function chooseModelFile(files: UpstreamModelFile[]): { file: UpstreamModelFile; format: ResolvedModelAsset["format"] } {
  const priority: ResolvedModelAsset["format"][] = ["glb", "gltf", "fbx"];
  for (const format of priority) {
    const file = files.find((item) => resolveFormat(item.file_name) === format);
    if (file) {
      if (Number(file.file_size || 0) > MAX_MODEL_FILE_BYTES) {
        throw new UpstreamApiError("Remote model file exceeds the 50 MB safety limit", 413, "MODEL_TOO_LARGE", false);
      }
      return { file, format };
    }
  }
  throw new UpstreamApiError("No supported FBX/GLB/GLTF model file was returned", 502, "MODEL_FILE_MISSING", false);
}

function createAssetFingerprint(metadata: UpstreamModelMetadata, file: UpstreamModelFile): string {
  return createHash("sha256").update(JSON.stringify({
    modelId: metadata.model_id,
    fileId: file.file_id ?? null,
    fileName: file.file_name,
    fileUrl: file.file_url,
    fileSize: Number(file.file_size || 0),
    updatedAt: metadata.update_time || metadata.edit_time || null,
  })).digest("hex");
}

// 2026-08-12 调整：定时或手动更新时可绕过五分钟元数据缓存，确保真正向模型 API 核对新资源；
async function resolveModelAsset(sceneId: ModelShowcaseSceneId, forceRefresh = false): Promise<ResolvedModelAsset> {
  const cached = modelMetadataCache.get(sceneId);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    // 2026-08-10 新增：元数据命中运行期缓存时保留连接成功事实并标记缓存状态；
    recordConnectionCacheHit(sceneId, "metadata");
    return cached.asset;
  }

  const config = getModelShowcaseConfig(sceneId)!;
  const metadata = await fetchUpstreamJson<UpstreamModelMetadata>(
    `/api/v1/three-model/models?model_id=${config.modelId}`,
    undefined,
    10_000,
    { sceneId, channel: "metadata" },
  );
  let files = Array.isArray(metadata.model_file) ? metadata.model_file : [];
  if (files.length === 0) {
    const result = await fetchUpstreamJson<{ file_list?: UpstreamModelFile[] }>(
      `/api/v1/three-model/models/files?model_id=${config.modelId}`,
      undefined,
      10_000,
      { sceneId, channel: "metadata" },
    );
    files = Array.isArray(result.file_list) ? result.file_list : [];
  }
  const selected = chooseModelFile(files);
  const asset = {
    metadata,
    ...selected,
    fingerprint: createAssetFingerprint(metadata, selected.file),
  };
  modelMetadataCache.set(sceneId, { expiresAt: Date.now() + MODEL_METADATA_TTL_MS, asset });
  return asset;
}

async function fetchDashboard(sceneId: ModelShowcaseSceneId): Promise<RemoteDashboardData> {
  const modelId = getModelShowcaseConfig(sceneId)!.modelId;
  // 2026-08-10 调整：Dashboard 请求同步写入跨项目连接通道状态；
  return fetchUpstreamJson<RemoteDashboardData>(
    `/api/visual-models/${modelId}/dashboard`,
    undefined,
    10_000,
    { sceneId, channel: "dashboard" },
  );
}

function assertModelFile(format: ResolvedModelAsset["format"], buffer: Buffer): void {
  if (buffer.byteLength === 0) {
    throw new UpstreamApiError("Remote model file is empty", 502, "MODEL_FILE_EMPTY");
  }
  if (format === "fbx") {
    const header = buffer.subarray(0, 32).toString("ascii");
    if (!header.startsWith("Kaydara FBX Binary") && !header.trimStart().startsWith("; FBX")) {
      throw new UpstreamApiError("Remote endpoint did not return a valid FBX file", 502, "MODEL_FILE_INVALID");
    }
  }
  if (format === "glb" && buffer.subarray(0, 4).toString("ascii") !== "glTF") {
    throw new UpstreamApiError("Remote endpoint did not return a valid GLB file", 502, "MODEL_FILE_INVALID");
  }
  if (format === "gltf") {
    try {
      const document = JSON.parse(buffer.toString("utf8"));
      if (!document?.asset?.version) throw new Error("missing asset.version");
    } catch {
      throw new UpstreamApiError("Remote endpoint did not return a valid GLTF file", 502, "MODEL_FILE_INVALID");
    }
  }
}

function modelManifestPath(sceneId: ModelShowcaseSceneId): string {
  return path.join(MODEL_CACHE_DIRECTORY, `${sceneId}.json`);
}

function modelRefreshState(sceneId: ModelShowcaseSceneId): ModelRefreshRuntimeState {
  const existing = modelRefreshStates.get(sceneId);
  if (existing) return existing;
  const created: ModelRefreshRuntimeState = {
    state: "empty",
    candidateVersion: null,
    lastCheckedAt: null,
    nextRefreshAt: null,
    lastRefreshError: null,
  };
  modelRefreshStates.set(sceneId, created);
  return created;
}

function safeRefreshError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Remote model update failed";
  return message.replace(/file_url=[^\s&"']+/gi, "file_url=[hidden]").slice(0, 240);
}

function toIso(value: number | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

// 2026-08-12 新增：将当前版本、上次检查、下次检查和失败原因组织成前端可直接展示的状态；
function getModelRefreshStatus(sceneId: ModelShowcaseSceneId): ModelRefreshStatus {
  const cached = modelBinaryCache.get(sceneId);
  const runtime = modelRefreshState(sceneId);
  const due = cached ? Date.now() >= cached.nextRefreshAt : false;
  const state = runtime.state === "checking"
    ? "checking"
    : runtime.state === "update-failed"
      ? "update-failed"
      : runtime.state === "stale"
        ? "stale"
      : !cached
        ? "empty"
        : due
          ? "stale"
          : "fresh";
  return {
    activeVersion: cached?.version ?? null,
    candidateVersion: runtime.candidateVersion,
    state,
    updatedAt: toIso(cached?.updatedAt ?? null),
    lastCheckedAt: toIso(runtime.lastCheckedAt ?? cached?.lastCheckedAt ?? null),
    nextRefreshAt: toIso(runtime.nextRefreshAt ?? cached?.nextRefreshAt ?? null),
    lastRefreshError: runtime.lastRefreshError,
    persistent: cached?.persistent ?? false,
    stale: state === "stale" || state === "update-failed",
    fileName: cached?.fileName ?? null,
    fileSize: cached?.fileSize ?? null,
    format: cached?.format ?? null,
  };
}

// 2026-08-12 新增：懒加载磁盘中的最后成功模型，并校验路径、大小、格式和 SHA-256；
async function ensurePersistedModelLoaded(sceneId: ModelShowcaseSceneId): Promise<void> {
  if (modelBinaryCache.has(sceneId)) return;
  const pending = modelPersistenceRequests.get(sceneId);
  if (pending) return pending;
  const request = (async () => {
    try {
      const manifest = JSON.parse(
        await fs.promises.readFile(modelManifestPath(sceneId), "utf8"),
      ) as PersistedModelManifest;
      if (manifest.schemaVersion !== 1 || manifest.sceneId !== sceneId || path.basename(manifest.binaryFile) !== manifest.binaryFile) {
        throw new Error("Model cache manifest is invalid");
      }
      const binaryPath = path.join(MODEL_CACHE_DIRECTORY, manifest.binaryFile);
      const buffer = await fs.promises.readFile(binaryPath);
      if (buffer.byteLength > MAX_MODEL_FILE_BYTES || buffer.byteLength !== manifest.fileSize) {
        throw new Error("Persisted model size verification failed");
      }
      assertModelFile(manifest.format, buffer);
      const contentHash = createHash("sha256").update(buffer).digest("hex");
      if (contentHash !== manifest.contentHash) throw new Error("Persisted model hash verification failed");
      modelBinaryCache.set(sceneId, {
        buffer,
        contentType: manifest.contentType,
        fileName: manifest.fileName,
        fileSize: manifest.fileSize,
        format: manifest.format,
        cachedAt: manifest.cachedAt,
        updatedAt: manifest.updatedAt,
        lastCheckedAt: manifest.lastCheckedAt,
        nextRefreshAt: manifest.nextRefreshAt,
        assetFingerprint: manifest.assetFingerprint,
        contentHash,
        version: manifest.version,
        persistent: true,
      });
      const runtime = modelRefreshState(sceneId);
      runtime.state = Date.now() >= manifest.nextRefreshAt ? "stale" : "fresh";
      runtime.lastCheckedAt = manifest.lastCheckedAt;
      runtime.nextRefreshAt = manifest.nextRefreshAt;
      runtime.lastRefreshError = null;
      recordConnectionCacheHit(sceneId, "modelBinary", { bytes: buffer.byteLength });
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code !== "ENOENT") console.warn(`[model-showcase] ignored invalid persisted cache for ${sceneId}:`, error);
    }
  })().finally(() => modelPersistenceRequests.delete(sceneId));
  modelPersistenceRequests.set(sceneId, request);
  return request;
}

// 2026-08-12 新增：模型文件和清单先写临时文件再重命名，只有完整版本才会成为重启后的回退版本；
async function persistModelBinary(sceneId: ModelShowcaseSceneId, model: CachedModelBinary): Promise<void> {
  const binaryFile = `${sceneId}-${model.version}.${model.format}`;
  const binaryPath = path.join(MODEL_CACHE_DIRECTORY, binaryFile);
  try {
    await fs.promises.access(binaryPath, fs.constants.R_OK);
  } catch {
    const temporaryBinaryPath = `${binaryPath}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(temporaryBinaryPath, model.buffer);
    await fs.promises.rename(temporaryBinaryPath, binaryPath);
  }
  const manifest: PersistedModelManifest = {
    schemaVersion: 1,
    sceneId,
    binaryFile,
    contentType: model.contentType,
    fileName: model.fileName,
    fileSize: model.fileSize,
    format: model.format,
    cachedAt: model.cachedAt,
    updatedAt: model.updatedAt,
    lastCheckedAt: model.lastCheckedAt,
    nextRefreshAt: model.nextRefreshAt,
    assetFingerprint: model.assetFingerprint,
    contentHash: model.contentHash,
    version: model.version,
  };
  const manifestPath = modelManifestPath(sceneId);
  const temporaryManifestPath = `${manifestPath}.${process.pid}.${Date.now()}.tmp`;
  await fs.promises.writeFile(temporaryManifestPath, JSON.stringify(manifest, null, 2), "utf8");
  await fs.promises.rename(temporaryManifestPath, manifestPath);
}

async function fetchRemoteModelBinary(asset: ResolvedModelAsset): Promise<{
  buffer: Buffer;
  contentType: string;
  httpStatus: number;
}> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MODEL_DOWNLOAD_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_DOWNLOAD_TIMEOUT_MS);
    try {
      const response = await fetch(
        `${VISUAL_MODEL_API_BASE_URL}/api/v1/three-model/models/files?file_url=${encodeURIComponent(asset.file.file_url)}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new UpstreamApiError(`Remote model download returned ${response.status}`);
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > MAX_MODEL_FILE_BYTES) {
        throw new UpstreamApiError("Remote model file exceeds the 50 MB safety limit", 413, "MODEL_TOO_LARGE", false);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength > MAX_MODEL_FILE_BYTES) {
        throw new UpstreamApiError("Remote model file exceeds the 50 MB safety limit", 413, "MODEL_TOO_LARGE", false);
      }
      if (contentType.includes("application/json") && asset.format !== "gltf") {
        let upstreamMessage = "Remote storage returned an error instead of model data";
        try {
          const payload = JSON.parse(buffer.toString("utf8"));
          if (typeof payload?.message === "string") upstreamMessage = payload.message;
        } catch {
          // Keep the stable fallback message.
        }
        throw new UpstreamApiError(upstreamMessage, 502, "MODEL_STORAGE_UNAVAILABLE");
      }
      assertModelFile(asset.format, buffer);
      return { buffer, contentType, httpStatus: response.status };
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError"
        ? new UpstreamApiError("Remote model download timed out", 504, "MODEL_DOWNLOAD_TIMEOUT")
        : error;
      const retryable = !(lastError instanceof UpstreamApiError) || lastError.retryable;
      if (attempt < MODEL_DOWNLOAD_ATTEMPTS && retryable) {
        await new Promise((resolve) => setTimeout(resolve, 750));
      } else {
        break;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new UpstreamApiError("Remote model download failed", 502, "MODEL_DOWNLOAD_FAILED");
}

// 2026-08-12 新增：采用 stale-while-revalidate 更新模型，候选版本校验失败时继续保留当前版本；
async function refreshModelBinary(
  sceneId: ModelShowcaseSceneId,
  reason: "initial" | "scheduled" | "manual",
): Promise<ModelRefreshOperationResult> {
  const pending = modelRefreshRequests.get(sceneId);
  if (pending) return pending;
  const request = (async (): Promise<ModelRefreshOperationResult> => {
    await ensurePersistedModelLoaded(sceneId);
    const previous = modelBinaryCache.get(sceneId);
    const runtime = modelRefreshState(sceneId);
    const startedAt = Date.now();
    runtime.state = "checking";
    runtime.candidateVersion = null;
    runtime.lastRefreshError = null;
    try {
      const asset = await resolveModelAsset(sceneId, true);
      runtime.candidateVersion = asset.fingerprint.slice(0, 16);
      const downloaded = await fetchRemoteModelBinary(asset);
      const now = Date.now();
      const contentHash = createHash("sha256").update(downloaded.buffer).digest("hex");
      const unchanged = previous?.contentHash === contentHash;
      const model: CachedModelBinary = unchanged && previous
        ? {
            ...previous,
            contentType: downloaded.contentType,
            fileName: asset.file.file_name,
            fileSize: downloaded.buffer.byteLength,
            format: asset.format,
            lastCheckedAt: now,
            nextRefreshAt: now + MODEL_REFRESH_INTERVAL_MS,
            assetFingerprint: asset.fingerprint,
          }
        : {
            buffer: downloaded.buffer,
            contentType: downloaded.contentType,
            fileName: asset.file.file_name,
            fileSize: downloaded.buffer.byteLength,
            format: asset.format,
            cachedAt: now,
            updatedAt: now,
            lastCheckedAt: now,
            nextRefreshAt: now + MODEL_REFRESH_INTERVAL_MS,
            assetFingerprint: asset.fingerprint,
            contentHash,
            version: contentHash.slice(0, 16),
            persistent: false,
          };
      let persistenceError: string | null = null;
      try {
        await persistModelBinary(sceneId, model);
        model.persistent = true;
      } catch (error) {
        persistenceError = `模型已更新，但持久缓存写入失败：${safeRefreshError(error)}`;
        console.error(`[model-showcase] persistence failed for ${sceneId}:`, error);
      }
      modelBinaryCache.set(sceneId, model);
      runtime.state = persistenceError ? "stale" : "fresh";
      runtime.lastCheckedAt = now;
      runtime.nextRefreshAt = model.nextRefreshAt;
      runtime.lastRefreshError = persistenceError;
      recordConnectionSuccess(sceneId, "modelBinary", {
        latencyMs: Date.now() - startedAt,
        httpStatus: downloaded.httpStatus,
        cacheState: "miss",
        bytes: model.buffer.byteLength,
      });
      return {
        result: unchanged ? "unchanged" : "updated",
        message: unchanged
          ? `模型内容未变化，已完成 ${reason === "manual" ? "手动" : "定时"}核验。`
          : persistenceError || "已获取并切换到最新模型版本。",
      };
    } catch (error) {
      const now = Date.now();
      const retryAt = now + MODEL_REFRESH_RETRY_MS;
      const message = safeRefreshError(error);
      runtime.state = "update-failed";
      runtime.lastCheckedAt = now;
      runtime.nextRefreshAt = retryAt;
      runtime.lastRefreshError = message;
      if (previous) {
        // 2026-08-12 修复：失败后的六小时退避同时写回活动缓存，避免十秒连接轮询立即重复下载大文件；
        previous.lastCheckedAt = now;
        previous.nextRefreshAt = retryAt;
        try {
          await persistModelBinary(sceneId, previous);
          previous.persistent = true;
        } catch (persistenceError) {
          console.error(`[model-showcase] failed to persist retry schedule for ${sceneId}:`, persistenceError);
        }
      }
      recordConnectionFailure(sceneId, "modelBinary", {
        latencyMs: Date.now() - startedAt,
        httpStatus: error instanceof UpstreamApiError ? error.status : 502,
        errorCode: error instanceof UpstreamApiError ? error.code : "MODEL_DOWNLOAD_FAILED",
        errorMessage: message,
      });
      return {
        result: "failed",
        message: previous
          ? `本次模型更新未成功，继续使用上次可用版本：${message}`
          : `模型获取失败：${message}`,
      };
    } finally {
      runtime.candidateVersion = null;
    }
  })().finally(() => modelRefreshRequests.delete(sceneId));
  modelRefreshRequests.set(sceneId, request);
  return request;
}

// 2026-08-12 新增：请求优先返回当前可用模型，到期检查在后台进行，避免等待期间出现空白视窗；
async function getServableModel(sceneId: ModelShowcaseSceneId): Promise<CachedModelBinary> {
  await ensurePersistedModelLoaded(sceneId);
  const cached = modelBinaryCache.get(sceneId);
  if (cached) {
    recordConnectionCacheHit(sceneId, "modelBinary", { bytes: cached.buffer.byteLength });
    if (Date.now() >= cached.nextRefreshAt && !modelRefreshRequests.has(sceneId)) {
      void refreshModelBinary(sceneId, "scheduled");
    }
    return cached;
  }
  const result = await refreshModelBinary(sceneId, "initial");
  const downloaded = modelBinaryCache.get(sceneId);
  if (downloaded) return downloaded;
  throw new UpstreamApiError(result.message, 502, "MODEL_DOWNLOAD_FAILED");
}

function sendShowcaseError(res: express.Response, error: unknown): void {
  const normalized = error instanceof UpstreamApiError
    ? error
    : new UpstreamApiError("Model showcase service failed", 500, "SHOWCASE_ERROR", false);
  if (normalized.status >= 500) console.error(`[model-showcase] ${normalized.code}:`, error);
  if (res.headersSent) {
    res.destroy(error instanceof Error ? error : undefined);
    return;
  }
  res.status(normalized.status).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      retryable: normalized.retryable,
    },
  });
}

function showcaseRoute(
  handler: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendShowcaseError(res, error);
    }
  };
}

app.get("/api/model-showcase/:sceneId/bootstrap", showcaseRoute(async (req, res) => {
  const { sceneId, config } = getShowcaseScene(req.params.sceneId);
  // 2026-08-12 新增：初始化页面前先恢复持久模型状态，避免服务重启后丢失最后可用版本；
  await ensurePersistedModelLoaded(sceneId);
  const restoredModel = modelBinaryCache.get(sceneId);
  const [asset, dashboard] = await Promise.all([
    resolveModelAsset(sceneId).catch((error) => {
      // 2026-08-12 新增：模型元数据库异常但已有持久版本时，允许页面继续使用最后成功模型初始化；
      if (restoredModel) return null;
      throw error;
    }),
    fetchDashboard(sceneId),
  ]);
  const modelRefresh = getModelRefreshStatus(sceneId);
  if (modelRefresh.stale && !modelRefreshRequests.has(sceneId)) void refreshModelBinary(sceneId, "scheduled");
  recordDiagnosticSnapshot(sceneId, dashboard, "dashboard");
  res.json({
    sceneId,
    modelId: config.modelId,
    title: config.title,
    model: {
      name: asset?.metadata.model_name || config.expectedRemoteName,
      description: asset?.metadata.model_description || config.description,
      industry: asset?.metadata.industry || "工业设备",
      fileName: asset?.file.file_name || restoredModel!.fileName,
      fileSize: asset ? Number(asset.file.file_size || 0) : restoredModel!.fileSize,
      format: asset?.format || restoredModel!.format,
      localAssetUrl: `/api/model-showcase/${sceneId}/model`,
      version: modelRefresh.activeVersion || asset!.fingerprint.slice(0, 16),
      updatedAt: modelRefresh.updatedAt,
    },
    dashboard,
  });
}));

// 2026-08-12 调整：连接快照同步模型版本；到期时只在后台检查，不阻塞当前模型展示；
app.get("/api/model-showcase/:sceneId/connection", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  await ensurePersistedModelLoaded(sceneId);
  const cached = modelBinaryCache.get(sceneId);
  if (cached && Date.now() >= cached.nextRefreshAt && !modelRefreshRequests.has(sceneId)) {
    void refreshModelBinary(sceneId, "scheduled");
  }
  res.json(getConnectionSnapshot(sceneId, {
    upstreamBaseUrl: VISUAL_MODEL_API_BASE_URL,
    modelCacheState: modelBinaryCache.has(sceneId) ? "hit" : "empty",
    modelRefresh: getModelRefreshStatus(sceneId),
  }));
}));

app.get("/api/model-showcase/:sceneId/model", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  const wasCached = modelBinaryCache.has(sceneId);
  const model = await getServableModel(sceneId);
  res.setHeader("Content-Type", model.contentType || "application/octet-stream");
  res.setHeader("Content-Length", String(model.buffer.byteLength));
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(model.fileName)}`);
  // 2026-08-12 调整：版本参数由前端显式控制，响应本身不允许浏览器复用错误版本的二进制；
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("ETag", `"${model.version}"`);
  res.setHeader("Last-Modified", new Date(model.updatedAt).toUTCString());
  res.setHeader("X-Model-Runtime-Cache", wasCached ? "HIT" : "MISS");
  res.setHeader("X-Model-Version", model.version);
  res.setHeader("X-Model-Updated-At", new Date(model.updatedAt).toISOString());
  res.setHeader("X-Model-Cached-At", new Date(model.cachedAt).toISOString());
  res.setHeader("X-Model-Next-Refresh", new Date(model.nextRefreshAt).toISOString());
  res.send(model.buffer);
}));

// 2026-08-12 新增：提供受十分钟场景级限流保护的手动模型更新入口；
app.post("/api/model-showcase/:sceneId/model/refresh", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  await ensurePersistedModelLoaded(sceneId);
  const now = Date.now();
  const lastAttemptAt = modelManualRefreshAttempts.get(sceneId) || 0;
  const retryAfterMs = MODEL_MANUAL_REFRESH_COOLDOWN_MS - (now - lastAttemptAt);
  if (retryAfterMs > 0) {
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      result: "rate-limited",
      message: `手动更新操作过于频繁，请在 ${Math.ceil(retryAfterSeconds / 60)} 分钟后重试。`,
      retryAfterSeconds,
      modelRefresh: getModelRefreshStatus(sceneId),
    });
    return;
  }
  modelManualRefreshAttempts.set(sceneId, now);
  const result = await refreshModelBinary(sceneId, "manual");
  res.status(result.result === "failed" && !modelBinaryCache.has(sceneId) ? 502 : 200).json({
    ...result,
    modelRefresh: getModelRefreshStatus(sceneId),
  });
}));

app.get("/api/model-showcase/:sceneId/dashboard", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  const dashboard = await fetchDashboard(sceneId);
  recordDiagnosticSnapshot(sceneId, dashboard, "dashboard");
  res.json(dashboard);
}));

app.post("/api/model-showcase/:sceneId/scenario/:type", showcaseRoute(async (req, res) => {
  const { sceneId, config } = getShowcaseScene(req.params.sceneId);
  const type = req.params.type as RemoteScenarioType;
  if (!(["normal", "high_load", "fault"] as string[]).includes(type)) {
    throw new UpstreamApiError("Unsupported scenario type", 400, "INVALID_SCENARIO", false);
  }
  const dashboard = await fetchUpstreamJson<RemoteDashboardData>(
    `/api/visual-models/${config.modelId}/scenario/${type}`,
    { method: "POST", body: "{}" },
    10_000,
    { sceneId, channel: "scenario" },
  );
  recordDiagnosticSnapshot(sceneId, dashboard, type);
  res.json(dashboard);
}));

app.post("/api/model-showcase/:sceneId/data-sync", showcaseRoute(async (req, res) => {
  const { sceneId, config } = getShowcaseScene(req.params.sceneId);
  const scenario = req.body?.scenario as RemoteScenarioType;
  const rawValues = req.body?.actual_values;
  if (!(["normal", "high_load", "fault"] as string[]).includes(scenario) || !rawValues || typeof rawValues !== "object") {
    throw new UpstreamApiError("scenario and actual_values are required", 400, "INVALID_SYNC_PAYLOAD", false);
  }
  const allowedFields = new Set(Object.keys(config.fields));
  const actualValues = Object.fromEntries(
    Object.entries(rawValues)
      .filter(([key, value]) => allowedFields.has(key) && typeof value === "number" && Number.isFinite(value))
      .slice(0, 20),
  );
  if (Object.keys(actualValues).length === 0) {
    throw new UpstreamApiError("No valid numeric values were provided", 400, "INVALID_SYNC_PAYLOAD", false);
  }
  const result = await fetchUpstreamJson<unknown>(
    `/api/visual-models/${config.modelId}/data-sync`,
    { method: "POST", body: JSON.stringify({ scenario, actual_values: actualValues }) },
    10_000,
    { sceneId, channel: "dataSync" },
  );
  res.json(result);
}));

app.post("/api/model-showcase/:sceneId/diagnosis", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  const startedAt = Date.now();
  const result = runDiagnosis(sceneId);
  if (!result) {
    const error = new UpstreamApiError("Telemetry history is not ready", 409, "DIAGNOSIS_NOT_READY", true);
    // 2026-08-10 新增：诊断数据窗口未就绪时记录本地派生通道状态；
    recordConnectionFailure(sceneId, "diagnosis", {
      latencyMs: Date.now() - startedAt,
      httpStatus: error.status,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw error;
  }
  // 2026-08-10 新增：诊断结论生成成功后登记本地派生通道可用；
  recordConnectionSuccess(sceneId, "diagnosis", {
    latencyMs: Date.now() - startedAt,
    httpStatus: 200,
  });
  res.json(result);
}));

// 2026-08-12 新增：服务启动后每 30 分钟扫描已使用场景，仅对到期模型发起后台更新；
async function sweepDueModelRefreshes(): Promise<void> {
  await Promise.all(MODEL_SHOWCASE_SCENE_IDS.map(async (sceneId) => {
    await ensurePersistedModelLoaded(sceneId);
    const cached = modelBinaryCache.get(sceneId);
    if (cached && Date.now() >= cached.nextRefreshAt && !modelRefreshRequests.has(sceneId)) {
      void refreshModelBinary(sceneId, "scheduled");
    }
  }));
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    // 2026-08-19 修复：0.0.0.0 是监听地址而不是可直接访问的网址，输出实际可打开的本机与局域网地址。
    const reachableUrls = new Set<string>([
      `http://localhost:${PORT}/`,
      `http://127.0.0.1:${PORT}/`,
    ]);
    const listensOnAllInterfaces = HOST === "0.0.0.0" || HOST === "::";
    if (listensOnAllInterfaces) {
      for (const addresses of Object.values(os.networkInterfaces())) {
        for (const address of addresses || []) {
          if (address.family === "IPv4" && !address.internal) {
            reachableUrls.add(`http://${address.address}:${PORT}/`);
          }
        }
      }
    } else if (HOST !== "127.0.0.1" && HOST !== "localhost") {
      reachableUrls.add(`http://${HOST}:${PORT}/`);
    }
    console.log(`Server listening on ${HOST}:${PORT}`);
    for (const url of reachableUrls) console.log(`Open: ${url}`);
    if (PUBLIC_URL) {
      console.log(`Public: ${PUBLIC_URL}`);
    } else if (process.env.NODE_ENV !== "production") {
      console.log("Public: set SCENE_LIBRARY_PUBLIC_URL after configuring a tunnel or reverse proxy.");
    }
    console.log(`Model refresh interval: ${MODEL_REFRESH_INTERVAL_HOURS} hours`);
    console.log(`Press 'q' followed by 'Enter' in the terminal to exit the development server.`);
  });
  void sweepDueModelRefreshes();
  const modelRefreshTimer = setInterval(() => void sweepDueModelRefreshes(), MODEL_REFRESH_SCHEDULER_MS);
  modelRefreshTimer.unref();
}

// Handle 'q' input to exit
if (process.env.NODE_ENV !== "production") {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (key) => {
    const str = key.toString().trim().toLowerCase();
    // 2026-08-10 调整：使用已规范化字符串判断 Ctrl+C，兼容 Node 输入回调的 Buffer 类型；
    if (str === 'q' || key.toString() === '\u0003') { // q or ctrl-c
      console.log('Quitting server...');
      process.exit(0);
    }
  });
}

startServer();
