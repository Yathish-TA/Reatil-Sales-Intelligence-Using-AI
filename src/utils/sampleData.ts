import * as XLSX from 'xlsx';
import { StoreMasterRecord, WeeklySalesRecord } from '../types/retail';

export const SAMPLE_STORE_MASTER: StoreMasterRecord[] = [
  { store_id: 'STR-101', store_name: 'Metro Flagship Downtown', region: 'North', city: 'New York', store_format: 'Flagship' },
  { store_id: 'STR-102', store_name: 'Midtown Supercenter', region: 'North', city: 'New York', store_format: 'Hypermarket' },
  { store_id: 'STR-103', store_name: 'Brooklyn Express', region: 'North', city: 'New York', store_format: 'Express' },
  { store_id: 'STR-201', store_name: 'Chicago Loop Retail', region: 'Central', city: 'Chicago', store_format: 'Supermarket' },
  { store_id: 'STR-202', store_name: 'Mag Mile Luxury Store', region: 'Central', city: 'Chicago', store_format: 'Flagship' },
  { store_id: 'STR-203', store_name: 'O\'Hare Transit Mart', region: 'Central', city: 'Chicago', store_format: 'Express' },
  { store_id: 'STR-301', store_name: 'LA Sunset Boulevard', region: 'West', city: 'Los Angeles', store_format: 'Flagship' },
  { store_id: 'STR-302', store_name: 'Santa Monica Hub', region: 'West', city: 'Los Angeles', store_format: 'Supermarket' },
  { store_id: 'STR-303', store_name: 'Seattle Tech Plaza', region: 'West', city: 'Seattle', store_format: 'Hypermarket' },
  { store_id: 'STR-401', store_name: 'Dallas Galleria Store', region: 'South', city: 'Dallas', store_format: 'Hypermarket' },
  { store_id: 'STR-402', store_name: 'Houston Galleria Outlet', region: 'South', city: 'Houston', store_format: 'Outlet' },
  { store_id: 'STR-403', store_name: 'Miami Beach Resort Hub', region: 'East', city: 'Miami', store_format: 'Supermarket' },
  { store_id: 'STR-404', store_name: 'Atlanta Peachtree Center', region: 'East', city: 'Atlanta', store_format: 'Supermarket' },
];

const WEEKS = [
  '2026-06-01',
  '2026-06-08',
  '2026-06-15',
  '2026-06-22',
  '2026-06-29',
  '2026-07-06',
  '2026-07-13',
  '2026-07-20',
  '2026-07-27',
];

const CATEGORIES = [
  'Apparel & Fashion',
  'Electronics & Tech',
  'Groceries & Fresh',
  'Home & Living',
  'Beauty & Personal Care',
  'Sports & Fitness',
];

// Generator for deterministic realistic sales data
export function generateSampleWeeklySales(): WeeklySalesRecord[] {
  const records: WeeklySalesRecord[] = [];

  WEEKS.forEach((week) => {
    SAMPLE_STORE_MASTER.forEach((store, storeIdx) => {
      CATEGORIES.forEach((category, catIdx) => {
        // Base multipliers based on store format & category
        let baseFootfall = 1200 + (storeIdx * 210) + (catIdx * 80);
        if (store.store_format === 'Flagship') baseFootfall *= 1.8;
        if (store.store_format === 'Hypermarket') baseFootfall *= 1.5;
        if (store.store_format === 'Express') baseFootfall *= 0.6;

        // Modulators per category
        let pricePerUnit = 45;
        if (category === 'Electronics & Tech') pricePerUnit = 180;
        if (category === 'Beauty & Personal Care') pricePerUnit = 35;
        if (category === 'Groceries & Fresh') pricePerUnit = 18;
        if (category === 'Apparel & Fashion') pricePerUnit = 65;

        const footfall = Math.round(baseFootfall * (0.85 + Math.sin(storeIdx + catIdx + week.length) * 0.25));
        const conversionRate = 0.22 + (catIdx * 0.03) + (storeIdx % 3 * 0.02);
        const transactions = Math.round(footfall * conversionRate);
        const unitsPerTx = 1.8 + (catIdx % 3) * 0.5;
        const units_sold = Math.round(transactions * unitsPerTx);
        
        const gross_sales = Math.round(units_sold * pricePerUnit);
        
        // Discounts
        let discountPct = 0.08 + (catIdx * 0.02);
        if (category === 'Apparel & Fashion') discountPct = 0.18; // Higher discount for apparel
        if (store.store_format === 'Outlet') discountPct += 0.12;
        const discount_amount = Math.round(gross_sales * discountPct);
        const net_sales = gross_sales - discount_amount;

        // Target setting
        const targetMultiplier = (store.store_id === 'STR-103' || store.store_id === 'STR-402') ? 1.25 : 0.95;
        const sales_target = Math.round(net_sales * targetMultiplier);

        // Inventory & Stockouts - intentional risk patterns
        let inventory_on_hand = Math.round(units_sold * (2.5 + Math.cos(storeIdx * catIdx) * 1.2));
        let stockouts = 0;
        
        // High stockout risk for specific stores/categories
        if (store.store_id === 'STR-103' && category === 'Electronics & Tech') {
          stockouts = 28;
          inventory_on_hand = 12;
        } else if (store.store_id === 'STR-402' && category === 'Apparel & Fashion') {
          stockouts = 42;
          inventory_on_hand = 8;
        } else if (store.store_id === 'STR-203' && category === 'Groceries & Fresh') {
          stockouts = 35;
          inventory_on_hand = 15;
        } else if (Math.random() < 0.12) {
          stockouts = Math.floor(Math.random() * 12) + 1;
        }

        // Returns - higher for apparel & electronics
        let returnPct = 0.025;
        if (category === 'Apparel & Fashion') returnPct = 0.085;
        if (category === 'Electronics & Tech') returnPct = 0.052;
        const returns_amount = Math.round(net_sales * returnPct);

        const customer_rating = Number((3.8 + Math.sin(storeIdx + catIdx) * 0.9).toFixed(1));
        const marketing_spend = Math.round(net_sales * 0.04 + 200);

        records.push({
          week_start_date: week,
          region: store.region,
          store_id: store.store_id,
          store_name: store.store_name,
          city: store.city,
          store_format: store.store_format,
          product_category: category,
          footfall,
          transactions,
          units_sold,
          gross_sales,
          discount_amount,
          net_sales,
          sales_target,
          inventory_on_hand,
          stockouts,
          returns_amount,
          customer_rating,
          marketing_spend,
        });
      });
    });
  });

  return records;
}

export const SAMPLE_WEEKLY_SALES = generateSampleWeeklySales();

// Helper to trigger direct browser download of Excel sample files
export function downloadExcelFile(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-fit column widths for cleaner presentation
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}

export function downloadSampleWeeklySalesExcel() {
  downloadExcelFile(SAMPLE_WEEKLY_SALES, 'retail_weekly_sales.xlsx', 'Weekly Sales');
}

export function downloadSampleStoreMasterExcel() {
  downloadExcelFile(SAMPLE_STORE_MASTER, 'store_master.xlsx', 'Store Master');
}
