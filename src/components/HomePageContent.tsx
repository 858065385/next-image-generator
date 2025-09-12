import Link from 'next/link'
import Image from 'next/image'

export default function HomePageContent() {
  return (
    <div>
      {/* Hero 区域 */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            AI 驱动的创意工具
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            使用最新的 AI 技术，几秒钟内生成高质量的图像和视频
          </p>
          <div className="space-x-4">
            <Link 
              href="/generate" 
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors"
            >
              免费试用
            </Link>
            <Link 
              href="/features" 
              className="border border-gray-300 px-8 py-3 rounded-lg text-lg hover:bg-gray-50 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* 功能展示 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">强大功能，简单操作</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">文本生成图像</h3>
              <p className="text-gray-600">输入文字描述，AI 为你创造精美图像</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">图像生成视频</h3>
              <p className="text-gray-600">让静态图片变成动态视频</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">多种艺术风格</h3>
              <p className="text-gray-600">写实、动漫、油画等多种风格可选</p>
            </div>
          </div>
        </div>
      </section>

      {/* 作品展示 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">精彩作品展示</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image 
                  src={`/placeholder-${i}.jpg`} 
                  alt={`作品 ${i}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">开始你的创作之旅</h2>
          <p className="text-xl text-gray-600 mb-8">
            立即注册，获得 100 免费积分
          </p>
          <Link 
            href="/generate" 
            className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors"
          >
            立即开始
          </Link>
        </div>
      </section>
    </div>
  )
}