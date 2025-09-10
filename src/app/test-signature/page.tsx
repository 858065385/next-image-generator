'use client';

import { useState } from 'react';

export default function TestSignaturePage() {
  const [rawQueryString, setRawQueryString] = useState('');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignature = async () => {
    setLoading(true);
    try {
      // 同时测试两个 API
      const [simpleResponse, verifyResponse] = await Promise.all([
        fetch('/api/debug/simple-signature-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawQueryString,
            webhookSecret: process.env.NEXT_PUBLIC_CREEM_WEBHOOK_SECRET,
          }),
        }),
        fetch('/api/creem/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature,
            rawQueryString,
          }),
        })
      ]);

      const simpleData = await simpleResponse.json();
      const verifyData = await verifyResponse.json();
      
      setResult({
        simpleTest: simpleData,
        verifyTest: verifyData,
        manualComparison: {
          providedSignature: signature,
          expectedSignature: simpleData.expectedSignature,
          matches: signature === simpleData.expectedSignature
        }
      });
      
      console.log('🔍 Simple Signature Test Result:', simpleData);
      console.log('🔍 Verify Signature Test Result:', verifyData);
    } catch (error) {
      console.error('Error testing signature:', error);
      setResult({ error: 'Failed to test signature' });
    } finally {
      setLoading(false);
    }
  };

  const testWithCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      const fullSearch = window.location.search;
      const fullQS = fullSearch.substring(1);
      const [qs, sig] = fullQS.split('&signature=');
      
      setRawQueryString(qs || '');
      setSignature(sig || '');
      
      console.log('📋 Extracted from URL:');
      console.log('   Full search:', fullSearch);
      console.log('   Full query string:', fullQS);
      console.log('   Raw query string (without signature):', qs);
      console.log('   Signature:', sig);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Return URL Signature Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testWithCurrentUrl}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Fill from Current URL
        </button>
        
        <button
          onClick={testSignature}
          disabled={loading || !rawQueryString || !signature}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading || !rawQueryString || !signature ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: loading || !rawQueryString || !signature ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Signature'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Raw Query String:
        </label>
        <textarea
          value={rawQueryString}
          onChange={(e) => setRawQueryString(e.target.value)}
          style={{
            width: '100%',
            height: '100px',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            fontFamily: 'monospace'
          }}
  placeholder="Paste the raw query string here (without the ? and without &signature=...)"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Signature:
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            fontFamily: 'monospace'
          }}
          placeholder="Paste the signature here"
        />
      </div>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.simpleTest && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: result.simpleTest.extractedSignature === result.simpleTest.expectedSignature ? '#d1fae5' : '#fee2e2',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: result.simpleTest.extractedSignature === result.simpleTest.expectedSignature ? '#065f46' : '#991b1b' }}>
                Simple Signature Test
              </h3>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <p>Expected: {result.simpleTest.expectedSignature}</p>
                <p>Extracted from QS: {result.simpleTest.extractedSignature || '[None found]'}</p>
                <p>Match: {result.simpleTest.extractedSignature === result.simpleTest.expectedSignature ? '✅' : '❌'}</p>
              </div>
            </div>
          )}
          
          {result.verifyTest && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: result.verifyTest.valid ? '#d1fae5' : '#fee2e2',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: result.verifyTest.valid ? '#065f46' : '#991b1b' }}>
                Verify Signature Test
              </h3>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <p>Valid: {result.verifyTest.valid ? '✅' : '❌'}</p>
                <p>Expected: {result.verifyTest.expectedSignature}</p>
                <p>Received: {result.verifyTest.receivedSignature}</p>
              </div>
            </div>
          )}
          
          {result.manualComparison && (
            <div style={{
              padding: '1rem',
              backgroundColor: result.manualComparison.matches ? '#d1fae5' : '#fee2e2',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: result.manualComparison.matches ? '#065f46' : '#991b1b' }}>
                Manual Comparison
              </h3>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <p>Your provided signature matches expected: {result.manualComparison.matches ? '✅' : '❌'}</p>
              </div>
            </div>
          )}
          
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Response Data</summary>
            <pre style={{ 
              marginTop: '1rem', 
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.25rem'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <h3>Instructions:</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Go to Creem Dashboard → Developers → Logs</li>
          <li>Find a recent successful payment in Redirect/Return Logs</li>
          <li>Click Retry to resend the webhook</li>
          <li>Copy the full URL from your browser's address bar</li>
          <li>Click "Fill from Current URL" to extract parameters</li>
          <li>Click "Test Signature" to verify</li>
        </ol>
      </div>
    </div>
  );
}