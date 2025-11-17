import QRCode from "qrcode";

const text= "https://google.com";

 QRCode.toString(text, {type: 'terminal'}, (err, qrCode)=>{
    if(err){
        console.error("Error generating QR code:", err);
        return;
    }
    console.log(qrCode);
})