"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import ToastNotifier from "@/app/components/ToastNotifier";
import { Toast } from "primereact/toast";

// Opsi status sesuai migration ENUM
const statusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Cuti", value: "Cuti" },
  { label: "Pensiun", value: "Pensiun" },
];

// Opsi gender
const genderOptions = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
];

const FormGuru = ({ visible, onHide, reloadData, guruData }) => {
  const [formData, setFormData] = useState(guruData || {});
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const inputClass = (field) =>
    `p-inputtext w-full ${errors[field] ? "p-invalid" : ""}`;

  // Reset form setiap kali modal dibuka/ditutup
  const resetForm = () => {
    setFormData({});
    setErrors({});
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  // Submit data
  const handleSubmit = async () => {
    try {
      if (formData.GURU_ID) {
        // === EDIT GURU ===
        const payload = {
          ...formData,
          updated_by: 1, // contoh: ambil dari user login
        };

        await axios.put(
          `http://localhost:8100/api/master-guru/${formData.GURU_ID}`,
          payload
        );

        showToast("success", "Berhasil", "Data guru berhasil diperbarui");
      } else {
        // === TAMBAH GURU ===
        const payload = {
          nip: formData.NIP,
          nama: formData.NAMA,
          gelar_depan: formData.GELAR_DEPAN,
          gelar_belakang: formData.GELAR_BELAKANG,
          pangkat: formData.PANGKAT,
          jabatan: formData.JABATAN,
          status_kepegawaian: formData.STATUS_KEPEGAWAIAN,
          gender: formData.GENDER,
          tgl_lahir: formData.TGL_LAHIR,
          tempat_lahir: formData.TEMPAT_LAHIR,
          email: formData.EMAIL,
          no_telp: formData.NO_TELP,
          alamat: formData.ALAMAT,
          password: formData.PASSWORD, // password wajib saat buat user baru
        };

        await axios.post(
          "http://localhost:8100/api/auth/register-guru",
          payload
        );

        showToast("success", "Berhasil", "Guru baru berhasil ditambahkan");
      }

      resetForm();
      onHide();
      reloadData && reloadData();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      showToast(
        "error",
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan server"
      );
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ToastNotifier />
      <Dialog
        header={formData.GURU_ID ? "Edit Guru" : "Tambah Guru"}
        visible={visible}
        onHide={() => {
          resetForm();
          onHide();
        }}
        className="rounded-lg shadow-lg"
        style={{ width: "40rem" }}
      >
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* NIP */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              NIP
            </label>
            <InputText
              className={inputClass("NIP")}
              value={formData.NIP || ""}
              onChange={(e) =>
                setFormData({ ...formData, NIP: e.target.value })
              }
            />
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nama
            </label>
            <InputText
              className={inputClass("NAMA")}
              value={formData.NAMA || ""}
              onChange={(e) =>
                setFormData({ ...formData, NAMA: e.target.value })
              }
            />
          </div>

          {/* Gelar Depan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Gelar Depan
            </label>
            <InputText
              className={inputClass("GELAR_DEPAN")}
              value={formData.GELAR_DEPAN || ""}
              onChange={(e) =>
                setFormData({ ...formData, GELAR_DEPAN: e.target.value })
              }
            />
          </div>

          {/* Gelar Belakang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Gelar Belakang
            </label>
            <InputText
              className={inputClass("GELAR_BELAKANG")}
              value={formData.GELAR_BELAKANG || ""}
              onChange={(e) =>
                setFormData({ ...formData, GELAR_BELAKANG: e.target.value })
              }
            />
          </div>

          {/* Pangkat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Pangkat
            </label>
            <InputText
              className={inputClass("PANGKAT")}
              value={formData.PANGKAT || ""}
              onChange={(e) =>
                setFormData({ ...formData, PANGKAT: e.target.value })
              }
            />
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Jabatan
            </label>
            <InputText
              className={inputClass("JABATAN")}
              value={formData.JABATAN || ""}
              onChange={(e) =>
                setFormData({ ...formData, JABATAN: e.target.value })
              }
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Status Kepegawaian
            </label>
            <Dropdown
              value={formData.STATUS_KEPEGAWAIAN || ""}
              options={statusOptions}
              onChange={(e) =>
                setFormData({ ...formData, STATUS_KEPEGAWAIAN: e.value })
              }
              className="w-full"
              placeholder="Pilih status"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Jenis Kelamin
            </label>
            <Dropdown
              value={formData.GENDER || ""}
              options={genderOptions}
              onChange={(e) =>
                setFormData({ ...formData, GENDER: e.value })
              }
              className="w-full"
              placeholder="Pilih gender"
            />
          </div>

          {/* Tempat Lahir */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Tempat Lahir
            </label>
            <InputText
              className={inputClass("TEMPAT_LAHIR")}
              value={formData.TEMPAT_LAHIR || ""}
              onChange={(e) =>
                setFormData({ ...formData, TEMPAT_LAHIR: e.target.value })
              }
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Tanggal Lahir
            </label>
            <Calendar
              value={formData.TGL_LAHIR ? new Date(formData.TGL_LAHIR) : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  TGL_LAHIR: e.value
                    ? e.value.toISOString().split("T")[0]
                    : "",
                })
              }
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <InputText
              className={inputClass("EMAIL")}
              value={formData.EMAIL || ""}
              onChange={(e) =>
                setFormData({ ...formData, EMAIL: e.target.value })
              }
            />
          </div>

          {/* No Telp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              No. Telp
            </label>
            <InputText
              className={inputClass("NO_TELP")}
              value={formData.NO_TELP || ""}
              onChange={(e) =>
                setFormData({ ...formData, NO_TELP: e.target.value })
              }
            />
          </div>

          {/* Alamat */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Alamat
            </label>
            <InputText
              className={inputClass("ALAMAT")}
              value={formData.ALAMAT || ""}
              onChange={(e) =>
                setFormData({ ...formData, ALAMAT: e.target.value })
              }
            />
          </div>

          {/* Password (hanya saat tambah guru) */}
          {!formData.GURU_ID && (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <InputText
                type="password"
                className={inputClass("PASSWORD")}
                value={formData.PASSWORD || ""}
                onChange={(e) =>
                  setFormData({ ...formData, PASSWORD: e.target.value })
                }
              />
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="col-span-2 text-right pt-4">
            <Button
              type="submit"
              label="Simpan"
              icon="pi pi-save"
              className="p-button-sm p-button-primary"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default FormGuru;
