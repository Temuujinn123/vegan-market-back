import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "temuujinn8563@gmail.com",
        pass: "lwsa bpve aevi zowv",
    },
});

const SendMail = async (mailDetails: any, callback: any) => {
    try {
        const info = await transporter.sendMail(mailDetails);
        callback(info);
        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false };
    }
};

export default SendMail;
