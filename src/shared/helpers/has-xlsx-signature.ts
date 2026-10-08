const XLSX_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

export function hasXlsxSignature(buffer: Buffer): boolean {
  return (
    buffer.length >= XLSX_SIGNATURE.length &&
    buffer.subarray(0, XLSX_SIGNATURE.length).equals(XLSX_SIGNATURE)
  );
}
