"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormDialogSiswa = ({ visible, onHide, selectedSiswa, token, reloadData, toastRef }) => {
  const fileUploadRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    EMAIL: "",
    NIS: "",
    NISN: "",
    NAMA: "",
    GENDER: "",
    TEMPAT_LAHIR: "",
    TGL_LAHIR: null,
    AGAMA: "",
    ALAMAT: "",
    NO_TELP: "",
    STATUS: "Aktif",
    GOL_DARAH: "",
    TINGGI: null,
    BERAT: null,
    KEBUTUHAN_KHUSUS: "",
    FOTO: null,
    PASSWORD: "",
  });

  const [orangTua, setOrangTua] = useState({
    NAMA_AYAH: "",
    PEKERJAAN_AYAH: "",
    PENDIDIKAN_AYAH: "",
    ALAMAT_AYAH: "",
    NO_TELP_AYAH: "",
    NAMA_IBU: "",
    PEKERJAAN_IBU: "",
    PENDIDIKAN_IBU: "",
    ALAMAT_IBU: "",
    NO_TELP_IBU: "",
    NAMA_WALI: "",
    PEKERJAAN_WALI: "",
    PENDIDIKAN_WALI: "",
    ALAMAT_WALI: "",
    NO_TELP_WALI: "",
  });

  useEffect(() => {
    if (selectedSiswa) {
      setFormData({
        EMAIL: selectedSiswa.EMAIL || "",
        NIS: selectedSiswa.NIS || "",
        NISN: selectedSiswa.NISN || "",
        NAMA: selectedSiswa.NAMA || "",
        GENDER: selectedSiswa.GENDER || "",
        TEMPAT_LAHIR: selectedSiswa.TEMPAT_LAHIR || "",
        TGL_LAHIR: selectedSiswa.TGL_LAHIR ? new Date(selectedSiswa.TGL_LAHIR) : null,
        AGAMA: selectedSiswa.AGAMA || "",
        ALAMAT: selectedSiswa.ALAMAT || "",
        NO_TELP: selectedSiswa.NO_TELP || "",
        STATUS: selectedSiswa.STATUS || "Aktif",
        GOL_DARAH: selectedSiswa.GOL_DARAH || "",
        TINGGI: selectedSiswa.TINGGI || null,
        BERAT: selectedSiswa.BERAT || null,
        KEBUTUHAN_KHUSUS: selectedSiswa.KEBUTUHAN_KHUSUS || "",
        FOTO: null,
        PASSWORD: "",
      });

      setOrangTua({
        NAMA_AYAH: selectedSiswa.NAMA_AYAH || "",
        PEKERJAAN_AYAH: selectedSiswa.PEKERJAAN_AYAH || "",
        PENDIDIKAN_AYAH: selectedSiswa.PENDIDIKAN_AYAH || "",
        ALAMAT_AYAH: selectedSiswa.ALAMAT_AYAH || "",
        NO_TELP_AYAH: selectedSiswa.NO_TELP_AYAH || "",
        NAMA_IBU: selectedSiswa.NAMA_IBU || "",
        PEKERJAAN_IBU: selectedSiswa.PEKERJAAN_IBU || "",
        PENDIDIKAN_IBU: selectedSiswa.PENDIDIKAN_IBU || "",
        ALAMAT_IBU: selectedSiswa.ALAMAT_IBU || "",
        NO_TELP_IBU: selectedSiswa.NO_TELP_IBU || "",
        NAMA_WALI: selectedSiswa.NAMA_WALI || "",
        PEKERJAAN_WALI: selectedSiswa.PEKERJAAN_WALI || "",
        PENDIDIKAN_WALI: selectedSiswa.PENDIDIKAN_WALI || "",
        ALAMAT_WALI: selectedSiswa.ALAMAT_WALI || "",
        NO_TELP_WALI: selectedSiswa.NO_TELP_WALI || "",
      });
    } else {
      resetForm();
    }
  }, [selectedSiswa, visible]);

  const resetForm = () => {
    setFormData({
      EMAIL: "",
      NIS: "",
      NISN: "",
      NAMA: "",
      GENDER: "",
      TEMPAT_LAHIR: "",
      TGL_LAHIR: null,
      AGAMA: "",
      ALAMAT: "",
      NO_TELP: "",
      STATUS: "Aktif",
      GOL_DARAH: "",
      TINGGI: null,
      BERAT: null,
      KEBUTUHAN_KHUSUS: "",
      FOTO: null,
      PASSWORD: "",
    });
    setOrangTua({
      NAMA_AYAH: "",
      PEKERJAAN_AYAH: "",
      PENDIDIKAN_AYAH: "",
      ALAMAT_AYAH: "",
      NO_TELP_AYAH: "",
      NAMA_IBU: "",
      PEKERJAAN_IBU: "",
      PENDIDIKAN_IBU: "",
      ALAMAT_IBU: "",
      NO_TELP_IBU: "",
      NAMA_WALI: "",
      PEKERJAAN_WALI: "",
      PENDIDIKAN_WALI: "",
      ALAMAT_WALI: "",
      NO_TELP_WALI: "",
    });
    // Reset file upload
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const genders = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" },
  ];

  const agamaList = [
    "Islam",
    "Kristen",
    "Katolik",
    "Hindu",
    "Buddha",
    "Konghucu",
  ].map((a) => ({ label: a, value: a }));

  const statusList = ["Aktif", "Lulus", "Pindah", "Nonaktif"].map((s) => ({
    label: s,
    value: s,
  }));

  const golDarahList = ["A", "B", "AB", "O"].map((g) => ({
    label: g,
    value: g,
  }));

  const handleFileSelect = (e) => {
    const file = e.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, FOTO: file }));
    }
  };

  const handleSubmit = async () => {
    // Validasi field wajib
    if (!formData.EMAIL || !formData.NIS || !formData.NISN || !formData.NAMA || !formData.GENDER) {
      toastRef.current?.showToast("99", "Mohon lengkapi semua field yang wajib diisi (*)");
      return;
    }

    if (!selectedSiswa && !formData.PASSWORD) {
      toastRef.current?.showToast("99", "Password wajib diisi untuk siswa baru");
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();

      // Data siswa - gunakan lowercase sesuai dengan backend
      submitFormData.append("email", formData.EMAIL);
      submitFormData.append("name", formData.NAMA);
      if (!selectedSiswa && formData.PASSWORD) {
        submitFormData.append("password", formData.PASSWORD);
      }
      submitFormData.append("nis", formData.NIS);
      submitFormData.append("nisn", formData.NISN);
      submitFormData.append("nama", formData.NAMA);
      submitFormData.append("gender", formData.GENDER);
      
      // Optional fields - hanya append jika ada nilai
      if (formData.TEMPAT_LAHIR) {
        submitFormData.append("tempat_lahir", formData.TEMPAT_LAHIR);
      }
      if (formData.TGL_LAHIR) {
        submitFormData.append("tgl_lahir", formData.TGL_LAHIR.toISOString().split("T")[0]);
      }
      if (formData.AGAMA) {
        submitFormData.append("agama", formData.AGAMA);
      }
      if (formData.ALAMAT) {
        submitFormData.append("alamat", formData.ALAMAT);
      }
      if (formData.NO_TELP) {
        submitFormData.append("no_telp", formData.NO_TELP);
      }
      
      submitFormData.append("status", formData.STATUS);
      
      if (formData.GOL_DARAH) {
        submitFormData.append("gol_darah", formData.GOL_DARAH);
      }
      if (formData.TINGGI) {
        submitFormData.append("tinggi", formData.TINGGI.toString());
      }
      if (formData.BERAT) {
        submitFormData.append("berat", formData.BERAT.toString());
      }
      if (formData.KEBUTUHAN_KHUSUS) {
        submitFormData.append("kebutuhan_khusus", formData.KEBUTUHAN_KHUSUS);
      }

      // Upload foto - pastikan ini File object
      if (formData.FOTO && formData.FOTO instanceof File) {
        submitFormData.append("foto", formData.FOTO);
      }

      // Data orang tua dalam format array
      const orangTuaArray = [];
      
      // Cek dan tambahkan data Ayah jika nama tidak kosong
      if (orangTua.NAMA_AYAH && orangTua.NAMA_AYAH.trim() !== "") {
        orangTuaArray.push({
          jenis: "Ayah",
          nama: orangTua.NAMA_AYAH,
          pekerjaan: orangTua.PEKERJAAN_AYAH || "",
          pendidikan: orangTua.PENDIDIKAN_AYAH || "",
          alamat: orangTua.ALAMAT_AYAH || "",
          no_hp: orangTua.NO_TELP_AYAH || "",
        });
      }

      // Cek dan tambahkan data Ibu jika nama tidak kosong
      if (orangTua.NAMA_IBU && orangTua.NAMA_IBU.trim() !== "") {
        orangTuaArray.push({
          jenis: "Ibu",
          nama: orangTua.NAMA_IBU,
          pekerjaan: orangTua.PEKERJAAN_IBU || "",
          pendidikan: orangTua.PENDIDIKAN_IBU || "",
          alamat: orangTua.ALAMAT_IBU || "",
          no_hp: orangTua.NO_TELP_IBU || "",
        });
      }

      // Cek dan tambahkan data Wali jika nama tidak kosong
      if (orangTua.NAMA_WALI && orangTua.NAMA_WALI.trim() !== "") {
        orangTuaArray.push({
          jenis: "Wali",
          nama: orangTua.NAMA_WALI,
          pekerjaan: orangTua.PEKERJAAN_WALI || "",
          pendidikan: orangTua.PENDIDIKAN_WALI || "",
          alamat: orangTua.ALAMAT_WALI || "",
          no_hp: orangTua.NO_TELP_WALI || "",
        });
      }

      // Hanya append orang_tua jika ada data
      if (orangTuaArray.length > 0) {
        submitFormData.append("orang_tua", JSON.stringify(orangTuaArray));
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (selectedSiswa) {
        // Update
        await axios.put(
          `${API_URL}/siswa/${selectedSiswa.SISWA_ID}`,
          submitFormData,
          config
        );
        toastRef.current?.showToast("00", "Data siswa berhasil diperbarui");
      } else {
        // Create
        await axios.post(`${API_URL}/siswa`, submitFormData, config);
        toastRef.current?.showToast("00", "Siswa baru berhasil ditambahkan");
      }

      onHide();
      reloadData();
      resetForm();
    } catch (err) {
      console.error("Gagal simpan siswa:", err);
      toastRef.current?.showToast(
        "99",
        err.response?.data?.message || "Gagal menyimpan data siswa"
      );
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2 mt-4">
      <Button
        label="Batal"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => {
          onHide();
          resetForm();
        }}
        disabled={loading}
      />
      <Button
        label={loading ? "Menyimpan..." : "Simpan"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={handleSubmit}
        disabled={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={selectedSiswa ? "Edit Data Siswa" : "Tambah Data Siswa"}
      visible={visible}
      style={{ width: "70vw", maxWidth: "900px", maxHeight: "90vh" }}
      modal
      className="p-fluid"
      footer={footer}
      onHide={() => {
        onHide();
        resetForm();
      }}
    >
      <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
        {/* Data Utama */}
        <h3 className="font-semibold mb-2 mt-2 border-b pb-1 text-primary">
          Data Utama
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label>Email <span className="text-red-500">*</span></label>
            <InputText
              value={formData.EMAIL}
              onChange={(e) =>
                setFormData({ ...formData, EMAIL: e.target.value })
              }
              disabled={!!selectedSiswa}
              required
            />
            {selectedSiswa && (
              <small className="text-gray-500">Email tidak dapat diubah</small>
            )}
          </div>
          <div>
            <label>NIS <span className="text-red-500">*</span></label>
            <InputText
              value={formData.NIS}
              onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
              required
            />
          </div>
          <div>
            <label>NISN <span className="text-red-500">*</span></label>
            <InputText
              value={formData.NISN}
              onChange={(e) =>
                setFormData({ ...formData, NISN: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Nama Lengkap <span className="text-red-500">*</span></label>
            <InputText
              value={formData.NAMA}
              onChange={(e) =>
                setFormData({ ...formData, NAMA: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Jenis Kelamin <span className="text-red-500">*</span></label>
            <Dropdown
              value={formData.GENDER}
              options={genders}
              onChange={(e) => setFormData({ ...formData, GENDER: e.value })}
              placeholder="Pilih"
              required
            />
          </div>
          <div>
            <label>Agama</label>
            <Dropdown
              value={formData.AGAMA}
              options={agamaList}
              onChange={(e) => setFormData({ ...formData, AGAMA: e.value })}
              placeholder="Pilih Agama"
            />
          </div>
          <div>
            <label>Tempat Lahir</label>
            <InputText
              value={formData.TEMPAT_LAHIR}
              onChange={(e) =>
                setFormData({ ...formData, TEMPAT_LAHIR: e.target.value })
              }
            />
          </div>
          <div>
            <label>Tanggal Lahir</label>
            <Calendar
              value={formData.TGL_LAHIR}
              onChange={(e) => setFormData({ ...formData, TGL_LAHIR: e.value })}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
          <div className="md:col-span-2">
            <label>Alamat</label>
            <InputTextarea
              rows={2}
              value={formData.ALAMAT}
              onChange={(e) =>
                setFormData({ ...formData, ALAMAT: e.target.value })
              }
            />
          </div>
          <div>
            <label>No. Telepon</label>
            <InputText
              value={formData.NO_TELP}
              onChange={(e) =>
                setFormData({ ...formData, NO_TELP: e.target.value })
              }
            />
          </div>
          <div>
            <label>Status</label>
            <Dropdown
              value={formData.STATUS}
              options={statusList}
              onChange={(e) => setFormData({ ...formData, STATUS: e.value })}
            />
          </div>
          <div>
            <label>Golongan Darah</label>
            <Dropdown
              value={formData.GOL_DARAH}
              options={golDarahList}
              onChange={(e) => setFormData({ ...formData, GOL_DARAH: e.value })}
              placeholder="Pilih"
            />
          </div>
          <div>
            <label>Tinggi Badan (cm)</label>
            <InputNumber
              value={formData.TINGGI}
              onValueChange={(e) =>
                setFormData({ ...formData, TINGGI: e.value ?? null })
              }
              suffix=" cm"
            />
          </div>
          <div>
            <label>Berat Badan (kg)</label>
            <InputNumber
              value={formData.BERAT}
              onValueChange={(e) =>
                setFormData({ ...formData, BERAT: e.value ?? null })
              }
              suffix=" kg"
            />
          </div>
          <div>
            <label>Kebutuhan Khusus</label>
            <InputText
              value={formData.KEBUTUHAN_KHUSUS}
              onChange={(e) =>
                setFormData({ ...formData, KEBUTUHAN_KHUSUS: e.target.value })
              }
            />
          </div>
          <div>
            <label>Foto Siswa</label>
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
          {!selectedSiswa && (
            <div>
              <label>Password <span className="text-red-500">*</span></label>
              <InputText
                type="password"
                value={formData.PASSWORD}
                onChange={(e) =>
                  setFormData({ ...formData, PASSWORD: e.target.value })
                }
                placeholder="Min. 8 karakter"
                required={!selectedSiswa}
              />
            </div>
          )}
        </div>

        {/* Data Orang Tua */}
        <h3 className="font-semibold mb-2 mt-4 border-b pb-1 text-primary">
          Data Orang Tua / Wali
        </h3>

        {/* Data Ayah */}
        <h4 className="font-semibold mb-2 mt-3 text-sm">Data Ayah</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label>Nama Ayah</label>
            <InputText
              value={orangTua.NAMA_AYAH}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NAMA_AYAH: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pekerjaan Ayah</label>
            <InputText
              value={orangTua.PEKERJAAN_AYAH}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PEKERJAAN_AYAH: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pendidikan Ayah</label>
            <InputText
              value={orangTua.PENDIDIKAN_AYAH}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PENDIDIKAN_AYAH: e.target.value })
              }
            />
          </div>
          <div>
            <label>Alamat Ayah</label>
            <InputText
              value={orangTua.ALAMAT_AYAH}
              onChange={(e) =>
                setOrangTua({ ...orangTua, ALAMAT_AYAH: e.target.value })
              }
            />
          </div>
          <div>
            <label>No. Telp Ayah</label>
            <InputText
              value={orangTua.NO_TELP_AYAH}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NO_TELP_AYAH: e.target.value })
              }
            />
          </div>
        </div>

        {/* Data Ibu */}
        <h4 className="font-semibold mb-2 mt-3 text-sm">Data Ibu</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label>Nama Ibu</label>
            <InputText
              value={orangTua.NAMA_IBU}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NAMA_IBU: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pekerjaan Ibu</label>
            <InputText
              value={orangTua.PEKERJAAN_IBU}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PEKERJAAN_IBU: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pendidikan Ibu</label>
            <InputText
              value={orangTua.PENDIDIKAN_IBU}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PENDIDIKAN_IBU: e.target.value })
              }
            />
          </div>
          <div>
            <label>Alamat Ibu</label>
            <InputText
              value={orangTua.ALAMAT_IBU}
              onChange={(e) =>
                setOrangTua({ ...orangTua, ALAMAT_IBU: e.target.value })
              }
            />
          </div>
          <div>
            <label>No. Telp Ibu</label>
            <InputText
              value={orangTua.NO_TELP_IBU}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NO_TELP_IBU: e.target.value })
              }
            />
          </div>
        </div>

        {/* Data Wali */}
        <h4 className="font-semibold mb-2 mt-3 text-sm">Data Wali</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label>Nama Wali</label>
            <InputText
              value={orangTua.NAMA_WALI}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NAMA_WALI: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pekerjaan Wali</label>
            <InputText
              value={orangTua.PEKERJAAN_WALI}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PEKERJAAN_WALI: e.target.value })
              }
            />
          </div>
          <div>
            <label>Pendidikan Wali</label>
            <InputText
              value={orangTua.PENDIDIKAN_WALI}
              onChange={(e) =>
                setOrangTua({ ...orangTua, PENDIDIKAN_WALI: e.target.value })
              }
            />
          </div>
          <div>
            <label>Alamat Wali</label>
            <InputText
              value={orangTua.ALAMAT_WALI}
              onChange={(e) =>
                setOrangTua({ ...orangTua, ALAMAT_WALI: e.target.value })
              }
            />
          </div>
          <div>
            <label>No. Telp Wali</label>
            <InputText
              value={orangTua.NO_TELP_WALI}
              onChange={(e) =>
                setOrangTua({ ...orangTua, NO_TELP_WALI: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FormDialogSiswa;