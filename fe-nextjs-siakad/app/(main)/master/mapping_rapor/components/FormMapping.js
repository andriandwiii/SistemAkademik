"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

export default function FormMapping({ visible, onHide, selectedData, onSave }) {
  const [formData, setFormData] = useState({
    MAPEL_ID: "",
    NAMA_LOKAL: "",
    KELOMPOK_ID: null,
    NO_URUT: ""
  });
  
  const [kelompokOptions, setKelompokOptions] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchKelompok();
      if (selectedData) {
        setFormData({
          MAPEL_ID: selectedData.MAPEL_ID,
          NAMA_LOKAL: selectedData.NAMA_LOKAL || selectedData.NAMA_MAPEL,
          KELOMPOK_ID: selectedData.KELOMPOK_ID,
          NO_URUT: selectedData.NO_URUT || ""
        });
      }
    }
  }, [visible, selectedData]);

  const fetchKelompok = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master-kelompok`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setKelompokOptions(res.data.data.map(k => ({ label: k.NAMA_KELOMPOK, value: k.ID })));
    } catch (err) { console.error(err); }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog 
      header="Setting Tampilan Rapor" 
      visible={visible} 
      style={{ width: "450px" }} 
      onHide={onHide}
      footer={
        <div className="mt-3">
          <Button label="Batal" icon="pi pi-times" text onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSave} autoFocus />
        </div>
      }
    >
      <div className="flex flex-column gap-3 mt-2">
        <div className="flex flex-column gap-1">
          <label className="font-bold">Nama Mata Pelajaran (Asli)</label>
          <InputText value={selectedData?.NAMA_MAPEL || ""} disabled className="surface-100" />
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Nama Tampilan Rapor</label>
          <InputText 
            value={formData.NAMA_LOKAL} 
            onChange={(e) => setFormData({ ...formData, NAMA_LOKAL: e.target.value })} 
            placeholder="Contoh: Pend. Agama Islam"
          />
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Kelompok Mapel</label>
          <Dropdown 
            value={formData.KELOMPOK_ID} 
            options={kelompokOptions} 
            onChange={(e) => setFormData({ ...formData, KELOMPOK_ID: e.value })} 
            placeholder="Pilih Kelompok"
          />
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-bold">Nomor Urut di Rapor</label>
          <InputText 
            value={formData.NO_URUT} 
            keyfilter="int"
            onChange={(e) => setFormData({ ...formData, NO_URUT: e.target.value })} 
            placeholder="Contoh: 1"
          />
        </div>
      </div>
    </Dialog>
  );
}