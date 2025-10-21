"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import axios from "axios";

const SiswaDetailDialog = ({ visible, onHide, siswa }) => {
  const [transaksi, setTransaksi] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_TRANSAKSI = `${API_URL}/transaksi-siswa`;

  useEffect(() => {
    if (siswa && visible) {
      setLoading(true);
      axios
        .get(API_TRANSAKSI)
        .then((res) => {
          const data = res.data.data;
          const transaksiSiswa = data.find(
            (item) => item.siswa && item.siswa.SISWA_ID === siswa.SISWA_ID
          );
          setTransaksi(transaksiSiswa || null);
        })
        .catch((err) => {
          console.error("Gagal memuat transaksi siswa:", err);
          setTransaksi(null);
        })
        .finally(() => setLoading(false));
    }
  }, [siswa, visible, API_TRANSAKSI]);

  return (
    <Dialog
      header="Detail Siswa"
      visible={visible}
      style={{ width: "800px" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
    >
      {siswa ? (
        <>
          {/* ====== DATA IDENTITAS ====== */}
          <Card className="shadow-md border-round-lg mb-3">
            <div className="grid text-sm p-3">
              <div className="col-6">
                <p><strong>ID:</strong> {siswa.SISWA_ID}</p>
                <p><strong>NIS:</strong> {siswa.NIS}</p>
                <p><strong>NISN:</strong> {siswa.NISN}</p>
                <p><strong>Nama:</strong> {siswa.NAMA}</p>
                <p><strong>Jenis Kelamin:</strong> {siswa.GENDER === "L" ? "Laki-laki" : "Perempuan"}</p>
                <p><strong>Tempat Lahir:</strong> {siswa.TEMPAT_LAHIR || "-"}</p>
                <p><strong>Tanggal Lahir:</strong> {siswa.TGL_LAHIR ? new Date(siswa.TGL_LAHIR).toLocaleDateString("id-ID") : "-"}</p>
                <p><strong>Agama:</strong> {siswa.AGAMA || "-"}</p>
                <p><strong>Alamat:</strong> {siswa.ALAMAT || "-"}</p>
                <p><strong>No. Telp:</strong> {siswa.NO_TELP || "-"}</p>
                <p><strong>Email:</strong> {siswa.EMAIL}</p>
                <p><strong>Status:</strong> {siswa.STATUS}</p>
              </div>

              <div className="col-6">
                {loading ? (
                  <p>Memuat kelas dan jurusan...</p>
                ) : transaksi ? (
                  <>
                    <p><strong>Kelas:</strong> {transaksi.kelas ? `${transaksi.kelas.TINGKATAN} ${transaksi.kelas.NAMA_KELAS}` : "-"}</p>
                    <p><strong>Jurusan:</strong> {transaksi.kelas?.NAMA_JURUSAN || "-"}</p>
                    <p><strong>Tahun Masuk:</strong> {transaksi.TAHUN_AJARAN || "-"}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Kelas:</strong> -</p>
                    <p><strong>Jurusan:</strong> -</p>
                    <p><strong>Tahun Masuk:</strong> -</p>
                  </>
                )}

                <p><strong>Golongan Darah:</strong> {siswa.GOL_DARAH || "-"}</p>
                <p><strong>Tinggi / Berat:</strong> {siswa.TINGGI || "-"} cm / {siswa.BERAT || "-"} kg</p>
                <p><strong>Kebutuhan Khusus:</strong> {siswa.KEBUTUHAN_KHUSUS || "-"}</p>

                {/* FOTO SISWA */}
                {siswa.FOTO && (
                  <div className="text-center mt-3">
                    <img
                      src={`${API_URL}${siswa.FOTO}`}
                      alt="Foto Siswa"
                      className="border-round-lg shadow-2"
                      style={{ maxWidth: "160px", height: "160px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Divider align="center">Data Orang Tua</Divider>

          {/* ====== DATA AYAH ====== */}
          <Card className="shadow-md border-round-lg mb-2">
            <div className="grid text-sm p-3">
              <div className="col-6">
                <p><strong>Nama Ayah:</strong> {siswa.NAMA_AYAH || "-"}</p>
                <p><strong>Pekerjaan Ayah:</strong> {siswa.PEKERJAAN_AYAH || "-"}</p>
                <p><strong>Pendidikan Ayah:</strong> {siswa.PENDIDIKAN_AYAH || "-"}</p>
              </div>
              <div className="col-6">
                <p><strong>Alamat Ayah:</strong> {siswa.ALAMAT_AYAH || "-"}</p>
                <p><strong>No. Telp Ayah:</strong> {siswa.NO_TELP_AYAH || "-"}</p>
              </div>
            </div>
          </Card>

          {/* ====== DATA IBU ====== */}
          <Card className="shadow-md border-round-lg mb-2">
            <div className="grid text-sm p-3">
              <div className="col-6">
                <p><strong>Nama Ibu:</strong> {siswa.NAMA_IBU || "-"}</p>
                <p><strong>Pekerjaan Ibu:</strong> {siswa.PEKERJAAN_IBU || "-"}</p>
                <p><strong>Pendidikan Ibu:</strong> {siswa.PENDIDIKAN_IBU || "-"}</p>
              </div>
              <div className="col-6">
                <p><strong>Alamat Ibu:</strong> {siswa.ALAMAT_IBU || "-"}</p>
                <p><strong>No. Telp Ibu:</strong> {siswa.NO_TELP_IBU || "-"}</p>
              </div>
            </div>
          </Card>

          {/* ====== DATA WALI ====== */}
          <Divider align="center">Data Wali</Divider>
          <Card className="shadow-md border-round-lg">
            <div className="grid text-sm p-3">
              <div className="col-6">
                <p><strong>Nama Wali:</strong> {siswa.NAMA_WALI || "-"}</p>
                <p><strong>Pekerjaan Wali:</strong> {siswa.PEKERJAAN_WALI || "-"}</p>
                <p><strong>Pendidikan Wali:</strong> {siswa.PENDIDIKAN_WALI || "-"}</p>
              </div>
              <div className="col-6">
                <p><strong>Alamat Wali:</strong> {siswa.ALAMAT_WALI || "-"}</p>
                <p><strong>No. Telp Wali:</strong> {siswa.NO_TELP_WALI || "-"}</p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <p className="text-center text-gray-500">Memuat data siswa...</p>
      )}
    </Dialog>
  );
};

export default SiswaDetailDialog;
