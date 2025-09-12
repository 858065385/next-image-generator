'use client'

import { useState } from 'react'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // 这里会调用 API 生成图像
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">文字生成图像</h1>
        <p className="text-gray-600">输入描述，让 AI 为你创造独特的图像作品</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图像描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一只橘猫坐在窗台上，阳光洒进来，写实摄影风格"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                消耗积分：<span className="font-medium text-blue-600">1</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isGenerating || !prompt.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isGenerating ? '生成中...' : '生成图像'}
              </button>
            </div>
          </div>

          {/* 高级选项 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">高级选项</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图像尺寸
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>1:1 (512x512)</option>
                  <option>16:9 (768x432)</option>
                  <option>9:16 (432x768)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  艺术风格
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>自动选择</option>
                  <option>写实摄影</option>
                  <option>油画风格</option>
                  <option>动漫风格</option>
                  <option>水彩画</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">生成结果</h3>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">AI 正在创作中...</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎨</div>
                <p>在左侧输入描述开始创作</p>
              </div>
            )}
          </div>
          
          {!isGenerating && (
            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">
                <strong>提示：</strong>更详细的描述会获得更好的效果
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  下载图像
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  生成视频
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}