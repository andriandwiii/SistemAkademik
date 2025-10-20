import * as Agama from "../models/masterAgamaModel.js";

export async function getAllAgama(req, res) {
  try {
    const data = await Agama.getAll();
    if (data.length === 0) {
      return res.status(404).json({ message: "Tidak ada data agama" });
    }
    res.status(200).json({ data });
  } catch (err) {
    console.error("Gagal get agama:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
}

export async function createAgama(req, res) {
  try {
    const { NAMAAGAMA } = req.body;

    if (!NAMAAGAMA || NAMAAGAMA.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Nama agama wajib diisi dan tidak boleh kosong" });
    }

    await Agama.create({ NAMAAGAMA }); // <- sudah benar
    res.status(201).json({ message: "Agama berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal menambahkan agama:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menambahkan agama" });
  }
}

export async function updateAgama(req, res) {
  try {
    const id = req.params.id;
    const { NAMAAGAMA } = req.body;

    if (!NAMAAGAMA || NAMAAGAMA.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Nama agama wajib diisi dan tidak boleh kosong" });
    }

    const existing = await Agama.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Data agama tidak ditemukan" });
    }

    await Agama.update(id, { NAMAAGAMA });
    res.status(200).json({ message: "Agama berhasil diperbarui" });
  } catch (err) {
    console.error("Gagal memperbarui agama:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat memperbarui agama" });
  }
}

export async function deleteAgama(req, res) {
  try {
    const id = req.params.id;

    const existing = await Agama.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Data agama tidak ditemukan" });
    }

    await Agama.remove(id);
    res.status(200).json({ message: "Agama berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus agama:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus agama" });
  }
}