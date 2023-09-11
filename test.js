// Data state
const userState = {
	poli: "Mawar",
	id_poli: "995035",
	dokter: "Humaira Hilda Palastri",
	id_dokter: 612,
	jadwal: [
		{
			hari: "Selasa",
			jam: ["13:30:00 - 16:30:00", "13:45:00 - 17:45:00"],
		},
		{
			hari: "Rabu",
			jam: [
				"08:00:00 - 12:00:00",
				"13:45:00 - 17:45:00",
				"15:00:00 - 19:00:00",
			],
		},
		{
			hari: "Kamis",
			jam: ["19:00:00 - 21:00:00"],
		},
		{
			hari: "Sabtu",
			jam: ["13:45:00 - 17:45:00"],
		},
		{
			hari: "Minggu",
			jam: ["13:00:00 - 17:00:00", "13:00:00 - 17:00:00"],
		},
	],
};

// Pesan yang diterima dari pengguna
const pesanDariPengguna = "4"; // Misalnya pengguna memilih nomor 1

// Parsing nomor jadwal dari pesan pengguna
const nomorJadwal = parseInt(pesanDariPengguna);

let allHour = [];
let dayHourLength = [];

userState.jadwal.forEach((jadwal) => {
	dayHourLength.push(jadwal.jam.length);
	jadwal.jam.forEach((jam) => {
		allHour.push(jam);
	});
});

// Mengambil jam dari nomor jadwal yang dipilih pengguna
const jam = allHour[nomorJadwal - 1];

let remain = nomorJadwal;
let result = 0;
for (let i = 0; i < dayHourLength.length; i++) {
  remain -= dayHourLength[i];
  if (remain <= 0) {
    result = i;
    break;
  }
}
if (remain > 0) {
  console.log(`Nilai 7 tidak akan habis dalam array ini.`);
}


// get day by first non 0

console.log(dayHourLength);
console.log(allHour);
console.log(jam);
console.log(result)
console.log(userState.jadwal[result].hari)