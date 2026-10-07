import * as XLSX from 'xlsx';

export function excelDateToIso(serial: number): string {
  return XLSX.utils.format_cell({
    t: 'n',
    v: serial,
    z: 'yyyy-mm-dd',
  });
}
