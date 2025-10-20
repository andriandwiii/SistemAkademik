import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

// 🎨 Style object
const FormWilayahStyles = {
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

// 🧩 Komponen utama
const FormWilayah = ({
  visible,
  formData,
  onHide,
  onChange,
  onSubmit,
  errors,
  statusOptions,
}) => {
  const inputClass = (field) =>
    errors[field]
      ? { ...FormWilayahStyles.inputText, ...FormWilayahStyles.invalidInput }
      : FormWilayahStyles.inputText;

  return (
    <Dialog
      header={formData.ID ? "Edit Wilayah" : "Tambah Wilayah"}
      visible={visible}
      onHide={onHide}
      style={FormWilayahStyles.dialog}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label style={FormWilayahStyles.formLabel}>Provinsi</label>
          <InputText
            style={inputClass("PROVINSI")}
            value={formData.PROVINSI}
            onChange={(e) => onChange("PROVINSI", e.target.value)}
          />
          {errors.PROVINSI && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.PROVINSI}
            </small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Kabupaten</label>
          <InputText
            style={inputClass("KABUPATEN")}
            value={formData.KABUPATEN}
            onChange={(e) => onChange("KABUPATEN", e.target.value)}
          />
          {errors.KABUPATEN && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.KABUPATEN}
            </small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Kecamatan</label>
          <InputText
            style={inputClass("KECAMATAN")}
            value={formData.KECAMATAN}
            onChange={(e) => onChange("KECAMATAN", e.target.value)}
          />
          {errors.KECAMATAN && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.KECAMATAN}
            </small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Desa/Kelurahan</label>
          <InputText
            style={inputClass("DESA_KELURAHAN")}
            value={formData.DESA_KELURAHAN}
            onChange={(e) => onChange("DESA_KELURAHAN", e.target.value)}
          />
          {errors.DESA_KELURAHAN && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.DESA_KELURAHAN}
            </small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Kode Pos</label>
          <InputText
            style={inputClass("KODEPOS")}
            value={formData.KODEPOS}
            maxLength={5}
            onChange={(e) => onChange("KODEPOS", e.target.value)}
          />
          {errors.KODEPOS && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.KODEPOS}
            </small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>RT</label>
          <InputText
            style={inputClass("RT")}
            value={formData.RT}
            maxLength={3}
            onChange={(e) => onChange("RT", e.target.value)}
          />
          {errors.RT && (
            <small style={FormWilayahStyles.errorMessage}>{errors.RT}</small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>RW</label>
          <InputText
            style={inputClass("RW")}
            value={formData.RW}
            maxLength={3}
            onChange={(e) => onChange("RW", e.target.value)}
          />
          {errors.RW && (
            <small style={FormWilayahStyles.errorMessage}>{errors.RW}</small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Jalan</label>
          <InputText
            style={inputClass("JALAN")}
            value={formData.JALAN}
            onChange={(e) => onChange("JALAN", e.target.value)}
          />
          {errors.JALAN && (
            <small style={FormWilayahStyles.errorMessage}>{errors.JALAN}</small>
          )}
        </div>

        <div>
          <label style={FormWilayahStyles.formLabel}>Status</label>
          <Dropdown
            style={inputClass("STATUS")}
            value={formData.STATUS}
            options={statusOptions}
            onChange={(e) => onChange("STATUS", e.value)}
            placeholder="Pilih Status"
            className="w-full mt-2"
          />
          {errors.STATUS && (
            <small style={FormWilayahStyles.errorMessage}>
              {errors.STATUS}
            </small>
          )}
        </div>

        <div className="text-right pt-3">
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            style={FormWilayahStyles.submitButton}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor =
                FormWilayahStyles.submitButtonHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor =
                FormWilayahStyles.submitButton.backgroundColor)
            }
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormWilayah;
