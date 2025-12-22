import { db } from "../core/config/knex.js";
const table = "absensi_siswa";

const formatRow = (r) => {
    if (!r) return null;
    return {
        ID: r.ID,
        ABSENSI_ID: r.ABSENSI_ID,
        NIS: r.NIS,
        NAMA: r.NAMA_SISWA,
        posisi: { 
            TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN, 
            KELAS: r.KELAS_ID, 
            TINGKATAN: r.TINGKATAN_ID 
        },
        TANGGAL: r.TANGGAL,
        STATUS: r.STATUS,
        BK: {
            CATATAN: r.CATATAN_BK,
            PERLU_TINDAKAN: !!r.PERLU_TINDAKAN,
            SUDAH_DITANGGANI: !!r.SUDAH_DITANGGANI,
            PETUGAS_BK: r.NAMA_GURU_BK || "Belum Ditangani"
        },
        INPUTER: r.NAMA_TU || r.INPUT_OLEH_ID, 
        created_at: r.created_at
    };
};

export const getRiwayatSiswaIndividual = async (identifier) => {
    let query = db(`${table} as a`)
        .select(
            "a.*", "ta.NAMA_TAHUN_AJARAN", "s.NAMA as NAMA_SISWA", 
            "s.EMAIL as EMAIL_SISWA", "g1.NAMA as NAMA_TU", "g2.NAMA as NAMA_GURU_BK"
        )
        .join("master_siswa as s", "a.NIS", "s.NIS")
        .join("master_tahun_ajaran as ta", "a.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
        .leftJoin("master_guru as g1", "a.INPUT_OLEH_ID", "g1.NIP")
        .leftJoin("master_guru as g2", "a.VERIFIKASI_BK_ID", "g2.NIP");

    if (identifier.includes('@')) {
        query.where("s.EMAIL", identifier);
    } else {
        query.where("a.NIS", identifier);
    }

    const rows = await query.orderBy("a.TANGGAL", "desc");
    return rows.map(formatRow);
};

export const getAbsensiByKelasAndTanggal = async (kelasId, tanggal) => {
    let query = db(`${table} as a`)
        .select("a.*", "s.NAMA as NAMA_SISWA", "ta.NAMA_TAHUN_AJARAN")
        .join("master_siswa as s", "a.NIS", "s.NIS")
        .join("master_tahun_ajaran as ta", "a.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID");
    if (tanggal) query.whereRaw("DATE(a.TANGGAL) = ?", [tanggal]);
    if (kelasId) query.andWhere("a.KELAS_ID", kelasId);
    const rows = await query.orderBy("a.created_at", "desc");
    return rows.map(formatRow);
};

export const bulkInsertAbsensi = async (data, trx) => await (trx || db)(table).insert(data);
export const updateTU = async (id, data) => await db(table).where("ABSENSI_ID", id).update(data);
export const remove = async (id) => await db(table).where("ABSENSI_ID", id).del();
export const getById = async (id) => await db(table).where("ABSENSI_ID", id).first();