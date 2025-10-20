import { db } from "../core/config/knex.js";

export const getDashboardInfo = async () => {
  try {
    // Jumlah siswa
    const jumlahSiswa = await db('master_siswa').count('* as total');
    // Jumlah guru
    const jumlahGuru = await db('master_guru').count('* as total');
    // Jumlah kelas
    const jumlahKelas = await db('master_kelas').count('* as total');
    // Jumlah mata pelajaran
    const jumlahMapel = await db('master_mata_pelajaran').count('* as total');

    // Statistik distribusi kelas
    const distribusiKelas = await db('master_kelas')
      .select('NAMA_KELAS')
      .count('* as total')
      .groupBy('NAMA_KELAS');

    // Data chart untuk statistik
    const chartData = {
      labels: ['Siswa', 'Guru', 'Kelas', 'Mata Pelajaran'],
      datasets: [
        {
          label: 'Statistik',
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350'],
          data: [
            jumlahSiswa[0].total,
            jumlahGuru[0].total,
            jumlahKelas[0].total,
            jumlahMapel[0].total,
          ],
        },
      ],
    };

    // Tren pendaftaran siswa per hari
    const trenSiswa = await db('master_siswa')
      .select(db.raw('DAYOFWEEK(TGL_LAHIR) as hari'), db.raw('COUNT(*) as total'))
      .groupBy('hari');

    const hariLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const trend = {
      labels: hariLabels,
      siswa: hariLabels.map((_, idx) => {
        const found = trenSiswa.find((row) => Number(row.hari) === (idx === 0 ? 1 : idx + 1));
        return found ? found.total : 0;
      }),
    };

    // Struktur distribusi kelas untuk chart
    const distribusi = {
      labels: distribusiKelas.map((r) => r.NAMA_KELAS),
      data: distribusiKelas.map((r) => r.total),
    };

    // Return data untuk dashboard
    return {
      cards: [
        {
          title: 'Total Siswa',
          value: jumlahSiswa[0].total,
          color: '#42A5F5',
          icon: 'pi pi-users',
        },
        {
          title: 'Total Guru',
          value: jumlahGuru[0].total,
          color: '#66BB6A',
          icon: 'pi pi-graduation-cap',
        },
        {
          title: 'Total Kelas',
          value: jumlahKelas[0].total,
          color: '#FFA726',
          icon: 'pi pi-school',
        },
        {
          title: 'Total Mata Pelajaran',
          value: jumlahMapel[0].total,
          color: '#EF5350',
          icon: 'pi pi-book',
        },
      ],
      chart: chartData, // Grafik untuk siswa, guru, kelas, mata pelajaran
      trend, // Tren pendaftaran siswa
      distribusi, // Distribusi kelas
    };
  } catch (error) {
    console.error('Error getDashboardInfo:', error);
    throw error;
  }
};
