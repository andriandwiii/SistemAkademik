"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJurusan = ({ visible, formData, onHide, onChange, onSubmit, errors }) => {
  // Tentukan gaya input jika error
  const inputClass = (field) =>
    errors[field] ? "p-inputtext w-full border-red-500" : "p-inputtext w-full";

  return (
    <Dialog
      header={formData.jurusan_id ? "Edit Jurusan" : "Tambah Jurusan"}
      visible={visible}
      onHide={onHide}
      style={{ width: "30vw", borderRadius: "10px" }}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Input Kode Jurusan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kode Jurusan
          </label>
          <InputText
            className={inputClass("kode_jurusan")}
            value={formData.kode_jurusan}
            onChange={(e) =>
              onChange({ ...formData, kode_jurusan: e.target.value })
            }
          />
          {errors.kode_jurusan && (
            <small className="text-red-500 text-xs">
              {errors.kode_jurusan}
            </small>
          )}
        </div>

        {/* Input Keterangan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Keterangan
          </label>
          <InputText
            className={inputClass("keterangan")}
            value={formData.keterangan}
            onChange={(e) =>
              onChange({ ...formData, keterangan: e.target.value })
            }
          />
          {errors.keterangan && (
            <small className="text-red-500 text-xs">
              {errors.keterangan}
            </small>
          )}
        </div>

        {/* Tombol Simpan */}
        <div className="text-right pt-3">
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            className="p-button-sm bg-blue-600 border-none hover:bg-blue-700"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormJurusan;
