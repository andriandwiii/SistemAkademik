"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

export default function PDFViewer({ pdfUrl, fileName, paperSize = "A4" }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Jika URL PDF berubah, reset status loading dan error
  useEffect(() => {
    if (pdfUrl) {
      setLoading(true);
      setError(null);
    }
  }, [pdfUrl]);

  // Saat iframe selesai memuat
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Jika gagal memuat PDF
  const handleIframeError = () => {
    setLoading(false);
    setError("Gagal memuat PDF");
  };

  // Tombol Download
  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName || "laporan.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
    }
  };

  // Tombol Print
  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  // Jika belum ada file PDF
  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm italic">
          Tidak ada PDF untuk ditampilkan
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-md overflow-hidden border border-gray-200 shadow-sm">
      {/* Toolbar Header */}
      <div className="flex justify-between items-center p-3 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <i className="pi pi-file-pdf text-red-500 text-xl"></i>
          <span className="font-semibold text-gray-700">
            {fileName || "Laporan.pdf"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            label="Download"
            icon="pi pi-download"
            className="p-button-sm p-button-success"
            onClick={handleDownload}
          />
          <Button
            label="Print"
            icon="pi pi-print"
            className="p-button-sm p-button-warning"
            onClick={handlePrint}
          />
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 relative bg-gray-200">
        {/* Spinner Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <ProgressSpinner
              style={{ width: "50px", height: "50px" }}
              strokeWidth="4"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <i className="pi pi-exclamation-triangle text-red-500 text-4xl mb-3"></i>
            <p className="text-gray-700">{error}</p>
          </div>
        )}

        {/* PDF Frame */}
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-full border-0"
          title="PDF Preview"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}
