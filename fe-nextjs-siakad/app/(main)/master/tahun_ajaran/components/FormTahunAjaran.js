"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormTahunAjaran = ({ visible, onHide, onSave, selectedTahunAjaran }) => {
  const [formData, setFormData] = useState({
    TAHUN_AJARAN_ID: "",
    NAMA_TAHUN_AJARAN: "",
    STATUS: "Tidak Aktif",
  });

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  useEffect(() => {
    if (selectedTahunAjaran) {
      setFormData({
        TAHUN_AJARAN_ID: selectedTahunAjaran.TAHUN_AJARAN_ID || "",
        NAMA_TAHUN_AJARAN: selectedTahunAjaran.NAMA_TAHUN_AJARAN || "",
        STATUS: selectedTahunAjaran.STATUS || "Tidak Aktif",
      });
    } else {
      setFormData({
        TAHUN_AJARAN_ID: "",
        NAMA_TAHUN_AJARAN: "",
        STATUS: "Tidak Aktif",
      });
    }
  }, [selectedTahunAjaran]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog
      header={
        selectedTahunAjaran
          ? "Edit Data Tahun Ajaran"
          : "Tambah Data Tahun Ajaran"
      }
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Kode Tahun Ajaran */}
        <div className="field">
          <label htmlFor="TAHUN_AJARAN_ID">Kode Tahun Ajaran</label>
          <InputText
            id="TAHUN_AJARAN_ID"
            value={formData.TAHUN_AJARAN_ID}
            onChange={(e) => handleChange("TAHUN_AJARAN_ID", e.target.value)}
            placeholder="Contoh: TA2425"
          />
        </div>

        {/* Nama Tahun Ajaran */}
        <div className="field">
          <label htmlFor="NAMA_TAHUN_AJARAN">Nama Tahun Ajaran</label>
          <InputText
            id="NAMA_TAHUN_AJARAN"
            value={formData.NAMA_TAHUN_AJARAN}
            onChange={(e) =>
              handleChange("NAMA_TAHUN_AJARAN", e.target.value)
            }
            placeholder="Contoh: Tahun Ajaran 2024/2025"
          />
        </div>

        {/* Status */}
        <div className="field">
          <label htmlFor="STATUS">Status</label>
          <Dropdown
            id="STATUS"
            value={formData.STATUS}
            options={statusOptions}
            onChange={(e) => handleChange("STATUS", e.value)}
            className="w-full"
          />
        </div>

        {/* Tombol Aksi */}
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

export default FormTahunAjaran;
