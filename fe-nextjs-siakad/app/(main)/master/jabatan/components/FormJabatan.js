"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const FormJabatan = ({ visible, onHide, onSave, selectedJabatan }) => {
  const [kodeJabatan, setKodeJabatan] = useState(""); // KODE_JABATAN
  const [namaJabatan, setNamaJabatan] = useState(""); // NAMA_JABATAN
  const [status, setStatus] = useState("Aktif"); // STATUS

  // List of status options
  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  // Clear form fields
  const clearForm = () => {
    setKodeJabatan("");
    setNamaJabatan("");
    setStatus("Aktif");
  };

  useEffect(() => {
    if (selectedJabatan) {
      // Edit mode: populate fields with selected data
      setKodeJabatan(selectedJabatan.KODE_JABATAN || "");
      setNamaJabatan(selectedJabatan.NAMA_JABATAN || "");
      setStatus(selectedJabatan.STATUS || "Aktif");
    } else {
      // Add mode: clear fields
      clearForm();
    }
  }, [selectedJabatan]);

  const handleSubmit = () => {
    const data = {
      KODE_JABATAN: kodeJabatan,
      NAMA_JABATAN: namaJabatan,
      STATUS: status,
    };

    onSave(data);

    // Clear the form after save
    clearForm();
  };

  return (
    <Dialog
      header={selectedJabatan ? "Edit Jabatan" : "Tambah Jabatan"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={() => {
        clearForm(); // Clear form on close
        onHide();
      }}
    >
      <div className="p-fluid">
        {/* KODE_JABATAN */}
        <div className="field">
          <label htmlFor="kodeJabatan">Kode Jabatan</label>
          <InputText
            id="kodeJabatan"
            value={kodeJabatan}
            onChange={(e) => setKodeJabatan(e.target.value)}
            disabled={!!selectedJabatan} // Disable if in edit mode
          />
        </div>

        {/* NAMA_JABATAN */}
        <div className="field">
          <label htmlFor="namaJabatan">Nama Jabatan</label>
          <InputText
            id="namaJabatan"
            value={namaJabatan}
            onChange={(e) => setNamaJabatan(e.target.value)}
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

export default FormJabatan;
