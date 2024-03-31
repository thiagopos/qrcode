const fs = require('fs');
const { create, Client, decryptMedia } = require('@open-wa/wa-automate');
const jsQR = require('jsqr');
const mime = require('mime-types');
const Canvas = require('canvas');

// Initialize WhatsApp bot
create().then(client => start(client));

async function start(client) {
  // Listen for incoming messages
  client.onMessage(async message => {
    if (message.mimetype && message.mimetype.includes('image')) {
      const filename = `${message.t}.${mime.extension(message.mimetype)}`;
      const mediaData = await decryptMedia(message);
     /*  const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString(
        'base64'
      )}`; */

      const imageBase64 = mediaData.toString('base64')

      const qrCodeData = decodeQRCode(imageBase64)

      await client.sendText(message.from, 'QR Code Data: ' + qrCodeData);    
    }
  });
}

// Function to decode QR code from base64 image
function decodeQRCode(imageBase64) {
  const img = new Canvas.Image();
  img.src = 'data:image/jpeg;base64,' + imageBase64;

  const canvas = Canvas.createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

  return qrCode ? qrCode.data : null;
}


