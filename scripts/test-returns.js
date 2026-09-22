async function testReturns() {
  console.log('Testing Admin Returns & Warranty Desk API...\n');

  // Admin Login
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aurevo.digital', password: 'password123' })
  });
  const loginCookie = loginRes.headers.get('set-cookie');

  // Fetch Returns
  const returnsRes = await fetch('http://localhost:3000/api/v1/returns', {
    headers: { Cookie: loginCookie }
  });
  const returnsData = await returnsRes.json();
  console.log(`Returns Fetch Status: ${returnsRes.status}, Total: ${returnsData.returns?.length}`);

  if (returnsData.returns?.length > 0) {
    const claim = returnsData.returns[0];
    console.log(`Sample Claim ID: ${claim.id}`);
    console.log(`Type: ${claim.type}, Status: ${claim.status}`);
    console.log(`Customer: ${claim.order?.customerName}, Reason: "${claim.reason}"`);

    // Test updating claim status
    const updateRes = await fetch('http://localhost:3000/api/v1/returns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: loginCookie },
      body: JSON.stringify({
        id: claim.id,
        status: 'RESOLVED',
        adminNotes: 'Technician verified and replaced panel under warranty. Ticket closed.'
      })
    });
    const updateData = await updateRes.json();
    console.log(`Update Status: ${updateRes.status}, New Status: ${updateData.returnRequest?.status}`);
    if (updateData.returnRequest?.status === 'RESOLVED') {
      console.log('\n[PASS] Returns & Warranty Desk workflow is fully verified!');
    }
  }
}

testReturns();
