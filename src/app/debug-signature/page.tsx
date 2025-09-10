'use client';

import { useState } from 'react';

export default function DebugSignaturePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignature = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/creem/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: '02129adb2a18d30be277954e9c6af9e5599c47f33b0341e1ebc23e587aabf419',
          rawQueryString: 'success=true&checkout_id=ch_IDPUDE83aubR9Qtd6ud4Q&order_id=ord_6oOspWArXuuREswOevGyW4&customer_id=cust_1MoEaamC85R5psMrgwl77W&subscription_id=sub_4QdRAyucIdZtCWbZz08HyA&product_id=prod_VNpWNdsTUA5sRhQbtn7Jz'
        }),
      });
      
      const data = await response.json();
      setResult(data);
      console.log('Signature verification result:', data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Debug Signature Verification</h1>
      
      <button
        onClick={testSignature}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Testing...' : 'Test Signature'}
      </button>

      {result && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: result.valid ? '#d1fae5' : '#fee2e2',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <h3>Test Data:</h3>
        <p><strong>Signature:</strong> 02129adb2a18d30be277954e9c6af9e5599c47f33b0341e1ebc23e587aabf419</p>
        <p><strong>Raw Query String:</strong> success=true&checkout_id=ch_IDPUDE83aubR9Qtd6ud4Q&order_id=ord_6oOspWArXuuREswOevGyW4&customer_id=cust_1MoEaamC85R5psMrgwl77W&subscription_id=sub_4QdRAyucIdZtCWbZz08HyA&product_id=prod_VNpWNdsTUA5sRhQbtn7Jz</p>
      </div>
    </div>
  );
}