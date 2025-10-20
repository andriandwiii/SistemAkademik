"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const TabelWilayah = ({ data, loading, onEdit, onDelete }) => {
  return (
    <DataTable value={data} paginator rows={10} loading={loading} size="small" scrollable>
      <Column field="id" header="ID Wilayah" />
      <Column field="PROVINSI" header="Provinsi" />
      <Column field="KABUPATEN" header="Kabupaten" />
      <Column field="KECAMATAN" header="Kecamatan" />
      <Column field="DESA_KELURAHAN" header="Desa/Kelurahan" />
      <Column field="KODEPOS" header="Kode Pos" />
      <Column field="RT" header="RT" />
      <Column field="RW" header="RW" />
      <Column field="JALAN" header="Jalan" />
      <Column field="STATUS" header="Status" />
      <Column
        header="Aksi"
        body={(row) => (
          <div className="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              onClick={() => onEdit(row)}
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              onClick={() => onDelete(row)}
            />
          </div>
        )}
        style={{ width: "150px" }}
      />
    </DataTable>
  );
};

export default TabelWilayah;
