import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, X } from "lucide-react";
// XLSX loaded from CDN (window.XLSX) — npm package browser bundle corrupts output
const getXLSX = () => window.XLSX;
import GlassCard from "./components/GlassCard";

const entityTypes = [
  { id: "nodes", label: "Nodes", desc: "Suppliers, plants, warehouses, customers", icon: "🏭", fields: "name, type, country, latitude, longitude, capacity_units" },
  { id: "lanes", label: "Lanes", desc: "Transportation routes between nodes", icon: "🚢", fields: "origin, destination, mode, transit_time_days, cost_per_unit" },
  { id: "skus", label: "SKUs", desc: "Product catalog with costs and specs", icon: "📦", fields: "sku_code, description, unit_cost, weight_kg, tariff_code" },
  { id: "demand", label: "Demand", desc: "Forecasted demand by SKU and location", icon: "📈", fields: "sku_code, destination, demand_date, qty_units" },
  { id: "inventory", label: "Inventory", desc: "Stock levels and safety stock", icon: "🏪", fields: "sku_code, node, qty_on_hand, safety_stock_qty" },
  { id: "supplier_skus", label: "Supplier-SKUs", desc: "Supplier capabilities per SKU", icon: "🤝", fields: "supplier, sku_code, lead_time_days, moq, disruption_risk" },
];

// Sample data for Excel generation
const sampleData = {
  nodes: [
    { name: "Shanghai Port", type: "supplier", country: "CN", latitude: 31.23, longitude: 121.47, capacity_units: 20000, capacity_periodicity: "per_week" },
    { name: "Los Angeles Hub", type: "plant", country: "US", latitude: 33.94, longitude: -118.41, capacity_units: 25000, capacity_periodicity: "per_week" },
    { name: "Dallas Warehouse", type: "warehouse", country: "US", latitude: 32.78, longitude: -96.80, capacity_units: 30000, capacity_periodicity: "per_week" },
    { name: "New York Market", type: "customer", country: "US", latitude: 40.71, longitude: -74.01, capacity_units: null, capacity_periodicity: null },
  ],
  lanes: [
    { origin: "Shanghai Port", destination: "Los Angeles Hub", mode: "ocean", transit_time_days: 15, cost_per_unit: 3.80, capacity_units_per_period: 12000 },
    { origin: "Los Angeles Hub", destination: "Dallas Warehouse", mode: "truck", transit_time_days: 2, cost_per_unit: 1.20, capacity_units_per_period: 14000 },
    { origin: "Dallas Warehouse", destination: "New York Market", mode: "truck", transit_time_days: 3, cost_per_unit: 1.40, capacity_units_per_period: 8000 },
  ],
};

export default function DataUpload() {
  const [selectedType, setSelectedType] = useState("nodes");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  const parseExcelFile = useCallback((f) => {
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const X = getXLSX();
        const data = new Uint8Array(e.target.result);
        const workbook = X.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = X.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length < 2) {
          setPreview({ headers: [], rows: [], totalRows: 0, error: "File appears empty" });
          return;
        }

        const headers = json[0].map(String);
        const rows = json.slice(1, 6).map((row) => {
          const obj = {};
          headers.forEach((h, i) => (obj[h] = row[i] !== undefined ? String(row[i]) : ""));
          return obj;
        });

        setPreview({ headers, rows, totalRows: json.length - 1 });
      } catch (err) {
        setPreview({ headers: [], rows: [], totalRows: 0, error: "Could not parse file: " + err.message });
      }
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) parseExcelFile(f);
  }, [parseExcelFile]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleUpload = async () => {
    if (!file || !preview) return;
    setUploading(true);

    // Simulate upload (in production, POST to /api/data-ingestion)
    await new Promise((r) => setTimeout(r, 2000));

    setResult({
      success: true,
      inserted: preview.totalRows,
      entityType: selectedType,
    });
    setUploading(false);
  };

  const downloadSampleExcel = (type) => {
    try {
      const X = getXLSX();
      if (!X) { alert("Excel library not loaded yet. Please wait a moment and try again."); return; }

      const data = sampleData[type] || sampleData.nodes;
      const ws = X.utils.json_to_sheet(data);
      const wb = X.utils.book_new();
      X.utils.book_append_sheet(wb, ws, type);

      // Set column widths
      const colWidths = Object.keys(data[0]).map((key) => ({ wch: Math.max(key.length + 4, 16) }));
      ws["!cols"] = colWidths;

      // Write to array buffer and trigger download via Blob
      const wbout = X.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sample_${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Excel download failed:", err);
      alert("Could not generate Excel file. Error: " + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Data Upload</h1>
        <p>Import your supply chain data via Excel files</p>
      </div>

      {/* Entity Type Selector */}
      <div className="scenario-types" style={{ marginBottom: 20 }}>
        {entityTypes.map((et) => (
          <div
            key={et.id}
            className={`scenario-type-card ${selectedType === et.id ? "selected" : ""}`}
            onClick={() => { setSelectedType(et.id); setFile(null); setPreview(null); setResult(null); }}
          >
            <div className="type-icon">{et.icon}</div>
            <div className="type-name">{et.label}</div>
            <div className="type-desc">{et.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Upload Zone */}
        <div style={{ flex: "1 1 400px" }}>
          <GlassCard style={{ padding: 20 }} accent>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#181818" }}>
                Upload {entityTypes.find((e) => e.id === selectedType)?.label}
              </h3>
              {sampleData[selectedType] && (
                <button className="btn btn-secondary btn-sm" onClick={() => downloadSampleExcel(selectedType)}>
                  <Download size={14} /> Sample Excel
                </button>
              )}
            </div>

            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => e.target.files[0] && parseExcelFile(e.target.files[0])}
              />
              <div className="upload-icon">
                <Upload size={36} />
              </div>
              <h3>Drop Excel file here</h3>
              <p>or click to browse · .xlsx or .xls format</p>
            </div>

            {/* File Info */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mt-4"
                style={{ padding: "10px 12px", background: "#FAFAFB", borderRadius: 8, border: "1px solid #E5E5E5" }}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} style={{ color: "#2E844A" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#181818" }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: "#969492" }}>
                      {(file.size / 1024).toFixed(1)} KB · {preview?.totalRows || 0} rows
                    </p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {/* Upload Button */}
            {file && !result && (
              <button className="btn btn-primary btn-lg w-full mt-4" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "flex" }}>
                      <Upload size={16} />
                    </motion.div>
                    Uploading {preview?.totalRows} rows...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload {preview?.totalRows} rows
                  </>
                )}
              </button>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mt-4"
                  style={{
                    padding: "12px 14px",
                    background: result.success ? "#EBF7EE" : "#FEF1EE",
                    borderRadius: 8,
                    border: `1px solid ${result.success ? "#2E844A30" : "#C2393430"}`,
                  }}
                >
                  {result.success ? (
                    <CheckCircle2 size={18} style={{ color: "#2E844A" }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: "#C23934" }} />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 500, color: result.success ? "#2E844A" : "#C23934" }}>
                    {result.success
                      ? `Successfully imported ${result.inserted} ${result.entityType} records`
                      : "Upload failed — check file format"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Preview */}
        {preview && !preview.error && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ flex: "1 1 400px" }}
          >
            <GlassCard style={{ padding: 20 }} accent>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#181818", marginBottom: 4 }}>Data Preview</h3>
              <p style={{ fontSize: 11, color: "#969492", marginBottom: 12 }}>
                Showing first {preview.rows.length} of {preview.totalRows} rows
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {preview.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i}>
                        {preview.headers.map((h) => (
                          <td key={h}>{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Expected Fields */}
      <GlassCard style={{ padding: 20, marginTop: 20 }} accent>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#181818", marginBottom: 12 }}>Expected Excel Columns</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {entityTypes.map((et) => (
            <div
              key={et.id}
              style={{
                padding: 12,
                borderRadius: 8,
                background: selectedType === et.id ? "#EBF5FE" : "#FAFAFB",
                border: `1px solid ${selectedType === et.id ? "#0176D340" : "#E5E5E5"}`,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: selectedType === et.id ? "#0176D3" : "#181818" }}>
                {et.icon} {et.label}
              </p>
              <p style={{ fontSize: 11, color: "#969492", fontFamily: "monospace" }}>{et.fields}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
