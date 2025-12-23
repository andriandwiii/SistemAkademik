/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";

// IMPORT KOMPONEN PRINTER
// Pastikan path filenya benar: /app/siswa/entry-nilai/print/AdjustPrintBukuInduk.js
import AdjustPrintBukuInduk from "./print/AdjustPrintBukuInduk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryNilaiPage() {
    const toast = useRef(null);

    // =============================== STATE =====================================
    const [filters, setFilters] = useState({
        TAHUN_AJARAN_ID: "",
        TINGKATAN_ID: "",
        JURUSAN_ID: "",
        KELAS_ID: "",
        NIS: ""
    });

    const [opsiTahun, setOpsiTahun] = useState([]);
    const [opsiTingkat, setOpsiTingkat] = useState([]);
    const [opsiJurusan, setOpsiJurusan] = useState([]);
    const [opsiKelas, setOpsiKelas] = useState([]);
    const [opsiSiswa, setOpsiSiswa] = useState([]);

    const [loadingPrint, setLoadingPrint] = useState(false);
    const [raportData, setRaportData] = useState(null);
    const [showPrintDialog, setShowPrintDialog] = useState(false);

    // =============================== LOAD MASTER ================================
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [resThn, resTkt, resJur] = await Promise.all([
                    fetch(`${API_URL}/master-tahun-ajaran`).then(r => r.json()),
                    fetch(`${API_URL}/master-tingkatan`).then(r => r.json()),
                    fetch(`${API_URL}/master-jurusan`).then(r => r.json())
                ]);

                setOpsiTahun((resThn.data || []).map(i => ({ label: i.NAMA_TAHUN_AJARAN, value: i.TAHUN_AJARAN_ID })));
                setOpsiTingkat((resTkt.data || []).map(i => ({ label: i.TINGKATAN || i.NAMA_TINGKATAN, value: i.TINGKATAN_ID })));
                setOpsiJurusan((resJur.data || []).map(i => ({ label: i.NAMA_JURUSAN, value: i.JURUSAN_ID })));
            } catch (e) {
                console.error("Load Master Error:", e);
            }
        };
        loadInitialData();
    }, []);

    // =============================== LOAD KELAS =================================
    useEffect(() => {
        const loadKelas = async () => {
            if (!filters.TAHUN_AJARAN_ID) return;
            try {
                const res = await fetch(`${API_URL}/transaksi-siswa`).then(r => r.json());
                const uniqueKelas = [];
                const seen = new Set();

                (res.data || []).filter(trx => trx.tahun_ajaran?.TAHUN_AJARAN_ID === filters.TAHUN_AJARAN_ID).forEach(trx => {
                    if (trx.kelas && !seen.has(trx.kelas.KELAS_ID)) {
                        seen.add(trx.kelas.KELAS_ID);
                        uniqueKelas.push({
                            KELAS_ID: trx.kelas.KELAS_ID,
                            TINGKATAN_ID: trx.tingkatan?.TINGKATAN_ID,
                            JURUSAN_ID: trx.jurusan?.JURUSAN_ID,
                            NAMA_RUANG: trx.kelas.NAMA_RUANG
                        });
                    }
                });
                setOpsiKelas(uniqueKelas);
            } catch (e) { console.error(e); }
        };
        loadKelas();
    }, [filters.TAHUN_AJARAN_ID]);

    // Filter Kelas Dropdown berdasarkan Tingkat/Jurusan
    const kelasOptions = opsiKelas.filter(k =>
        (!filters.TINGKATAN_ID || k.TINGKATAN_ID === filters.TINGKATAN_ID) &&
        (!filters.JURUSAN_ID || k.JURUSAN_ID === filters.JURUSAN_ID)
    ).map(k => ({ label: `${k.KELAS_ID} ${k.NAMA_RUANG || ''}`, value: k.KELAS_ID }));

    // =============================== LOAD SISWA =================================
    useEffect(() => {
        const loadSiswa = async () => {
            if (!filters.KELAS_ID || !filters.TAHUN_AJARAN_ID) {
                setOpsiSiswa([]);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/transaksi-siswa`).then(r => r.json());
                const filteredSiswa = (res.data || [])
                    .filter(trx => trx.kelas?.KELAS_ID === filters.KELAS_ID && trx.tahun_ajaran?.TAHUN_AJARAN_ID === filters.TAHUN_AJARAN_ID)
                    .map(s => ({
                        label: `${s.siswa?.NIS} - ${s.siswa?.NAMA}`,
                        value: s.siswa?.NIS
                    }));
                setOpsiSiswa(filteredSiswa);
            } catch (e) { console.error(e); }
        };
        loadSiswa();
    }, [filters.KELAS_ID, filters.TAHUN_AJARAN_ID]);

    // =============================== HANDLE PRINT ===============================
    const handleGenerateRaport = async () => {
        if (!filters.NIS) return;

        setLoadingPrint(true);
        try {
            const url = `${API_URL}/buku-induk/generate?nis=${filters.NIS}&tahun_ajaran_id=${filters.TAHUN_AJARAN_ID}&semester=1`;
            const response = await fetch(url);
            const resJson = await response.json();

            if (resJson.status === "00") {
                setRaportData(resJson.data);
                setShowPrintDialog(true);
            } else {
                toast.current.show({ severity: 'error', summary: 'Gagal', detail: resJson.message || 'Data raport tidak ditemukan' });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Server Error', detail: 'Tidak bisa menghubungi server' });
        } finally {
            setLoadingPrint(false);
        }
    };

    return (
        <div className="flex justify-content-center p-4">
            <Toast ref={toast} />

            <div className="col-12 md:col-9">
                <Card className="shadow-4 border-round-xl">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-print text-primary text-4xl mr-3"></i>
                        <div>
                            <h3 className="m-0 text-900 font-bold">Cetak Laporan Raport</h3>
                            <small className="text-600">Pilih kriteria untuk mencetak raport atau buku induk siswa</small>
                        </div>
                    </div>

                    <Divider />

                    <div className="p-fluid grid">
                        <div className="field col-12 md:col-6">
                            <label className="font-bold">Tahun Ajaran</label>
                            <Dropdown value={filters.TAHUN_AJARAN_ID} options={opsiTahun} 
                                onChange={(e) => setFilters({ ...filters, TAHUN_AJARAN_ID: e.value, KELAS_ID: "", NIS: "" })} 
                                placeholder="Pilih Tahun Ajaran" 
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label className="font-bold text-500">Tingkat (Opsional)</label>
                            <Dropdown value={filters.TINGKATAN_ID} options={opsiTingkat} 
                                onChange={(e) => setFilters({ ...filters, TINGKATAN_ID: e.value, KELAS_ID: "", NIS: "" })} 
                                placeholder="Semua" showClear 
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label className="font-bold text-500">Jurusan (Opsional)</label>
                            <Dropdown value={filters.JURUSAN_ID} options={opsiJurusan} 
                                onChange={(e) => setFilters({ ...filters, JURUSAN_ID: e.value, KELAS_ID: "", NIS: "" })} 
                                placeholder="Semua" showClear 
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-bold">Kelas</label>
                            <Dropdown value={filters.KELAS_ID} options={kelasOptions} 
                                onChange={(e) => setFilters({ ...filters, KELAS_ID: e.value, NIS: "" })} 
                                placeholder="Pilih Kelas" 
                                disabled={!filters.TAHUN_AJARAN_ID} 
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-bold text-primary">Pilih Siswa</label>
                            <Dropdown 
                                value={filters.NIS} 
                                options={opsiSiswa} 
                                onChange={(e) => setFilters({ ...filters, NIS: e.value })} 
                                placeholder="Ketik NIS atau Nama Siswa" 
                                filter 
                                disabled={!filters.KELAS_ID}
                            />
                        </div>
                    </div>

                    <Divider className="mt-4" />

                    <div className="flex justify-content-end">
                        <Button 
                            label="Generate Preview Raport" 
                            icon={loadingPrint ? "pi pi-spin pi-spinner" : "pi pi-file-pdf"} 
                            className="p-button-raised p-button-primary p-button-lg px-6" 
                            onClick={handleGenerateRaport} 
                            disabled={loadingPrint || !filters.NIS}
                        />
                    </div>
                </Card>
            </div>

            {/* KOMPONEN MODAL PREVIEW */}
            {raportData && (
                <AdjustPrintBukuInduk
                    visible={showPrintDialog}
                    onHide={() => {
                        setShowPrintDialog(false);
                        setRaportData(null);
                    }}
                    dataRaport={raportData} 
                />
            )}
        </div>
    );
}