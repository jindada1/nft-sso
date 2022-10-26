var crypto = require("crypto");

crypto.randomFill(new Uint8Array(16), (err, iv) => {
    if (err) throw err;
    const algorithm = 'aes-256-cfb8'
    const key = Buffer.from("d1c993f56c197375f0a396cd08e45424f594a757fe1a309e104aeb5373007d23", "hex")

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update('d1c993f56c197375f0a396cd08e45424f594a757fe1a309e104aeb5373007d23', 'hex', 'hex');
    encrypted += cipher.final('hex');

    console.log(encrypted);
});