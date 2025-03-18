const fs = require('fs');
const path = require('path');

// Create .env file with the correct credentials
const envContent = `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=notion_clone
JWT_SECRET=your-secret-key
`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('.env file created successfully with the following content:');
console.log(envContent);
console.log('You can now run your server with: npm run dev');
