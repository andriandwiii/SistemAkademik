"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";

const DialogSiswaKelas = ({ visible, onHide, jadwalData, token }) => {
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (visible && jadwalData) {
      fetchSiswaByKelas();
    }
  }, [visible, jadwalData]);

  const fetchSiswaByKelas = async () => {
    if (!jadwalData?.kelas?.KELAS_ID) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        const allTransaksi = res.data.data || [];

        // Filter siswa berdasarkan kelas, jurusan, dan tingkatan
        const siswaFiltered = allTransaksi.filter((t) => {
          return (
            t.tingkatan?.TINGKATAN_ID === jadwalData.tingkatan?.TINGKATAN_ID &&
            t.jurusan?.JURUSAN_ID === jadwalData.jurusan?.JURUSAN_ID &&
            t.kelas?.KELAS_ID === jadwalData.kelas?.KELAS_ID
          );
        });

        setSiswaList(siswaFiltered);
      }
    } catch (err) {
      console.error("Gagal fetch siswa:", err);
      setSiswaList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSiswaList([]);
    onHide();
  };

  const headerTemplate = () => (
    <div className="flex align-items-center gap-3">
      <i className="pi pi-users text-primary" style={{ fontSize: "1.5rem" }}></i>
      <div>
        <h4 className="m-0">Daftar Siswa</h4>
        <small className="text-gray-600">
          Kelas: {jadwalData?.kelas?.KELAS_ID || "-"} |{" "}
          Tingkatan: {jadwalData?.tingkatan?.TINGKATAN || "-"} |{" "}
          Jurusan: {jadwalData?.jurusan?.NAMA_JURUSAN || "-"}
        </small>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header={headerTemplate}
      style={{ width: "70vw" }}
      modal
      dismissableMask
    >
      <div className="p-2">
        {loading ? (
          <div
            className="flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <ProgressSpinner
              style={{ width: "50px", height: "50px" }}
              strokeWidth="4"
            />
          </div>
        ) : (
          <>
            <div className="mb-3 p-3 bg-blue-50 border-round">
              <div className="flex justify-content-between align-items-center">
                <div>
                  <i className="pi pi-info-circle mr-2"></i>
                  <strong>Total Siswa: {siswaList.length} orang</strong>
                </div>
                <div className="text-sm text-gray-600">
                  Ruang:{" "}
                  {jadwalData?.kelas?.ruang?.NAMA_RUANG ||
                    jadwalData?.kelas?.NAMA_RUANG ||
                    "-"}
                </div>
              </div>
            </div>

            {siswaList.length === 0 ? (
              <div className="text-center p-5">
                <i
                  className="pi pi-inbox text-gray-400"
                  style={{ fontSize: "3rem" }}
                ></i>
                <p className="text-gray-600 mt-3">
                  Belum ada siswa di kelas ini
                </p>
              </div>
            ) : (
              <DataTable
                value={siswaList}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: "50rem" }}
                stripedRows
                showGridlines
                emptyMessage="Tidak ada data siswa"
              >
                <Column
                  header="No"
                  body={(_, options) => options.rowIndex + 1}
                  style={{ width: "60px", textAlign: "center" }}
                />
                <Column
                  header="NIS"
                  body={(row) => row.siswa?.NIS || "-"}
                  style={{ width: "120px" }}
                />
                <Column
                  header="Nama Siswa"
                  body={(row) => row.siswa?.NAMA || "-"}
                  style={{ minWidth: "200px" }}
                />
                <Column
                  header="Jenis Kelamin"
                  body={(row) => {
                    const g = row.siswa?.GENDER;
                    return g ? (
                      <span
                        className={
                          g === "L" ? "text-blue-600" : "text-pink-600"
                        }
                      >
                        <i
                          className={`pi ${
                            g === "L" ? "pi-mars" : "pi-venus"
                          } mr-1`}
                        ></i>
                        {g}
                      </span>
                    ) : (
                      "-"
                    );
                  }}
                  style={{ width: "120px", textAlign: "center" }}
                />
                <Column
                  header="Tingkatan"
                  body={(row) => row.tingkatan?.TINGKATAN || "-"}
                  style={{ width: "120px" }}
                />
                <Column
                  header="Tahun Ajaran"
                  body={(row) => row.tahun_ajaran?.NAMA_TAHUN_AJARAN || "-"}
                  style={{ width: "150px" }}
                />
              </DataTable>
            )}
          </>
        )}

        <div className="flex justify-content-end mt-3">
          <Button
            label="Tutup"
            icon="pi pi-times"
            onClick={handleClose}
            className="p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogSiswaKelas;
