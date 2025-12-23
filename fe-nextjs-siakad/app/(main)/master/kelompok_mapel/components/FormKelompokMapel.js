"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormKelompokMapel = ({ visible, onHide, onSave, selectedData }) => {
  const [kelompok, setKelompok] = useState("");
  const [namaKelompok, setNamaKelompok] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (selectedData) {
        setKelompok(selectedData.KELOMPOK || "");
        setNamaKelompok(selectedData.NAMA_KELOMPOK || "");
        setStatus(selectedData.STATUS || "Aktif");
      } else {
        setKelompok("");
        setNamaKelompok("");
        setStatus("Aktif");
      }
    }
  }, [visible, selectedData]);

  const handleSubmit = async () => {
    if (!kelompok || !namaKelompok) return;

    setIsSubmitting(true);
    await onSave({
      KELOMPOK: kelompok.toUpperCase(),
      NAMA_KELOMPOK: namaKelompok,
      STATUS: status,
    });
    setIsSubmitting(false);
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Batal" icon="pi pi-times" text severity="secondary" onClick={onHide} disabled={isSubmitting} />
      <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} loading={isSubmitting} />
    </div>
  );

  return (
    <Dialog
      header={selectedData ? "Ubah Kelompok" : "Tambah Kelompok"}
      visible={visible}
      style={{ width: "450px" }}
      modal
      footer={footer}
      onHide={onHide}
    >
      <div className="flex flex-column gap-3 pt-2">
        <div className="flex flex-column gap-2">
          <label htmlFor="kelompok" className="font-semibold text-sm">Kode Kelompok</label>
          <InputText 
            id="kelompok" 
            value={kelompok} 
            onChange={(e) => setKelompok(e.target.value)} 
            placeholder="Contoh: A atau B" 
            className="p-inputtext-sm"
          />
        </div>
        <div className="flex flex-column gap-2">
          <label htmlFor="nama" className="font-semibold text-sm">Nama Kelompok</label>
          <InputText 
            id="nama" 
            value={namaKelompok} 
            onChange={(e) => setNamaKelompok(e.target.value)} 
            placeholder="Contoh: Muatan Nasional" 
            className="p-inputtext-sm"
          />
        </div>
        <div className="flex flex-column gap-2">
          <label htmlFor="status" className="font-semibold text-sm">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Tidak Aktif"].map(s => ({ label: s, value: s }))}
            onChange={(e) => setStatus(e.value)}
            className="p-inputtext-sm"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormKelompokMapel;