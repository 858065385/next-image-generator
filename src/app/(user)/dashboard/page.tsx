import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">仪表盘</h1>
        <p className="text-gray-600">欢迎回来！查看你的创作统计和账户信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">当前积分</p>
              <p className="text-3xl font-bold text-blue-600">850</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
          <div className="mt-4">
            <Link href="/credits" className="text-blue-600 text-sm hover:underline">
              管理积分 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本月生成</p>
              <p className="text-3xl font-bold text-green-600">42</p>
            </div>
            <div className="text-4xl">🎨</div>
          </div>
          <div className="mt-4">
            <Link href="/history" className="text-green-600 text-sm hover:underline">
              查看历史 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">订阅状态</p>
              <p className="text-3xl font-bold text-purple-600">专业版</p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
          <div className="mt-4">
            <Link href="/subscription" className="text-purple-600 text-sm hover:underline">
              管理订阅 →
            </Link>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/generate"
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">🖼️</div>
            <div>
              <h3 className="font-medium">文字生成图像</h3>
              <p className="text-sm text-gray-600">输入描述，AI 为你创作图像</p>
            </div>
          </Link>
          <Link
            href="/img-to-video"
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">🎬</div>
            <div>
              <h3 className="font-medium">图像生成视频</h3>
              <p className="text-sm text-gray-600">将图片转换为动态视频</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 最近作品 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近作品</h2>
          <Link href="/history" className="text-blue-600 text-sm hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-4xl opacity-50">🎨</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}