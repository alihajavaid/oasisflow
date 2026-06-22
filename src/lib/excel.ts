import "server-only";
import ExcelJS from "exceljs";

export type ExcelColumn = { header: string; key: string; width?: number };
export type ExcelSheet = { name: string; columns: ExcelColumn[]; rows: Record<string, unknown>[] };

export async function buildExcelResponse(filename: string, sheets: ExcelSheet[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OasisFlow Admin";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name);
    ws.columns = sheet.columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 22 }));
    ws.getRow(1).font = { bold: true };
    ws.addRows(sheet.rows);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** Reads the first worksheet of an uploaded .xlsx file into an array of objects keyed by header text. */
export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as never);
  const ws = workbook.worksheets[0];
  if (!ws) return [];

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim();
  });

  const rows: Record<string, string>[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (!key) return;
      const value = cell.value == null ? "" : String(cell.value).trim();
      if (value) hasValue = true;
      record[key] = value;
    });
    if (hasValue) rows.push(record);
  });

  return rows;
}
