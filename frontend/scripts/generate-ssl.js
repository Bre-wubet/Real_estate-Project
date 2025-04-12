import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const CERT_DIR = path.join(__dirname, '..', '.cert');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');

// Create .cert directory if it doesn't exist
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Generate SSL certificate using OpenSSL
try {
  console.log('Generating SSL certificates...');
  
  // Generate private key
  execSync(
    'openssl genrsa -out "' + KEY_PATH + '" 2048',
    { stdio: 'inherit' }
  );

  // Generate certificate
  execSync(
    'openssl req -new -x509 -key "' + KEY_PATH + '" -out "' + CERT_PATH + '" -days 365 -subj "/CN=localhost"',
    { stdio: 'inherit' }
  );

  console.log('SSL certificates generated successfully!');
  console.log('Certificate files created at:', CERT_DIR);
} catch (error) {
  console.error('Error generating SSL certificates:', error);
  process.exit(1);
}