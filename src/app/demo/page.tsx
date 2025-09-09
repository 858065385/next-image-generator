'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function DemoContent() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoImage, setVideoImage] = useState<File | null>(null);
  const [imageStatus, setImageStatus] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [imageResult, setImageResult] = useState('');
  const [videoResult, setVideoResult] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // 处理登录成功
  useEffect(() => {
    if (session?.user && !currentUser) {
      // 注册或更新用户
      registerUser(session.user, session);
      // 使用session.user，但添加uuid字段
      setCurrentUser({
        ...session.user,
        uuid: session.user.email // 临时使用email作为标识，实际应该从数据库获取
      });
    } else if (!session && currentUser) {
      // 处理登出
      setCurrentUser(null);
      setSubscriptionInfo(null);
    }
  }, [session, currentUser]);

  // 加载用户信息和历史
  useEffect(() => {
    if (currentUser) {
      loadUserSubscription();
      loadHistory();
    }
  }, [currentUser]);

  const registerUser = async (user: any, session: any) => {
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          account: {
            type: 'oauth',
            provider: 'google',
            providerAccountId: session.sub,
          },
        }),
      });
    } catch (error) {
      console.error('注册用户失败:', error);
    }
  };

  const loadUserSubscription = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/user/get_user_subscription_info');
      const data = await response.json();
      
      if (data.code === 0) {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('加载订阅信息失败:', error);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/signin/google';
  };

  const logout = () => {
    setCurrentUser(null);
    setSubscriptionInfo(null);
    window.location.href = '/api/auth/signout';
  };

  const upgradeSubscription = async (planType: 'monthly' | 'yearly' = 'monthly') => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    const planId = planType === 'monthly' ? 1 : 2;
    const amount = planType === 'monthly' ? 999 : 9999; // $9.99 or $99.99 in cents
    const interval = planType === 'monthly' ? 'month' : 'year';

    try {
      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          amount: amount,
          interval: interval,
          user_uuid: currentUser.uuid || currentUser.email,
          user_email: currentUser.email
        })
      });
      
      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('创建支付会话失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('升级订阅失败:', error);
      alert('升级订阅失败');
    }
  };

  const generateImage = async () => {
    if (!currentUser) {
      setImageStatus('请先登录');
      return;
    }

    if (!imagePrompt) {
      setImageStatus('请输入提示词');
      return;
    }

    setImageStatus('正在生成...');

    try {
      const response = await fetch('/api/predictions/text_to_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          user_id: currentUser.uuid || currentUser.email,
          user_email: currentUser.email,
          credit: '1'
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        setImageStatus('生成任务已提交，请稍候...');
        pollPredictionStatus(data.id, 'image');
      } else {
        let errorMsg = '生成失败';
        if (data.code === -4) errorMsg = '积分不足';
        else if (data.code === -3) errorMsg = '无有效订阅';
        else if (data.code === -1) errorMsg = '用户未认证';
        
        setImageStatus(errorMsg);
      }
    } catch (error) {
      console.error('生成图像失败:', error);
      setImageStatus('生成失败');
    }
  };

  const generateVideo = async () => {
    if (!currentUser) {
      setVideoStatus('请先登录');
      return;
    }

    if (!videoPrompt || !videoImage) {
      setVideoStatus('请上传图像并输入提示词');
      return;
    }

    setVideoStatus('正在上传图像...');

    try {
      // 1. 上传图像
      const uploadResponse = await fetch('/api/r2/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileType: 'image',
          fileName: videoImage.name,
          contentType: videoImage.type
        })
      });

      const uploadData = await uploadResponse.json();
      
      if (uploadData.code === 0) {
        // 2. 直接上传到 R2
        await fetch(uploadData.presignedUrl, {
          method: 'PUT',
          body: videoImage
        });

        setVideoStatus('正在生成视频...');

        // 3. 生成视频
        const response = await fetch('/api/predictions/img_to_video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: videoPrompt,
            image_url: uploadData.publicUrl,
            user_id: currentUser.uuid || currentUser.email,
            user_email: currentUser.email,
            credit: '15'
          })
        });

        const data = await response.json();
        
        if (data.code === 0) {
          setVideoStatus('生成任务已提交，请稍候...');
          pollPredictionStatus(data.id, 'video');
        } else {
          let errorMsg = '生成失败';
          if (data.code === -4) errorMsg = '积分不足';
          else if (data.code === -3) errorMsg = '无有效订阅';
          
          setVideoStatus(errorMsg);
        }
      }
    } catch (error) {
      console.error('生成视频失败:', error);
      setVideoStatus('生成失败');
    }
  };

  const pollPredictionStatus = (predictionId: string, type: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/predictions/${predictionId}`);
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          clearInterval(interval);
          if (type === 'image') {
            setImageResult(data.output[0]);
            setImageStatus('生成完成！');
          } else {
            setVideoResult(data.output[0]);
            setVideoStatus('生成完成！');
          }
          loadHistory();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          if (type === 'image') {
            setImageStatus(`生成失败: ${data.error}`);
          } else {
            setVideoStatus(`生成失败: ${data.error}`);
          }
        }
      } catch (error) {
        console.error('查询状态失败:', error);
      }
    }, 2000);
  };

  const loadHistory = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/effect_result/list_by_user_id?user_id=${currentUser.uuid || currentUser.email}&limit=12`);
      const data = await response.json();
      
      if (data.code === 0) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>AI 图像视频生成器</h1>
          <p>基于 AI 的图像和视频生成服务</p>
        </div>

        {/* 用户信息区域 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ddd', backgroundImage: currentUser?.image ? `url(${currentUser.image})` : 'none' }}></div>
            <div>
              <div>{currentUser?.name || '未登录'}</div>
              <div>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>{subscriptionInfo?.subscription?.status === 'active' ? subscriptionInfo.subscription.plan_name || '专业版' : '免费用户'}</div>
            <div style={{ fontWeight: 'bold', color: '#28a745' }}>
              积分: {subscriptionInfo?.credit_usage?.credits_used || 0}/{subscriptionInfo?.credit_usage?.credits_total || 0} 
              (剩余: {subscriptionInfo?.credit_usage?.credits_remain || 0})
            </div>
            <div>
              <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', margin: '5px', background: '#007bff', color: 'white' }} onClick={() => upgradeSubscription('monthly')}>月度会员 ($9.99)</button>
              <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', margin: '5px', background: '#28a745', color: 'white' }} onClick={() => upgradeSubscription('yearly')}>年度会员 ($99.99)</button>
            </div>
            {currentUser ? (
              <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', margin: '5px', background: '#6c757d', color: 'white' }} onClick={logout}>登出</button>
            ) : (
              <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', margin: '5px', background: '#007bff', color: 'white' }} onClick={login}>Google 登录</button>
            )}
          </div>
        </div>

        {/* 生成功能区域 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* 文本生成图像 */}
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>文本生成图像 (1 积分)</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>提示词:</label>
              <textarea 
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="输入图像描述..."
              />
            </div>
            <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', background: '#007bff', color: 'white' }} onClick={generateImage}>生成图像</button>
            {imageStatus && <div style={{ padding: '10px', margin: '10px 0', borderRadius: '4px', background: imageStatus.includes('失败') ? '#f8d7da' : imageStatus.includes('完成') ? '#d4edda' : '#d1ecf1', color: imageStatus.includes('失败') ? '#721c24' : imageStatus.includes('完成') ? '#155724' : '#0c5460' }}>{imageStatus}</div>}
            {imageResult && <img src={imageResult} style={{ maxWidth: '100%', marginTop: '10px' }} alt="Generated" />}
          </div>

          {/* 图像生成视频 */}
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>图像生成视频 (15 积分)</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>上传图像:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setVideoImage(e.target.files?.[0] || null)}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>提示词:</label>
              <textarea 
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="输入视频描述..."
              />
            </div>
            <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', background: '#007bff', color: 'white' }} onClick={generateVideo}>生成视频</button>
            {videoStatus && <div style={{ padding: '10px', margin: '10px 0', borderRadius: '4px', background: videoStatus.includes('失败') ? '#f8d7da' : videoStatus.includes('完成') ? '#d4edda' : '#d1ecf1', color: videoStatus.includes('失败') ? '#721c24' : videoStatus.includes('完成') ? '#155724' : '#0c5460' }}>{videoStatus}</div>}
            {videoResult && <video controls style={{ maxWidth: '100%', marginTop: '10px' }}><source src={videoResult} type="video/mp4" /></video>}
          </div>
        </div>

        {/* 生成历史 */}
        <div style={{ marginTop: '30px' }}>
          <h3>生成历史</h3>
          <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', background: '#007bff', color: 'white', marginBottom: '15px' }} onClick={loadHistory}>刷新历史</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {history.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                {item.output_url && item.output_url.includes('.mp4') ? (
                  <video controls style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}>
                    <source src={item.output_url} type="video/mp4" />
                  </video>
                ) : (
                  <img src={item.output_url} alt={item.prompt} style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div style={{ marginTop: '5px', fontSize: '12px' }}>
                  {item.effect_name}<br />
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return <DemoContent />;
}