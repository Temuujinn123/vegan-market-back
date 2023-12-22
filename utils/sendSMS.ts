import twilio from "twilio";

// Twilio credentials
const accountSid = "ACbc71c9ae9be6956949c958d581dd7ffd";
const authToken = "215a6341794ea1fa052abf350524e65f";

const verifySid = "VAbc1863ac6d3ef80a13f6e0b511f50394";

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Mongolian phone number (replace with the recipient's number)
// const toPhoneNumber = "+97688741921";

// Twilio phone number (get it from your Twilio account)
const fromPhoneNumber = "+97680848397";

// Message content
const messageBody = "Hello, this is a test message from Node.js!";

// Send SMS

export const sendSMS = async (toPhoneNumber: number) => {
    await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+976${toPhoneNumber}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {
            const readline = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            readline.question("Please enter the OTP:", (otpCode: any) => {
                client.verify.v2
                    .services(verifySid)
                    .verificationChecks.create({
                        to: `+976${toPhoneNumber}`,
                        code: otpCode,
                    })
                    .then((verification_check) =>
                        console.log(verification_check.status)
                    )
                    .then(() => readline.close());
            });
        });
};
