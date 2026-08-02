import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  parseStoreMasterFile,
  parseWeeklySalesFile,
  REQUIRED_STORE_MASTER_COLS,
  REQUIRED_WEEKLY_SALES_COLS,
} from '../utils/excelParser';
import {
  downloadSampleStoreMasterExcel,
  downloadSampleWeeklySalesExcel,
} from '../utils/sampleData';
import { StoreMasterRecord, WeeklySalesRecord } from '../types/retail';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUploaded: (
    sales: WeeklySalesRecord[],
    master: StoreMasterRecord[],
    salesFileName: string,
    masterFileName: string
  ) => void;
  currentSalesCount: number;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataUploaded,
  currentSalesCount,
}) => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSalesFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMasterFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleUploadProcess = async () => {
    if (!salesFile && !masterFile) {
      setErrorMsg('Please select at least one Excel file (Retail Weekly Sales or Store Master).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let parsedSales: WeeklySalesRecord[] = [];
    let parsedMaster: StoreMasterRecord[] = [];
    const errors: string[] = [];

    if (salesFile) {
      const salesResult = await parseWeeklySalesFile(salesFile);
      if (!salesResult.validation.isValid) {
        errors.push(...salesResult.validation.errors);
      } else {
        parsedSales = salesResult.records;
      }
    }

    if (masterFile) {
      const masterResult = await parseStoreMasterFile(masterFile);
      if (!masterResult.validation.isValid) {
        errors.push(...masterResult.validation.errors);
      } else {
        parsedMaster = masterResult.masterRecords;
      }
    }

    setLoading(false);

    if (errors.length > 0) {
      setErrorMsg(errors.join(' | '));
      return;
    }

    setSuccessMsg(
      `Upload processed successfully! ${
        parsedSales.length > 0 ? `${parsedSales.length} weekly sales rows loaded.` : ''
      } ${parsedMaster.length > 0 ? `${parsedMaster.length} store master records joined.` : ''}`
    );

    setTimeout(() => {
      onDataUploaded(
        parsedSales,
        parsedMaster,
        salesFile?.name || 'Uploaded_Weekly_Sales.xlsx',
        masterFile?.name || 'Uploaded_Store_Master.xlsx'
      );
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Retail Sales Data</h2>
              <p className="text-xs text-slate-400">Import Excel files (.xlsx / .xls) to populate analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Upload Error</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Success</strong>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Download Sample Excel Templates Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Need standard Excel files to test?</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Download pre-formatted sample Excel workbooks containing required columns and realistic sales data.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadSampleWeeklySalesExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>retail_weekly_sales.xlsx</span>
              </button>
              <button
                type="button"
                onClick={downloadSampleStoreMasterExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>store_master.xlsx</span>
              </button>
            </div>
          </div>

          {/* File Upload Slot 1: Retail Weekly Sales */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              File 1: Retail Weekly Sales Excel (<span className="text-blue-600">retail_weekly_sales.xlsx</span>)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleSalesChange}
                className="hidden"
                id="weekly-sales-upload"
              />
              <label
                htmlFor="weekly-sales-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-7 w-7 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {salesFile ? salesFile.name : 'Click to select or drag & drop Weekly Sales Excel'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Columns: week_start_date, region, store_id, store_name, city, store_format, product_category, footfall, transactions, units_sold, gross_sales, discount_amount, net_sales, sales_target, inventory_on_hand, stockouts, returns_amount...
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* File Upload Slot 2: Store Master */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              File 2: Store Master Excel (<span className="text-indigo-600">store_master.xlsx</span>)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleMasterChange}
                className="hidden"
                id="store-master-upload"
              />
              <label
                htmlFor="store-master-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-7 w-7 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {masterFile ? masterFile.name : 'Click to select or drag & drop Store Master Excel'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Columns: store_id, store_name, region, city, store_format
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Expected Columns Cheat Sheet */}
          <div className="bg-slate-100 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1.5 border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              <span>Data Join & Column Requirements:</span>
            </div>
            <p>
              • Both datasets will be automatically joined on <code className="bg-white px-1 py-0.5 rounded text-slate-800 border">store_id</code>.
            </p>
            <p>
              • Dates in <code className="bg-white px-1 py-0.5 rounded text-slate-800 border">week_start_date</code> should follow YYYY-MM-DD or standard Excel Date format.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadProcess}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Excel...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Process & Update Dashboard</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
