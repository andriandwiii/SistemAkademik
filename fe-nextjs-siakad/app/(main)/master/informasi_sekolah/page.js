"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import TabelInformasiSekolah from "./components/tabelInformasiSekolah";
import FormDialogSekolah from "./components/formDialogInformasiSekolah";
import HeaderBar from "@/app/components/headerbar";
import ToastNotifier from "@/app/components/ToastNotifier";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InfoSekolahPage = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    INFO_ID: 0,
    NAMA_SEKOLAH: "",
    NPSN: "",
    NSS: "",
    JENJANG_PENDIDIKAN: "",
    STATUS_SEKOLAH: "",
    VISI: "",
    MISI: "",
    MOTTO: "",
    ALAMAT_JALAN: "",
    RT: "",
    RW: "",
    KELURAHAN_DESA: "",
    KECAMATAN: "",
    KABUPATEN_KOTA: "",
    PROVINSI: "",
    KODE_POS: "",
    TELEPON: "",
    FAX: "",
    EMAIL: "",
    WEBSITE: "",
    AKREDITASI: "",
    NO_SK_AKREDITASI: "",
    TANGGAL_SK_AKREDITASI: "",
    TANGGAL_AKHIR_AKREDITASI: "",
    NAMA_KEPALA_SEKOLAH: "",
    NIP_KEPALA_SEKOLAH: "",
    EMAIL_KEPALA_SEKOLAH: "",
    NO_HP_KEPALA_SEKOLAH: "",
    PENYELENGGARA: "",
    NO_SK_PENDIRIAN: "",
    TANGGAL_SK_PENDIRIAN: "",
    NO_SK_IZIN_OPERASIONAL: "",
    TANGGAL_SK_IZIN_OPERASIONAL: "",
    LINTANG: "",
    BUJUR: "",
    LOGO_SEKOLAH_URL: "",
    NAMA_BANK: "",
    NOMOR_REKENING: "",
    NAMA_PEMILIK_REKENING: "",
    NPWP: "",
    KURIKULUM_DIGUNAKAN: "",
    WAKTU_PENYELENGGARAAN: "",
    SUMBER_LISTRIK: "",
    AKSES_INTERNET: "",
    NAMA_OPERATOR_DAPODIK: "",
    EMAIL_OPERATOR_DAPODIK: "",
    NO_HP_OPERATOR_DAPODIK: "",
    NAMA_KETUA_KOMITE: "",
    FACEBOOK_URL: "",
    INSTAGRAM_URL: "",
    TWITTER_X_URL: "",
    YOUTUBE_URL: "",
    IS_ACTIVE: true,
  });

  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  useEffect(() => {
    fetchSekolah();
  }, []);

  const fetchSekolah = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-infosekolah`);
      setData(res.data);
      setOriginalData(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NAMA_SEKOLAH?.trim()) newErrors.NAMA_SEKOLAH = "Nama Sekolah wajib diisi";
    if (!formData.NPSN?.trim()) newErrors.NPSN = "NPSN wajib diisi";
    if (!formData.STATUS_SEKOLAH?.trim()) newErrors.STATUS_SEKOLAH = "Status Sekolah wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (keyword) => {
    const lowercasedKeyword = keyword.toLowerCase();
    if (!keyword) {
      setData(originalData);
    } else {
      const filtered = originalData.filter(
        (item) =>
          item.NAMA_SEKOLAH.toLowerCase().includes(lowercasedKeyword) ||
          item.NPSN.toLowerCase().includes(lowercasedKeyword) ||
          item.STATUS_SEKOLAH.toLowerCase().includes(lowercasedKeyword)
      );
      setData(filtered);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isEdit = !!formData.INFO_ID;
    const url = isEdit
      ? `${API_URL}/master-infosekolah/${formData.INFO_ID}`
      : `${API_URL}/master-infosekolah`;

    try {
      if (isEdit) {
        await axios.put(url, formData);
        toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        await axios.post(url, formData);
        toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }
      fetchSekolah();
      setDialogVisible(false);
      resetForm();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setDialogVisible(true);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus informasi sekolah ${row.NAMA_KURIKULUM}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-infosekolah/${row.INFO_ID}`);
          fetchSekolah();
          toastRef.current?.showToast("00", "Data berhasil dihapus");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      INFO_ID: 0,
      NAMA_SEKOLAH: "",
      NPSN: "",
      NSS: "",
      JENJANG_PENDIDIKAN: "",
      STATUS_SEKOLAH: "",
      VISI: "",
      MISI: "",
      MOTTO: "",
      ALAMAT_JALAN: "",
      RT: "",
      RW: "",
      KELURAHAN_DESA: "",
      KECAMATAN: "",
      KABUPATEN_KOTA: "",
      PROVINSI: "",
      KODE_POS: "",
      TELEPON: "",
      FAX: "",
      EMAIL: "",
      WEBSITE: "",
      AKREDITASI: "",
      NO_SK_AKREDITASI: "",
      TANGGAL_SK_AKREDITASI: "",
      TANGGAL_AKHIR_AKREDITASI: "",
      NAMA_KEPALA_SEKOLAH: "",
      NIP_KEPALA_SEKOLAH: "",
      EMAIL_KEPALA_SEKOLAH: "",
      NO_HP_KEPALA_SEKOLAH: "",
      PENYELENGGARA: "",
      NO_SK_PENDIRIAN: "",
      TANGGAL_SK_PENDIRIAN: "",
      NO_SK_IZIN_OPERASIONAL: "",
      TANGGAL_SK_IZIN_OPERASIONAL: "",
      LINTANG: "",
      BUJUR: "",
      LOGO_SEKOLAH_URL: "",
      NAMA_BANK: "",
      NOMOR_REKENING: "",
      NAMA_PEMILIK_REKENING: "",
      NPWP: "",
      KURIKULUM_DIGUNAKAN: "",
      WAKTU_PENYELENGGARAAN: "",
      SUMBER_LISTRIK: "",
      AKSES_INTERNET: "",
      NAMA_OPERATOR_DAPODIK: "",
      EMAIL_OPERATOR_DAPODIK: "",
      NO_HP_OPERATOR_DAPODIK: "",
      NAMA_KETUA_KOMITE: "",
      FACEBOOK_URL: "",
      INSTAGRAM_URL: "",
      TWITTER_X_URL: "",
      YOUTUBE_URL: "",
      IS_ACTIVE: true,
    });
    setErrors({});
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Informasi Sekolah</h3>

      <div className="flex items-center justify-end">
        <HeaderBar
          title=""
          placeholder="Cari Sekolah"
          onSearch={handleSearch}
          onAddClick={() => {
            resetForm();
            setDialogVisible(true);
          }}
        />
      </div>

      <TabelInformasiSekolah
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialogSekolah
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          resetForm();
        }}
        onChange={setFormData}
        onSubmit={handleSubmit}
        formData={formData}
        errors={errors}
      />
    </div>
  );
};

export default InfoSekolahPage;
