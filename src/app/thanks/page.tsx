'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThanksPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to payment-result page with the same query parameters
    const currentUrl = new URL(window.location.href);
    const paymentResultUrl = new URL('/payment-result', window.location.origin);
    
    // Copy all query parameters
    currentUrl.searchParams.forEach((value, key) => {
      paymentResultUrl.searchParams.set(key, value);
    });
    
    router.replace(paymentResultUrl.pathname + paymentResultUrl.search);
  }, [router]);
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span>正在跳转到支付结果页面...</span>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}