"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const FormWaktuPelajaranStyles = {
  dialog: {
    width: "40vw",
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

const FormWaktuPelajaran = ({
  visible,
  formData,
  onHide,
  onChange,
  onSubmit,
  errors,
  mapelOptions,
  kelasOptions,  // Tambahkan kelasOptions untuk dropdown Kelas
  ruanganOptions,  // Tambahkan ruanganOptions untuk dropdown Ruangan
}) => {
  const inputClass = (field) =>
    errors[field]
      ? { ...FormWaktuPelajaranStyles.inputText, ...FormWaktuPelajaranStyles.invalidInput }
      : FormWaktuPelajaranStyles.inputText;

  return (
    <Dialog
      header={formData.ID ? "Edit Waktu Pelajaran" : "Tambah Waktu Pelajaran"}
      visible={visible}
      onHide={onHide}
      style={FormWaktuPelajaranStyles.dialog}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* HARI */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Hari</label>
          <InputText
            style={inputClass("HARI")}
            value={formData.HARI}
            onChange={(e) => onChange({ ...formData, HARI: e.target.value })}
          />
          {errors.HARI && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.HARI}</small>}
        </div>

        {/* JAM MULAI */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Jam Mulai</label>
          <InputText
            type="time"
            style={inputClass("JAM_MULAI")}
            value={formData.JAM_MULAI}
            onChange={(e) => onChange({ ...formData, JAM_MULAI: e.target.value })}
          />
          {errors.JAM_MULAI && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.JAM_MULAI}</small>}
        </div>

        {/* JAM SELESAI */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Jam Selesai</label>
          <InputText
            type="time"
            style={inputClass("JAM_SELESAI")}
            value={formData.JAM_SELESAI}
            onChange={(e) => onChange({ ...formData, JAM_SELESAI: e.target.value })}
          />
          {errors.JAM_SELESAI && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.JAM_SELESAI}</small>}
        </div>

        {/* DURASI */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Durasi (Menit)</label>
          <InputText
            type="number"
            style={inputClass("DURASI")}
            value={formData.DURASI}
            onChange={(e) => onChange({ ...formData, DURASI: e.target.value })}
          />
          {errors.DURASI && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.DURASI}</small>}
        </div>

        {/* MATA PELAJARAN */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Mata Pelajaran</label>
          <Dropdown
            value={formData.MATA_PELAJARAN}
            options={mapelOptions} // This should be a list of mapel { label, value } pairs
            onChange={(e) => onChange({ ...formData, MATA_PELAJARAN: e.value })}
            optionLabel="label"
            placeholder="Pilih Mata Pelajaran"
            style={inputClass("MATA_PELAJARAN")}
          />
          {errors.MATA_PELAJARAN && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.MATA_PELAJARAN}</small>}
        </div>

        {/* KELAS */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Kelas</label>
          <Dropdown
            value={formData.KELAS}
            options={kelasOptions} // Dropdown for Kelas
            onChange={(e) => onChange({ ...formData, KELAS: e.value })}
            optionLabel="label"
            placeholder="Pilih Kelas"
            style={inputClass("KELAS")}
          />
          {errors.KELAS && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.KELAS}</small>}
        </div>

        {/* RUANGAN */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Ruangan</label>
          <Dropdown
            value={formData.RUANGAN}
            options={ruanganOptions} // Dropdown for Ruangan
            onChange={(e) => onChange({ ...formData, RUANGAN: e.value })}
            optionLabel="label"
            placeholder="Pilih Ruangan"
            style={inputClass("RUANGAN")}
          />
          {errors.RUANGAN && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.RUANGAN}</small>}
        </div>

        {/* GURU PENGAJAR */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Guru Pengajar</label>
          <InputText
            style={inputClass("GURU_PENGAJAR")}
            value={formData.GURU_PENGAJAR}
            onChange={(e) => onChange({ ...formData, GURU_PENGAJAR: e.target.value })}
          />
          {errors.GURU_PENGAJAR && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.GURU_PENGAJAR}</small>}
        </div>

        {/* STATUS */}
        <div>
          <label style={FormWaktuPelajaranStyles.formLabel}>Status</label>
          <InputText
            style={inputClass("STATUS")}
            value={formData.STATUS}
            onChange={(e) => onChange({ ...formData, STATUS: e.target.value })}
          />
          {errors.STATUS && <small style={FormWaktuPelajaranStyles.errorMessage}>{errors.STATUS}</small>}
        </div>

        {/* Submit Button */}
        <div className="text-right pt-3">
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            style={FormWaktuPelajaranStyles.submitButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = FormWaktuPelajaranStyles.submitButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = FormWaktuPelajaranStyles.submitButton.backgroundColor)}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormWaktuPelajaran;
