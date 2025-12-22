"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${API_URL}/master-komponen-biaya`;

const JENIS_BIAYA_OPTIONS = [
  { label: "Rutin", value: "RUTIN" },
  { label: "Non Rutin", value: "NON_RUTIN" },
];

export default function FormKomponenBiaya({
  visible,
  onHide,
  selected,
  onSuccess,
}) {
  const [form, setForm] = useState({
    NAMA_KOMPONEN: "",
    JENIS_BIAYA: null,
    DESKRIPSI: "",
    WAJIB: true,
    URUTAN: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setForm({
        NAMA_KOMPONEN: selected.NAMA_KOMPONEN || "",
        JENIS_BIAYA: selected.JENIS_BIAYA || null,
        DESKRIPSI: selected.DESKRIPSI || "",
        WAJIB: selected.WAJIB ?? true,
        URUTAN: selected.URUTAN || 0,
      });
    } else {
      setForm({
        NAMA_KOMPONEN: "",
        JENIS_BIAYA: null,
        DESKRIPSI: "",
        WAJIB: true,
        URUTAN: 0,
      });
    }
  }, [selected, visible]);

  const submit = async () => {
    if (!form.NAMA_KOMPONEN || !form.JENIS_BIAYA) {
      alert("Nama komponen dan jenis biaya wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (selected) {
        await axios.put(
          `${ENDPOINT}/${selected.KOMPONEN_ID}`,
          form
        );
      } else {
        await axios.post(ENDPOINT, form);
      }
      onSuccess();
    } catch {
      alert("Gagal menyimpan komponen biaya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={selected ? "Edit Komponen Biaya" : "Tambah Komponen Biaya"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label>Nama Komponen</label>
          <InputText
            value={form.NAMA_KOMPONEN}
            onChange={(e) =>
              setForm({ ...form, NAMA_KOMPONEN: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Jenis Biaya</label>
          <Dropdown
            value={form.JENIS_BIAYA}
            options={JENIS_BIAYA_OPTIONS}
            onChange={(e) =>
              setForm({ ...form, JENIS_BIAYA: e.value })
            }
            placeholder="Pilih jenis biaya"
          />
        </div>

        <div className="field">
          <label>Deskripsi</label>
          <InputTextarea
            value={form.DESKRIPSI}
            rows={3}
            onChange={(e) =>
              setForm({ ...form, DESKRIPSI: e.target.value })
            }
          />
        </div>

        <div className="field flex align-items-center gap-2">
          <label>Wajib</label>
          <InputSwitch
            checked={form.WAJIB}
            onChange={(e) =>
              setForm({ ...form, WAJIB: e.value })
            }
          />
        </div>

        <div className="field">
          <label>Urutan</label>
          <InputNumber
            value={form.URUTAN}
            onValueChange={(e) =>
              setForm({ ...form, URUTAN: e.value })
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
