const { execSync } = require('child_process');
const path = require('path');

// Get the absolute path to the setup-project.js file
const setupScriptPath = path.join(__dirname, '..', 'setup-project.js');

try {
    // Run the setup script
    execSync(`node ${setupScriptPath}`, { stdio: 'inherit' });
    
    // Change to the project directory
    process.chdir(path.join(process.cwd(), 'ecommerce-api'));
    
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\nProject setup completed successfully!');
    console.log('\nTo start the development server:');
    console.log('1. cd ecommerce-api');
    console.log('2. npm run dev');
} catch (error) {
    console.error('Error during project setup:', error);
    process.exit(1);
} 