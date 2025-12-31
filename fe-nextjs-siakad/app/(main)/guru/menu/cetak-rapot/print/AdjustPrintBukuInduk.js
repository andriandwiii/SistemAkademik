import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function AdjustPrintBukuInduk({ visible, onHide, dataRaport }) {
    const printRef = useRef();

    if (!dataRaport) return null;

    const { biodata, akademik, tanda_tangan } = dataRaport;
    const nilaiRaport = akademik?.nilai_raport || {};

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('print-area');
        const opt = {
            margin: 0,
            filename: `Buku_Induk_${biodata?.NAMA || 'Siswa'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // Note: html2pdf harus diimport terlebih dahulu
        // import html2pdf from 'html2pdf.js';
        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        }
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
                
                {/* ================= HALAMAN 1: BUKU INDUK ================= */}
                <div className="sheet">
                    {/* Header */}
                    <div className="header-section">
                        <table style={{ width: '100%', marginBottom: '10px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '80px', verticalAlign: 'top' }}>
                                        <div className="logo-box">LOGO</div>
                                    </td>
                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                        <h4 className="m-0" style={{ fontSize: '11pt' }}>PEMERINTAH PROVINSI JAWA TIMUR</h4>
                                        <h4 className="m-0" style={{ fontSize: '11pt' }}>DINAS PENDIDIKAN</h4>
                                        <h2 className="m-0 font-bold" style={{ fontSize: '16pt', marginTop: '5px' }}>SMA NEGERI 1 MADIUN</h2>
                                        <p className="m-0" style={{ fontSize: '9pt', marginTop: '5px' }}>
                                            Jl. Pendidikan No. 123, Madiun 63137<br/>
                                            Telp. (0351) 123456 | Email: sman1madiun@example.com
                                        </p>
                                    </td>
                                    <td style={{ width: '80px' }}></td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ borderBottom: '3px solid black', marginBottom: '3px' }}></div>
                        <div style={{ borderBottom: '1px solid black', marginBottom: '15px' }}></div>
                    </div>

                    <div className="text-center mb-4">
                        <h2 className="m-0 font-bold" style={{ fontSize: '14pt', textDecoration: 'underline' }}>BUKU INDUK SISWA</h2>
                        <p className="m-0" style={{ fontSize: '10pt', marginTop: '5px' }}>SMA NEGERI 1 MADIUN</p>
                    </div>

                    <div className="grid" style={{ marginTop: '20px' }}>
                        <div className="col-9">
                            <h5 className="section-title">A. KETERANGAN TENTANG DIRI SISWA</h5>
                            <table className="table-biodata">
                                <tbody>
                                    <tr>
                                        <td width="30px" style={{ verticalAlign: 'top' }}>1.</td>
                                        <td width="200px">Nomor Induk Siswa (NIS)</td>
                                        <td>: <strong>{biodata?.NIS}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>2.</td>
                                        <td>Nomor Induk Siswa Nasional (NISN)</td>
                                        <td>: <strong>{biodata?.NISN}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>3.</td>
                                        <td>Nama Lengkap Siswa</td>
                                        <td>: <strong>{biodata?.NAMA}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>4.</td>
                                        <td>Jenis Kelamin</td>
                                        <td>: {biodata?.GENDER === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>5.</td>
                                        <td>Tempat Lahir</td>
                                        <td>: {biodata?.TEMPAT_LAHIR}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>6.</td>
                                        <td>Tanggal Lahir</td>
                                        <td>: {biodata?.TGL_LAHIR || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>7.</td>
                                        <td>Agama</td>
                                        <td>: {biodata?.AGAMA}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>8.</td>
                                        <td>Alamat Lengkap</td>
                                        <td>: {biodata?.ALAMAT}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>9.</td>
                                        <td>Nomor Telepon/HP</td>
                                        <td>: {biodata?.NO_TELP || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>10.</td>
                                        <td>Tahun Masuk</td>
                                        <td>: <strong>{biodata?.TAHUN_MASUK || '2022'}</strong></td>
                                    </tr>
                                </tbody>
                            </table>

                            <h5 className="section-title" style={{ marginTop: '25px' }}>B. KETERANGAN TENTANG ORANG TUA/WALI</h5>
                            <table className="table-biodata">
                                <tbody>
                                    <tr>
                                        <td width="30px" style={{ verticalAlign: 'top' }}>1.</td>
                                        <td width="200px">Nama Ayah Kandung</td>
                                        <td>: {biodata?.NAMA_AYAH}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>2.</td>
                                        <td>Pekerjaan Ayah</td>
                                        <td>: {biodata?.PEKERJAAN_AYAH}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>3.</td>
                                        <td>Nama Ibu Kandung</td>
                                        <td>: {biodata?.NAMA_IBU}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>4.</td>
                                        <td>Pekerjaan Ibu</td>
                                        <td>: {biodata?.PEKERJAAN_IBU}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>5.</td>
                                        <td>Alamat Orang Tua</td>
                                        <td>: {biodata?.ALAMAT_ORTU || biodata?.ALAMAT}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>6.</td>
                                        <td>Nama Wali (jika ada)</td>
                                        <td>: {biodata?.NAMA_WALI || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="col-3">
                            <div className="photo-box">
                                <div style={{ fontSize: '9pt', color: '#999' }}>
                                    PAS FOTO<br/>3 x 4 cm<br/>Berwarna
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px' }}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '50%' }}></td>
                                    <td style={{ width: '50%', textAlign: 'center' }}>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>{tanda_tangan?.titimangsa || 'Madiun, 23 Desember 2025'}</p>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt', marginTop: '5px' }}>Kepala Sekolah,</p>
                                        <div style={{ height: '70px' }}></div>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt', textDecoration: 'underline' }}>
                                            {tanda_tangan?.kepala_sekolah?.nama}
                                        </p>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>NIP. {tanda_tangan?.kepala_sekolah?.nip}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FORCE PAGE BREAK */}
                <div className="page-break"></div>

                {/* ================= HALAMAN 2: RAPOR ================= */}
                <div className="sheet">
                    {/* Header Rapor */}
                    <div className="header-section">
                        <table style={{ width: '100%', marginBottom: '10px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '80px', verticalAlign: 'top' }}>
                                        <div className="logo-box">LOGO</div>
                                    </td>
                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                        <h4 className="m-0" style={{ fontSize: '11pt' }}>PEMERINTAH PROVINSI JAWA TIMUR</h4>
                                        <h4 className="m-0" style={{ fontSize: '11pt' }}>DINAS PENDIDIKAN</h4>
                                        <h2 className="m-0 font-bold" style={{ fontSize: '16pt', marginTop: '5px' }}>SMA NEGERI 1 MADIUN</h2>
                                        <p className="m-0" style={{ fontSize: '9pt', marginTop: '5px' }}>
                                            Jl. Pendidikan No. 123, Madiun 63137<br/>
                                            Telp. (0351) 123456 | Email: sman1madiun@example.com
                                        </p>
                                    </td>
                                    <td style={{ width: '80px' }}></td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ borderBottom: '3px solid black', marginBottom: '3px' }}></div>
                        <div style={{ borderBottom: '1px solid black', marginBottom: '15px' }}></div>
                    </div>

                    <div className="text-center mb-3">
                        <h2 className="m-0 font-bold" style={{ fontSize: '13pt', textDecoration: 'underline' }}>
                            LAPORAN HASIL BELAJAR SISWA
                        </h2>
                    </div>

                    {/* Identitas Siswa */}
                    <table className="table-identitas mb-3">
                        <tbody>
                            <tr>
                                <td width="25%">Nama Siswa</td>
                                <td width="2%">:</td>
                                <td width="40%"><strong>{biodata?.NAMA}</strong></td>
                                <td width="15%">Kelas</td>
                                <td width="2%">:</td>
                                <td><strong>{biodata?.KELAS_AKTIF}</strong></td>
                            </tr>
                            <tr>
                                <td>Nomor Induk / NISN</td>
                                <td>:</td>
                                <td>{biodata?.NIS} / {biodata?.NISN}</td>
                                <td>Semester</td>
                                <td>:</td>
                                <td><strong>{akademik?.semester}</strong></td>
                            </tr>
                            <tr>
                                <td>Nama Sekolah</td>
                                <td>:</td>
                                <td>SMA NEGERI 1 MADIUN</td>
                                <td>Tahun Pelajaran</td>
                                <td>:</td>
                                <td><strong>{akademik?.tahun_ajaran}</strong></td>
                            </tr>
                            <tr>
                                <td>Alamat Sekolah</td>
                                <td>:</td>
                                <td colSpan="4">Jl. Pendidikan No. 123, Madiun</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Tabel Nilai - DENGAN DUA KOLOM NILAI */}
                    <table className="table-nilai">
                        <thead>
                            <tr className="bg-header">
                                <th width="4%" rowSpan="2" className="text-center">No</th>
                                <th width="30%" rowSpan="2">Mata Pelajaran</th>
                                <th width="12%" colSpan="2" className="text-center">Nilai</th>
                                <th width="54%" rowSpan="2">Capaian Kompetensi</th>
                            </tr>
                            <tr className="bg-header">
                                <th className="text-center" style={{ fontSize: '9pt' }}>P</th>
                                <th className="text-center" style={{ fontSize: '9pt' }}>K</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(nilaiRaport).map(([kategori, mapels]) => (
                                <React.Fragment key={kategori}>
                                    <tr className="bg-kategori">
                                        <td colSpan="5" className="font-bold" style={{ paddingLeft: '8px' }}>
                                            {kategori}
                                        </td>
                                    </tr>
                                    {mapels.map((m, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td style={{ paddingLeft: '8px' }}>{m.NAMA_MAPEL}</td>
                                            <td className="text-center font-bold">{m.NILAI_P || '-'}</td>
                                            <td className="text-center font-bold">{m.NILAI_K || '-'}</td>
                                            <td style={{ paddingLeft: '8px', paddingRight: '8px', textAlign: 'justify', fontSize: '9pt', lineHeight: '1.3' }}>
                                                {m.DESKRIPSI_P || `Menunjukkan pemahaman yang baik dalam ${m.NAMA_MAPEL}, mampu menguasai kompetensi dasar dengan sangat memuaskan.`}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Keterangan Nilai */}
                    <div style={{ marginTop: '8px', fontSize: '9pt', fontStyle: 'italic' }}>
                        <strong>Keterangan:</strong> P = Pengetahuan | K = Keterampilan
                    </div>

                    {/* Ketidakhadiran */}
                    <div style={{ marginTop: '15px' }}>
                        <table className="table-kehadiran">
                            <thead>
                                <tr className="bg-header">
                                    <th colSpan="2">KETIDAKHADIRAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td width="70%">Sakit</td>
                                    <td className="text-center">{akademik?.kehadiran?.sakit || 0} hari</td>
                                </tr>
                                <tr>
                                    <td>Izin</td>
                                    <td className="text-center">{akademik?.kehadiran?.izin || 0} hari</td>
                                </tr>
                                <tr>
                                    <td>Tanpa Keterangan</td>
                                    <td className="text-center">{akademik?.kehadiran?.alpa || 0} hari</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Tanda Tangan */}
                    <div style={{ marginTop: '30px' }}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top' }}>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>Mengetahui,</p>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt' }}>Orang Tua/Wali</p>
                                        <div style={{ height: '60px' }}></div>
                                        <p className="m-0" style={{ fontSize: '10pt', borderBottom: '1px solid black', display: 'inline-block', minWidth: '150px' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        </p>
                                    </td>
                                    <td style={{ width: '34%', textAlign: 'center', verticalAlign: 'top' }}>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>{tanda_tangan?.titimangsa || 'Madiun, 23 Desember 2025'}</p>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt' }}>Wali Kelas</p>
                                        <div style={{ height: '60px' }}></div>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt', textDecoration: 'underline' }}>
                                            {tanda_tangan?.wali_kelas?.nama}
                                        </p>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>NIP. {tanda_tangan?.wali_kelas?.nip}</p>
                                    </td>
                                    <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top' }}>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>Mengetahui,</p>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt' }}>Kepala Sekolah</p>
                                        <div style={{ height: '60px' }}></div>
                                        <p className="m-0 font-bold" style={{ fontSize: '10pt', textDecoration: 'underline' }}>
                                            {tanda_tangan?.kepala_sekolah?.nama}
                                        </p>
                                        <p className="m-0" style={{ fontSize: '10pt' }}>NIP. {tanda_tangan?.kepala_sekolah?.nip}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .print-container { 
                    background: #e5e5e5; 
                    padding: 20px 0; 
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
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15); 
                    box-sizing: border-box;
                    position: relative;
                }

                .logo-box {
                    width: 70px;
                    height: 70px;
                    border: 2px solid #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9pt;
                    color: #666;
                    background: #f9f9f9;
                }

                .section-title {
                    font-weight: bold;
                    font-size: 11pt;
                    margin: 15px 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #000;
                }

                .table-biodata {
                    width: 100%;
                    border-collapse: collapse;
                }

                .table-biodata td {
                    padding: 6px 0;
                    font-size: 10pt;
                    line-height: 1.4;
                }

                .photo-box {
                    width: 3cm;
                    height: 4cm;
                    border: 2px solid #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background: #fafafa;
                    margin: 0 auto;
                }

                .table-identitas {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10pt;
                }

                .table-identitas td {
                    padding: 4px 0;
                }

                .table-nilai, .table-kehadiran {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #000;
                }

                .table-nilai th, .table-nilai td,
                .table-kehadiran th, .table-kehadiran td {
                    border: 1px solid #000;
                    padding: 6px;
                    font-size: 10pt;
                }

                .table-kehadiran {
                    width: 100%;
                }

                .bg-header {
                    background: #d9d9d9 !important;
                    font-weight: bold;
                    text-align: center;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .bg-kategori {
                    background: #efefef !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                @media print {
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    
                    body * { 
                        visibility: hidden; 
                    }
                    
                    .print-container, .print-container * { 
                        visibility: visible; 
                    }
                    
                    .print-container { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        background: white; 
                        padding: 0; 
                        gap: 0; 
                    }
                    
                    .sheet { 
                        box-shadow: none; 
                        border: none; 
                        margin: 0; 
                        padding: 15mm; 
                        page-break-after: always !important; 
                        page-break-inside: avoid;
                    }
                    
                    .p-dialog-header, 
                    .p-dialog-footer, 
                    .p-dialog-mask { 
                        display: none !important; 
                    }
                    
                    .page-break { 
                        display: block; 
                        page-break-before: always; 
                        page-break-after: always;
                    }

                    .bg-header, .bg-kategori {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </Dialog>
    );
}