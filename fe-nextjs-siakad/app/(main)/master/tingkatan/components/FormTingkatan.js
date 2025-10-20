"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormTingkatan = ({ visible, onHide, onSave, selectedTingkatan }) => {
  const [tingkatan, setTingkatan] = useState("");
  const [status, setStatus] = useState("Aktif");

  useEffect(() => {
    if (selectedTingkatan) {
      setTingkatan(selectedTingkatan.TINGKATAN || "");
      setStatus(selectedTingkatan.STATUS || "Aktif");
    } else {
      setTingkatan("");
      setStatus("Aktif");
    }
  }, [selectedTingkatan, visible]);

  const handleSubmit = () => {
    if (!tingkatan) return alert("Tingkatan wajib diisi!");
    onSave({ TINGKATAN: tingkatan, STATUS: status });
  };

  return (
    <Dialog
      header={selectedTingkatan ? "Edit Tingkatan" : "Tambah Tingkatan"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="tingkatan">Tingkatan</label>
          <InputText
            id="tingkatan"
            value={tingkatan}
            onChange={(e) => setTingkatan(e.target.value)}
            placeholder="Contoh: X, XI, XII"
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

export default FormTingkatan;
