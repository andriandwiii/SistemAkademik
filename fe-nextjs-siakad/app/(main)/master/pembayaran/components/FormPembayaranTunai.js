"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";

const FormPembayaranTunai = ({ visible, onHide, onSave, token }) => {
  const [nis, setNis] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [selectedTagihan, setSelectedTagihan] = useState([]);
  
  const [siswaOptions, setSiswaOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [tagihanList, setTagihanList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingTagihan, setLoadingTagihan] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([fetchSiswa(), fetchTahunAjaran()]);
      setLoadingData(false);

      // Reset form
      setNis(null);
      setTahunAjaranId(null);
      setKeterangan("");
      setSelectedTagihan([]);
      setTagihanList([]);
    };

    initForm();
  }, [visible, token]);

  // Fetch tagihan when siswa and tahun ajaran selected
  useEffect(() => {
    if (nis && tahunAjaranId) {
      fetchTagihan();
    } else {
      setTagihanList([]);
      setSelectedTagihan([]);
    }
  }, [nis, tahunAjaranId]);

  const fetchSiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setSiswaOptions(
        data
          .filter((s) => s.STATUS === "Aktif")
          .map((s) => ({
            label: `${s.NIS} - ${s.NAMA}`,
            value: s.NIS,
          }))
      );
    } catch (err) {
      console.error("Gagal fetch siswa:", err);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setTahunAjaranOptions(
        data.map((ta) => ({
          label: ta.NAMA_TAHUN_AJARAN,
          value: ta.TAHUN_AJARAN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch tahun ajaran:", err);
    }
  };

  const fetchTagihan = async () => {
    setLoadingTagihan(true);
    try {
      const res = await fetch(
        `${API_URL}/tagihan/siswa/${nis}?tahun_ajaran_id=${tahunAjaranId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();

      if (json.status === "00") {
        // Filter hanya tagihan yang belum lunas
        const unpaidTagihan = (json.data || []).filter(
          (t) => t.STATUS !== "LUNAS"
        );
        setTagihanList(unpaidTagihan);
      } else {
        console.error("Error fetch tagihan:", json.message);
        setTagihanList([]);
      }
    } catch (err) {
      console.error("Gagal fetch tagihan:", err);
      setTagihanList([]);
    } finally {
      setLoadingTagihan(false);
    }
  };

  const handleSubmit = async () => {
    if (!nis || selectedTagihan.length === 0) {
      return alert("Pilih siswa dan minimal 1 tagihan!");
    }

    const data = {
      NIS: nis,
      tagihan_ids: selectedTagihan.map((t) => t.TAGIHAN_ID),
      keterangan: keterangan || null,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTotalBayar = () => {
    return selectedTagihan.reduce((sum, t) => sum + parseFloat(t.TOTAL || 0), 0);
  };

  const statusBodyTemplate = (rowData) => {
    const statusMap = {
      BELUM_BAYAR: { label: "Belum Bayar", color: "danger" },
      SEBAGIAN: { label: "Sebagian", color: "warning" },
      DISPENSASI: { label: "Dispensasi", color: "info" },
    };

    const config = statusMap[rowData.STATUS] || { label: rowData.STATUS, color: "secondary" };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold bg-${config.color}-100 text-${config.color}-700`}>
        {config.label}
      </span>
    );
  };

  return (
    <Dialog
      header="Pembayaran Tunai"
      visible={visible}
      style={{ width: "60vw" }}
      modal
      onHide={onHide}
      maximizable
    >
      <div className="p-fluid">
        {loadingData && (
          <div className="text-center mb-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
            <p>Memuat data...</p>
          </div>
        )}

        {/* Siswa */}
        <div className="field">
          <label htmlFor="nis">
            Siswa <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="nis"
            value={nis}
            options={siswaOptions}
            onChange={(e) => setNis(e.value)}
            placeholder="Pilih siswa"
            filter
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data siswa aktif"
          />
        </div>

        {/* Tahun Ajaran */}
        <div className="field">
          <label htmlFor="tahunAjaran">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="tahunAjaran"
            value={tahunAjaranId}
            options={tahunAjaranOptions}
            onChange={(e) => setTahunAjaranId(e.value)}
            placeholder="Pilih tahun ajaran"
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data tahun ajaran"
          />
        </div>

        {/* Daftar Tagihan */}
        {nis && tahunAjaranId && (
          <div className="field">
            <label>
              Pilih Tagihan yang Akan Dibayar <span className="text-red-500">*</span>
            </label>
            
            {loadingTagihan ? (
              <div className="text-center p-4">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: "1.5rem" }}></i>
                <p>Memuat tagihan...</p>
              </div>
            ) : tagihanList.length === 0 ? (
              <div className="border-1 border-gray-300 border-round p-4 text-center">
                <i className="pi pi-info-circle text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">Tidak ada tagihan yang perlu dibayar</p>
              </div>
            ) : (
              <>
                <DataTable
                  value={tagihanList}
                  selection={selectedTagihan}
                  onSelectionChange={(e) => setSelectedTagihan(e.value)}
                  dataKey="TAGIHAN_ID"
                  size="small"
                  className="mt-2"
                >
                  <Column
                    selectionMode="multiple"
                    headerStyle={{ width: "3rem" }}
                  />
                  <Column
                    field="NAMA_KOMPONEN"
                    header="Komponen"
                    body={(row) => (
                      <div>
                        <div className="font-medium">{row.NAMA_KOMPONEN}</div>
                        {row.BULAN && (
                          <small className="text-gray-500">
                            Bulan {row.BULAN}/{row.TAHUN}
                          </small>
                        )}
                      </div>
                    )}
                  />
                  <Column
                    field="TOTAL"
                    header="Total"
                    body={(row) => (
                      <span className="font-semibold text-green-600">
                        {formatRupiah(row.TOTAL)}
                      </span>
                    )}
                  />
                  <Column
                    field="STATUS"
                    header="Status"
                    body={statusBodyTemplate}
                  />
                </DataTable>

                <div className="flex justify-content-between align-items-center mt-3 p-3 bg-blue-50 border-round">
                  <span className="font-semibold">Total yang Akan Dibayar:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatRupiah(getTotalBayar())}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Keterangan */}
        <div className="field">
          <label htmlFor="keterangan">Keterangan</label>
          <InputTextarea
            id="keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={3}
            placeholder="Masukkan keterangan tambahan (opsional)"
            disabled={loadingData}
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label={loading ? "Memproses..." : "Proses Pembayaran"}
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading || loadingData || selectedTagihan.length === 0}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormPembayaranTunai;