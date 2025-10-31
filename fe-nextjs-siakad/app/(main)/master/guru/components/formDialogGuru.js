"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Opsi status
const statusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Cuti", value: "Cuti" },
  { label: "Pensiun", value: "Pensiun" },
];

// 🔹 Opsi gender
const genderOptions = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
];

const FormGuru = ({ visible, onHide, reloadData, formData, setFormData, toastRef }) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [loadingJabatan, setLoadingJabatan] = useState(false);
  const fileUploadRef = useRef(null);

  useEffect(() => {
    if (visible) {
      fetchJabatan();
    }
  }, [visible]);

  const fetchJabatan = async () => {
    setLoadingJabatan(true);
    try {
      const response = await axios.get(`${API_URL}/master-jabatan`);
      const options = response.data.data.map((jabatan) => ({
        label: `${jabatan.KODE_JABATAN} - ${jabatan.NAMA_JABATAN}`,
        value: jabatan.KODE_JABATAN,
      }));
      setJabatanOptions(options);
    } catch (err) {
      console.error("Error fetching jabatan:", err);
      toastRef.current?.showToast("99", "Gagal memuat data jabatan");
    } finally {
      setLoadingJabatan(false);
    }
  };

  const inputClass = (field) =>
    `p-inputtext w-full ${errors[field] ? "p-invalid" : ""}`;

  const handleFileSelect = (e) => {
    const file = e.files[0];
    if (file) {
      setFormData({ ...formData, FOTO: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.GURU_ID) {
        // === EDIT GURU ===
        const updateFormData = new FormData();

        Object.keys(formData).forEach((key) => {
          if (key === "FOTO" && formData.FOTO instanceof File) {
            updateFormData.append("foto", formData.FOTO);
          } else if (key === "TGL_LAHIR" && formData.TGL_LAHIR) {
            const date = new Date(formData.TGL_LAHIR);
            updateFormData.append(key.toLowerCase(), date.toISOString().split("T")[0]);
          } else if (formData[key] !== null && formData[key] !== undefined && key !== "FOTO") {
            updateFormData.append(key.toLowerCase(), formData[key]);
          }
        });

        await axios.put(
          `${API_URL}/master-guru/${formData.GURU_ID}`,
          updateFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        toastRef.current?.showToast("00", "Data guru berhasil diperbarui");
      } else {
        // === TAMBAH GURU ===
        const createFormData = new FormData();

        createFormData.append("nip", formData.NIP || "");
        createFormData.append("nama", formData.NAMA || "");
        createFormData.append("pangkat", formData.PANGKAT || "");
        createFormData.append("kode_jabatan", formData.KODE_JABATAN || "");
        createFormData.append("status_kepegawaian", formData.STATUS_KEPEGAWAIAN || "Aktif");
        createFormData.append("gender", formData.GENDER || "");
        createFormData.append("email", formData.EMAIL || "");
        createFormData.append("no_telp", formData.NO_TELP || "");
        createFormData.append("alamat", formData.ALAMAT || "");
        createFormData.append("tempat_lahir", formData.TEMPAT_LAHIR || "");
        createFormData.append("pendidikan_terakhir", formData.PENDIDIKAN_TERAKHIR || "");
        createFormData.append("tahun_lulus", formData.TAHUN_LULUS || "");
        createFormData.append("universitas", formData.UNIVERSITAS || "");
        createFormData.append("no_sertifikat_pendidik", formData.NO_SERTIFIKAT_PENDIDIK || "");
        createFormData.append("tahun_sertifikat", formData.TAHUN_SERTIFIKAT || "");
        createFormData.append("keahlian", formData.KEAHLIAN || ""); // ✅ ganti dari mapel_diampu
        createFormData.append("password", formData.PASSWORD || "123456");

        if (formData.TGL_LAHIR) {
          const date = formData.TGL_LAHIR instanceof Date
            ? formData.TGL_LAHIR
            : new Date(formData.TGL_LAHIR);
          createFormData.append("tgl_lahir", date.toISOString().split("T")[0]);
        }

        if (formData.FOTO instanceof File) {
          createFormData.append("foto", formData.FOTO);
        }

        await axios.post(`${API_URL}/master-guru`, createFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toastRef.current?.showToast("00", "Guru baru berhasil ditambahkan");
      }

      onHide();
      reloadData && reloadData();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toastRef.current?.showToast(
        "99",
        err.response?.data?.message || "Terjadi kesalahan server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={formData.GURU_ID ? "Edit Guru" : "Tambah Guru"}
      visible={visible}
      onHide={onHide}
      className="rounded-lg shadow-lg"
      style={{ width: "60rem", maxHeight: "90vh" }}
    >
      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {/* === DATA KEPEGAWAIAN === */}
        <div className="col-span-2">
          <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
            Data Kepegawaian
          </h4>
        </div>

        {/* NIP */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            NIP <span className="text-red-500">*</span>
          </label>
          <InputText
            className={inputClass("NIP")}
            value={formData.NIP || ""}
            onChange={(e) => setFormData({ ...formData, NIP: e.target.value })}
            required
          />
        </div>

        {/* Nama */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <InputText
            className={inputClass("NAMA")}
            value={formData.NAMA || ""}
            onChange={(e) => setFormData({ ...formData, NAMA: e.target.value })}
            required
          />
        </div>

        {/* Pangkat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pangkat
          </label>
          <InputText
            className={inputClass("PANGKAT")}
            value={formData.PANGKAT || ""}
            onChange={(e) => setFormData({ ...formData, PANGKAT: e.target.value })}
          />
        </div>

        {/* Jabatan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Jabatan
          </label>
          <Dropdown
            value={formData.KODE_JABATAN || ""}
            options={jabatanOptions}
            onChange={(e) => setFormData({ ...formData, KODE_JABATAN: e.value })}
            className="w-full"
            placeholder={loadingJabatan ? "Memuat..." : "Pilih Jabatan"}
            disabled={loadingJabatan}
            filter
            showClear
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Status Kepegawaian <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.STATUS_KEPEGAWAIAN || ""}
            options={statusOptions}
            onChange={(e) =>
              setFormData({ ...formData, STATUS_KEPEGAWAIAN: e.value })
            }
            className="w-full"
            placeholder="Pilih status"
            required
          />
        </div>

        {/* Keahlian */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Keahlian
          </label>
          <InputText
            className={inputClass("KEAHLIAN")}
            value={formData.KEAHLIAN || ""}
            onChange={(e) =>
              setFormData({ ...formData, KEAHLIAN: e.target.value })
            }
            placeholder="Contoh: Matematika, Fisika, Teknologi"
          />
        </div>

        {/* === DATA PRIBADI === */}
        <div className="col-span-2 mt-3">
          <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
            Data Pribadi
          </h4>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <InputText
            type="email"
            className={inputClass("EMAIL")}
            value={formData.EMAIL || ""}
            onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })}
            disabled={!!formData.GURU_ID}
            required
          />
          {formData.GURU_ID && (
            <small className="text-gray-500">Email tidak dapat diubah</small>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.GENDER || ""}
            options={genderOptions}
            onChange={(e) => setFormData({ ...formData, GENDER: e.value })}
            className="w-full"
            placeholder="Pilih gender"
            required
          />
        </div>

        {/* Tempat Lahir */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tanggal Lahir
          </label>
          <Calendar
            value={formData.TGL_LAHIR ? new Date(formData.TGL_LAHIR) : null}
            onChange={(e) =>
              setFormData({
                ...formData,
                TGL_LAHIR: e.value ? e.value.toISOString().split("T")[0] : "",
              })
            }
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full"
          />
        </div>

        {/* No Telp */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            No. Telepon
          </label>
          <InputText
            className={inputClass("NO_TELP")}
            value={formData.NO_TELP || ""}
            onChange={(e) => setFormData({ ...formData, NO_TELP: e.target.value })}
          />
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Alamat
          </label>
          <InputText
            className={inputClass("ALAMAT")}
            value={formData.ALAMAT || ""}
            onChange={(e) => setFormData({ ...formData, ALAMAT: e.target.value })}
          />
        </div>

        {/* === DATA PENDIDIKAN === */}
        <div className="col-span-2 mt-3">
          <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
            Data Pendidikan
          </h4>
        </div>

        {/* Pendidikan Terakhir */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pendidikan Terakhir
          </label>
          <InputText
            className={inputClass("PENDIDIKAN_TERAKHIR")}
            value={formData.PENDIDIKAN_TERAKHIR || ""}
            onChange={(e) =>
              setFormData({ ...formData, PENDIDIKAN_TERAKHIR: e.target.value })
            }
            placeholder="Contoh: S1, S2"
          />
        </div>

        {/* Universitas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Universitas
          </label>
          <InputText
            className={inputClass("UNIVERSITAS")}
            value={formData.UNIVERSITAS || ""}
            onChange={(e) =>
              setFormData({ ...formData, UNIVERSITAS: e.target.value })
            }
          />
        </div>

        {/* Tahun Lulus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tahun Lulus
          </label>
          <InputText
            className={inputClass("TAHUN_LULUS")}
            value={formData.TAHUN_LULUS || ""}
            onChange={(e) =>
              setFormData({ ...formData, TAHUN_LULUS: e.target.value })
            }
            maxLength={4}
            placeholder="Contoh: 2020"
          />
        </div>

        {/* No Sertifikat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            No. Sertifikat Pendidik
          </label>
          <InputText
            className={inputClass("NO_SERTIFIKAT_PENDIDIK")}
            value={formData.NO_SERTIFIKAT_PENDIDIK || ""}
            onChange={(e) =>
              setFormData({ ...formData, NO_SERTIFIKAT_PENDIDIK: e.target.value })
            }
          />
        </div>

        {/* Tahun Sertifikat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tahun Sertifikat
          </label>
          <InputText
            className={inputClass("TAHUN_SERTIFIKAT")}
            value={formData.TAHUN_SERTIFIKAT || ""}
            onChange={(e) =>
              setFormData({ ...formData, TAHUN_SERTIFIKAT: e.target.value })
            }
            maxLength={4}
            placeholder="Contoh: 2021"
          />
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Foto Profil
          </label>
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            name="foto"
            accept="image/*"
            maxFileSize={2000000}
            onSelect={handleFileSelect}
            chooseLabel={formData.FOTO ? "Ubah Foto" : "Pilih Foto"}
            className="w-full"
            auto={false}
          />
          {formData.FOTO instanceof File && (
            <small className="text-green-600">
              File terpilih: {formData.FOTO.name}
            </small>
          )}
        </div>

        {/* Password */}
        {!formData.GURU_ID && (
          <div className="col-span-2 mt-3">
            <h4 className="text-lg font-semibold mb-2 text-primary border-b pb-2">
              Keamanan Akun
            </h4>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <InputText
              type="password"
              className={inputClass("PASSWORD")}
              value={formData.PASSWORD || ""}
              onChange={(e) =>
                setFormData({ ...formData, PASSWORD: e.target.value })
              }
              placeholder="Minimal 8 karakter"
              minLength={8}
            />
            <small className="text-gray-500">
              Kosongkan untuk menggunakan password default: 123456
            </small>
          </div>
        )}

        {/* Tombol Simpan */}
        <div className="col-span-2 flex justify-end gap-2 pt-4 border-t mt-4">
          <Button
            type="button"
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            type="submit"
            label={loading ? "Menyimpan..." : "Simpan"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            disabled={loading}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default FormGuru;
