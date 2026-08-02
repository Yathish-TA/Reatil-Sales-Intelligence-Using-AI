import * as XLSX from 'xlsx';
import {
  FileValidationResult,
  MergedSalesRecord,
  StoreMasterRecord,
  WeeklySalesRecord,
} from '../types/retail';

// Required columns definitions
export const REQUIRED_WEEKLY_SALES_COLS = [
  'week_start_date',
  'region',
  'store_id',
  'store_name',
  'city',
  'store_format',
  'product_category',
  'footfall',
  'transactions',
  'units_sold',
  'gross_sales',
  'discount_amount',
  'net_sales',
  'sales_target',
  'inventory_on_hand',
  'stockouts',
  'returns_amount',
  'customer_rating',
  'marketing_spend',
];

export const REQUIRED_STORE_MASTER_COLS = [
  'store_id',
  'store_name',
  'region',
  'city',
  'store_format',
];

// Normalize column keys to lowercase snake_case
function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '_')
    .replace(/[^\w]/g, '');
}

// Convert Excel serial date or date string to YYYY-MM-DD
export function formatExcelDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'number') {
    // Excel date epoch offset
    const dateObj = XLSX.SSF.parse_date_code(value);
    if (dateObj) {
      const yyyy = dateObj.y;
      const mm = String(dateObj.m).padStart(2, '0');
      const dd = String(dateObj.d).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  const dateStr = String(value).trim();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return dateStr;
}

// Helper to convert unknown value to clean number
export function parseNum(val: any, defaultVal = 0): number {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[\$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
}

// Parse Weekly Sales Excel File
export async function parseWeeklySalesFile(
  file: File
): Promise<{ records: WeeklySalesRecord[]; validation: FileValidationResult }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Excel workbook contains no sheets.');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          return resolve({
            records: [],
            validation: {
              isValid: false,
              errors: ['Weekly Sales file is empty.'],
              warnings: [],
              salesCount: 0,
              storesCount: 0,
            },
          });
        }

        // Map row keys
        const normalizedRows = rawJson.map((row) => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            newRow[normalizeKey(k)] = row[k];
          });
          return newRow;
        });

        // Check for required columns
        const firstRowKeys = Object.keys(normalizedRows[0]);
        const missingCols = REQUIRED_WEEKLY_SALES_COLS.filter(
          (col) => !firstRowKeys.includes(col)
        );

        const errors: string[] = [];
        const warnings: string[] = [];

        if (missingCols.length > 0) {
          errors.push(`Missing required columns in Weekly Sales file: ${missingCols.join(', ')}`);
        }

        if (errors.length > 0) {
          return resolve({
            records: [],
            validation: {
              isValid: false,
              errors,
              warnings,
              salesCount: 0,
              storesCount: 0,
            },
          });
        }

        // Process records
        const records: WeeklySalesRecord[] = normalizedRows.map((row, idx) => ({
          id: `wrow-${idx}`,
          week_start_date: formatExcelDate(row.week_start_date),
          region: String(row.region || '').trim(),
          store_id: String(row.store_id || '').trim(),
          store_name: String(row.store_name || '').trim(),
          city: String(row.city || '').trim(),
          store_format: String(row.store_format || '').trim(),
          product_category: String(row.product_category || '').trim(),
          footfall: parseNum(row.footfall),
          transactions: parseNum(row.transactions),
          units_sold: parseNum(row.units_sold),
          gross_sales: parseNum(row.gross_sales),
          discount_amount: parseNum(row.discount_amount),
          net_sales: parseNum(row.net_sales),
          sales_target: parseNum(row.sales_target),
          inventory_on_hand: parseNum(row.inventory_on_hand),
          stockouts: parseNum(row.stockouts),
          returns_amount: parseNum(row.returns_amount),
          customer_rating: parseNum(row.customer_rating, 4.0),
          marketing_spend: parseNum(row.marketing_spend),
        }));

        const uniqueStores = new Set(records.map((r) => r.store_id)).size;

        resolve({
          records,
          validation: {
            isValid: true,
            errors: [],
            warnings,
            salesCount: records.length,
            storesCount: uniqueStores,
          },
        });
      } catch (err: any) {
        resolve({
          records: [],
          validation: {
            isValid: false,
            errors: [`Failed to parse Weekly Sales Excel: ${err.message || 'Unknown error'}`],
            warnings: [],
            salesCount: 0,
            storesCount: 0,
          },
        });
      }
    };

    reader.onerror = () => {
      resolve({
        records: [],
        validation: {
          isValid: false,
          errors: ['Failed to read file buffer from browser.'],
          warnings: [],
          salesCount: 0,
          storesCount: 0,
        },
      });
    };

    reader.readAsBinaryString(file);
  });
}

// Parse Store Master Excel File
export async function parseStoreMasterFile(
  file: File
): Promise<{ masterRecords: StoreMasterRecord[]; validation: FileValidationResult }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Store Master workbook contains no sheets.');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          return resolve({
            masterRecords: [],
            validation: {
              isValid: false,
              errors: ['Store Master file is empty.'],
              warnings: [],
              salesCount: 0,
              storesCount: 0,
            },
          });
        }

        const normalizedRows = rawJson.map((row) => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            newRow[normalizeKey(k)] = row[k];
          });
          return newRow;
        });

        const firstRowKeys = Object.keys(normalizedRows[0]);
        const missingCols = REQUIRED_STORE_MASTER_COLS.filter(
          (col) => !firstRowKeys.includes(col)
        );

        if (missingCols.length > 0) {
          return resolve({
            masterRecords: [],
            validation: {
              isValid: false,
              errors: [`Missing required columns in Store Master file: ${missingCols.join(', ')}`],
              warnings: [],
              salesCount: 0,
              storesCount: 0,
            },
          });
        }

        const masterRecords: StoreMasterRecord[] = normalizedRows.map((row) => ({
          store_id: String(row.store_id || '').trim(),
          store_name: String(row.store_name || '').trim(),
          region: String(row.region || '').trim(),
          city: String(row.city || '').trim(),
          store_format: String(row.store_format || '').trim(),
        }));

        resolve({
          masterRecords,
          validation: {
            isValid: true,
            errors: [],
            warnings: [],
            salesCount: 0,
            storesCount: masterRecords.length,
          },
        });
      } catch (err: any) {
        resolve({
          masterRecords: [],
          validation: {
            isValid: false,
            errors: [`Failed to parse Store Master Excel: ${err.message || 'Unknown error'}`],
            warnings: [],
            salesCount: 0,
            storesCount: 0,
          },
        });
      }
    };

    reader.readAsBinaryString(file);
  });
}

// Join weekly sales records with store master on store_id
export function joinSalesWithStoreMaster(
  weeklySales: WeeklySalesRecord[],
  storeMaster: StoreMasterRecord[]
): MergedSalesRecord[] {
  const storeMap = new Map<string, StoreMasterRecord>();
  storeMaster.forEach((s) => {
    if (s.store_id) {
      storeMap.set(s.store_id.toLowerCase(), s);
    }
  });

  return weeklySales.map((sale) => {
    const matchedMaster = storeMap.get(sale.store_id.toLowerCase());
    
    // Override store details with master if present, or keep sales attributes
    const store_name = matchedMaster?.store_name || sale.store_name;
    const region = matchedMaster?.region || sale.region;
    const city = matchedMaster?.city || sale.city;
    const store_format = matchedMaster?.store_format || sale.store_format;

    // Stockout risk calculation
    const stockouts = sale.stockouts || 0;
    const inventory = sale.inventory_on_hand || 0;
    let risk_level: 'High' | 'Medium' | 'Low' = 'Low';
    let risk_score = 0;

    if (stockouts > 20 || (stockouts > 10 && inventory < 20)) {
      risk_level = 'High';
      risk_score = stockouts * 2 + (50 - Math.min(inventory, 50));
    } else if (stockouts > 5 || (stockouts > 0 && inventory < 30)) {
      risk_level = 'Medium';
      risk_score = stockouts + 10;
    }

    return {
      ...sale,
      store_name,
      region,
      city,
      store_format,
      master_store_name: matchedMaster?.store_name,
      master_region: matchedMaster?.region,
      master_city: matchedMaster?.city,
      master_store_format: matchedMaster?.store_format,
      stockout_risk_level: risk_level,
      stockout_risk_score: risk_score,
    };
  });
}
