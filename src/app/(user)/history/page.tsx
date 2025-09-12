export default function HistoryPage() {
  const historyItems = [
    {
      id: 1,
      type: 'image',
      prompt: '一只橘猫坐在窗台上，阳光洒进来，写实摄影风格',
      createdAt: '2024-01-15 14:30',
      status: 'completed',
      credits: 1
    },
    {
      id: 2,
      type: 'video',
      prompt: '风景照片变成动态视频，云朵流动，树叶摇摆',
      createdAt: '2024-01-14 10:15',
      status: 'completed',
      credits: 15
    },
    {
      id: 3,
      type: 'image',
      prompt: '赛博朋克城市夜景，霓虹灯闪烁，下雨天',
      createdAt: '2024-01-13 16:45',
      status: 'failed',
      credits: 0
    },
    {
      id: 4,
      type: 'video',
      prompt: '海滩日落，海浪轻拍岸边，无人机视角',
      createdAt: '2024-01-12 09:20',
      status: 'processing',
      credits: 15
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-gray-600">查看你的所有创作历史</p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">全部类型</option>
            <option value="image">图像</option>
            <option value="video">视频</option>
          </select>
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">全部状态</option>
            <option value="completed">已完成</option>
            <option value="processing">处理中</option>
            <option value="failed">失败</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="选择日期"
          />
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-4">
        {historyItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'image' ? '图像' : '视频'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'completed' ? '已完成' : 
                     item.status === 'processing' ? '处理中' : '失败'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.createdAt}
                  </span>
                </div>
                <p className="text-gray-900 mb-2">{item.prompt}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>消耗积分: {item.credits}</span>
                  {item.status === 'failed' && (
                    <button className="text-blue-600 hover:underline">
                      重新生成
                    </button>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {item.status === 'completed' && (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {item.type === 'image' ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-2xl">🎬</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="mt-8 flex justify-center">
        <nav className="flex space-x-2">
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50" disabled>
            上一页
          </button>
          <button className="px-3 py-2 rounded-lg bg-blue-500 text-white">1</button>
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50">2</button>
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50">3</button>
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50">
            下一页
          </button>
        </nav>
      </div>
    </div>
  )
}