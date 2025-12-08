import QRCode from 'qrcode';

async function generateTestQR() {
  try {
    const testHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const qrCode = await QRCode.toDataURL(testHash, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log('✅ QR Code generated successfully');
    console.log('QR Code length:', qrCode.length);
    console.log('QR Code starts with:', qrCode.substring(0, 50));
    
    return qrCode;
  } catch (error) {
    console.error('❌ QR generation failed:', error);
  }
}

generateTestQR();