import DB from "../../db/database";
import pino from "../logger"
import fs from "fs"
import client from "../whatsapp/client";
import { QueryResult } from "pg"


const birthdayMessages: string[] = [
    "Selamat ulang tahun yang penuh berkah! 🎂🎉\n\nHari ini adalah hari spesial yang mengingatkan kita untuk merayakan hidup dan kesehatan. 💪🫶\n\nKami di tim kesehatan selalu mendukungmu dalam menjaga kesehatan. 💯\n\nSemoga kamu memiliki hari yang menyenangkan dan sehat selalu! 😊",
    "Ulang tahun adalah saat yang tepat untuk merenung tentang pentingnya menjaga tubuh dan pikiran. 🧠🫀\n\nSelalu prioritaskan kesehatan dan ingatlah bahwa kami selalu siap membantumu. 🩺\n\nSemoga kamu dapat terus menjalani hidup yang sehat dan bahagia selama bertahun-tahun yang akan datang! 🥳",
    "Hari ini adalah bukti betapa kuatnya dirimu!. 💪🫶\n\nSelama perjalanan hidup ini, pasti ada tantangan yang kamu hadapi, dan setiap tahun, kamu akan menjadi lebih kuat. 💯\n\nJadikan hari ini sebagai awal yang baru untuk terus menjaga kesehatan. 😊",
    "Ulang tahun adalah waktu yang baik untuk merenung tentang pola makan dan gaya hidup sehat. 🍎🥑\n\nIngatlah bahwa makanan sehat adalah investasi terbaik untuk masa depan mu. 💯\n\nSelamat ulang tahun dan semoga kamu selalu sehat dan bahagia! 🎂🎉",
    "Selamat ulang tahun! 🎂🎉\n\nIngatlah bahwa olahraga dan aktivitas fisik adalah bagian penting dari kesehatan. 🏃‍♀️🚴‍♂️\n\nTemukan jenis aktivitas yang kmau nikmati dan jadikan sebagai kebiasaan sehari-hari. 💯\n\nSemoga kamu dapat terus menjalani hidup yang sehat dan bahagia selama bertahun-tahun yang akan datang! 🥳",
    "Hari ini adalah saat yang tepat untuk merenung tentang manfaat tidur yang cukup. 😴💤\n\nTidur yang baik membantu pemulihan tubuh dan meningkatkan kesehatan mental. 💯\n\nPastikan untuk memberi dirimu waktu istirahat yang cukup. 😊\n\nSelamat ulang tahun dan semoga kamu selalu sehat dan bahagia! 🎂🎉",
    "Selamat ulang tahun yang penuh berkah! 🎂\n\nHari ini adalah hari spesial yang mengingatkan kita untuk merayakan hidup dan kesehatan. 🎉\n\nKami di tim kesehatan selalu mendukungmu dalam menjaga kesehatanmu. 💪",
    "Ulang tahun adalah saat yang tepat untuk merenung tentang pentingnya menjaga tubuh dan pikiranmy. 🧠\n\nSelalu prioritaskan kesehatanmu dan ingatlah bahwa kami selalu siap membantu kamu. 🩺",
    "Hari ini adalah bukti betapa kuatnya dirimu. 💪\n\nSelama perjalanan hidup ini, pasti ada tantangan yang kamu hadapi, dan setiap tahun, kamu menjadi lebih kuat. 💪\n\nJadikan hari ini sebagai awal yang baru untuk terus menjaga kesehatan. 💪",
    "Ulang tahun adalah waktu yang baik untuk merenung tentang pola makan dan gaya hidup sehat. 🍎\n\nIngatlah bahwa makanan sehat adalah investasi terbaik untuk masa depan mu. 💰\n\nSelamat ulang tahun dan semoga kamu selalu sehat dan bahagia! 🎂",
    "Selamat ulang tahun! 🎂\n\nIngatlah bahwa olahraga dan aktivitas fisik adalah bagian penting dari kesehatan. 🏃‍♀️\n\nTemukan jenis aktivitas yang kamu nikmati dan jadikan sebagai kebiasaan sehari-hari. 🏃‍♂️",
    "Hari ini adalah saat yang tepat untuk merenung tentang manfaat tidur yang cukup. 😴\n\nTidur yang baik membantu pemulihan tubuh dan meningkatkan kesehatan mental. 🧠\n\nPastikan untuk memberi diriymu waktu istirahat yang cukup. 😴",
    "Semoga ulang tahunmu penuh dengan cinta, tawa, dan kebahagiaan! 🎉\n\nKami sangat mencintaimu dan berharap kamu memiliki hari yang sangat spesial. 🎂",
    "Selamat ulang tahun! 🎂\n\nSemoga semua keinginanmu terkabul dan tahun ini dipenuhi dengan banyak hal yang menyenangkan. 🎉",
    "Semoga ulang tahunmu dipenuhi dengan kebahagiaan, kesehatan, dan banyak cinta! 🎂\n\nKami sangat bersyukur memilikimu dalam hidup kami. 😊",
    "Selamat ulang tahun! 🎂\n\nSemoga harimu dipenuhi dengan hal-hal yang indah dan momen-momen yang tak terlupakan. 🎉",
    "Semoga ulang tahunmu penuh dengan tawa, cinta, dan kebahagiaan! 🎂\n\nKami sangat mencintaimu dan berharap kamu memiliki hari yang sangat spesial. 🎉",
    "Selamat ulang tahun! 🎂\n\nSemoga tahun ini dipenuhi dengan banyak hal yang menyenangkan dan pencapaian baru. 🎉",
    "Semoga ulang tahunmu dipenuhi dengan kesehatan, kebahagiaan, dan cinta! 🎂\n\nKami sangat bersyukur memilikimu dalam hidup kami. 😊",
    "Selamat ulang tahun! 🎂\n\nSemoga harimu dipenuhi dengan hal-hal yang indah dan momen-momen yang tak terlupakan. 🎉"
];

export default async () => {
    return new Promise(async (res, rej) => {
        try {

            const imageBuffer = fs.readFileSync("./assets/images/ultah.jpeg");

            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDate = today.getDate();

            const pasiens: QueryResult<any> = await DB.query(
                `SELECT telepon, nama FROM "public"."pasien" WHERE EXTRACT(MONTH FROM tgl_lahir) = $1 AND EXTRACT(DAY FROM tgl_lahir) = $2`,
                [ todayMonth, todayDate ]
            );

            pino.info("Sending birthday card to " + pasiens.rows.length + " receipient")
            pasiens.rows.forEach(async (p) => {
                if (p.telepon && p.telepon.length > 8) {
                    let [ result ] = await client.onWhatsapp(p.telepon)
                    if (result.exists) {
                        let tel = result.jid
                        try {
                            await client.sendImage(tel, imageBuffer, birthdayMessages[ Math.round(Math.random() * birthdayMessages.length) ] + "\n\nSalam hangat dari kami Segenap tenaga kesehatan dan staff RSU Darmayu\n\nhttp://rsdarmayu.com/");
                            pino.info("Succesfully Send Birthday message to " + p.nama)
                        } catch (error) {
                            pino.error("Failed to send birthday card to " + p.nama, error)
                        }
                    } else {
                        pino.warn(`User ${p.nama} don't have whatsapp account`)
                    }
                }
            });

            res("Done")
        } catch (error) {
            rej(error)
        }
    })
}
