import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";

const app = express();
const PORT = 3000;

// Need cors and body-parser for completeness? Express has them built or let's ignore if not cross-origin.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directories
const DIRS = {
  powerUnit1: path.join(process.cwd(), "/src/data/Unit1Pred/有功功率文件"),
  tempUnit1: path.join(process.cwd(), "/src/data/Unit1Pred/机组推力瓦温度数据"),
  powerExample: path.join(process.cwd(), "/src/data/example/power"),
  tempExample: path.join(process.cwd(), "/src/data/example/temperature"),
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
