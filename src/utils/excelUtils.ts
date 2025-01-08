import * as XLSX from "xlsx";

export const readExcelFile = async (filePath: string): Promise<any[]> => {
  try {
    const fileData = await window.fs.readFile(filePath);
    const workbook = XLSX.read(fileData, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw error;
  }
};
