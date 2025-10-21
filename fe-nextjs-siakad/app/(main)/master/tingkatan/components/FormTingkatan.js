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

  useEffect(() => {
    if (selectedTingkatan) {
      setTingkatanId(selectedTingkatan.TINGKATAN_ID || "");
      setTingkatan(selectedTingkatan.TINGKATAN || "");
      setStatus(selectedTingkatan.STATUS || "Aktif");
    } else {
      setTingkatanId("");
      setTingkatan("");
      setStatus("Aktif");
    }
  }, [selectedTingkatan]);

  const handleSubmit = () => {
    const data = {
      TINGKATAN_ID: tingkatanId,
      TINGKATAN: tingkatan,
      STATUS: status,
    };
    onSave(data);
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
          <label htmlFor="tingkatanId">Kode Tingkatan</label>
          <InputText
            id="tingkatanId"
            value={tingkatanId}
            onChange={(e) => setTingkatanId(e.target.value)}
            disabled={!!selectedTingkatan} // nonaktif saat edit
          />
        </div>

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

        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormTingkatan;
