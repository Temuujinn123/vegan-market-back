import axios from "axios";

const credentials = `${
    process.env.NODE_ENV === "production"
        ? process.env.PROD_QPAY_USERNAME && process.env.PROD_QPAY_USERNAME
        : process.env.QPAY_USERNAME && process.env.QPAY_USERNAME
}:${
    process.env.NODE_ENV === "production"
        ? process.env.PROD_QPAY_PASS && process.env.PROD_QPAY_PASS
        : process.env.QPAY_PASS && process.env.QPAY_PASS
}`;

const base64Credentials = btoa(credentials);

var options = {
    method: "POST",
    url: `${
        process.env.NODE_ENV === "production"
            ? process.env.PROD_QPAY_API_BASE_URL &&
              process.env.PROD_QPAY_API_BASE_URL
            : process.env.QPAY_API_BASE_URL && process.env.QPAY_API_BASE_URL
    }/auth/token`,
    headers: {
        Authorization: `Basic ${base64Credentials}`,
    },
};

export const GetQpayToken = async (): Promise<string | undefined> => {
    console.log("🚀 ~ file: invoice.ts:12 ~ credentials:", credentials);
    const response = await axios(options);
    let token: string | undefined;
    if (response.data) {
        token = response.data.access_token;
    } else {
        token = undefined;
    }
    return token;
};

export const CreateQpayInvoice = async (
    token: string,
    senderNumber: string,
    receiverCode: string,
    amount: number
): Promise<string | undefined> => {
    console.log(
        "------------> ",
        process.env.NODE_ENV === "production"
            ? process.env.PROD_QPAY_API_BASE_URL &&
                  process.env.PROD_QPAY_API_BASE_URL
            : process.env.QPAY_API_BASE_URL && process.env.QPAY_API_BASE_URL
    );
    const response = await axios({
        method: "POST",
        url: `${
            process.env.NODE_ENV === "production"
                ? process.env.PROD_QPAY_API_BASE_URL &&
                  process.env.PROD_QPAY_API_BASE_URL
                : process.env.QPAY_API_BASE_URL && process.env.QPAY_API_BASE_URL
        }/invoice`,
        data: {
            invoice_code: "VEGAN_MARKET_INVOICE",
            sender_invoice_no: senderNumber,
            invoice_receiver_code: receiverCode,
            invoice_description: "Description",
            amount: amount,
            callback_url: `${
                process.env.NODE_ENV === "production"
                    ? process.env.PROD_API_BASE_URL &&
                      process.env.PROD_API_BASE_URL
                    : process.env.API_BASE_URL && process.env.API_BASE_URL
            }/payments?payment_id=${senderNumber}`,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.data) {
        return response.data.qPay_shortUrl;
    } else {
        return undefined;
    }
};
