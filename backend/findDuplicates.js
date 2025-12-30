// Save as: findDuplicates.js
// Run: node findDuplicates.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for Customer model imports...\n');

const searchDir = (dir, results = []) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(filePath, results);
      }
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for Customer model imports
      if (content.includes("require('./models/Customer") || 
          content.includes('require("./models/Customer') ||
          content.includes("require('../models/Customer") ||
          content.includes('require("../models/Customer') ||
          content.includes('from "./models/Customer') ||
          content.includes('from "../models/Customer')) {
        
        results.push({
          file: filePath,
          lines: content.split('\n')
            .map((line, idx) => ({ line, num: idx + 1 }))
            .filter(({ line }) => line.includes('Customer'))
        });
      }
    }
  }
  
  return results;
};

const results = searchDir('./');

console.log(`Found ${results.length} files importing Customer model:\n`);

results.forEach(({ file, lines }) => {
  console.log(`📄 ${file}`);
  lines.forEach(({ line, num }) => {
    if (line.trim()) {
      console.log(`   Line ${num}: ${line.trim()}`);
    }
  });
  console.log('');
});

console.log('\n🔍 Checking for duplicate model definitions...\n');

// Check if Customer.js exists in multiple places
const customerFiles = [];
const findCustomerFiles = (dir) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findCustomerFiles(filePath);
      }
    } else if (file === 'Customer.js') {
      customerFiles.push(filePath);
    }
  }
};

findCustomerFiles('./');

console.log(`Found ${customerFiles.length} Customer.js file(s):\n`);
customerFiles.forEach(file => console.log(`   📄 ${file}`));

if (customerFiles.length > 1) {
  console.log('\n⚠️  WARNING: Multiple Customer.js files found!');
  console.log('   This will cause duplicate model registration.');
  console.log('   Keep only models/Customer.js and delete the others.');
}