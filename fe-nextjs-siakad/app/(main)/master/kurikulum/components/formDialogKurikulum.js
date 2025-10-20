"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const FormKurikulumStyles = {
  dialog: {
    width: "30vw",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  formLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },
  inputText: {
    width: "100%",
    padding: "8px",
    marginTop: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  invalidInput: {
    borderColor: "#f44336",
  },
  errorMessage: {
    color: "#f44336",
    fontSize: "12px",
    marginTop: "4px",
  },
  submitButton: {
    marginTop: "16px",
    padding: "8px 16px",
    fontSize: "14px",
    backgroundColor: "#007ad9",
    border: "none",
    color: "#fff",
    borderRadius: "4px",
    transition: "all 0.3s ease-in-out",
  },
  submitButtonHover: {
    backgroundColor: "#005bb5",
  },
};

const FormKurikulum = ({ visible, formData, onHide, onChange, onSubmit, errors }) => {
  const inputClass = (field) =>
    errors[field]
      ? { ...FormKurikulumStyles.inputText, ...FormKurikulumStyles.invalidInput }
      : FormKurikulumStyles.inputText;

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  return (
    <Dialog
      header={formData.ID ? "Edit Kurikulum" : "Tambah Kurikulum"}
      visible={visible}
      onHide={onHide}
      style={FormKurikulumStyles.dialog}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label style={FormKurikulumStyles.formLabel}>Nama Kurikulum</label>
          <InputText
            style={inputClass("NAMA_KURIKULUM")}
            value={formData.NAMA_KURIKULUM}
            onChange={(e) => onChange({ ...formData, NAMA_KURIKULUM: e.target.value })}
          />
          {errors.NAMA_KURIKULUM && <small style={FormKurikulumStyles.errorMessage}>{errors.NAMA_KURIKULUM}</small>}
        </div>

        <div>
          <label style={FormKurikulumStyles.formLabel}>Tahun</label>
          <InputText
            type="number"
            style={inputClass("TAHUN")}
            value={formData.TAHUN}
            onChange={(e) => onChange({ ...formData, TAHUN: e.target.value })}
          />
          {errors.TAHUN && <small style={FormKurikulumStyles.errorMessage}>{errors.TAHUN}</small>}
        </div>

        <div>
          <label style={FormKurikulumStyles.formLabel}>Deskripsi</label>
          <InputText
            style={inputClass("DESKRIPSI")}
            value={formData.DESKRIPSI}
            onChange={(e) => onChange({ ...formData, DESKRIPSI: e.target.value })}
          />
        </div>

        <div>
          <label style={FormKurikulumStyles.formLabel}>Status</label>
          <Dropdown
            value={formData.STATUS}
            options={statusOptions}
            onChange={(e) => onChange({ ...formData, STATUS: e.value })}
            optionLabel="label"
            placeholder="Pilih Status"
            style={inputClass("STATUS")}
          />
          {errors.STATUS && <small style={FormKurikulumStyles.errorMessage}>{errors.STATUS}</small>}
        </div>

        <div className="text-right pt-3">
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            style={FormKurikulumStyles.submitButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = FormKurikulumStyles.submitButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = FormKurikulumStyles.submitButton.backgroundColor)}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormKurikulum;
