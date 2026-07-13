// 2026-07-09 新增：场景库测试方案 - 场景导出（决策 4）。
// 仅在 views/SmartOperationsView.tsx（工业智能运维全景视图）里用到，纯前端实现：
// 读取 constants.tsx 的 MENU_ITEMS（经 scenarioRegistry 整理），按分类分组导出全部场景基础信息，
// 支持 Word(.docx) / Excel(.xlsx) / JSON / Markdown 四种格式，不经过后端接口。
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { MENU_ITEMS } from '../../constants';
import { getCategorySummaries, getTotalSceneCount } from './scenarioRegistry';

export type ScenarioExportFormat = 'word' | 'excel' | 'json' | 'md';

interface SceneDetailRow {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
}

const buildExportData = () => {
  const categories = getCategorySummaries();
  const totalScenes = getTotalSceneCount();
  const totalCategories = categories.length;

  const scenes: SceneDetailRow[] = [];
  MENU_ITEMS.forEach((category) => {
    (category.children || []).forEach((child) => {
      scenes.push({
        id: child.id,
        name: child.label,
        categoryId: category.id,
        categoryName: category.label,
      });
    });
  });

  return { totalScenes, totalCategories, categories, scenes };
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const exportAsJSON = () => {
  const data = buildExportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `场景库导出_${Date.now()}.json`);
};

const exportAsMarkdown = () => {
  const { totalScenes, totalCategories, categories, scenes } = buildExportData();
  const lines: string[] = [];
  lines.push('# 场景库导出');
  lines.push('');
  lines.push(`- 场景总数：${totalScenes}`);
  lines.push(`- 分类总数：${totalCategories}`);
  lines.push('');
  lines.push('## 分类统计');
  lines.push('');
  lines.push('| 分类名称 | 分类 ID | 场景数量 |');
  lines.push('|---|---|---|');
  categories.forEach((c) => lines.push(`| ${c.categoryName} | ${c.categoryId} | ${c.sceneCount} |`));
  lines.push('');
  lines.push('## 场景明细');
  lines.push('');
  lines.push('| 场景 ID | 场景名称 | 所属分类 |');
  lines.push('|---|---|---|');
  scenes.forEach((s) => lines.push(`| ${s.id} | ${s.name} | ${s.categoryName} |`));

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `场景库导出_${Date.now()}.md`);
};

const exportAsExcel = () => {
  const { totalScenes, totalCategories, categories, scenes } = buildExportData();

  const summarySheet = XLSX.utils.json_to_sheet([{ 场景总数: totalScenes, 分类总数: totalCategories }]);
  const categorySheet = XLSX.utils.json_to_sheet(
    categories.map((c) => ({ 分类名称: c.categoryName, 分类ID: c.categoryId, 场景数量: c.sceneCount }))
  );
  const sceneSheet = XLSX.utils.json_to_sheet(
    scenes.map((s) => ({ 场景ID: s.id, 场景名称: s.name, 所属分类: s.categoryName, 分类ID: s.categoryId }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, '总计');
  XLSX.utils.book_append_sheet(wb, categorySheet, '分类统计');
  XLSX.utils.book_append_sheet(wb, sceneSheet, '场景明细');

  XLSX.writeFile(wb, `场景库导出_${Date.now()}.xlsx`);
};

const makeHeaderCell = (text: string) =>
  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] });
const makeCell = (text: string) => new TableCell({ children: [new Paragraph(text)] });

const exportAsWord = async () => {
  const { totalScenes, totalCategories, categories, scenes } = buildExportData();

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [makeHeaderCell('场景总数'), makeHeaderCell('分类总数')] }),
      new TableRow({ children: [makeCell(String(totalScenes)), makeCell(String(totalCategories))] }),
    ],
  });

  const categoryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [makeHeaderCell('分类名称'), makeHeaderCell('分类 ID'), makeHeaderCell('场景数量')] }),
      ...categories.map(
        (c) => new TableRow({ children: [makeCell(c.categoryName), makeCell(c.categoryId), makeCell(String(c.sceneCount))] })
      ),
    ],
  });

  const sceneTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [makeHeaderCell('场景 ID'), makeHeaderCell('场景名称'), makeHeaderCell('所属分类')] }),
      ...scenes.map(
        (s) => new TableRow({ children: [makeCell(s.id), makeCell(s.name), makeCell(s.categoryName)] })
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: '场景库导出', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '总计', heading: HeadingLevel.HEADING_2 }),
          summaryTable,
          new Paragraph({ text: '分类统计', heading: HeadingLevel.HEADING_2 }),
          categoryTable,
          new Paragraph({ text: '场景明细', heading: HeadingLevel.HEADING_2 }),
          sceneTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `场景库导出_${Date.now()}.docx`);
};

export const exportScenarioLibrary = async (format: ScenarioExportFormat) => {
  switch (format) {
    case 'json':
      return exportAsJSON();
    case 'md':
      return exportAsMarkdown();
    case 'excel':
      return exportAsExcel();
    case 'word':
      return exportAsWord();
  }
};
