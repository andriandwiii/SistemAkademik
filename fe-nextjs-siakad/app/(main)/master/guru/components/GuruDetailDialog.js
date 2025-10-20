"use client";

import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";

const GuruDetailDialog = ({ visible, onHide, guru }) => {
  return (
    <Dialog
      header="Detail Guru"
      visible={visible}
      style={{ width: "600px" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
    >
      {guru ? (
        <Card className="shadow-md border-round-lg">
          <div className="grid text-sm p-3">
            <div className="col-6">
              <p><strong>ID:</strong> {guru.GURU_ID}</p>
              <p><strong>User ID:</strong> {guru.user_id}</p>
              <p><strong>NIP:</strong> {guru.NIP}</p>
              <p>
                <strong>Nama:</strong> {guru.GELAR_DEPAN} {guru.NAMA}
                {guru.GELAR_BELAKANG ? `, ${guru.GELAR_BELAKANG}` : ""}
              </p>
              <p><strong>Email:</strong> {guru.EMAIL}</p>
              <p><strong>No. Telp:</strong> {guru.NO_TELP}</p>
            </div>
            <div className="col-6">
              <p><strong>Pangkat:</strong> {guru.PANGKAT}</p>
              <p><strong>Jabatan:</strong> {guru.JABATAN}</p>
              <p><strong>Status:</strong> {guru.STATUS_KEPEGAWAIAN}</p>
              <p><strong>Tanggal Lahir:</strong> {new Date(guru.TGL_LAHIR).toLocaleDateString()}</p>
              <p><strong>Tempat Lahir:</strong> {guru.TEMPAT_LAHIR}</p>
              <p><strong>Jenis Kelamin:</strong> {guru.GENDER === "L" ? "Laki-laki" : "Perempuan"}</p>
            </div>
          </div>

          <Divider />
          <div className="px-3">
            <p><strong>Alamat:</strong> {guru.ALAMAT}</p>
          </div>
        </Card>
      ) : (
        <p className="text-center text-gray-500">Memuat data...</p>
      )}
    </Dialog>
  );
};

export default GuruDetailDialog;
