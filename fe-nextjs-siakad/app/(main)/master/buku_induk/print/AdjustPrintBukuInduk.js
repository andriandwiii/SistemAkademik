import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import html2pdf from 'html2pdf.js';

export default function AdjustPrintBukuInduk({ visible, onHide, dataRaport }) {
    const printRef = useRef();

    if (!dataRaport) return null;

    const { biodata, akademik, tanda_tangan } = dataRaport;
    const nilaiRaport = akademik?.nilai_raport || {};

    // Fungsi Cetak Browser
    const handlePrint = () => {
        window.print();
    };

    // Fungsi Download PDF (Anti Terpotong)
    const handleDownloadPDF = () => {
        const element = document.getElementById('print-area');
        const opt = {
            margin: 0,
            filename: `Buku_Induk_${biodata?.NAMA || 'Siswa'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <Dialog 
            header="Preview Buku Induk Siswa" 
            visible={visible} 
            style={{ width: '95vw' }} 
            onHide={onHide}
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button label="Tutup" icon="pi pi-times" className="p-button-text" onClick={onHide} />
                    <Button label="Download PDF" icon="pi pi-download" severity="info" onClick={handleDownloadPDF} />
                    <Button label="Cetak Sekarang" icon="pi pi-print" severity="success" onClick={handlePrint} />
                </div>
            }
        >
            <div id="print-area" className="print-container" ref={printRef}>
                
                {/* ================= HALAMAN 1 ================= */}
                <div className="sheet">
                    <div className="text-center mb-6">
                        <h2 className="m-0 uppercase font-bold" style={{ fontSize: '16pt' }}>BUKU INDUK SISWA</h2>
                        <h3 className="m-0 uppercase font-bold" style={{ fontSize: '14pt' }}>SMA NEGERI 2 CONTOH RAPOR</h3>
                    </div>

                    <div className="flex justify-content-between mb-4 font-bold" style={{ fontSize: '11pt', borderBottom: '2px solid black', paddingBottom: '5px' }}>
                        <span>Nomor Induk : {biodata?.NIS}</span>
                        <span>NISN : {biodata?.NISN}</span>
                        <span>Thn Masuk : {biodata?.TAHUN_MASUK || '2022'}</span>
                    </div>

                    <div className="grid">
                        <div className="col-9">
                            <h5 className="font-bold mb-2 section-title">A. KETERANGAN SISWA</h5>
                            <table className="table-borderless">
                                <tbody>
                                    <tr><td width="30px">1.</td><td width="200px">Nama Siswa</td><td>: <strong>{biodata?.NAMA}</strong></td></tr>
                                    <tr><td>2.</td><td>Jenis Kelamin</td><td>: {biodata?.JENIS_KELAMIN === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                                    <tr><td>3.</td><td>Tempat, Tanggal Lahir</td><td>: {biodata?.TEMPAT_LAHIR}, {biodata?.TANGGAL_LAHIR}</td></tr>
                                    <tr><td>4.</td><td>Agama</td><td>: {biodata?.AGAMA}</td></tr>
                                    <tr><td>5.</td><td>Alamat</td><td>: {biodata?.ALAMAT}</td></tr>
                                    <tr><td>6.</td><td>Nomor Telepon</td><td>: {biodata?.NO_TELP || '-'}</td></tr>
                                </tbody>
                            </table>

                            <h5 className="font-bold mt-6 mb-2 section-title">B. KETERANGAN ORANG TUA/WALI</h5>
                            <table className="table-borderless">
                                <tbody>
                                    <tr><td width="30px">1.</td><td width="200px">Nama Ayah / Ibu</td><td>: {biodata?.NAMA_AYAH} / {biodata?.NAMA_IBU}</td></tr>
                                    <tr><td>2.</td><td>Pekerjaan Ayah / Ibu</td><td>: {biodata?.PEKERJAAN_AYAH} / {biodata?.PEKERJAAN_IBU}</td></tr>
                                    <tr><td>3.</td><td>Alamat Orangtua</td><td>: {biodata?.ALAMAT_ORTU || biodata?.ALAMAT}</td></tr>
                                    <tr><td>4.</td><td>Nama Wali</td><td>: {biodata?.NAMA_WALI || '-'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="col-3 text-center">
                            <div className="photo-box">
                                PAS FOTO<br/>3 X 4
                            </div>
                        </div>
                    </div>

                    <div className="signature-wrapper">
                        <div className="signature-box">
                            <p>{tanda_tangan?.titimangsa || 'Madiun, 23 Desember 2025'}</p>
                            <p className="font-bold">Kepala Sekolah,</p>
                            <div className="spacer"></div>
                            <p className="font-bold underline">{tanda_tangan?.kepala_sekolah?.nama}</p>
                            <p>NIP. {tanda_tangan?.kepala_sekolah?.nip}</p>
                        </div>
                    </div>
                </div>

                {/* FORCE PAGE BREAK */}
                <div className="page-break"></div>

                {/* ================= HALAMAN 2 ================= */}
                <div className="sheet">
                    <div className="text-center mb-4">
                        <h3 className="m-0 uppercase font-bold">HASIL BELAJAR SISWA (RAPOR)</h3>
                    </div>

                    <table className="table-header-raport mb-4">
                        <tbody>
                            <tr>
                                <td className="bg-gray-100 font-bold" width="15%">NAMA</td><td width="35%">{biodata?.NAMA}</td>
                                <td className="bg-gray-100 font-bold" width="15%">KELAS</td><td>{biodata?.KELAS_AKTIF}</td>
                            </tr>
                            <tr>
                                <td className="bg-gray-100 font-bold">NIS / NISN</td><td>{biodata?.NIS} / {biodata?.NISN}</td>
                                <td className="bg-gray-100 font-bold">SEMESTER</td><td>{akademik?.semester} / {akademik?.tahun_ajaran}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="table-nilai-komplit">
                        <thead>
                            <tr className="bg-gray-100 text-center">
                                <th width="5%">NO</th>
                                <th width="25%">MATA PELAJARAN</th>
                                <th width="8%">NILAI</th>
                                <th width="62%">DESKRIPSI KEMAJUAN BELAJAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(nilaiRaport).map(([kategori, mapels]) => (
                                <React.Fragment key={kategori}>
                                    <tr className="bg-gray-200 font-bold">
                                        <td colSpan="4" className="pl-2">{kategori}</td>
                                    </tr>
                                    {mapels.map((m, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td>{m.NAMA_MAPEL}</td>
                                            <td className="text-center font-bold">{m.NILAI_P}</td>
                                            <td className="text-justify p-2" style={{ fontSize: '9pt', lineHeight: '1.2' }}>
                                                {m.DESKRIPSI_P || `Menunjukkan kompetensi yang sangat baik dalam mata pelajaran ${m.NAMA_MAPEL}`}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-content-between mt-6">
                        <table className="table-absen" style={{ width: '250px' }}>
                            <thead>
                                <tr className="bg-gray-100"><th colSpan="2">Ketidakhadiran</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Sakit</td><td className="text-center">{akademik?.kehadiran?.sakit || 0} hari</td></tr>
                                <tr><td>Izin</td><td className="text-center">{akademik?.kehadiran?.izin || 0} hari</td></tr>
                                <tr><td>Tanpa Keterangan</td><td className="text-center">{akademik?.kehadiran?.alpa || 0} hari</td></tr>
                            </tbody>
                        </table>

                        <div className="signature-box-small text-center">
                            <p className="font-bold">Wali Kelas,</p>
                            <div className="spacer-small"></div>
                            <p className="font-bold underline">{tanda_tangan?.wali_kelas?.nama}</p>
                            <p>NIP. {tanda_tangan?.wali_kelas?.nip}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* TAMPILAN LAYAR PREVIEW */
                .print-container { 
                    background: #e0e0e0; 
                    padding: 30px 0; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 20px;
                    font-family: 'Times New Roman', Times, serif;
                }
                .sheet { 
                    background: white; 
                    width: 210mm; 
                    min-height: 297mm; 
                    padding: 20mm; 
                    box-shadow: 0 0 15px rgba(0,0,0,0.2); 
                    box-sizing: border-box;
                    position: relative;
                }

                /* CSS KHUSUS CETAK */
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 0; gap: 0; }
                    .sheet { box-shadow: none; border: none; margin: 0; padding: 15mm; page-break-after: always !important; }
                    .p-dialog-header, .p-dialog-footer, .p-dialog-mask { display: none !important; }
                    .page-break { display: block; page-break-before: always; }
                }

                /* STYLING KONTEN */
                .section-title { border-bottom: 1px solid #333; padding-bottom: 3px; margin-top: 15px; }
                .table-borderless { width: 100%; border-collapse: collapse; }
                .table-borderless td { padding: 8px 0; vertical-align: top; font-size: 11pt; }
                
                .photo-box { 
                    width: 3cm; height: 4cm; 
                    border: 1px solid black; 
                    margin: 20px auto; 
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10pt; color: #666;
                }

                .table-header-raport, .table-nilai-komplit, .table-absen { 
                    width: 100%; border-collapse: collapse; border: 2px solid black; 
                }
                .table-header-raport td, .table-nilai-komplit th, .table-nilai-komplit td, .table-absen td, .table-absen th { 
                    border: 1px solid black; padding: 6px; font-size: 10pt;
                }

                .signature-wrapper { margin-top: 50px; display: flex; justify-content: flex-end; }
                .signature-box { text-align: center; width: 300px; }
                .spacer { height: 80px; }
                .spacer-small { height: 60px; }
                .bg-gray-100 { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
                .bg-gray-200 { background-color: #e5e5e5 !important; -webkit-print-color-adjust: exact; }
            `}</style>
        </Dialog>
    );
}