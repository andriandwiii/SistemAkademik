"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdjustPrintMarginKehadiran({ visible, onHide, data, info }) {
    const [config, setConfig] = useState({ top: 20, left: 15, size: "A4", orient: "portrait" });

    const exportPDF = () => {
        const doc = new jsPDF({ 
            orientation: config.orient, 
            unit: "mm", 
            format: config.size 
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Judul Laporan
        doc.setFontSize(14);
        doc.text("REKAPITULASI KETIDAKHADIRAN SISWA", pageWidth / 2, 15, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Tahun Ajaran: ${info.TAHUN_AJARAN_ID} | Semester: ${info.SEMESTER}`, pageWidth / 2, 22, { align: "center" });
        doc.text(`Kelas: ${info.KELAS_ID}`, pageWidth / 2, 27, { align: "center" });

        autoTable(doc, {
            startY: 35,
            margin: { top: config.top, left: config.left },
            head: [['No', 'NIS', 'Nama Siswa', 'Sakit', 'Izin', 'Alpa']],
            body: data.map((d, i) => [
                i + 1, 
                d.NIS, 
                d.NAMA_SISWA, 
                `${d.SAKIT || 0} hari`, 
                `${d.IZIN || 0} hari`, 
                `${d.ALPA || 0} hari`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [52, 73, 94], halign: 'center' },
            columnStyles: {
                0: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
            }
        });

        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <Dialog visible={visible} onHide={onHide} header="Opsi Cetak Rekap" style={{ width: '400px' }} modal shadow>
            <div className="flex flex-column gap-4">
                <div className="grid">
                    <div className="col-6">
                        <label className="block mb-2 font-semibold">Margin Atas (mm)</label>
                        <InputNumber value={config.top} onValueChange={(e) => setConfig({...config, top: e.value})} showButtons />
                    </div>
                    <div className="col-6">
                        <label className="block mb-2 font-semibold">Margin Kiri (mm)</label>
                        <InputNumber value={config.left} onValueChange={(e) => setConfig({...config, left: e.value})} showButtons />
                    </div>
                </div>
                
                <div>
                    <label className="block mb-2 font-semibold">Ukuran Kertas</label>
                    <Dropdown value={config.size} options={['A4', 'Letter', 'F4']} onChange={(e) => setConfig({...config, size: e.value})} className="w-full" />
                </div>

                <div className="flex gap-2 justify-content-end mt-2">
                    <Button label="Batal" icon="pi pi-times" onClick={onHide} className="p-button-text p-button-secondary" />
                    <Button label="Buka PDF" icon="pi pi-external-link" severity="danger" onClick={exportPDF} />
                </div>
            </div>
        </Dialog>
    );
}