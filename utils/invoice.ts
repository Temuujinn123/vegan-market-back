import axios from "axios";

// var options = {
//     method: "POST",
//     url: "https://merchant-sandbox.qpay.mn/v2/invoice",
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer",
//     },
//     body: {
//         invoice_code: "TEST_INVOICE",
//         sender_invoice_no: "1234567",
//         invoice_receiver_code: "terminal",
//         invoice_description: "test",
//         amount: 100,
//         callback_url:
//             "https://bd5492c3ee85.ngrok.io/payments?payment_id=1234567",
//     },
// };

var options = {
    method: "POST",
    url: "https://merchant-sandbox.qpay.mn/v2/auth/token",
    headers: {
        Authorization: "Basic",
    },
};

const Invoice = async () => {
    await axios(options)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
};

export default Invoice;
