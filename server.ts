import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
// 2026-08-09 新增：引入外部模型场景白名单、诊断引擎及共享数据类型；
import {
  getModelShowcaseConfig,
  isModelShowcaseSceneId,
} from "./src/remoteModelShowcase/modelCatalog";
import {
  recordDiagnosticSnapshot,
  runDiagnosis,
} from "./src/remoteModelShowcase/diagnosticEngine";
import type {
  ModelShowcaseSceneId,
  RemoteDashboardData,
  RemoteDataMode,
  RemoteScenarioType,
} from "./src/remoteModelShowcase/types";

const app = express();
// 2026-08-09 调整：支持通过 PORT 环境变量配置服务端口并保留 3000 默认值；
const PORT = Number(process.env.PORT || 3000);

// Need cors and body-parser for completeness? Express has them built or let's ignore if not cross-origin.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directories
// 2026-07-13 清理：powerExample/tempExample 两个目录是早期原型遗留的死代码（从未被读写），已移除。
const DIRS = {
  powerUnit1: path.join(process.cwd(), "/src/data/Unit1Pred/有功功率文件"),
  tempUnit1: path.join(process.cwd(), "/src/data/Unit1Pred/机组推力瓦温度数据"),
};

// Ensure directories exist
Object.values(DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Handle tmp upload dir
const tmpDir = path.join(process.cwd(), "/tmp_uploads");
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
    dir: path.join(process.cwd(), "/src/data/cv-spillway-monitoring/uploads"),
    metrics: ["flowRate", "waterLevel", "vibrationLevel"],
  },
  "vibe-DamGalleryMicroseism": {
    dir: path.join(process.cwd(), "/src/data/vibe-DamGalleryMicroseism/uploads"),
    metrics: ["eventEnergy", "stabilityIndex", "waterLevel", "crackWidth", "seepageFlow"],
  },
  "intake-trash-rack-life": {
    dir: path.join(process.cwd(), "/src/data/intake-trash-rack-life/uploads"),
    metrics: ["flowVelocity", "waterLevelDiff", "vibrationAmplitude", "blockageRatio"],
  },
  "mpm-16": {
    dir: path.join(process.cwd(), "/src/data/mpm-16/uploads"),
    metrics: ["temperature", "pressure", "vibration"],
  },
  "pm-hydro-36": {
    dir: path.join(process.cwd(), "/src/data/pm-hydro-36/uploads"),
    metrics: ["pressure", "hoopStress"],
  },
  "eq-7": {
    dir: path.join(process.cwd(), "/src/data/eq-7/uploads"),
    metrics: ["speed", "rpm", "fuelConsumption", "exhaustTemp"],
  },
  "cv-mooring-tension": {
    dir: path.join(process.cwd(), "/src/data/cv-mooring-tension/uploads"),
    metrics: ["tensionL1", "tensionL2", "tensionL3", "tensionL4"],
  },
  "eq-12": {
    dir: path.join(process.cwd(), "/src/data/eq-12/uploads"),
    metrics: ["depth", "velocity", "payload", "brakePressure", "ropeTensionR1", "ropeTensionR2", "ropeTensionR3", "ropeTensionR4"],
  },
  "mining-shovel-rope-life": {
    dir: path.join(process.cwd(), "/src/data/mining-shovel-rope-life/uploads"),
    metrics: ["tension", "abrasion"],
  },
  "vibe-ConeCrusherVibration": {
    dir: path.join(process.cwd(), "/src/data/vibe-ConeCrusherVibration/uploads"),
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
  model_file?: UpstreamModelFile[];
}

interface ResolvedModelAsset {
  metadata: UpstreamModelMetadata;
  file: UpstreamModelFile;
  format: "fbx" | "glb" | "gltf";
}

interface CachedModelBinary {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  cachedAt: number;
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
const modelDownloadRequests = new Map<ModelShowcaseSceneId, Promise<CachedModelBinary>>();

async function fetchUpstreamJson<T>(pathname: string, init?: RequestInit, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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
    const payload = await response.json() as UpstreamEnvelope<T>;
    if (!response.ok || Number(payload.code) !== 200) {
      throw new UpstreamApiError(payload.message || `Remote API returned ${response.status}`);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof UpstreamApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new UpstreamApiError("Remote model API request timed out", 504, "UPSTREAM_TIMEOUT");
    }
    throw new UpstreamApiError("Remote model API is temporarily unavailable");
  } finally {
    clearTimeout(timer);
  }
}

function getShowcaseScene(sceneId: string) {
  if (!isModelShowcaseSceneId(sceneId)) {
    throw new UpstreamApiError("Unknown model showcase scene", 404, "SCENE_NOT_FOUND", false);
  }
  return { sceneId, config: getModelShowcaseConfig(sceneId)! };
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

async function resolveModelAsset(sceneId: ModelShowcaseSceneId): Promise<ResolvedModelAsset> {
  const cached = modelMetadataCache.get(sceneId);
  if (cached && cached.expiresAt > Date.now()) return cached.asset;

  const config = getModelShowcaseConfig(sceneId)!;
  const metadata = await fetchUpstreamJson<UpstreamModelMetadata>(
    `/api/v1/three-model/models?model_id=${config.modelId}`,
  );
  let files = Array.isArray(metadata.model_file) ? metadata.model_file : [];
  if (files.length === 0) {
    const result = await fetchUpstreamJson<{ file_list?: UpstreamModelFile[] }>(
      `/api/v1/three-model/models/files?model_id=${config.modelId}`,
    );
    files = Array.isArray(result.file_list) ? result.file_list : [];
  }
  const selected = chooseModelFile(files);
  const asset = { metadata, ...selected };
  modelMetadataCache.set(sceneId, { expiresAt: Date.now() + MODEL_METADATA_TTL_MS, asset });
  return asset;
}

async function fetchDashboard(sceneId: ModelShowcaseSceneId): Promise<RemoteDashboardData> {
  const modelId = getModelShowcaseConfig(sceneId)!.modelId;
  return fetchUpstreamJson<RemoteDashboardData>(`/api/visual-models/${modelId}/dashboard`);
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

async function downloadModelBinary(
  sceneId: ModelShowcaseSceneId,
  asset: ResolvedModelAsset,
): Promise<CachedModelBinary> {
  const cached = modelBinaryCache.get(sceneId);
  if (cached) return cached;
  const pending = modelDownloadRequests.get(sceneId);
  if (pending) return pending;

  const request = (async () => {
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
        const model = { buffer, contentType, fileName: asset.file.file_name, cachedAt: Date.now() };
        modelBinaryCache.set(sceneId, model);
        return model;
      } catch (error) {
        lastError = error instanceof Error && error.name === "AbortError"
          ? new UpstreamApiError("Remote model download timed out", 504, "MODEL_DOWNLOAD_TIMEOUT")
          : error;
        const retryableWithoutTimeout = !(lastError instanceof UpstreamApiError && lastError.code === "MODEL_DOWNLOAD_TIMEOUT");
        if (attempt < MODEL_DOWNLOAD_ATTEMPTS && retryableWithoutTimeout) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        } else if (!retryableWithoutTimeout) {
          break;
        }
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new UpstreamApiError("Remote model download failed", 502, "MODEL_DOWNLOAD_FAILED");
  })().finally(() => modelDownloadRequests.delete(sceneId));

  modelDownloadRequests.set(sceneId, request);
  return request;
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
  const [asset, dashboard] = await Promise.all([resolveModelAsset(sceneId), fetchDashboard(sceneId)]);
  recordDiagnosticSnapshot(sceneId, dashboard, "dashboard");
  res.json({
    sceneId,
    modelId: config.modelId,
    title: config.title,
    model: {
      name: asset.metadata.model_name,
      description: asset.metadata.model_description || config.description,
      industry: asset.metadata.industry || "工业设备",
      fileName: asset.file.file_name,
      fileSize: Number(asset.file.file_size || 0),
      format: asset.format,
      localAssetUrl: `/api/model-showcase/${sceneId}/model`,
    },
    dashboard,
  });
}));

app.get("/api/model-showcase/:sceneId/model", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  const asset = await resolveModelAsset(sceneId);
  const wasCached = modelBinaryCache.has(sceneId);
  const model = await downloadModelBinary(sceneId, asset);
  res.setHeader("Content-Type", model.contentType || "application/octet-stream");
  res.setHeader("Content-Length", String(model.buffer.byteLength));
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(model.fileName)}`);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("X-Model-Runtime-Cache", wasCached ? "HIT" : "MISS");
  res.send(model.buffer);
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
  );
  recordDiagnosticSnapshot(sceneId, dashboard, type);
  res.json(dashboard);
}));

app.post("/api/model-showcase/:sceneId/data-sync", showcaseRoute(async (req, res) => {
  const { config } = getShowcaseScene(req.params.sceneId);
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
  );
  res.json(result);
}));

app.post("/api/model-showcase/:sceneId/diagnosis", showcaseRoute(async (req, res) => {
  const { sceneId } = getShowcaseScene(req.params.sceneId);
  const result = runDiagnosis(sceneId);
  if (!result) {
    throw new UpstreamApiError("Telemetry history is not ready", 409, "DIAGNOSIS_NOT_READY", true);
  }
  res.json(result);
}));

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Press 'q' followed by 'Enter' in the terminal to exit the development server.`);
  });
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
    if (str === 'q' || key === '\u0003') { // q or ctrl-c
      console.log('Quitting server...');
      process.exit(0);
    }
  });
}

startServer();
