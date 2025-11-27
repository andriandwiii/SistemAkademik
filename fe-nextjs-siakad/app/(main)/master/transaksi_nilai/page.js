"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import dynamic from "next/dynamic";
import AdjustPrintMarginLaporanNilai from "./print/AdjustPrintMarginLaporanNilai";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex justify-center p-4">
      <ProgressSpinner />
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryNilaiPage() {
  const toast = useRef(null);

  // =============================== FILTERS =====================================
  const [filters, setFilters] = useState({
    TAHUN: "",
    TINGKAT: "",
    JURUSAN: null,
    KELAS: "",
    MAPEL: "",
  });

  // =============================== DATA NILAI ==================================
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({
    kkm: 75,
    deskripsi_template: {},
  });

  // =============================== MASTER OPSI ==================================
  const [opsi, setOpsi] = useState({
    tahun: [],
    tingkat: [],
    jurusan: [],
    kelas: [],
    mapel: [],
  });

  const [loading, setLoading] = useState(false);

  // =============================== PRINT ========================================
  const [printDialog, setPrintDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // =============================== EDIT FORM ====================================
  const [editDialog, setEditDialog] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // ============================ LOAD MASTER DATA ===============================
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [thn, tkt, jur, kls, mpl] = await Promise.all([
          axios.get(`${API_URL}/master-tahun-ajaran`),
          axios.get(`${API_URL}/master-tingkatan`),
          axios.get(`${API_URL}/master-jurusan`),
          axios.get(`${API_URL}/master-kelas`),
          axios.get(`${API_URL}/master-mata-pelajaran`),
        ]);

        setOpsi({
          tahun: thn.data.data.map((i) => ({
            label: i.NAMA_TAHUN_AJARAN,
            value: i.TAHUN_AJARAN_ID,
          })),
          tingkat: tkt.data.data.map((i) => ({
            label: i.TINGKATAN,
            value: i.TINGKATAN_ID,
          })),
          jurusan: jur.data.data.map((i) => ({
            label: i.NAMA_JURUSAN,
            value: i.JURUSAN_ID,
          })),
          kelas: kls.data.data.map((i) => ({
            label: `${i.KELAS_ID} (R. ${i.NAMA_RUANG || "-"})`,
            value: i.KELAS_ID,
          })),
          mapel: mpl.data.data.map((i) => ({
            label: i.NAMA_MAPEL,
            value: i.KODE_MAPEL,
          })),
        });
      } catch (e) {
        console.error(e);
      }
    };

    loadMaster();
  }, []);

  // ============================ LOAD NILAI ===================================
  const fetchEntryData = async () => {
    if (!filters.TAHUN || !filters.KELAS || !filters.MAPEL) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-nilai`, {
        params: {
          kelasId: filters.KELAS,
          mapelId: filters.MAPEL,
          tahunId: filters.TAHUN,
        },
      });

      setStudents(res.data.data);
      setMeta(res.data.meta);

      toast.current.show({
        severity: "success",
        summary: "Loaded",
        detail: `KKM: ${res.data.meta.kkm}`,
      });
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal load nilai",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntryData();
  }, [filters.TAHUN, filters.KELAS, filters.MAPEL]);

  // ========================== UPDATE SATU SISWA ================================
  const updateSingle = async () => {
    try {
      await axios.put(`${API_URL}/transaksi-nilai/${editRow.id}`, editRow);

      toast.current.show({
        severity: "success",
        summary: "Update",
        detail: "Nilai berhasil diperbarui",
      });

      setEditDialog(false);
      fetchEntryData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal update nilai",
      });
    }
  };

  // ============================ DELETE SATU SISWA =============================
  const deleteSingle = (row) => {
    confirmDialog({
      message: `Hapus nilai siswa ${row.nama}?`,
      header: "Konfirmasi",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/transaksi-nilai/${row.id}`);

          toast.current.show({
            severity: "success",
            summary: "Hapus",
            detail: "Nilai dihapus",
          });

          fetchEntryData();
        } catch (e) {
          toast.current.show({
            severity: "error",
            summary: "Gagal",
            detail: "Tidak bisa menghapus",
          });
        }
      },
    });
  };

  // ============================== PREDIKAT ====================================
  const getPredikat = (v) => {
    if (v === null || v === "") return "-";

    const k = meta.kkm;
    const interval = (100 - k) / 3;

    if (v < k) return "D";
    if (v < k + interval) return "C";
    if (v < k + interval * 2) return "B";
    return "A";
  };

  // ============================== TEMPLATE INPUT ===============================
  const onValChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const inputTpl = (row, field) => (
    <InputNumber
      value={row[field]}
      onValueChange={(e) => onValChange(row.id, field, e.value)}
      min={0}
      max={100}
      className="w-full text-center"
    />
  );

  const predTpl = (row, field) => {
    const p = getPredikat(row[field]);
    return (
      <Tag
        value={p}
        severity={
          p === "A"
            ? "success"
            : p === "B"
            ? "info"
            : p === "C"
            ? "warning"
            : "danger"
        }
      />
    );
  };

  const deskTpl = (row, field) => {
    const p = getPredikat(row[field]);
    return <small>{meta.deskripsi_template[p] || "-"}</small>;
  };

  // ============================== ACTION COLUMN ===============================
  const actionTpl = (row) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        severity="warning"
        size="small"
        onClick={() => {
          setEditRow({ ...row });
          setEditDialog(true);
        }}
      />

      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        onClick={() => deleteSingle(row)}
      />
    </div>
  );

  // ============================== SAVE ALL ====================================
  const saveAll = async () => {
    try {
      await axios.post(`${API_URL}/transaksi-nilai/save-all`, {
        data: students,
        filters,
      });

      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Semua nilai tersimpan",
      });
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Tidak bisa menyimpan nilai",
      });
    }
  };

  // =============================== RENDER ====================================
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ============================ FILTER KOMPONEN ============================ */}
      <div className="card mb-4 p-4 bg-white shadow-sm border-round grid md:grid-cols-5 gap-4">

        {/* Tahun Ajaran */}
        <div>
          <label className="font-medium text-sm">Tahun Ajaran</label>
          <Dropdown
            value={filters.TAHUN}
            options={opsi.tahun}
            onChange={(e) =>
              setFilters({ ...filters, TAHUN: e.value })
            }
            placeholder="Pilih Tahun"
            className="w-full"
          />
        </div>

        {/* Tingkat */}
        <div>
          <label className="font-medium text-sm">Tingkat</label>
          <Dropdown
            value={filters.TINGKAT}
            options={opsi.tingkat}
            onChange={(e) =>
              setFilters({ ...filters, TINGKAT: e.value })
            }
            placeholder="Pilih Tingkat"
            className="w-full"
          />
        </div>

        {/* Jurusan */}
        <div>
          <label className="font-medium text-sm">Jurusan</label>
          <Dropdown
            value={filters.JURUSAN}
            options={opsi.jurusan}
            onChange={(e) =>
              setFilters({ ...filters, JURUSAN: e.value })
            }
            placeholder="Pilih Jurusan"
            className="w-full"
          />
        </div>

        {/* Kelas */}
        <div>
          <label className="font-medium text-sm">Kelas</label>
          <Dropdown
            value={filters.KELAS}
            options={opsi.kelas}
            onChange={(e) =>
              setFilters({ ...filters, KELAS: e.value })
            }
            placeholder="Pilih Kelas"
            className="w-full"
          />
        </div>

        {/* Mapel */}
        <div>
          <label className="font-medium text-sm">Mata Pelajaran</label>
          <Dropdown
            value={filters.MAPEL}
            options={opsi.mapel}
            onChange={(e) =>
              setFilters({ ...filters, MAPEL: e.value })
            }
            placeholder="Pilih Mapel"
            className="w-full"
            filter
          />
        </div>
      </div>

      {/* =============================== TABLE ================================ */}
      {students.length > 0 && (
        <div className="card bg-white shadow-1 border-round">

          <Toolbar
            right={
              <div className="flex gap-2">
                <Button
                  label="Cetak / Export"
                  icon="pi pi-print"
                  onClick={() => setPrintDialog(true)}
                />
                <Button
                  label="Simpan Semua"
                  icon="pi pi-save"
                  severity="success"
                  onClick={saveAll}
                />
              </div>
            }
          />

          <DataTable
            value={students}
            scrollable
            scrollHeight="600px"
            showGridlines
          >
            <Column
              header="No"
              body={(d, opt) => opt.rowIndex + 1}
              style={{ width: "60px" }}
            />

            <Column
              field="nama"
              header="Nama Siswa"
              style={{ minWidth: "200px" }}
            />

            {/* PENGETAHUAN */}
            <Column header="Nilai P" body={(r) => inputTpl(r, "nilai_p")} />
            <Column header="Pred" body={(r) => predTpl(r, "nilai_p")} />
            <Column header="Desk" body={(r) => deskTpl(r, "nilai_p")} />

            {/* KETERAMPILAN */}
            <Column header="Nilai K" body={(r) => inputTpl(r, "nilai_k")} />
            <Column header="Pred" body={(r) => predTpl(r, "nilai_k")} />
            <Column header="Desk" body={(r) => deskTpl(r, "nilai_k")} />

            {/* ACTION */}
            <Column
              header="Aksi"
              body={actionTpl}
              style={{ width: "140px" }}
            />
          </DataTable>
        </div>
      )}

      {/* ============================ EDIT DIALOG ============================= */}
      <Dialog
        visible={editDialog}
        onHide={() => setEditDialog(false)}
        header="Edit Nilai Siswa"
        modal
      >
        {editRow && (
          <div className="flex flex-column gap-3">
            <h4>{editRow.nama}</h4>

            <div>
              <label>Nilai Pengetahuan</label>
              <InputNumber
                className="w-full"
                value={editRow.nilai_p}
                onValueChange={(e) =>
                  setEditRow({ ...editRow, nilai_p: e.value })
                }
              />
            </div>

            <div>
              <label>Nilai Keterampilan</label>
              <InputNumber
                className="w-full"
                value={editRow.nilai_k}
                onValueChange={(e) =>
                  setEditRow({ ...editRow, nilai_k: e.value })
                }
              />
            </div>

            <Button label="Simpan" severity="success" onClick={updateSingle} />
          </div>
        )}
      </Dialog>

      {/* ============================ PRINT PREVIEW ============================ */}
      <AdjustPrintMarginLaporanNilai
        visible={printDialog}
        onHide={() => setPrintDialog(false)}
        dataNilai={students}
        meta={meta}
        info={{ ...filters, ...opsi }}
        setPdfUrl={setPdfUrl}
        setPreviewOpen={setPreviewOpen}
      />

      <Dialog
        visible={previewOpen}
        onHide={() => setPreviewOpen(false)}
        maximizable
        header="Preview Cetak"
        style={{ width: "90vw", height: "90vh" }}
      >
        <PDFViewer pdfUrl={pdfUrl} />
      </Dialog>
    </div>
  );
}
