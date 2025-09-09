export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>AI Image Video API</h1>
      <p>This is an API-only service. The frontend has been removed for performance.</p>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem' }}>Admin Panel</h2>
        <p style={{ marginBottom: '1rem' }}>Access the enhanced admin interface for managing users, credits, and subscriptions:</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <a 
            href="/admin-enhanced" 
            style={{ 
              display: 'inline-block', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#0369a1', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '0.375rem',
              fontWeight: 'bold'
            }}
          >
            Open Admin Panel →
          </a>
          <a 
            href="/test-payment" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '0.375rem',
              fontWeight: 'bold'
            }}
          >
            Test Payment →
          </a>
        </div>
      </div>
      
      <h2>Available API Endpoints:</h2>
      <ul>
        <li><strong>POST</strong> /api/creem/checkout - Create checkout session</li>
        <li><strong>POST</strong> /api/webhook/creem - Handle Creem webhooks</li>
        <li><strong>POST</strong> /api/webhook/replicate - Handle Replicate webhooks</li>
        <li><strong>POST</strong> /api/predictions/text_to_image - Generate images from text</li>
        <li><strong>POST</strong> /api/predictions/img_to_video - Generate videos from images</li>
        <li><strong>GET</strong> /api/predictions/[id] - Get prediction status</li>
        <li><strong>GET</strong> /api/effect_result/list_by_user_id - Get user results</li>
        <li><strong>GET</strong> /api/effect_result/count_all - Get total count</li>
        <li><strong>PUT</strong> /api/effect_result/update - Update result</li>
        <li><strong>POST</strong> /api/r2/upload - Upload files to R2</li>
        <li><strong>GET</strong> /api/user/check_pro_status - Check user status</li>
        <li><strong>GET</strong> /api/user/get_user_subscription_info - Get subscription info</li>
        <li><strong>POST</strong> /api/auth/[...nextauth] - Authentication endpoints</li>
      </ul>
      
      <h2>Documentation:</h2>
      <p>Use tools like Postman, curl, or integrate with your own frontend to interact with these APIs.</p>
    </div>
  )
}