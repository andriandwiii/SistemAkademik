"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FormKategoriSiswa({
  visible,
  onHide,
  selected,
  onSuccess,
}) {
  const [form, setForm] = useState({
    NAMA_KATEGORI: "",
    DESKRIPSI: "",
    PRIORITAS: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setForm({
        NAMA_KATEGORI: selected.NAMA_KATEGORI || "",
        DESKRIPSI: selected.DESKRIPSI || "",
        PRIORITAS: selected.PRIORITAS || 0,
      });
    } else {
      setForm({
        NAMA_KATEGORI: "",
        DESKRIPSI: "",
        PRIORITAS: 0,
      });
    }
  }, [selected, visible]);

  const submit = async () => {
    if (!form.NAMA_KATEGORI) {
      alert("Nama kategori wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (selected) {
        await axios.put(
          `${API_URL}/master-kategori-siswa/${selected.KATEGORI_ID}`,
          form
        );
      } else {
        await axios.post(
          `${API_URL}/master-kategori-siswa`,
          form
        );
      }
      onSuccess();
    } catch {
      alert("Gagal menyimpan kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={selected ? "Edit Kategori" : "Tambah Kategori"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label>Nama Kategori</label>
          <InputText
            value={form.NAMA_KATEGORI}
            onChange={(e) =>
              setForm({ ...form, NAMA_KATEGORI: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Deskripsi</label>
          <InputTextarea
            value={form.DESKRIPSI}
            onChange={(e) =>
              setForm({ ...form, DESKRIPSI: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="field">
          <label>Prioritas</label>
          <InputNumber
            value={form.PRIORITAS}
            onValueChange={(e) =>
              setForm({ ...form, PRIORITAS: e.value })
            }
          />
        </div>

        <div className="flex justify-content-end mt-4">
          <Button
            label="Simpan"
            icon="pi pi-save"
            onClick={submit}
            loading={loading}
          />
        </div>
      </div>
    </Dialog>
  );
}
