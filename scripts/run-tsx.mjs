import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// 2026-08-19 修复：部分 Windows/受限账户环境会让 os.userInfo() 抛出
// uv_os_get_passwd ENOMEM，tsx 在真正加载 server.ts 前因此退出。仅在该调用
// 失败时提供最小兼容信息；Linux 云端和正常本机仍使用 Node 原生结果。
try {
  os.userInfo();
} catch (error) {
  const username = process.env.USERNAME || process.env.USER || 'local-user';
  // tsx 同时包含 ESM/CJS 两条加载链；在 Windows 上提供临时有效用户编号，
  // 可让两条链都避开失败的系统账户查询。该属性在正常平台不会被改写。
  if (typeof process.geteuid !== 'function') {
    Object.defineProperty(process, 'geteuid', {
      configurable: true,
      value: () => 0,
    });
  }
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username,
    homedir: os.homedir(),
    shell: null,
  });
  console.warn('[启动兼容] 系统用户信息不可用，已使用本地临时目录兼容模式。');
}

const entry = process.argv[2];
if (!entry) throw new Error('缺少要运行的 TypeScript 入口文件。');

// 直接使用同进程 API，确保上述兼容处理也覆盖 tsx 的 ESM/CJS 加载链。
const { tsImport } = await import('tsx/esm/api');
await tsImport(pathToFileURL(path.resolve(entry)).href, import.meta.url);
