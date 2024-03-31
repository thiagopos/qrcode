const { create, Client, decryptMedia } = require('@open-wa/wa-automate');
const jsQR = require('jsqr');
const mime = require('mime-types');
const fs = require('fs');

function start(client) {
  client.onMessage(async message => {
    const { from, type, mimetype, body } = message;

    // Check if the message is an image
    if (type === 'image' && mimetype.includes('image')) {
      try {
        // Decrypt media data
        const mediaData = await decryptMedia(message);
        console.log(mediaData)
        // Decode the QR code from the image
        const qrCodeData = await readQRCodeFromImage(mediaData);

        // Send the decoded QR code data back to the user
        if (qrCodeData) {
          await client.sendText(from, 'QR Code Data: ' + qrCodeData);
        } else {
          await client.sendText(from, 'No QR code found in the image.');
        }
      } catch (error) {
        console.error('Error reading QR code from image:', error);
        await client.sendText(from, 'Error reading QR code from image. Please try again.');
      }
    }
  });
}

async function readQRCodeFromImage(imageData) {
  try {
    // Create a new image element
    const img = new Image();

    // Set the source of the image to the media data (base64 string)
    img.src = `data:image/jpeg;base64,${imageData.toString('base64')}`;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Set the canvas dimensions to match the image dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to decode the QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    // Check if a QR code was successfully decoded
    if (qrCode) {
      return qrCode.data; // Return the decoded data
    } else {
      return null; // Return null if no QR code was found
    }
  } catch (error) {
    console.error('Error reading QR code from image:', error);
    return null;
  }
}


create().then(client => start(client));
