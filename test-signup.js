const http = require('http');

const data = JSON.stringify({
  schoolName: 'Happy Kids School',
  ownerName: 'Prashant Mali',
  email: 'test6@happykids.com',
  phone: '9876543210',
  city: 'Mumbai',
  address: '123 Main Road Andheri West',
  password: 'test12345'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/school/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
