"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import dynamic from "next/dynamic";
import axios from "axios";

import CustomDataTable from "../../../components/DataTable";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import FormBK from "./components/FormBK";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
    () => import("./print/AdjustPrintMarginLaporan"),
    { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MonitoringBKPage() {
    const toastRef = useRef(null);
    const isMounted = useRef(true);

    const [token, setToken] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [dataAbsensi, setDataAbsensi] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [kelasOptions, setKelasOptions] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);

    const [showFormBK, setShowFormBK] = useState(false);
    const [selectedAbsensi, setSelectedAbsensi] = useState(null);

    const [adjustDialog, setAdjustDialog] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
    const [dataAdjust, setDataAdjust] = useState({
        marginTop: 15, marginBottom: 15, marginRight: 10, marginLeft: 10,
        paperSize: "A4", orientation: "portrait",
    });

    const fetchMasterKelas = async (t) => {
        try {
            const res = await axios.get(`${API_URL}/master-kelas`, {
                headers: { Authorization: `Bearer ${t}` }
            });
            const options = res.data.data.map(k => ({ label: k.KELAS_ID, value: k.KELAS_ID }));
            setKelasOptions(options);
        } catch (err) {
            console.error("Gagal load master kelas", err);
        }
    };

    const fetchMonitoring = useCallback(async (t, date, kelasId) => {
        if (!t || !date) return;
        setLoading(true);
        try {
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
            const formattedDate = adjustedDate.toISOString().split("T")[0];

            const params = new URLSearchParams();
            params.append("tanggal", formattedDate);
            if (kelasId) params.append("kelasId", kelasId);

            const res = await axios.get(`${API_URL}/tu-absensi/monitoring?${params.toString()}`, {
                headers: { Authorization: `Bearer ${t}` },
            });

            if (isMounted.current) {
                const rawData = res.data.data || [];
                const filteredData = rawData.filter((item) => 
                    ["ALPA", "IZIN", "SAKIT", "BOLOS"].includes(item.STATUS?.toUpperCase())
                );
                setDataAbsensi(filteredData);
                setOriginalData(filteredData);
            }
        } catch (err) {
            console.error(err);
            toastRef.current?.showToast("01", "Gagal memuat data monitoring");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const profile = JSON.parse(localStorage.getItem("user") || "{}");
        if (!t) { window.location.href = "/"; } 
        else {
            setToken(t);
            setUserProfile(profile);
            fetchMasterKelas(t);
            fetchMonitoring(t, selectedDate, selectedKelas);
        }
        return () => { isMounted.current = false; };
    }, [fetchMonitoring]);

    useEffect(() => {
        if (token) fetchMonitoring(token, selectedDate, selectedKelas);
    }, [selectedDate, selectedKelas, token, fetchMonitoring]);

    const handleSearch = (keyword) => {
        if (!keyword) {
            setDataAbsensi(originalData);
        } else {
            const lowerKeyword = keyword.toLowerCase();
            const filtered = originalData.filter((item) =>
                (item.siswa?.NAMA || item.NAMA || "").toLowerCase().includes(lowerKeyword) ||
                (item.NIS || "").includes(lowerKeyword) ||
                (item.KELAS_ID || "").toLowerCase().includes(lowerKeyword)
            );
            setDataAbsensi(filtered);
        }
    };

    // --- PENGATURAN KOLOM DENGAN UKURAN TETAP ---
    const columns = [
        { 
            header: "Tgl", 
            body: (row) => new Date(row.TANGGAL).toLocaleDateString("id-ID"), 
            style: { width: "10%" } 
        },
        { 
            header: "NIS", 
            body: (row) => row.NIS, 
            style: { width: "10%" } 
        },
        { 
            header: "Nama Siswa", 
            body: (row) => <span className="font-semibold">{row.siswa?.NAMA || row.NAMA}</span>,
            style: { width: "20%" } 
        },
        { 
            header: "Kelas", 
            body: (row) => <span>{row.KELAS_ID}</span>, 
            style: { width: "8%" } 
        },
        { 
            header: "Status", 
            body: (row) => {
                const colors = { ALPA: "danger", IZIN: "info", SAKIT: "warning", BOLOS: "danger" };
                return <Tag value={row.STATUS} severity={colors[row.STATUS] || "secondary"} />;
            },
            style: { width: "10%" } 
        },
        { 
            header: "Catatan BK", 
            body: (row) => (
                <div className="text-sm line-height-2" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {row.CATATAN_BK || <span className="text-400 italic">Belum ada catatan...</span>}
                </div>
            ),
            style: { width: "27%" } 
        },
        { 
            header: "Proses", 
            body: (row) => {
                const isSelesai = row.SUDAH_DITANGGANI === 1;
                return <Tag value={isSelesai ? "Selesai" : "Pending"} severity={isSelesai ? "success" : "danger"} rounded />;
            },
            style: { width: "10%" } 
        },
        { 
            header: "Aksi", 
            body: (row) => (
                <Button 
                    icon="pi pi-shield" 
                    className="p-button-rounded p-button-warning p-button-text" 
                    onClick={() => { setSelectedAbsensi(row); setShowFormBK(true); }} 
                />
            ), 
            style: { width: "5%", textAlign: 'center' } 
        },
    ];

    return (
        <div className="card border-none shadow-none p-0">
            <ToastNotifier ref={toastRef} />
            <ConfirmDialog />

            <h3 className="text-xl font-bold mb-4" style={{ color: '#334155' }}>Monitoring BK</h3>

            <div className="flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
                <div className="flex flex-wrap align-items-end gap-2">
                    <Calendar value={selectedDate} onChange={(e) => setSelectedDate(e.value)} dateFormat="yy-mm-dd" showIcon className="w-10rem" />
                    <Dropdown value={selectedKelas} options={kelasOptions} onChange={(e) => setSelectedKelas(e.value)} placeholder="Kelas" showClear className="w-9rem" />
                    <Button icon="pi pi-refresh" severity="secondary" onClick={() => fetchMonitoring(token, selectedDate, selectedKelas)} loading={loading} />
                </div>
                <div className="flex gap-2">
                    <Button icon="pi pi-print" severity="warning" onClick={() => setAdjustDialog(true)} />
                    <HeaderBar onSearch={handleSearch} hideAddButton={true} />
                </div>
            </div>

            <CustomDataTable
                data={dataAbsensi}
                loading={loading}
                columns={columns}
                paginator
                rows={10}
                stripedRows
                responsiveLayout="scroll"
                className="mt-2 text-sm"
            />

            {showFormBK && (
                <FormBK
                    visible={showFormBK}
                    onHide={() => { setShowFormBK(false); setSelectedAbsensi(null); }}
                    editData={selectedAbsensi}
                    token={token}
                    userProfile={userProfile}
                    onSaveSuccess={() => {
                        fetchMonitoring(token, selectedDate, selectedKelas);
                        setShowFormBK(false);
                    }}
                />
            )}

            <AdjustPrintMarginLaporan
                adjustDialog={adjustDialog} setAdjustDialog={setAdjustDialog}
                dataMonitoring={dataAbsensi} setPdfUrl={setPdfUrl}
                setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen}
                dataAdjust={dataAdjust} setDataAdjust={setDataAdjust}
            />

            <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} header="Preview" style={{ width: "80vw", height: "90vh" }} modal>
                <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
            </Dialog>
        </div>
    );
}