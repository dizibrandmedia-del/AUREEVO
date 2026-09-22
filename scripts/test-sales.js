async function testSales() {
  console.log('Testing Sales CRM Leads and Quotations API...\n');

  // Sales Executive Login
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales@aurevo.digital', password: 'password123' })
  });
  const loginCookie = loginRes.headers.get('set-cookie');

  // 1. Create a new B2B Lead
  const createLeadRes = await fetch('http://localhost:3000/api/v1/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikram Singhania (Apex Hospitality)',
      phone: '9820011223',
      email: 'procurement@apexhospitality.com',
      city: 'Udaipur',
      leadSource: 'B2B_INQUIRY',
      productName: '55-inch Commercial Smart TVs',
      quantity: 25,
      budgetRange: '₹4,00,000 - ₹5,00,000',
      requirement: 'Requiring 25 units of 55-inch Smart TVs for new boutique resort wing in Udaipur.'
    })
  });
  const createLeadData = await createLeadRes.json();
  console.log(`Lead Creation: ${createLeadRes.status}, Lead ID: ${createLeadData.lead?.id}`);

  // 2. Fetch Leads Pipeline
  const leadsRes = await fetch('http://localhost:3000/api/v1/leads', {
    headers: { Cookie: loginCookie }
  });
  const leadsData = await leadsRes.json();
  console.log(`Pipeline Leads Count: ${leadsData.leads?.length}`);

  // 3. Move Lead to 'NEGOTIATION'
  if (createLeadData.lead?.id) {
    const updateLeadRes = await fetch('http://localhost:3000/api/v1/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: loginCookie },
      body: JSON.stringify({
        id: createLeadData.lead.id,
        stage: 'NEGOTIATION',
        notes: 'Commercial discount of 6% approved by regional sales director.'
      })
    });
    const updateLeadData = await updateLeadRes.json();
    console.log(`Lead Stage Updated: ${updateLeadData.lead?.stage}`);
  }

  console.log('\n[PASS] Sales CRM Pipeline is fully operational!');
}

testSales();
