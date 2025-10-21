"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormTingkatan = ({ visible, onHide, onSave, selectedTingkatan }) => {
  const [tingkatanId, setTingkatanId] = useState("");
  const [tingkatan, setTingkatan] = useState("");
  const [status, setStatus] = useState("Aktif");

  const tingkatanOptions = [
    { label: "X", value: "X" },
    { label: "XI", value: "XI" },
    { label: "XII", value: "XII" },
  ];

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  // ✅ Fungsi untuk reset semua field
  const clearForm = () => {
    setTingkatanId("");
    setTingkatan("");
    setStatus("Aktif");
  };

  useEffect(() => {
    if (selectedTingkatan) {
      // Mode edit: isi field dari data yang dipilih
      setTingkatanId(selectedTingkatan.TINGKATAN_ID || "");
      setTingkatan(selectedTingkatan.TINGKATAN || "");
      setStatus(selectedTingkatan.STATUS || "Aktif");
    } else {
      // Mode tambah baru: kosongkan semua field
      clearForm();
    }
  }, [selectedTingkatan]);

  const handleSubmit = () => {
    const data = {
      TINGKATAN_ID: tingkatanId,
      TINGKATAN: tingkatan,
      STATUS: status,
    };

    onSave(data);

    // ✅ Kosongkan form setelah simpan
    clearForm();
  };

  return (
    <Dialog
      header={selectedTingkatan ? "Edit Tingkatan" : "Tambah Tingkatan"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={() => {
        clearForm(); // ✅ Kosongkan juga saat ditutup
        onHide();
      }}
    >
      <div className="p-fluid">
        {/* TINGKATAN_ID */}
        <div className="field">
          <label htmlFor="tingkatanId">Kode Tingkatan</label>
          <InputText
            id="tingkatanId"
            value={tingkatanId}
            onChange={(e) => setTingkatanId(e.target.value)}
            disabled={!!selectedTingkatan} // Nonaktif kalau mode edit
          />
        </div>

        {/* TINGKATAN */}
        <div className="field">
          <label htmlFor="tingkatan">Tingkatan</label>
          <Dropdown
            id="tingkatan"
            value={tingkatan}
            options={tingkatanOptions}
            onChange={(e) => setTingkatan(e.value)}
            placeholder="Pilih Tingkatan"
          />
        </div>

        {/* STATUS */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            placeholder="Pilih Status"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              clearForm(); // ✅ Reset field saat batal
              onHide();
            }}
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormTingkatan;
