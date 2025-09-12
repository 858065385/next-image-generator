import Link from 'next/link'

export default function HelpPage() {
  const faqs = [
    {
      question: '如何开始使用 AI 图像生成器？',
      answer: '只需访问 /generate 页面，输入你想要的图像描述，点击生成即可。新用户可获得 10 个免费积分。'
    },
    {
      question: '积分是如何计算的？',
      answer: '文字生成图像消耗 1 积分，图像生成视频消耗 15 积分。订阅用户每月会获得额外积分奖励。'
    },
    {
      question: '生成的图像版权属于谁？',
      answer: '你拥有使用 AI 生成图像的完全版权，可以用于商业或非商业用途。'
    },
    {
      question: '支持哪些图像格式？',
      answer: '生成的图像为 JPG/PNG 格式，最高支持 4K 分辨率。上传图片支持 JPG、PNG 格式。'
    },
    {
      question: '如何获得更多积分？',
      answer: '你可以购买积分包或订阅专业版计划。订阅用户每月会获得 100-1200 积分不等。'
    },
    {
      question: '生成失败怎么办？',
      answer: '如果生成失败，积分会自动退还。你可以查看历史记录重新生成，或联系客服获取帮助。'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">帮助中心</h1>
        <p className="text-gray-600">常见问题解答和使用指南</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 快速链接 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">快速导航</h2>
            <nav className="space-y-2">
              <a href="#getting-started" className="block px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
                快速开始
              </a>
              <a href="#faq" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                常见问题
              </a>
              <a href="#tutorials" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                视频教程
              </a>
              <a href="#contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                联系我们
              </a>
            </nav>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">需要更多帮助？</h3>
              <p className="text-sm text-gray-600 mb-3">
                我们的客服团队随时为您服务
              </p>
              <a 
                href="mailto:support@example.com" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                support@example.com →
              </a>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 快速开始 */}
          <section id="getting-started" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">快速开始</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">注册账户</h3>
                  <p className="text-gray-600">使用 Google 账号快速注册，新用户即送 10 积分</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">选择功能</h3>
                  <p className="text-gray-600">文字生成图像或图像生成视频，根据需要选择</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">输入描述</h3>
                  <p className="text-gray-600">详细描述你想要的效果，越具体越好</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium mb-1">生成和下载</h3>
                  <p className="text-gray-600">等待 AI 完成创作，满意即可下载使用</p>
                </div>
              </div>
            </div>
          </section>

          {/* 常见问题 */}
          <section id="faq" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">常见问题</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 视频教程 */}
          <section id="tutorials" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">视频教程</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">🎥</span>
                </div>
                <h3 className="font-medium mb-1">新手入门指南</h3>
                <p className="text-sm text-gray-600">5 分钟快速了解所有功能</p>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">🎥</span>
                </div>
                <h3 className="font-medium mb-1">高级技巧分享</h3>
                <p className="text-sm text-gray-600">提升生成质量的专业技巧</p>
              </div>
            </div>
          </section>

          {/* 联系我们 */}
          <section id="contact" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">联系我们</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">客服支持</h3>
                <div className="space-y-2 text-sm">
                  <p>📧 邮箱：support@example.com</p>
                  <p>⏰ 工作时间：周一至周五 9:00-18:00</p>
                  <p>🌐 语言：中文、English</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">社区交流</h3>
                <div className="space-y-2 text-sm">
                  <p>💬 Discord：加入讨论群</p>
                  <p>🐦 Twitter：@example_ai</p>
                  <p>📱 微信群：扫描二维码加入</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}