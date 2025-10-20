"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../../components/ToastNotifier";
import CustomDataTable from "../../../../components/DataTable";
import FormAbsensiGuru from "./components/FormAbsensiGuru";

export default function AbsensiGuruPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [absensi, setAbsensi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");
  const [guruOptions, setGuruOptions] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Ambil token dari localStorage
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  // Fetch absensi dan guru saat token tersedia
  useEffect(() => {
    if (token) {
      fetchAbsensi();
      fetchGuruOptions();
    }
  }, [token]);

  // --- Fetch Absensi ---
  const fetchAbsensi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/absensi/guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;
      setAbsensi(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data absensi guru");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- Fetch Guru Options ---
  const fetchGuruOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/master-guru/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const options = (json.data || []).map((g) => ({
        label: `${g.GELAR_DEPAN ? g.GELAR_DEPAN + " " : ""}${g.NAMA}${
          g.GELAR_BELAKANG ? ", " + g.GELAR_BELAKANG : ""
        }`,
        value: g.GURU_ID,
      }));
      setGuruOptions(options);
    } catch (err) {
      console.error("Error fetching guru:", err);
      setGuruOptions([]);
    }
  };

  // --- Tambah / Edit Absensi ---
  const handleSubmit = async (data) => {
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/absensi/guru`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Absensi berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedAbsensi) {
        await fetch(`${API_URL}/absensi/guru/${selectedAbsensi.ABSENSI_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Absensi berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchAbsensi();
        setDialogMode(null);
        setSelectedAbsensi(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan absensi guru");
    }
  };

  // --- Hapus Absensi ---
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus absensi guru "${rowData.guru?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/absensi/guru/${rowData.ABSENSI_ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Absensi berhasil dihapus");
          if (isMounted.current) await fetchAbsensi();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus absensi guru");
        }
      },
    });
  };

  // --- Kolom DataTable ---
  const columns = [
    {
      header: "Nama Guru",
      body: (row) => (
        <div>
          <strong>{row.guru?.NAMA || "-"}</strong>
          <br />
          <small>{row.guru?.NIP || "-"}</small>
        </div>
      ),
    },
    {
      field: "TANGGAL",
      header: "Tanggal",
      body: (row) =>
        new Date(row.TANGGAL).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
    },
    { field: "JAM_MASUK", header: "Jam Masuk" },
    { field: "JAM_PULANG", header: "Jam Pulang" },
    { field: "LATITUDE", header: "Latitude" },
    { field: "LONGITUDE", header: "Longitude" },
    { field: "JARAK_SEKOLAH", header: "Jarak Sekolah (m)" },
    { field: "STATUS", header: "Status" },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          {!row.JAM_PULANG && (
            <Button
              label="Check Out"
              icon="pi pi-sign-out"
              size="small"
              severity="success"
              onClick={async () => {
                const now = new Date();
                const jamPulang = now.toTimeString().split(" ")[0].substring(0, 5);
                try {
                  await fetch(`${API_URL}/absensi/guru/${row.ABSENSI_ID}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ JAM_PULANG: jamPulang }),
                  });
                  toastRef.current?.showToast("00", "Check-Out berhasil");
                  fetchAbsensi();
                } catch (err) {
                  console.error(err);
                  toastRef.current?.showToast("01", "Gagal melakukan Check-Out");
                }
              }}
            />
          )}
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedAbsensi(row);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Absensi Guru</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Absensi"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedAbsensi(null);
          }}
        />
      </div>

      <CustomDataTable data={absensi} loading={isLoading} columns={columns} />

      <ConfirmDialog />

        <FormAbsensiGuru
        visible={dialogMode !== null} // add atau edit
        mode={dialogMode} // 'add' atau 'edit'
        selectedAbsensi={selectedAbsensi}
        onHide={() => {
            setDialogMode(null);
            setSelectedAbsensi(null);
        }}
        onSave={handleSubmit}
        guruOptions={guruOptions}
        />


      <ToastNotifier ref={toastRef} />
    </div>
  );
}
