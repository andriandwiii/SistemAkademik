"use client";
import React, { useState } from 'react'; // Hapus useEffect, tidak perlu lagi
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Button } from 'primereact/button';
import 'react-pdf/dist/Page/TextLayer.css';

// Atur worker source di luar komponen, cukup sekali
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewer({ pdfUrl, fileName }) { // Hapus prop 'paperSize'
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0); // Skala default

  // Fungsi untuk mengatur jumlah halaman saat PDF berhasil dimuat
  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setCurrentPage(1); // Selalu kembali ke halaman 1 saat PDF baru dimuat
  }

  const handleFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage !== numPages) {
      setCurrentPage(numPages);
    }
  };

  const handleZoomIn = () => {
    if (scale < 2.0) { // Batasi zoom maks 200%
      setScale(scale + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (scale > 0.5) { // Batasi zoom min 50%
      setScale(scale - 0.1);
    }
  };

  const handleDownloadPDF = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = fileName + '.pdf';
    downloadLink.click();
  };

  // Fungsi print ini akan membuka tab baru untuk print (lebih baik)
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      // Beri sedikit waktu untuk load, lalu panggil print
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  };
  
  // Hapus useEffect yang menghitung 'pageWidth' dan 'pageHeight'
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {pdfUrl && (
        <>
          {/* 1. Toolbar */}
          <div
            style={{
              backgroundColor: '#f0f0f0',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
              position: 'sticky',
              top: '0',
              zIndex: '1000',
              width: '100%',
              textAlign: 'center' // Pusatkan tombol
            }}
          >
            <Button icon="pi pi-angle-double-left" style={{ margin: '5px' }} onClick={handleFirstPage} disabled={currentPage === 1} className="p-button-secondary" />
            <Button icon="pi pi-angle-left" style={{ margin: '5px' }} onClick={handlePrevPage} disabled={currentPage === 1} className="p-button-secondary" />
            <Button icon="pi pi-search-minus" style={{ margin: '5px' }} onClick={handleZoomOut} disabled={scale <= 0.5} className="p-button-info" />
            <Button icon="pi pi-search-plus" style={{ margin: '5px' }} onClick={handleZoomIn} disabled={scale >= 2.0} className="p-button-info" />
            <Button icon="pi pi-angle-right" style={{ margin: '5px' }} onClick={handleNextPage} disabled={!numPages || currentPage === numPages} className="p-button-secondary" />
            <Button icon="pi pi-angle-double-right" style={{ margin: '5px' }} onClick={handleLastPage} disabled={!numPages || currentPage === numPages} className="p-button-secondary" />
            <Button icon="pi pi-download" style={{ margin: '5px' }} onClick={handleDownloadPDF} className="p-button-success" />
            <Button icon="pi pi-print" style={{ margin: '5px' }} onClick={handlePrint} className="p-button-warning" /> 
          </div>

          {/* 2. PDF Viewer Area */}
          <div 
            style={{ 
              overflow: 'auto', 
              flexGrow: 1, // Ambil sisa tinggi
              background: '#525659', // Latar belakang abu-abu tua
              display: 'flex', 
              justifyContent: 'center',
              padding: '20px' // Beri jarak
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error('Error loading PDF:', error.message)}
            >
              {/* Gunakan 'scale' untuk zoom, jangan 'width'/'height' */}
              <Page 
                pageNumber={currentPage} 
                scale={scale}
              />
            </Document>
          </div>

          {/* 3. Page Info Footer */}
          {numPages && (
            <div
              style={{
                textAlign: 'center',
                padding: '5px',
                background: '#f0f0f0',
                color: 'gray',
                fontSize: '12px',
                borderTop: '1px solid #ddd'
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

export default PDFViewer;