"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

const FormHari = ({ visible, onHide, onSave, selectedHari }) => {
  const [namaHari, setNamaHari] = useState("");
  const [urutan, setUrutan] = useState(1);
  const [status, setStatus] = useState("Aktif");

  useEffect(() => {
    if (selectedHari) {
      setNamaHari(selectedHari.NAMA_HARI || "");
      setUrutan(selectedHari.URUTAN || 1);
      setStatus(selectedHari.STATUS || "Aktif");
    } else {
      setNamaHari("");
      setUrutan(1);
      setStatus("Aktif");
    }
  }, [selectedHari, visible]);

  const handleSubmit = () => {
    if (!namaHari) return alert("Nama hari wajib diisi!");
    if (!urutan || urutan < 1) return alert("Urutan harus diisi dan lebih besar dari 0");
    onSave({ NAMA_HARI: namaHari, URUTAN: urutan, STATUS: status });
  };

  return (
    <Dialog
      header={selectedHari ? "Edit Hari" : "Tambah Hari"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="namaHari">Nama Hari</label>
          <InputText
            id="namaHari"
            value={namaHari}
            onChange={(e) => setNamaHari(e.target.value)}
            placeholder="Contoh: Senin"
          />
        </div>

        <div className="field">
          <label htmlFor="urutan">Urutan</label>
          <InputNumber
            id="urutan"
            value={urutan}
            onValueChange={(e) => setUrutan(e.value)}
            min={1}
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Tidak Aktif"].map((s) => ({ label: s, value: s }))}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormHari;
