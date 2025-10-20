'use client';

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import React from 'react';

const FormInformasiSekolah = ({ visible, formData, onHide, onChange, onSubmit }) => {
  // Handler `onChange` yang efisien untuk semua tipe input
  const handleChange = (name, value) => {
    onChange({ ...formData, [name]: value });
  };

  const statusSekolahOptions = [ { label: 'Negeri', value: 'Negeri' }, { label: 'Swasta', value: 'Swasta' } ];
  const akreditasiOptions = [ { label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }, { label: 'Belum Terakreditasi', value: 'Belum Terakreditasi' } ];

  return (
    <Dialog
      header="Master Informasi Sekolah"
      visible={visible}
      onHide={onHide}
      style={{ width: '80vw', maxWidth: '1200px' }}
      maximizable
      blockScroll
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="p-fluid"
      >
        <TabView>
          {/* TAB 1: IDENTITAS UTAMA */}
          <TabPanel header="Identitas Utama">
            <div className="formgrid grid mt-3">
              <div className="field col-12 md:col-6">
                <label htmlFor="NAMA_SEKOLAH">Nama Sekolah</label>
                <InputText id="NAMA_SEKOLAH" name="NAMA_SEKOLAH" value={formData.NAMA_SEKOLAH || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12 md:col-3">
                <label htmlFor="NPSN">NPSN</label>
                <InputText id="NPSN" name="NPSN" value={formData.NPSN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12 md:col-3">
                <label htmlFor="NSS">NSS</label>
                <InputText id="NSS" name="NSS" value={formData.NSS || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="JENJANG_PENDIDIKAN">Jenjang Pendidikan</label>
                <InputText id="JENJANG_PENDIDIKAN" name="JENJANG_PENDIDIKAN" value={formData.JENJANG_PENDIDIKAN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="STATUS_SEKOLAH">Status Sekolah</label>
                <Dropdown id="STATUS_SEKOLAH" name="STATUS_SEKOLAH" value={formData.STATUS_SEKOLAH} options={statusSekolahOptions} onChange={(e) => handleChange(e.target.name, e.value)} placeholder="Pilih Status" />
              </div>
              <div className="field col-12">
                <label htmlFor="VISI">Visi</label>
                <InputTextarea id="VISI" name="VISI" value={formData.VISI || ''} rows={3} autoResize onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12">
                <label htmlFor="MISI">Misi</label>
                <InputTextarea id="MISI" name="MISI" value={formData.MISI || ''} rows={3} autoResize onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
              <div className="field col-12">
                <label htmlFor="MOTTO">Motto</label>
                <InputText id="MOTTO" name="MOTTO" value={formData.MOTTO || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: ALAMAT & KONTAK */}
          <TabPanel header="Alamat & Kontak">
            <div className="formgrid grid mt-3">
                <div className="field col-12">
                  <label htmlFor="ALAMAT_JALAN">Alamat Jalan</label>
                  <InputText id="ALAMAT_JALAN" name="ALAMAT_JALAN" value={formData.ALAMAT_JALAN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-6 md:col-3">
                  <label htmlFor="RT">RT</label>
                  <InputText id="RT" name="RT" value={formData.RT || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-6 md:col-3">
                  <label htmlFor="RW">RW</label>
                  <InputText id="RW" name="RW" value={formData.RW || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="KELURAHAN_DESA">Kelurahan/Desa</label>
                  <InputText id="KELURAHAN_DESA" name="KELURAHAN_DESA" value={formData.KELURAHAN_DESA || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="KECAMATAN">Kecamatan</label>
                  <InputText id="KECAMATAN" name="KECAMATAN" value={formData.KECAMATAN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="KABUPATEN_KOTA">Kabupaten/Kota</label>
                  <InputText id="KABUPATEN_KOTA" name="KABUPATEN_KOTA" value={formData.KABUPATEN_KOTA || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="PROVINSI">Provinsi</label>
                  <InputText id="PROVINSI" name="PROVINSI" value={formData.PROVINSI || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="KODE_POS">Kode Pos</label>
                  <InputText id="KODE_POS" name="KODE_POS" value={formData.KODE_POS || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="TELEPON">Telepon</label>
                  <InputText id="TELEPON" name="TELEPON" value={formData.TELEPON || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="FAX">Fax</label>
                  <InputText id="FAX" name="FAX" value={formData.FAX || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="EMAIL">Email</label>
                  <InputText id="EMAIL" name="EMAIL" value={formData.EMAIL || ''} type="email" onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12">
                  <label htmlFor="WEBSITE">Website</label>
                  <InputText id="WEBSITE" name="WEBSITE" value={formData.WEBSITE || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
            </div>
          </TabPanel>

          {/* TAB 3: LEGALITAS & PJ */}
          <TabPanel header="Legalitas & PJ">
            <div className="formgrid grid mt-3">
                 <div className="field col-12 md:col-3">
                    <label htmlFor="AKREDITASI">Akreditasi</label>
                    <Dropdown id="AKREDITASI" name="AKREDITASI" value={formData.AKREDITASI} options={akreditasiOptions} onChange={(e) => handleChange(e.target.name, e.value)} placeholder="Pilih Akreditasi" />
                  </div>
                  <div className="field col-12 md:col-9">
                    <label htmlFor="NO_SK_AKREDITASI">No. SK Akreditasi</label>
                    <InputText id="NO_SK_AKREDITASI" name="NO_SK_AKREDITASI" value={formData.NO_SK_AKREDITASI || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="TANGGAL_SK_AKREDITASI">Tanggal SK Akreditasi</label>
                    <Calendar id="TANGGAL_SK_AKREDITASI" name="TANGGAL_SK_AKREDITASI" value={formData.TANGGAL_SK_AKREDITASI ? new Date(formData.TANGGAL_SK_AKREDITASI) : null} onChange={(e) => handleChange(e.target.name, e.value)} dateFormat="dd-mm-yy" showIcon />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="TANGGAL_AKHIR_AKREDITASI">Tanggal Akhir Akreditasi</label>
                    <Calendar id="TANGGAL_AKHIR_AKREDITASI" name="TANGGAL_AKHIR_AKREDITASI" value={formData.TANGGAL_AKHIR_AKREDITASI ? new Date(formData.TANGGAL_AKHIR_AKREDITASI) : null} onChange={(e) => handleChange(e.target.name, e.value)} dateFormat="dd-mm-yy" showIcon />
                  </div>
                  <div className="col-12"><Divider /></div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="NAMA_KEPALA_SEKOLAH">Nama Kepala Sekolah</label>
                    <InputText id="NAMA_KEPALA_SEKOLAH" name="NAMA_KEPALA_SEKOLAH" value={formData.NAMA_KEPALA_SEKOLAH || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="NIP_KEPALA_SEKOLAH">NIP Kepala Sekolah</label>
                    <InputText id="NIP_KEPALA_SEKOLAH" name="NIP_KEPALA_SEKOLAH" value={formData.NIP_KEPALA_SEKOLAH || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="EMAIL_KEPALA_SEKOLAH">Email Kepala Sekolah</label>
                    <InputText id="EMAIL_KEPALA_SEKOLAH" name="EMAIL_KEPALA_SEKOLAH" value={formData.EMAIL_KEPALA_SEKOLAH || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="NO_HP_KEPALA_SEKOLAH">No. HP Kepala Sekolah</label>
                    <InputText id="NO_HP_KEPALA_SEKOLAH" name="NO_HP_KEPALA_SEKOLAH" value={formData.NO_HP_KEPALA_SEKOLAH || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
            </div>
          </TabPanel>

          {/* TAB 4: OPERASIONAL & FINANSIAL */}
          <TabPanel header="Operasional & Finansial">
            <div className="formgrid grid mt-3">
                <div className="field col-12 md:col-6">
                  <label htmlFor="KURIKULUM_DIGUNAKAN">Kurikulum Digunakan</label>
                  <InputText id="KURIKULUM_DIGUNAKAN" name="KURIKULUM_DIGUNAKAN" value={formData.KURIKULUM_DIGUNAKAN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="WAKTU_PENYELENGGARAAN">Waktu Penyelenggaraan</label>
                  <InputText id="WAKTU_PENYELENGGARAAN" name="WAKTU_PENYELENGGARAAN" value={formData.WAKTU_PENYELENGGARAAN || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                 <div className="col-12"><Divider /></div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="NAMA_BANK">Nama Bank</label>
                  <InputText id="NAMA_BANK" name="NAMA_BANK" value={formData.NAMA_BANK || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="NOMOR_REKENING">Nomor Rekening</label>
                  <InputText id="NOMOR_REKENING" name="NOMOR_REKENING" value={formData.NOMOR_REKENING || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="NAMA_PEMILIK_REKENING">Nama Pemilik Rekening</label>
                  <InputText id="NAMA_PEMILIK_REKENING" name="NAMA_PEMILIK_REKENING" value={formData.NAMA_PEMILIK_REKENING || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="NPWP">NPWP</label>
                  <InputText id="NPWP" name="NPWP" value={formData.NPWP || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
            </div>
          </TabPanel>

           {/* TAB 5: DIGITAL & LAINNYA */}
          <TabPanel header="Digital & Lainnya">
            <div className="formgrid grid mt-3">
                <div className="field col-12 md:col-6">
                  <label htmlFor="FACEBOOK_URL">URL Facebook</label>
                  <InputText id="FACEBOOK_URL" name="FACEBOOK_URL" value={formData.FACEBOOK_URL || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="INSTAGRAM_URL">URL Instagram</label>
                  <InputText id="INSTAGRAM_URL" name="INSTAGRAM_URL" value={formData.INSTAGRAM_URL || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="TWITTER_X_URL">URL Twitter/X</label>
                  <InputText id="TWITTER_X_URL" name="TWITTER_X_URL" value={formData.TWITTER_X_URL || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="YOUTUBE_URL">URL YouTube</label>
                  <InputText id="YOUTUBE_URL" name="YOUTUBE_URL" value={formData.YOUTUBE_URL || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                <div className="field col-12">
                  <label htmlFor="LOGO_SEKOLAH_URL">URL Logo Sekolah</label>
                  <InputText id="LOGO_SEKOLAH_URL" name="LOGO_SEKOLAH_URL" value={formData.LOGO_SEKOLAH_URL || ''} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </div>
                 <div className="col-12"><Divider /></div>
                <div className="field col-12 flex align-items-center">
                    <InputSwitch id="IS_ACTIVE" name="IS_ACTIVE" checked={formData.IS_ACTIVE} onChange={(e) => handleChange(e.target.name, e.value)} />
                    <label htmlFor="IS_ACTIVE" className="ml-2">Status Aktif</label>
                </div>
            </div>
          </TabPanel>
        </TabView>
        
        {/* === BAGIAN YANG DIPERBAIKI === */}
        <div className="flex justify-content-center mt-5">
          <Button type="submit" label="Simpan Perubahan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default FormInformasiSekolah;
