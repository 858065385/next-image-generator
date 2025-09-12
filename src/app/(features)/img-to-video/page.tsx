'use client'

import { useState } from 'react'

export default function ImgToVideoPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage) return
    
    setIsGenerating(true)
    // 这里会调用 API 生成视频
    setTimeout(() => {
      setIsGenerating(false)
    }, 5000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图像生成视频</h1>
        <p className="text-gray-600">上传静态图片，AI 将其转换为生动的短视频</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传图像
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-4xl">📷</div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">点击上传</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-gray-500"> 或拖拽到此处</span>
                  </div>
                  <p className="text-xs text-gray-500">支持 JPG、PNG 格式，最大 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              动画描述（可选）
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：让云朵缓缓飘动，树叶轻轻摇摆"
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                消耗积分：<span className="font-medium text-purple-600">15</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedImage}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isGenerating || !selectedImage
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isGenerating ? '生成中...' : '生成视频'}
              </button>
            </div>
          </div>

          {/* 高级选项 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">高级选项</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频长度
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>5 秒</option>
                  <option>8 秒</option>
                  <option>10 秒</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  动画强度
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>轻微动画</option>
                  <option>适中</option>
                  <option>强烈动画</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">生成结果</h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">AI 正在生成视频...</p>
                <p className="text-sm text-gray-500 mt-2">预计需要 2-5 分钟</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎬</div>
                <p>上传图片开始创作</p>
              </div>
            )}
          </div>
          
          {!isGenerating && selectedImage && (
            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">
                <strong>提示：</strong>清晰的图片会获得更好的视频效果
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  预览视频
                </button>
                <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  下载视频
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}