export default function PricingPage() {
  const plans = [
    {
      name: '免费体验',
      price: '0',
      credits: '10',
      features: [
        '10 个免费积分',
        '基础图像生成',
        '社区支持'
      ],
      popular: false
    },
    {
      name: '月度专业版',
      price: '15.9',
      credits: '100',
      features: [
        '100 个积分/月',
        '高清图像生成',
        '图像生成视频',
        '优先处理队列',
        '邮件支持'
      ],
      popular: true
    },
    {
      name: '年度专业版',
      price: '99',
      credits: '1200',
      features: [
        '1200 个积分/年',
        '所有月度功能',
        '节省 50% 费用',
        '专属客服',
        'API 访问'
      ],
      popular: false
    }
  ]

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">选择适合你的方案</h1>
          <p className="text-xl text-gray-600">灵活的定价，满足不同需求</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-lg border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-500 relative transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                    最受欢迎
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price !== '0' && <span className="text-gray-600">/月</span>}
              </div>
              
              <div className="mb-6">
                <span className="text-blue-600 font-semibold">{plan.credits} 积分</span>
                <p className="text-sm text-gray-600">{plan.price === '0' ? '一次性' : '每月'}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 rounded-lg font-medium ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.price === '0' ? '免费开始' : '立即订阅'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            所有套餐都包含基础功能。积分用于生成图像和视频，不同消耗不同积分。
          </p>
        </div>
      </div>
    </div>
  )
}