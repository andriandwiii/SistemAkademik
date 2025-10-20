"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import axios from "axios";

const SiswaDetailDialog = ({ visible, onHide, siswa }) => {
  const [transaksi, setTransaksi] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_TRANSAKSI = `${process.env.NEXT_PUBLIC_API_URL}/transaksi-siswa`;

  useEffect(() => {
    if (siswa && visible) {
      setLoading(true);
      axios
        .get(API_TRANSAKSI)
        .then((res) => {
          const data = res.data.data;
          // cari transaksi berdasarkan SISWA_ID di dalam item.siswa
          const transaksiSiswa = data.find(
            (item) => item.siswa && item.siswa.SISWA_ID === siswa.SISWA_ID
          );
          setTransaksi(transaksiSiswa || null);
        })
        .catch((err) => {
          console.error(err);
          setTransaksi(null);
        })
        .finally(() => setLoading(false));
    }
  }, [siswa, visible, API_TRANSAKSI]);

  return (
    <Dialog
      header="Detail Siswa"
      visible={visible}
      style={{ width: "750px" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
    >
      {siswa ? (
        <>
          {/* Data Identitas */}
          <Card className="shadow-md border-round-lg mb-3">
            <div className="grid text-sm p-3">
              <div className="col-6">
                <p><strong>ID:</strong> {siswa.SISWA_ID}</p>
                <p><strong>NIS:</strong> {siswa.NIS}</p>
                <p><strong>NISN:</strong> {siswa.NISN}</p>
                <p><strong>Nama:</strong> {siswa.NAMA}</p>
                <p><strong>Jenis Kelamin:</strong> {siswa.GENDER === "L" ? "Laki-laki" : "Perempuan"}</p>
                <p><strong>Tempat Lahir:</strong> {siswa.TEMPAT_LAHIR || "-"}</p>
                <p><strong>Tanggal Lahir:</strong> {siswa.TGL_LAHIR ? new Date(siswa.TGL_LAHIR).toLocaleDateString() : "-"}</p>
                <p><strong>Agama:</strong> {siswa.AGAMA || "-"}</p>
              </div>

              <div className="col-6">
                <p><strong>Alamat:</strong> {siswa.ALAMAT || "-"}</p>
                <p><strong>No Telp:</strong> {siswa.NO_TELP || "-"}</p>
                <p><strong>Email:</strong> {siswa.EMAIL}</p>
                <p><strong>Status:</strong> {siswa.STATUS}</p>

                {/* Kelas, Jurusan, Tahun Masuk */}
                {loading ? (
                  <p>Memuat kelas/jurusan...</p>
                ) : transaksi ? (
                  <>
                    <p><strong>Kelas:</strong> {transaksi.kelas ? `${transaksi.kelas.TINGKATAN} ${transaksi.kelas.NAMA_KELAS}` : "-"}</p>
                    <p><strong>Jurusan:</strong> {transaksi.kelas ? transaksi.kelas.NAMA_JURUSAN : "-"}</p>
                    <p><strong>Tahun Masuk:</strong> {transaksi.TAHUN_AJARAN || "-"}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Kelas:</strong> -</p>
                    <p><strong>Jurusan:</strong> -</p>
                    <p><strong>Tahun Masuk:</strong> -</p>
                  </>
                )}

                <p><strong>Gol Darah:</strong> {siswa.GOL_DARAH || "-"}</p>
                <p><strong>Tinggi/Berat:</strong> {siswa.TINGGI || "-"} cm / {siswa.BERAT || "-"} kg</p>
                <p><strong>Kebutuhan Khusus:</strong> {siswa.KEBUTUHAN_KHUSUS || "-"}</p>
              </div>
            </div>
          </Card>

          {/* Foto */}
          {siswa.FOTO && (
            <Card className="shadow-md border-round-lg mb-3">
              <div className="text-center">
                <img
                  src={siswa.FOTO}
                  alt="Foto Siswa"
                  className="border-round-lg"
                  style={{ maxWidth: "200px" }}
                />
              </div>
            </Card>
          )}

          <Divider align="center">Orang Tua / Wali</Divider>

          {/* Data Orang Tua */}
          {siswa.orang_tua && siswa.orang_tua.length > 0 ? (
            siswa.orang_tua.map((ortu, index) => (
              <Card key={index} className="shadow-md border-round-lg mb-2">
                <div className="grid text-sm p-3">
                  <div className="col-6">
                    <p><strong>Jenis:</strong> {ortu.JENIS}</p>
                    <p><strong>Nama:</strong> {ortu.NAMA}</p>
                  </div>
                  <div className="col-6">
                    <p><strong>Pekerjaan:</strong> {ortu.PEKERJAAN || "-"}</p>
                    <p><strong>Pendidikan:</strong> {ortu.PENDIDIKAN || "-"}</p>
                    <p><strong>No HP:</strong> {ortu.NO_HP || "-"}</p>
                    <p><strong>Alamat:</strong> {ortu.ALAMAT || "-"}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">Belum ada data orang tua/wali</p>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">Memuat data...</p>
      )}
    </Dialog>
  );
};

export default SiswaDetailDialog;
