"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

const TabelInformasiSekolah = ({ data, loading, onEdit, onDelete }) => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSekolah, setSelectedSekolah] = useState(null);

  // Fungsi untuk membuka dialog detail
  const showDetail = (sekolah) => {
    setSelectedSekolah(sekolah);
    setDetailVisible(true);
  };

  // Template untuk tombol aksi
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          className="p-button-info"
          onClick={() => showDetail(rowData)}
          tooltip="Lihat Detail"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-pencil"
          rounded
          className="p-button-warning"
          onClick={() => onEdit(rowData)}
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          className="p-button-danger"
          onClick={() => onDelete(rowData)}
          tooltip="Hapus"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // Template untuk status sekolah
  const statusBodyTemplate = (rowData) => {
    const severity = rowData.STATUS_SEKOLAH === "Negeri" ? "info" : "success";
    return <Tag severity={severity} value={rowData.STATUS_SEKOLAH}></Tag>;
  };

  // Komponen untuk menampilkan Dialog Detail (SEKARANG MENAMPILKAN SEMUANYA)
  const renderDetailDialog = () => {
    if (!selectedSekolah) return null;

    // Fungsi kecil untuk format tanggal agar mudah dibaca
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    return (
      <Dialog
        header={`Detail Lengkap: ${selectedSekolah.NAMA_SEKOLAH}`}
        visible={detailVisible}
        style={{ width: "80vw", maxWidth: "1200px" }}
        onHide={() => setDetailVisible(false)}
        maximizable
      >
        <div className="p-fluid grid gap-2 text-sm">
          {/* --- Identitas Utama --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Identitas Utama</b>
            </Divider>
          </div>
           <div className="col-12 md:col-6">
            <strong>INFO_ID Sekolah:</strong> {selectedSekolah.INFO_ID}
          </div>
          <div className="col-12 md:col-6">
            <strong>Nama Sekolah:</strong> {selectedSekolah.NAMA_SEKOLAH}
          </div>
          <div className="col-12 md:col-3">
            <strong>NPSN:</strong> {selectedSekolah.NPSN}
          </div>
          <div className="col-12 md:col-3">
            <strong>NSS:</strong> {selectedSekolah.NSS}
          </div>
          <div className="col-12 md:col-6">
            <strong>Jenjang Pendidikan:</strong> {selectedSekolah.JENJANG_PENDIDIKAN}
          </div>
          <div className="col-12 md:col-6">
            <strong>Status Sekolah:</strong> {selectedSekolah.STATUS_SEKOLAH}
          </div>
          <div className="col-12">
            <strong>Visi:</strong> {selectedSekolah.VISI}
          </div>
          <div className="col-12">
            <strong>Misi:</strong> {selectedSekolah.MISI}
          </div>
          <div className="col-12">
            <strong>Motto:</strong> {selectedSekolah.MOTTO}
          </div>

          {/* --- Alamat & Kontak --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Alamat & Kontak</b>
            </Divider>
          </div>
          <div className="col-12">
            <strong>Alamat Jalan:</strong> {selectedSekolah.ALAMAT_JALAN}
          </div>
          <div className="col-6 md:col-2">
            <strong>RT/RW:</strong> {`${selectedSekolah.RT}/${selectedSekolah.RW}`}
          </div>
          <div className="col-6 md:col-4">
            <strong>Kelurahan/Desa:</strong> {selectedSekolah.KELURAHAN_DESA}
          </div>
          <div className="col-12 md:col-6">
            <strong>Kecamatan:</strong> {selectedSekolah.KECAMATAN}
          </div>
          <div className="col-12 md:col-6">
            <strong>Kabupaten/Kota:</strong> {selectedSekolah.KABUPATEN_KOTA}
          </div>
          <div className="col-12 md:col-6">
            <strong>Provinsi:</strong> {selectedSekolah.PROVINSI}
          </div>
          <div className="col-12 md:col-4">
            <strong>Kode Pos:</strong> {selectedSekolah.KODE_POS}
          </div>
          <div className="col-12 md:col-4">
            <strong>Telepon:</strong> {selectedSekolah.TELEPON}
          </div>
          <div className="col-12 md:col-4">
            <strong>Fax:</strong> {selectedSekolah.FAX}
          </div>
          <div className="col-12 md:col-6">
            <strong>Email:</strong> {selectedSekolah.EMAIL}
          </div>
          <div className="col-12 md:col-6">
            <strong>Website:</strong>{" "}
            <a href={selectedSekolah.WEBSITE} target="_blank" rel="noopener noreferrer">
              {selectedSekolah.WEBSITE}
            </a>
          </div>

          {/* --- Legalitas & Akreditasi --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Legalitas & Akreditasi</b>
            </Divider>
          </div>
          <div className="col-6 md:col-3">
            <strong>Akreditasi:</strong> {selectedSekolah.AKREDITASI}
          </div>
          <div className="col-6 md:col-9">
            <strong>No. SK Akreditasi:</strong> {selectedSekolah.NO_SK_AKREDITASI}
          </div>
          <div className="col-12 md:col-6">
            <strong>Tanggal SK Akreditasi:</strong> {formatDate(selectedSekolah.TANGGAL_SK_AKREDITASI)}
          </div>
          <div className="col-12 md:col-6">
            <strong>Tanggal Akhir Akreditasi:</strong> {formatDate(selectedSekolah.TANGGAL_AKHIR_AKREDITASI)}
          </div>
          <div className="col-12">
            <strong>Penyelenggara:</strong> {selectedSekolah.PENYELENGGARA}
          </div>
          <div className="col-12 md:col-6">
            <strong>No. SK Pendirian:</strong> {selectedSekolah.NO_SK_PENDIRIAN}
          </div>
          <div className="col-12 md:col-6">
            <strong>Tanggal SK Pendirian:</strong> {formatDate(selectedSekolah.TANGGAL_SK_PENDIRIAN)}
          </div>
          <div className="col-12 md:col-6">
            <strong>No. SK Izin Operasional:</strong> {selectedSekolah.NO_SK_IZIN_OPERASIONAL}
          </div>
          <div className="col-12 md:col-6">
            <strong>Tanggal SK Izin Operasional:</strong> {formatDate(selectedSekolah.TANGGAL_SK_IZIN_OPERASIONAL)}
          </div>

          {/* --- Penanggung Jawab --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Penanggung Jawab</b>
            </Divider>
          </div>
          <div className="col-12 md:col-6">
            <strong>Nama Kepala Sekolah:</strong> {selectedSekolah.NAMA_KEPALA_SEKOLAH}
          </div>
          <div className="col-12 md:col-6">
            <strong>NIP Kepala Sekolah:</strong> {selectedSekolah.NIP_KEPALA_SEKOLAH}
          </div>
          <div className="col-12 md:col-6">
            <strong>Email Kepala Sekolah:</strong> {selectedSekolah.EMAIL_KEPALA_SEKOLAH}
          </div>
          <div className="col-12 md:col-6">
            <strong>No. HP Kepala Sekolah:</strong> {selectedSekolah.NO_HP_KEPALA_SEKOLAH}
          </div>
          <div className="col-12 md:col-6">
            <strong>Nama Operator Dapodik:</strong> {selectedSekolah.NAMA_OPERATOR_DAPODIK}
          </div>
          <div className="col-12 md:col-6">
            <strong>Email Operator Dapodik:</strong> {selectedSekolah.EMAIL_OPERATOR_DAPODIK}
          </div>
          <div className="col-12 md:col-6">
            <strong>No. HP Operator Dapodik:</strong> {selectedSekolah.NO_HP_OPERATOR_DAPODIK}
          </div>
          <div className="col-12 md:col-6">
            <strong>Nama Ketua Komite:</strong> {selectedSekolah.NAMA_KETUA_KOMITE}
          </div>

          {/* --- Operasional & Finansial --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Operasional & Finansial</b>
            </Divider>
          </div>
          <div className="col-12 md:col-6">
            <strong>Kurikulum:</strong> {selectedSekolah.KURIKULUM_DIGUNAKAN}
          </div>
          <div className="col-12 md:col-6">
            <strong>Waktu Penyelenggaraan:</strong> {selectedSekolah.WAKTU_PENYELENGGARAAN}
          </div>
          <div className="col-12 md:col-6">
            <strong>Sumber Listrik:</strong> {selectedSekolah.SUMBER_LISTRIK}
          </div>
          <div className="col-12 md:col-6">
            <strong>Akses Internet:</strong> {selectedSekolah.AKSES_INTERNET}
          </div>
          <div className="col-12 md:col-4">
            <strong>Nama Bank:</strong> {selectedSekolah.NAMA_BANK}
          </div>
          <div className="col-12 md:col-4">
            <strong>Nomor Rekening:</strong> {selectedSekolah.NOMOR_REKENING}
          </div>
          <div className="col-12 md:col-4">
            <strong>a.n. Rekening:</strong> {selectedSekolah.NAMA_PEMILIK_REKENING}
          </div>
          <div className="col-12">
            <strong>NPWP:</strong> {selectedSekolah.NPWP}
          </div>

          {/* --- Digital & Lainnya --- */}
          <div className="col-12">
            <Divider align="left">
              <b className="text-lg">Digital & Lainnya</b>
            </Divider>
          </div>
          <div className="col-12 md:col-6">
            <strong>URL Logo:</strong> {selectedSekolah.LOGO_SEKOLAH_URL}
          </div>
          <div className="col-6 md:col-3">
            <strong>Lintang:</strong> {selectedSekolah.LINTANG}
          </div>
          <div className="col-6 md:col-3">
            <strong>Bujur:</strong> {selectedSekolah.BUJUR}
          </div>
          <div className="col-12 flex flex-wrap gap-3">
            <a
              href={selectedSekolah.FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>{" "}
            |
            <a
              href={selectedSekolah.INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>{" "}
            |
            <a
              href={selectedSekolah.TWITTER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter/X
            </a>{" "}
            |
            <a
              href={selectedSekolah.YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          </div>
          <div className="col-12">
            <strong>Status Aktif:</strong> {selectedSekolah.IS_ACTIVE ? "Ya" : "Tidak"}
          </div>
        </div>
      </Dialog>
    );
  };

  return (
    <>
      <DataTable
        value={data}
        paginator
        rows={10}
        loading={loading}
        size="small"
        stripedRows
        scrollable
        dataKey="INFO_ID"
        header="Data Master Informasi Sekolah"
        emptyMessage="Tidak ada data ditemukan."
        className="p-datatable-customers"
      >
         <Column
          field="INFO_ID"
          header=" Sekolah"
          sortable
          style={{ minWidth: "250px" }}
        />
        <Column
          field="NAMA_SEKOLAH"
          header="Nama Sekolah"
          sortable
          style={{ minWidth: "250px" }}
        />
        <Column
          field="NPSN"
          header="NPSN"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="STATUS_SEKOLAH"
          header="Status"
          body={statusBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="NAMA_KEPALA_SEKOLAH"
          header="Kepala Sekolah"
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column field="TELEPON" header="Telepon" style={{ minWidth: "150px" }} />
        <Column
          header="Aksi"
          body={actionBodyTemplate}
          frozen
          alignFrozen="right"
          style={{ minWidth: "150px" }}
        />
      </DataTable>

      {/* Panggil fungsi untuk merender Dialog Detail */}
      {renderDetailDialog()}
    </>
  );
};

export default TabelInformasiSekolah;
