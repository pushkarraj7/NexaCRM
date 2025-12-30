const testAPI = async () => {
    try {
        // Test if server is running
        console.log('Testing server endpoints...\n');

        const baseUrl = 'http://localhost:5000';
        
        // You'll need to get a valid token first
        console.log('⚠️  You need to login first to get a token');
        console.log('1. Go to http://localhost:3000/login');
        console.log('2. Login with your credentials');
        console.log('3. Open browser console and type: localStorage.getItem("token")');
        console.log('4. Copy the token and paste it below\n');
        
        const token = 'YOUR_TOKEN_HERE'; // Replace with actual token
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Test customers endpoint
        console.log('📋 Testing /api/auth/customers');
        const customersRes = await fetch(`${baseUrl}/api/auth/customers`, { headers });
        console.log(`   Status: ${customersRes.status} ${customersRes.statusText}`);
        
        // Test items endpoint
        console.log('📦 Testing /api/auth/items');
        const itemsRes = await fetch(`${baseUrl}/api/auth/items`, { headers });
        console.log(`   Status: ${itemsRes.status} ${itemsRes.statusText}`);
        
        // Test customer-items endpoint
        console.log('🤝 Testing /api/auth/customer-items');
        const agreementsRes = await fetch(`${baseUrl}/api/auth/customer-items`, { headers });
        console.log(`   Status: ${agreementsRes.status} ${agreementsRes.statusText}`);
        
        if (agreementsRes.ok) {
            const data = await agreementsRes.json();
            console.log(`   Data:`, data);
        } else {
            const text = await agreementsRes.text();
            console.log(`   Response:`, text.substring(0, 200));
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testAPI();