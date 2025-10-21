"use client";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "primereact/button";
import "react-pdf/dist/Page/TextLayer.css";

// Atur worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewerTahunAjaran({ pdfUrl, fileName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setCurrentPage(1);
  }

  const handleFirstPage = () => setCurrentPage(1);
  const handlePrevPage = () =>
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const handleNextPage = () =>
    setCurrentPage((prev) => (prev < numPages ? prev + 1 : prev));
  const handleLastPage = () => setCurrentPage(numPages);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const handleDownloadPDF = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download = fileName + ".pdf";
    downloadLink.click();
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow.onload = function () {
        printWindow.print();
      };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {pdfUrl && (
        <>
          {/* Toolbar Navigasi */}
          <div
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
              position: "sticky",
              top: "0",
              zIndex: "1000",
              width: "100%",
              textAlign: "center",
            }}
          >
            <Button
              icon="pi pi-angle-double-left"
              style={{ margin: "5px" }}
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              className="p-button-secondary"
              tooltip="Halaman Pertama"
            />
            <Button
              icon="pi pi-angle-left"
              style={{ margin: "5px" }}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-button-secondary"
              tooltip="Sebelumnya"
            />
            <Button
              icon="pi pi-search-minus"
              style={{ margin: "5px" }}
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-button-info"
              tooltip="Perkecil"
            />
            <Button
              icon="pi pi-search-plus"
              style={{ margin: "5px" }}
              onClick={handleZoomIn}
              disabled={scale >= 2.0}
              className="p-button-info"
              tooltip="Perbesar"
            />
            <Button
              icon="pi pi-angle-right"
              style={{ margin: "5px" }}
              onClick={handleNextPage}
              disabled={!numPages || currentPage === numPages}
              className="p-button-secondary"
              tooltip="Berikutnya"
            />
            <Button
              icon="pi pi-angle-double-right"
              style={{ margin: "5px" }}
              onClick={handleLastPage}
              disabled={!numPages || currentPage === numPages}
              className="p-button-secondary"
              tooltip="Halaman Terakhir"
            />
            <Button
              icon="pi pi-download"
              style={{ margin: "5px" }}
              onClick={handleDownloadPDF}
              className="p-button-success"
              tooltip="Unduh PDF"
            />
            <Button
              icon="pi pi-print"
              style={{ margin: "5px" }}
              onClick={handlePrint}
              className="p-button-warning"
              tooltip="Cetak"
            />
          </div>

          {/* Area Viewer PDF */}
          <div
            style={{
              overflow: "auto",
              flexGrow: 1,
              background: "#525659",
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) =>
                console.error("Gagal memuat PDF:", error.message)
              }
            >
              <Page pageNumber={currentPage} scale={scale} />
            </Document>
          </div>

          {/* Footer Info Halaman */}
          {numPages && (
            <div
              style={{
                textAlign: "center",
                padding: "5px",
                background: "#f0f0f0",
                color: "gray",
                fontSize: "12px",
                borderTop: "1px solid #ddd",
              }}
            >
              Halaman {currentPage} dari {numPages}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PDFViewerTahunAjaran;
