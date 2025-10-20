"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const FormUjianStyles = {
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

const FormUjian = ({
  visible,
  formData = {},
  onHide,
  onChange,
  onSubmit,
  errors,
  mapelOptions = [],
}) => {
  const inputClass = (field) =>
    errors[field] ? { ...FormUjianStyles.inputText, ...FormUjianStyles.invalidInput } : FormUjianStyles.inputText;

  const jenisUjianOptions = [
    { label: "UTS", value: "UTS" },
    { label: "UAS", value: "UAS" },
    { label: "Tugas", value: "Tugas" },
    { label: "Praktikum", value: "Praktikum" },
  ];

  return (
    <Dialog
      header={formData?.UJIAN_ID ? "Edit Ujian" : "Tambah Ujian"}
      visible={visible}
      onHide={onHide}
      style={FormUjianStyles.dialog}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label style={FormUjianStyles.formLabel}>Nama Ujian</label>
          <InputText
            style={inputClass("NAMA_UJIAN")}
            value={formData?.NAMA_UJIAN || ""}
            onChange={(e) => onChange({ ...formData, NAMA_UJIAN: e.target.value })}
          />
          {errors.NAMA_UJIAN && <small style={FormUjianStyles.errorMessage}>{errors.NAMA_UJIAN}</small>}
        </div>

        <div>
          <label style={FormUjianStyles.formLabel}>Jenis Ujian</label>
          <Dropdown
            value={formData?.JENIS_UJIAN || ""}
            options={jenisUjianOptions}
            onChange={(e) => onChange({ ...formData, JENIS_UJIAN: e.value })}
            optionLabel="label"
            placeholder="Pilih Jenis Ujian"
            style={inputClass("JENIS_UJIAN")}
          />
          {errors.JENIS_UJIAN && <small style={FormUjianStyles.errorMessage}>{errors.JENIS_UJIAN}</small>}
        </div>

        <div>
          <label style={FormUjianStyles.formLabel}>Tanggal Ujian</label>
          <InputText
            type="date"
            style={inputClass("TANGGAL_UJIAN")}
            value={formData?.TANGGAL_UJIAN || ""}
            onChange={(e) => onChange({ ...formData, TANGGAL_UJIAN: e.target.value })}
          />
          {errors.TANGGAL_UJIAN && <small style={FormUjianStyles.errorMessage}>{errors.TANGGAL_UJIAN}</small>}
        </div>

        <div>
          <label style={FormUjianStyles.formLabel}>Mata Pelajaran</label>
          <Dropdown
            value={formData?.MAPEL_ID || ""}
            options={mapelOptions} // This should be a list of mapel { label, value } pairs
            onChange={(e) => onChange({ ...formData, MAPEL_ID: e.value })}
            optionLabel="label"
            placeholder="Pilih Mata Pelajaran"
            style={inputClass("MAPEL_ID")}
          />
          {errors.MAPEL_ID && <small style={FormUjianStyles.errorMessage}>{errors.MAPEL_ID}</small>}
        </div>

        <div className="text-right pt-3">
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            style={FormUjianStyles.submitButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = FormUjianStyles.submitButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = FormUjianStyles.submitButton.backgroundColor)}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormUjian;
