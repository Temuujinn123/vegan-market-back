import axios from "axios";

const credentials = "TEST_MERCHANT:123456";
const base64Credentials = btoa(credentials);

var options = {
    method: "POST",
    url: "https://merchant-sandbox.qpay.mn/v2/auth/token",
    headers: {
        Authorization: `Basic ${base64Credentials}`,
    },
};

const Invoice = async (): Promise<string | undefined> => {
    const response = await axios(options);
    let token: string | undefined;
    if (response.data) {
        token = response.data.access_token;
    } else {
        token = undefined;
    }
    return token;
};

export default Invoice;
