async function run() {
    try {
        const res = await fetch('https://hmfincome.paymently.io/api/checkout-v2', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "RT-UDDOKTAPAY-API-KEY": "JrL9aItP8nvkUYN0tCyAfjlpoCZnvJahWBPdc40m"
            },
            body: JSON.stringify({
                full_name: "Test",
                email: "test@test.com",
                amount: "10",
                metadata: { depositId: "123", uid: "123" },
                redirect_url: "http://localhost:3000/payment/success",
                cancel_url: "http://localhost:3000/payment/cancel",
                webhook_url: "http://localhost:3000/api/webhook"
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
