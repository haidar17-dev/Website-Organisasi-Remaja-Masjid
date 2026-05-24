console.log('YOOO');

window.addEventListener('beforeunload', () => {
    localStorage.setItem('scrollPos', window.scrollY);
});

window.addEventListener('load', () => {
    const scrollPos = localStorage.getItem('scrollPos');
    if (scrollPos) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(scrollPos));
        }, 500);
    }
});

AOS.init();
const mobileMenu = document.getElementById('mobile-menu');
const menuList = document.querySelector('.menu');

mobileMenu.addEventListener('click', () => {
    menuList.classList.toggle('show');
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Spreadsheet
const SHEET_ID = '19OuNKXlcTieJVIsoZh-WHN3Unmlb7NYgO6pq-soVWYE';

let semuaAnggota = [];

async function fetchDataDariSheet(namaSheet) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${namaSheet}&tqx=out:json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gagal fetch: ${namaSheet}`);
    const textData = await response.text();
    const jsonMurni = JSON.parse(textData.substring(47, textData.length - 2));
    return jsonMurni.table.rows;
}

async function inisialisasiWebsite() {
    try {
        const [rowsPengurus, rowsAlumni, rowsPengaturan] = await Promise.all([
            fetchDataDariSheet('Pengurus'),
            fetchDataDariSheet('Alumni'),
            fetchDataDariSheet('Pengaturan_Web')
        ]);

        prosesTabPengaturan(rowsPengaturan);
        prosesTabAlumni(rowsAlumni);
        prosesTabPengurus(rowsPengurus);

    } catch (error) {
        console.error("Sistem Error:", error);
    }
}

function prosesTabPengaturan(rows) {
    if (!rows || rows.length === 0) return;

    const row = rows[0].c; // baris "nilai"

    const getValue = (index) => row[index] ? row[index].v : '';

    const pengaturan = {
        bg_home:        getValue(1),  // kolom B
        foto_about:     getValue(2),  // kolom C
        proker_1:       getValue(3),  // kolom D
        proker_nama_1:  getValue(4),  // kolom E
        proker_desc_1:  getValue(5),  // kolom F
        proker_2:       getValue(6),  // kolom G
        proker_nama_2:  getValue(7),  // kolom H
        proker_desc_2:  getValue(8),  // kolom I
        proker_3:       getValue(9),  // kolom J
        proker_nama_3:  getValue(10), // kolom K
        proker_desc_3:  getValue(11), // kolom L
        proker_4:       getValue(12), // kolom M
        proker_nama_4:  getValue(13), // kolom N
        proker_desc_4:  getValue(14), // kolom O
        tahun_footer:   getValue(15),  // kolom P
        link_daftar:    getValue(16)
    };

    console.log("Isi objek pengaturan:", pengaturan);

    const btnDaftar = document.getElementById('join-button');
    if (btnDaftar && pengaturan.link_daftar) btnDaftar.href = pengaturan.link_daftar;

    const imgHome = document.getElementById('bg-home');
    if (imgHome && pengaturan.bg_home) imgHome.src = pengaturan.bg_home;

    const imgAbout = document.getElementById('foto-about');
    if (imgAbout && pengaturan.foto_about) imgAbout.src = pengaturan.foto_about;

    for (let i = 1; i <= 4; i++) {
        const imgProker = document.getElementById(`proker-${i}`);
        const namaProker = document.getElementById(`proker-nama-${i}`);
        const descProker = document.getElementById(`proker-desc-${i}`);

        if (imgProker && pengaturan[`proker_${i}`]) imgProker.src = pengaturan[`proker_${i}`];
        if (namaProker && pengaturan[`proker_nama_${i}`]) namaProker.innerText = pengaturan[`proker_nama_${i}`];
        if (descProker && pengaturan[`proker_desc_${i}`]) descProker.innerText = pengaturan[`proker_desc_${i}`];
    }

    const textTahun = document.getElementById('tahun-footer');
    if (textTahun && pengaturan.tahun_footer) textTahun.innerText = pengaturan.tahun_footer;
}

// ALumni
function prosesTabAlumni(rows) {
    const kontainerAlumni = document.getElementById('tempat-kartu-alumni');
    if (!kontainerAlumni) return;
    kontainerAlumni.innerHTML = "";

    rows.forEach((row, index) => {
        const nama = row.c[0] ? row.c[0].v : '';
        const foto = row.c[1] ? row.c[1].v : 'images/default.jpg';
        const kalimatQuote = row.c[2] ? row.c[2].v : '';
        const jabatanAngkatan = row.c[3] ? row.c[3].v : '';

        const kartu = document.createElement('div');
        kartu.classList.add('kartu');

        kartu.innerHTML = `
            <img src="${foto}" alt="Foto ${nama}" loading="lazy">
            <div class="info-profil">
                <h3>${nama}</h3>
                <p>${jabatanAngkatan}</p><br>
                <h3 style="font-size:0.9rem; font-style:italic;">"${kalimatQuote}"</h3>
            </div>
        `;

        kontainerAlumni.appendChild(kartu);

        setTimeout(() => {
            kartu.classList.add('muncul');
        }, index * 100);
    });
}

// Pengurus
function prosesTabPengurus(rows) {
    semuaAnggota = rows.map(row => ({
        nama: row.c[0] ? row.c[0].v : '',
        jabatan: row.c[1] ? row.c[1].v : '',
        bidang: row.c[2] ? row.c[2].v.trim() : '',
        foto: row.c[3] ? row.c[3].v : 'images/default.jpg',
        usernameIg: row.c[4] ? row.c[4].v : '@instagram',
        linkIg: row.c[5] ? row.c[5].v : '#',
        motto: row.c[6] ? row.c[6].v : '',
        deskripsiBidang: row.c[7] ? row.c[7].v : ''
    }));

    const daftarBidangUnik = [...new Set(semuaAnggota.map(a => a.bidang).filter(b => b !== ''))];
    const wadahTombol = document.getElementById('wadah-tombol-bidang');
    if (!wadahTombol) return;

    wadahTombol.innerHTML = "";

    daftarBidangUnik.forEach((namaBidang) => {
        const templateTombol = `
            <li>
                <a href="#" class="tombol-dep" data-bidang="${namaBidang}">
                    ${namaBidang}
                </a>
            </li>
        `;
        wadahTombol.innerHTML += templateTombol;
    });

    inisialisasiKlikTombol();

    const bidangTersimpan = localStorage.getItem('bidangAktif');
    const bidangAwal = bidangTersimpan && daftarBidangUnik.includes(bidangTersimpan)
        ? bidangTersimpan
        : daftarBidangUnik[0];

    document.querySelectorAll('.tombol-dep').forEach(t => {
        if (t.getAttribute('data-bidang') === bidangAwal) {
            t.classList.add('aktif');
        } else {
            t.classList.remove('aktif');
        }
    });

    tampilkanAnggotaPerBidang(bidangAwal);
}

function tampilkanAnggotaPerBidang(namaBidang) {
    const kontainerKartu = document.getElementById('tempat-kartu-anggota');
    const elemenDesc = document.getElementById('deskripsi-bidang');

    if (!kontainerKartu) return;

    const barisDeskripsi = semuaAnggota.find(a => a.bidang === namaBidang && a.deskripsiBidang !== '');
    if (elemenDesc) {
        elemenDesc.innerText = barisDeskripsi ? barisDeskripsi.deskripsiBidang : `Anggota dari ${namaBidang}`;
    }

    kontainerKartu.innerHTML = "";
    const anggotaTersaring = semuaAnggota.filter(a => a.bidang === namaBidang);

    anggotaTersaring.forEach((anggota, index) => {
        const infoMotto = anggota.motto ? `<br><small style="color:gray;">"${anggota.motto}"</small>` : '';

        const kartu = document.createElement('div');
        kartu.classList.add('kartu');
        kartu.style.animationDelay = `${index * 0.1}s`;

        kartu.innerHTML = `
            <img src="${anggota.foto}" alt="Foto ${anggota.nama}" loading="lazy">
            <div class="info-profil">
                <h3 class="jabatan">${anggota.nama}</h3>
                <h3>${anggota.jabatan}${infoMotto}</h3><br>
                <a target="_blank" href="${anggota.linkIg}">
                    <h3>${anggota.usernameIg}</h3>
                </a>
            </div>
        `;

        kontainerKartu.appendChild(kartu);
        setTimeout(() => {
            kartu.classList.add('muncul');
        }, index * 100);
    });
}

function inisialisasiKlikTombol() {
    document.querySelectorAll('.tombol-dep').forEach(tombol => {
        tombol.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.tombol-dep').forEach(t => t.classList.remove('aktif'));
            this.classList.add('aktif');

           
            localStorage.setItem('bidangAktif', this.getAttribute('data-bidang'));

            tampilkanAnggotaPerBidang(this.getAttribute('data-bidang'));
        });
    });

document.querySelectorAll('.faq-pertanyaan').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        item.classList.toggle('terbuka');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-pertanyaan').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            item.classList.toggle('terbuka');
        });
    });
});

}

window.addEventListener('DOMContentLoaded', inisialisasiWebsite);