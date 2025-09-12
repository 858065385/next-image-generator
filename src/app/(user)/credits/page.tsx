export default function CreditsPage() {
  const creditPackages = [
    {
      id: 1,
      credits: 50,
      price: 7.9,
      bonus: 0,
      popular: false
    },
    {
      id: 2,
      credits: 100,
      price: 15.9,
      bonus: 0,
      popular: true
    },
    {
      id: 3,
      credits: 200,
      price: 29.9,
      bonus: 20,
      popular: false
    },
    {
      id: 4,
      credits: 500,
      price: 69.9,
      bonus: 75,
      popular: false
    }
  ]

  const usageHistory = [
    {
      id: 1,
      type: 'image',
      description: '文字生成图像',
      credits: -1,
      date: '2024-01-15 14:30',
      balance: 849
    },
    {
      id: 2,
      type: 'video',
      description: '图像生成视频',
      credits: -15,
      date: '2024-01-14 10:15',
      balance: 850
    },
    {
      id: 3,
      type: 'purchase',
      description: '购买积分包',
      credits: 100,
      date: '2024-01-10 09:00',
      balance: 865
    },
    {
      id: 4,
      type: 'subscription',
      description: '月度订阅奖励',
      credits: 100,
      date: '2024-01-01 00:00',
      balance: 765
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">积分管理</h1>
        <p className="text-gray-600">管理你的积分余额和购买记录</p>
      </div>

      {/* 当前积分卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">当前积分余额</p>
            <p className="text-4xl font-bold mb-4">850 积分</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                月度订阅: +100/月
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                有效期至: 2024-02-01
              </span>
            </div>
          </div>
          <div className="text-6xl opacity-50">💎</div>
        </div>
      </div>

      {/* 积分消耗说明 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">积分消耗说明</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="text-2xl mr-2">🖼️</span>
              图像生成
            </h3>
            <p className="text-gray-600 text-sm mb-2">使用 AI 生成静态图像</p>
            <p className="text-blue-600 font-medium">1 积分/张</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="text-2xl mr-2">🎬</span>
              视频生成
            </h3>
            <p className="text-gray-600 text-sm mb-2">将图像转换为短视频</p>
            <p className="text-purple-600 font-medium">15 积分/个</p>
          </div>
        </div>
      </div>

      {/* 购买积分包 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">购买积分包</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow p-6 border-2 relative ${
                pkg.popular ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                    最受欢迎
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {pkg.credits}
                </div>
                <div className="text-sm text-gray-600 mb-4">积分</div>
                {pkg.bonus > 0 && (
                  <div className="text-xs text-green-600 mb-2">
                    +{pkg.bonus} 赠送积分
                  </div>
                )}
                <div className="text-2xl font-bold mb-4">
                  ${pkg.price}
                </div>
                <button
                  className={`w-full py-2 rounded-lg font-medium ${
                    pkg.popular
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  立即购买
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 使用记录 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">使用记录</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  积分变化
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  余额
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageHistory.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.type === 'purchase' || record.type === 'subscription'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {record.type === 'purchase' ? '购买' :
                       record.type === 'subscription' ? '订阅' :
                       record.type === 'image' ? '图像' : '视频'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    record.credits > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.credits > 0 ? '+' : ''}{record.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {record.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}