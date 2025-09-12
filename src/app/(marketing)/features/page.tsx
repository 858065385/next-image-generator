export default function FeaturesPage() {
  const features = [
    {
      title: '文本生成图像',
      description: '只需输入文字描述，AI 即可为你创造精美的图像作品',
      icon: '🎨',
      demo: '一只橘猫坐在窗台上，阳光洒进来，写实摄影风格'
    },
    {
      title: '图像生成视频',
      description: '将静态图片转换为生动的短视频，让作品更有生命力',
      icon: '🎬',
      demo: '风景照片变成动态视频，云朵流动，树叶摇摆'
    },
    {
      title: '多种艺术风格',
      description: '支持写实、动漫、油画、水彩等多种艺术风格',
      icon: '🎭',
      demo: '同一张照片可以转换成不同艺术风格'
    },
    {
      title: '高清输出',
      description: '支持高达 4K 分辨率的图像输出，满足专业需求',
      icon: '📸',
      demo: '生成高清大图，细节丰富，色彩饱满'
    },
    {
      title: '智能编辑',
      description: 'AI 辅助的图像编辑功能，轻松修改生成结果',
      icon: '✏️',
      demo: '可以修改图像中的元素，调整颜色和构图'
    },
    {
      title: '批量生成',
      description: '一次生成多个变体，快速找到最佳效果',
      icon: '📋',
      demo: '输入一个提示词，获得4个不同版本'
    }
  ]

  return (
    <div>
      {/* Hero 区域 */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">强大功能，释放创意</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            探索 AI 创作的无限可能，让想象力变为现实
          </p>
        </div>
      </section>

      {/* 功能列表 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-3">{feature.description}</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <strong>示例：</strong> {feature.demo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术优势 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">技术优势</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2">快速生成</h3>
              <p className="text-gray-600 text-sm">
                采用最新的 AI 模型，几秒内生成高质量图像
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold mb-2">精准理解</h3>
              <p className="text-gray-600 text-sm">
                强大的自然语言理解能力，准确把握创作意图
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-semibold mb-2">持续优化</h3>
              <p className="text-gray-600 text-sm">
                模型持续更新，生成效果越来越好
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始创作了吗？</h2>
          <p className="text-xl text-gray-600 mb-8">
            立即注册，获得 10 个免费积分
          </p>
          <a 
            href="/generate" 
            className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors inline-block"
          >
            免费试用
          </a>
        </div>
      </section>
    </div>
  )
}