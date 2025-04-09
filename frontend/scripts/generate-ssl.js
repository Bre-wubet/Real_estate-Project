const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create .cert directory if it doesn't exist
const certDir = path.join(__dirname, '..', '.cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Generate SSL certificate using OpenSSL
try {
  console.log('Generating SSL certificates...');
  
  // Generate private key
  execSync('openssl genrsa -out .cert/key.pem 2048');
  
  // Generate certificate signing request
  execSync('openssl req -new -key .cert/key.pem -out .cert/csr.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"');
  
  // Generate self-signed certificate
  execSync('openssl x509 -req -days 365 -in .cert/csr.pem -signkey .cert/key.pem -out .cert/cert.pem');
  
  // Remove CSR file as it's no longer needed
  fs.unlinkSync(path.join(certDir, 'csr.pem'));
  
  console.log('SSL certificates generated successfully!');
  console.log('Location:', certDir);
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  process.exit(1);
}