"use client";

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// Pakai CustomDataTable jika ada
import CustomDataTable from "../../../../components/DataTable";

const ManajemenKeuangan = () => {
  const toast = useRef(null);

  // contoh data awal
  const [transactions, setTransactions] = useState([
    { id: 1, tanggal: "2025-09-20", jenis: "Pemasukan", deskripsi: "SPP September", jumlah: 5000000, sumber: "Siswa" },
    { id: 2, tanggal: "2025-09-21", jenis: "Pengeluaran", deskripsi: "Gaji Guru", jumlah: 25000000, sumber: "Bank" },
  ]);

  const [filterJenis, setFilterJenis] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // modal form
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    tanggal: "",
    jenis: "Pemasukan",
    deskripsi: "",
    jumlah: "",
    sumber: "",
  });

  const jenisOptions = ["Pemasukan", "Pengeluaran"];

  // format ke IDR
  const formatIDR = (n) =>
    n == null ? "-" : n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

  // handle save form
  const handleSave = () => {
    if (!form.tanggal || !form.deskripsi || !form.jumlah) {
      toast.current?.show({ severity: "warn", summary: "Validasi", detail: "Lengkapi semua field wajib" });
      return;
    }

    if (editing) {
      // edit mode
      setTransactions((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...editing, ...form, jumlah: Number(form.jumlah) } : t))
      );
      toast.current?.show({ severity: "success", summary: "Update", detail: "Transaksi diperbarui" });
    } else {
      // tambah baru
      const newData = { id: Date.now(), ...form, jumlah: Number(form.jumlah) };
      setTransactions((prev) => [...prev, newData]);
      toast.current?.show({ severity: "success", summary: "Tambah", detail: "Transaksi ditambahkan" });
    }

    setShowDialog(false);
    setEditing(null);
    setForm({ tanggal: "", jenis: "Pemasukan", deskripsi: "", jumlah: "", sumber: "" });
  };

  // hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Hapus transaksi "${row.deskripsi}" (${formatIDR(row.jumlah)})?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== row.id));
        toast.current?.show({ severity: "success", summary: "Dihapus", detail: "Transaksi dihapus" });
      },
    });
  };

  // export CSV
  const exportCSV = () => {
    if (!transactions.length) return;
    const keys = Object.keys(transactions[0]);
    const csv = [
      keys.join(","),
      ...transactions.map((r) =>
        keys.map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "manajemen-keuangan.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  // kolom untuk DataTable
  const columns = [
    { field: "tanggal", header: "Tanggal" },
    { field: "jenis", header: "Jenis" },
    { field: "deskripsi", header: "Deskripsi" },
    { field: "jumlah", header: "Jumlah", body: (r) => formatIDR(r.jumlah) },
    { field: "sumber", header: "Sumber" },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setEditing(row);
              setForm(row);
              setShowDialog(true);
            }}
          />
          <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  const useCustom = !!CustomDataTable;

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5>Manajemen Keuangan</h5>
            <div className="flex gap-2">
              <Button label="Tambah" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
              <Button label="Export CSV" icon="pi pi-file" onClick={exportCSV} />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <InputText
              placeholder="Cari..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <Dropdown
              value={filterJenis}
              options={jenisOptions}
              onChange={(e) => setFilterJenis(e.value)}
              placeholder="Filter Jenis"
              showClear
            />
          </div>

          {useCustom ? (
            <CustomDataTable
              data={transactions.filter(
                (t) =>
                  (!filterJenis || t.jenis === filterJenis) &&
                  (!globalFilter ||
                    t.deskripsi.toLowerCase().includes(globalFilter.toLowerCase()))
              )}
              loading={false}
              columns={columns}
            />
          ) : (
            <DataTable
              value={transactions.filter(
                (t) =>
                  (!filterJenis || t.jenis === filterJenis) &&
                  (!globalFilter ||
                    t.deskripsi.toLowerCase().includes(globalFilter.toLowerCase()))
              )}
              paginator
              rows={10}
            >
              {columns.map((col, i) => (
                <Column key={i} {...col} />
              ))}
            </DataTable>
          )}
        </div>
      </div>

      {/* Dialog Form */}
      <Dialog
        header={editing ? "Edit Transaksi" : "Tambah Transaksi"}
        visible={showDialog}
        style={{ width: "30rem" }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-column gap-3">
          <div>
            <label className="block mb-1">Tanggal</label>
            <InputText
              type="date"
              className="w-full"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">Jenis</label>
            <Dropdown
              value={form.jenis}
              options={jenisOptions}
              onChange={(e) => setForm({ ...form, jenis: e.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Deskripsi</label>
            <InputText
              className="w-full"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">Jumlah</label>
            <InputText
              type="number"
              className="w-full"
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">Sumber</label>
            <InputText
              className="w-full"
              value={form.sumber}
              onChange={(e) => setForm({ ...form, sumber: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Batal" icon="pi pi-times" severity="secondary" onClick={() => setShowDialog(false)} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
};

export default ManajemenKeuangan;
