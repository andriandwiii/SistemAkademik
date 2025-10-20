'use client'

import React, { useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { Toolbar } from 'primereact/toolbar'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function AdjustPrintMarginLaporanJadwal({
  adjustDialog,
  setAdjustDialog,
  dataJadwal = [],
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false)
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: 'A4',
    orientation: 'landscape',
  })

  const paperSizes = [
    { name: 'A4', value: 'A4' },
    { name: 'Letter', value: 'Letter' },
    { name: 'Legal', value: 'Legal' },
  ]

  const orientationOptions = [
    { label: 'Potrait', value: 'portrait' },
    { label: 'Lanskap', value: 'landscape' },
  ]

  const onInputChangeNumber = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value || 0 }))
  }

  const onInputChange = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value }))
  }

  // 🔹 Header laporan
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(41, 128, 185)
    doc.text('SEKOLAH NEGERI 1 MADIUN', pageWidth / 2, marginTop + 5, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text('Jl. Pendidikan No. 10, Kota Madiun, Jawa Timur', pageWidth / 2, marginTop + 12, { align: 'center' })

    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(marginLeft, marginTop + 18, pageWidth - marginRight, marginTop + 18)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(title, pageWidth / 2, marginTop + 25, { align: 'center' })

    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`Dicetak pada: ${today}`, marginLeft, marginTop + 33, { align: 'left' })

    return marginTop + 38
  }

  // 🔸 Export PDF
  async function exportPDF(adjustConfig) {
    const doc = new jsPDF({
      orientation: adjustConfig.orientation,
      unit: 'mm',
      format: adjustConfig.paperSize,
    })

    const marginLeft = parseFloat(adjustConfig.marginLeft)
    const marginTop = parseFloat(adjustConfig.marginTop)
    const marginRight = parseFloat(adjustConfig.marginRight)

    const startY = addHeader(doc, 'LAPORAN JADWAL PELAJARAN', marginLeft, marginTop, marginRight)

    autoTable(doc, {
      startY,
      head: [['ID', 'Kelas', 'Mata Pelajaran', 'Guru', 'Hari', 'Jam Mulai', 'Jam Selesai']],
      body: dataJadwal.map((j) => [
        j.JADWAL_ID,
        j.kelas
          ? `${j.kelas.TINGKATAN} ${j.kelas.NAMA_JURUSAN} ${j.kelas.NAMA_RUANG || '-'}`
          : '-',
        j.mapel
          ? `${j.mapel.KODE_MAPEL || ''} - ${j.mapel.NAMA_MAPEL || ''}`
          : '-',
        j.guru?.NAMA_GURU || '-',
        j.hari?.NAMA_HARI || '-',
        j.JAM_MULAI || '-',
        j.JAM_SELESAI || '-',
      ]),
      margin: { left: marginLeft, right: marginRight },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
    })

    return doc.output('datauristring')
  }

  // 🔸 Export Excel
  const exportExcel = () => {
    const dataForExcel = dataJadwal.map((j) => ({
      ID: j.JADWAL_ID,
      'Kelas': j.kelas
        ? `${j.kelas.TINGKATAN} ${j.kelas.NAMA_JURUSAN} ${j.kelas.NAMA_RUANG || '-'}`
        : '-',
      'Mata Pelajaran': j.mapel
        ? `${j.mapel.KODE_MAPEL || ''} - ${j.mapel.NAMA_MAPEL || ''}`
        : '-',
      'Guru': j.guru?.NAMA_GURU || '-',
      'Hari': j.hari?.NAMA_HARI || '-',
      'Jam Mulai': j.JAM_MULAI || '-',
      'Jam Selesai': j.JAM_SELESAI || '-',
    }))

    const ws = XLSX.utils.json_to_sheet(dataForExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data Jadwal')
    XLSX.writeFile(wb, 'Laporan_Jadwal_Pelajaran.xlsx')
  }

  // 🔸 Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true)
      const pdfDataUrl = await exportPDF(dataAdjust)
      setPdfUrl(pdfDataUrl)
      setFileName('Laporan_Jadwal_Pelajaran')
      setAdjustDialog(false)
      setJsPdfPreviewOpen(true)
    } finally {
      setLoadingExport(false)
    }
  }

  const footer = () => (
    <div className="flex flex-row gap-2">
      <Button
        label="Export Excel"
        icon="pi pi-file-excel"
        severity="success"
        onClick={exportExcel}
      />
      <Button
        label="Export PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        onClick={handleExportPdf}
        loading={loadingExport}
      />
    </div>
  )

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak Laporan Jadwal"
      style={{ width: '50vw' }}
      modal
    >
      <div className="grid p-fluid">
        <div className="col-12 md:col-6">
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Margin (mm)</h5>
            {['Top', 'Bottom', 'Right', 'Left'].map((label) => (
              <div className="col-6 field" key={label}>
                <label>Margin {label}</label>
                <InputNumber
                  value={dataAdjust[`margin${label}`]}
                  onChange={(e) => onInputChangeNumber(e, `margin${label}`)}
                  min={0}
                  suffix=" mm"
                  showButtons
                  className="w-full"
                  inputStyle={{ padding: '0.3rem' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Kertas</h5>
            <div className="col-12 field">
              <label>Ukuran Kertas</label>
              <Dropdown
                value={dataAdjust.paperSize}
                options={paperSizes}
                onChange={(e) => onInputChange(e, 'paperSize')}
                optionLabel="name"
                className="w-full"
              />
            </div>
            <div className="col-12 field">
              <label>Orientasi</label>
              <Dropdown
                value={dataAdjust.orientation}
                options={orientationOptions}
                onChange={(e) => onInputChange(e, 'orientation')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <Toolbar className="py-2 justify-content-end" end={footer} />
    </Dialog>
  )
}
