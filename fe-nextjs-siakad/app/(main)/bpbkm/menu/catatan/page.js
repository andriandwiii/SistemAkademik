"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea"; // Pakai textarea untuk catatan panjang
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CustomDataTable from "../../../../components/DataTable"; // Sesuaikan path

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CatatanBK = () => {
  const toast = useRef(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterKelas, setFilterKelas] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // Modal State
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    catatan: "",
    tanggal: new Date().toISOString().split('T')[0], // Default tanggal hari ini
  });

  const kelasOptions = ["X IPA 1", "X IPS 2", "XI IPA 1", "XI IPA 3", "XII IPA 2"];

  // 1. Fetch Data dari Backend
  const loadData = async () => {
    setLoading(true);
    try {
      // Ganti endpoint sesuai backend anda, misal: /bk/catatan
      const res = await fetch(`${API_URL}/bk/catatan`);
      const json = await res.json();
      setRecords(json.data || []);
    } catch (err) {
      console.error("Gagal load data BK:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Save (Tambah/Edit)
  const handleSave = async () => {
    if (!form.nama || !form.kelas || !form.catatan) {
      toast.current?.show({ severity: "warn", summary: "Validasi", detail: "Mohon lengkapi Nama, Kelas, dan Catatan" });
      return;
    }

    setLoading(true);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `${API_URL}/bk/catatan/${editing.id}` : `${API_URL}/bk/catatan`;

      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.current?.show({ severity: "success", summary: "Berhasil", detail: "Data berhasil disimpan" });
        loadData(); // Refresh table
        closeDialog();
      }
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Gagal menyimpan data" });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setForm({ nama: "", kelas: "", catatan: "", tanggal: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Hapus catatan untuk ${row.nama}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/bk/catatan/${row.id}`, { method: "DELETE" });
          toast.current?.show({ severity: "success", summary: "Dihapus", detail: "Data telah dihapus" });
          loadData();
        } catch (err) {
          toast.current?.show({ severity: "error", summary: "Error", detail: "Gagal menghapus data" });
        }
      },
    });
  };

  // 3. Kolom Tabel
  const columns = [
    { field: "tanggal", header: "Tanggal", sortable: true, style: { width: '15%' } },
    { field: "nama", header: "Nama Siswa", sortable: true, style: { width: '25%' } },
    { field: "kelas", header: "Kelas", sortable: true, style: { width: '15%' } },
    { field: "catatan", header: "Catatan Bimbingan", style: { width: '35%' } },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            severity="warning"
            onClick={() => {
              setEditing(row);
              setForm(row);
              setShowDialog(true);
            }}
          />
          <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: "10%", textAlign: 'center' },
    },
  ];

  const filteredRecords = records.filter((r) =>
    (!filterKelas || r.kelas === filterKelas) &&
    (!globalFilter || r.nama.toLowerCase().includes(globalFilter.toLowerCase()))
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12">
        <div className="card shadow-2 p-4">
          <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
            <h5 className="m-0 text-xl font-semibold">Catatan Bimbingan Konseling</h5>
            <div className="flex gap-2">
              <Button label="Tambah Catatan" icon="pi pi-plus" className="p-button-primary" onClick={() => setShowDialog(true)} />
              <Button label="Export CSV" icon="pi pi-download" severity="help" outlined onClick={() => {/* Fungsi export tetap sama */}} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                placeholder="Cari nama siswa..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </span>
            <Dropdown
              value={filterKelas}
              options={kelasOptions}
              onChange={(e) => setFilterKelas(e.value)}
              placeholder="Filter Kelas"
              showClear
              className="w-full md:w-15rem"
            />
          </div>

          <DataTable
            value={filteredRecords}
            paginator
            rows={10}
            loading={loading}
            className="p-datatable-sm"
            emptyMessage="Tidak ada catatan ditemukan."
            responsiveLayout="stack"
          >
            {columns.map((col, i) => (
              <Column key={i} {...col} />
            ))}
          </DataTable>
        </div>
      </div>

      <Dialog
        header={editing ? "Edit Catatan Bimbingan" : "Buat Catatan Baru"}
        visible={showDialog}
        style={{ width: "90vw", maxWidth: "450px" }}
        modal
        onHide={closeDialog}
        blockScroll
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="field">
            <label htmlFor="nama" className="font-bold">Nama Siswa</label>
            <InputText
              id="nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full mt-1"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="field">
            <label htmlFor="kelas" className="font-bold">Kelas</label>
            <Dropdown
              id="kelas"
              value={form.kelas}
              options={kelasOptions}
              onChange={(e) => setForm({ ...form, kelas: e.value })}
              className="w-full mt-1"
              placeholder="Pilih Kelas"
            />
          </div>

          <div className="field">
            <label htmlFor="tanggal" className="font-bold">Tanggal Kejadian/Bimbingan</label>
            <InputText
              id="tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full mt-1"
            />
          </div>

          <div className="field">
            <label htmlFor="catatan" className="font-bold">Detail Catatan</label>
            <InputTextarea
              id="catatan"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              className="w-full mt-1"
              rows={4}
              placeholder="Tuliskan detail kejadian atau hasil bimbingan..."
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Batal" icon="pi pi-times" text severity="secondary" onClick={closeDialog} />
          <Button label="Simpan Data" icon="pi pi-check" loading={loading} onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
};

export default CatatanBK;