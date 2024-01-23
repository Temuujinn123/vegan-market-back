import HTML_TEMPLATE from "./mailTemplate";

const message = "Hi there, you were emailed me through nodemailer";
const emailOptions = (
    from: string,
    to: string,
    message: string,
    subject: string
) => {
    return {
        from, // sender address
        to, // receiver email
        subject,
        text: message,
        html: HTML_TEMPLATE(message),
    };
};

export default emailOptions;
