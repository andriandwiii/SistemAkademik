"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GuruDetailDialog = ({ visible, onHide, guru }) => {
  const fotoUrl = guru?.FOTO
    ? guru.FOTO.startsWith("http")
      ? guru.FOTO
      : `${API_URL.replace("/api", "")}${guru.FOTO}`
    : null;

  const InfoItem = ({ label, value }) => (
    <div className="mb-3">
      <span className="text-600 text-sm font-medium block mb-1">{label}</span>
      <span className="text-900 font-semibold">{value || "-"}</span>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user-edit text-primary text-2xl"></i>
          <span className="font-bold text-xl">Detail Guru</span>
        </div>
      }
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
    >
      {guru ? (
        <div className="pb-2">
          {/* ====== HEADER CARD - FOTO & INFO UTAMA ====== */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-3">
            <div className="grid align-items-center">
              <div className="col-12 md:col-4 text-center">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Foto Guru"
                    className="border-circle shadow-4"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      margin: "0 auto",
                      border: "4px solid white",
                    }}
                  />
                ) : (
                  <div
                    className="border-circle bg-gray-200 flex align-items-center justify-content-center shadow-2"
                    style={{
                      width: "160px",
                      height: "160px",
                      margin: "0 auto",
                    }}
                  >
                    <i className="pi pi-user text-6xl text-gray-400"></i>
                  </div>
                )}
              </div>
              <div className="col-12 md:col-8">
                <h2 className="mt-0 mb-2 text-primary">{guru.NAMA}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Tag
                    severity={
                      guru.STATUS_KEPEGAWAIAN === "Aktif"
                        ? "success"
                        : "warning"
                    }
                    value={guru.STATUS_KEPEGAWAIAN || "Status"}
                    icon="pi pi-check-circle"
                  />
                  <Tag
                    severity="info"
                    value={guru.GENDER === "L" ? "Laki-laki" : "Perempuan"}
                    icon={guru.GENDER === "L" ? "pi pi-mars" : "pi pi-venus"}
                  />
                  {guru.JABATAN && (
                    <Tag
                      severity="help"
                      value={guru.JABATAN}
                      icon="pi pi-briefcase"
                    />
                  )}
                </div>
                <div className="grid">
                  <div className="col-6">
                    <InfoItem label="NIP" value={guru.NIP} />
                    <InfoItem label="Pangkat" value={guru.PANGKAT} />
                  </div>
                  <div className="col-6">
                    <InfoItem label="Email" value={guru.EMAIL} />
                    <InfoItem label="No. Telp" value={guru.NO_TELP} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ====== DATA KEPEGAWAIAN ====== */}
          <Card title="Data Kepegawaian" className="mb-4 shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <InfoItem label="NIP" value={guru.NIP} />
                <InfoItem label="Pangkat" value={guru.PANGKAT} />
                <InfoItem label="Kode Jabatan" value={guru.KODE_JABATAN} />
                <InfoItem label="Jabatan" value={guru.JABATAN} />
              </div>
              <div className="col-12 md:col-6">
                <InfoItem
                  label="Status Kepegawaian"
                  value={guru.STATUS_KEPEGAWAIAN}
                />
                <InfoItem
                  label="Keahlian" 
                  value={guru.KEAHLIAN}
                />
                <InfoItem
                  label="No. Sertifikat Pendidik"
                  value={guru.NO_SERTIFIKAT_PENDIDIK}
                />
                <InfoItem
                  label="Tahun Sertifikat"
                  value={guru.TAHUN_SERTIFIKAT}
                />
              </div>
            </div>
          </Card>

          {/* ====== DATA PRIBADI ====== */}
          <Card title="Data Pribadi" className="mb-4 shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <InfoItem label="Tempat Lahir" value={guru.TEMPAT_LAHIR} />
                <InfoItem
                  label="Tanggal Lahir"
                  value={formatDate(guru.TGL_LAHIR)}
                />
                <InfoItem
                  label="Jenis Kelamin"
                  value={guru.GENDER === "L" ? "Laki-laki" : "Perempuan"}
                />
              </div>
              <div className="col-12 md:col-6">
                <InfoItem label="Email" value={guru.EMAIL} />
                <InfoItem label="No. Telepon" value={guru.NO_TELP} />
                <InfoItem label="Alamat" value={guru.ALAMAT} />
              </div>
            </div>
          </Card>

          {/* ====== DATA PENDIDIKAN ====== */}
          <Card title="Data Pendidikan" className="mb-4 shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <InfoItem
                  label="Pendidikan Terakhir"
                  value={guru.PENDIDIKAN_TERAKHIR}
                />
                <InfoItem label="Universitas" value={guru.UNIVERSITAS} />
              </div>
              <div className="col-12 md:col-6">
                <InfoItem label="Tahun Lulus" value={guru.TAHUN_LULUS} />
                <InfoItem
                  label="No. Sertifikat Pendidik"
                  value={guru.NO_SERTIFIKAT_PENDIDIK}
                />
              </div>
            </div>
            {guru.TAHUN_SERTIFIKAT && (
              <div className="surface-100 border-round p-3 mt-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-certificate text-blue-500"></i>
                  <span className="text-700">
                    <strong>Tahun Sertifikat:</strong> {guru.TAHUN_SERTIFIKAT}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Divider align="center">
            <span className="bg-white px-3 text-700 font-semibold">
              Data Akun & Sistem
            </span>
          </Divider>

          {/* ====== DATA AKUN ====== */}
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <i className="pi pi-user-edit"></i>
                <span>Data Akun</span>
              </div>
            }
            className="shadow-2"
          >
            <div className="grid">
              <div className="col-12 md:col-6">
                <InfoItem label="ID Guru" value={guru.GURU_ID} />
                <InfoItem label="Nama User" value={guru.user_name} />
                <InfoItem label="Role" value={guru.user_role} />
              </div>
              <div className="col-12 md:col-6">
                <InfoItem
                  label="Dibuat Pada"
                  value={formatDate(guru.created_at)}
                />
                <InfoItem
                  label="Terakhir Diupdate"
                  value={formatDate(guru.updated_at)}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-6">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
          <p className="text-600">Memuat data guru...</p>
        </div>
      )}
    </Dialog>
  );
};

export default GuruDetailDialog;
