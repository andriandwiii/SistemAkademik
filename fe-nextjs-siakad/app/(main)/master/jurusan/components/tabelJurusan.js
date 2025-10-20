"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const TabelJurusanStyles = {
  datatable: {
    backgroundColor: "#f4f4f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  buttonWarning: {
    backgroundColor: "#f9a825",
    border: "none",
  },
  buttonWarningHover: {
    backgroundColor: "#f57f17",
  },
  buttonDanger: {
    backgroundColor: "#d32f2f",
    border: "none",
  },
  buttonDangerHover: {
    backgroundColor: "#c62828",
  },
};

const TabelJurusan = ({ data, loading, onEdit, onDelete }) => {
  // 🔹 Template tombol aksi Edit & Hapus
  const actionTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        size="small"
        style={TabelJurusanStyles.buttonWarning}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor =
            TabelJurusanStyles.buttonWarningHover.backgroundColor)
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor =
            TabelJurusanStyles.buttonWarning.backgroundColor)
        }
        onClick={() => onEdit(rowData)}
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        style={TabelJurusanStyles.buttonDanger}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor =
            TabelJurusanStyles.buttonDangerHover.backgroundColor)
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor =
            TabelJurusanStyles.buttonDanger.backgroundColor)
        }
        onClick={() => onDelete(rowData)}
        tooltip="Hapus"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={data}
        paginator
        rows={10}
        loading={loading}
        size="small"
        scrollable
        style={TabelJurusanStyles.datatable}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="Tidak ada data jurusan ditemukan."
      >
        <Column field="JURUSAN_ID" header="ID Jurusan" sortable />
        <Column field="KODE_JURUSAN" header="Kode Jurusan" sortable />
        <Column field="KETERANGAN" header="Keterangan" sortable />
        <Column
          header="Aksi"
          body={actionTemplate}
          style={{ width: "140px", textAlign: "center" }}
        />
      </DataTable>
    </div>
  );
};

export default TabelJurusan;
