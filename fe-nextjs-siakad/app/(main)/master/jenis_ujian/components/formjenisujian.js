"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const FormJenisUjian = ({ visible, onHide, onSave, selectedUjian }) => {
  const [kodeUjian, setKodeUjian] = useState(""); // KODE_UJIAN
  const [namaUjian, setNamaUjian] = useState(""); // NAMA_UJIAN
  const [status, setStatus] = useState("Aktif"); // STATUS

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  const clearForm = () => {
    setKodeUjian("");
    setNamaUjian("");
    setStatus("Aktif");
  };

  useEffect(() => {
    if (selectedUjian) {
      setKodeUjian(selectedUjian.KODE_UJIAN || "");
      setNamaUjian(selectedUjian.NAMA_UJIAN || "");
      setStatus(selectedUjian.STATUS || "Aktif");
    } else {
      clearForm();
    }
  }, [selectedUjian]);

  const handleSubmit = () => {
    if (!kodeUjian) return alert("Kode ujian wajib diisi");
    if (!namaUjian) return alert("Nama ujian wajib diisi");

    const data = {
      KODE_UJIAN: kodeUjian,
      NAMA_UJIAN: namaUjian,
      STATUS: status,
    };

    onSave(data);
    clearForm();
  };

  return (
    <Dialog
      header={selectedUjian ? "Edit Jenis Ujian" : "Tambah Jenis Ujian"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={() => {
        clearForm();
        onHide();
      }}
    >
      <div className="p-fluid">
        {/* KODE_UJIAN */}
        <div className="field">
          <label htmlFor="kodeUjian">Kode Ujian</label>
          <InputText
            id="kodeUjian"
            value={kodeUjian}
            onChange={(e) => setKodeUjian(e.target.value.toUpperCase())}
            disabled={!!selectedUjian} // disable saat edit
            placeholder="Contoh: UTS"
          />
        </div>

        {/* NAMA_UJIAN */}
        <div className="field">
          <label htmlFor="namaUjian">Nama Ujian</label>
          <InputText
            id="namaUjian"
            value={namaUjian}
            onChange={(e) => setNamaUjian(e.target.value)}
            placeholder="Contoh: Ujian Tengah Semester"
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
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              clearForm();
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

export default FormJenisUjian;
