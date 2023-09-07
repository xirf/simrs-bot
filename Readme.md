# 1. Message Template

## 1.1. Message Template
Message template digunakan sebagai template pesan yang akan dikirimkan ke user. Message template terdiri dari beberapa jenis, yaitu:
- msg.welcome (untuk pesan selamat datang)
- msg....

## 1.2. Message Template Syntax

beberapa syntax yang digunakan dalam message template adalah sebagai berikut:
| Syntax | Description |
| --- | --- |
| `[key]` | key akan diganti dengan value yang sesuai |
| `{if:key}` | jika key bernilai true, maka pesan akan ditampilkan |
| `{else}` | jika key bernilai false, maka pesan akan ditampilkan |

## 1.3. Message Template Example

### Contoh 1
Objek: 
```json
{
    "nama": "Jhon Doe",
    "kontrol": "Selasa",
}
```

Message Template Example:
```
Selamat [nama].
{if:kontrol}
Jadwal kontrol Anda berikutnya adalah:
Tanggal: [kontrol]
{else}
*Selamat datang di Asisten WA RSU Darmayu!👋*
  
Silahkan pilih menu berikut:
1. Mendaftar pasien
2. Lihat jadwal dokter
  
Silahkan balas dengan nomor yang Anda inginkan😊
```

Result:
```
Selamat 08:30 AM, John Doe.
Jadwal kontrol Anda berikutnya adalah:
Tanggal: Selasa
*Selamat datang di Asisten WA RSU Darmayu!👋*

Silahkan pilih menu berikut:
1. Mendaftar pasien
2. Lihat jadwal dokter

Silahkan balas dengan nomor yang Anda inginkan😊
```

### Contoh 2
Objek: 
```json
{
    "nama": "Jhon Doe",
    "kontrol": "Selasa",
}
```

Message Template Example:
```
Selamat [nama].
{if:kontrol}
Jadwal kontrol Anda berikutnya adalah:
Tanggal: [kontrol]
{else}
*Selamat datang di Asisten WA RSU Darmayu!👋*
  
Silahkan pilih menu berikut:
1. Mendaftar pasien
2. Lihat jadwal dokter
  
Silahkan balas dengan nomor yang Anda inginkan😊
```

Result:
```
Selamat 08:30 AM, John Doe.
Jadwal kontrol Anda berikutnya adalah:
Tanggal: 2021-01-01
*Selamat datang di Asisten WA RSU Darmayu!👋*

Silahkan pilih menu berikut:
1. Mendaftar pasien
2. Lihat jadwal dokter

Silahkan balas dengan nomor yang Anda inginkan😊
```