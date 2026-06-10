export function buildCsv<T>(rows: T[][]): string {
  const processRow = (row: T[]) => {
    let finalVal = "";
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] == null ? "" : String(row[j]);

      if (row[j] instanceof Date) {
        innerValue = (row[j] as unknown as Date).toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ",";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  let csvFile = "";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    csvFile += processRow(row);
  }

  return csvFile;
}
