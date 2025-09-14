'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ImgToVideoPage() {
  const { data: session } = useSession()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const checkProgress = async (id: string) => {
    try {
      const response = await fetch(`/api/predictions/${id}`)
      const prediction = await response.json()
      
      if (prediction.status === 'succeeded' && prediction.output) {
        setGeneratedVideo(prediction.output)
        setIsGenerating(false)
        if (progressInterval.current) {
          clearInterval(progressInterval.current)
        }
      } else if (prediction.status === 'failed') {
        setError(prediction.error || 'Video generation failed')
        setIsGenerating(false)
        if (progressInterval.current) {
          clearInterval(progressInterval.current)
        }
      }
    } catch (err) {
      console.error('Error checking progress:', err)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage || !selectedFile || !session) {
      if (!session) {
        setError('Please login first')
      }
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setGeneratedVideo(null)
    
    try {
      // First upload the image to get a URL
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', 'image')
      
      const uploadResponse = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }
      
      const { url } = await uploadResponse.json()
      
      // Then generate video
      const response = await fetch('/api/predictions/img_to_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: url,
          prompt: prompt.trim(),
          user_id: session.user.id,
          user_email: session.user.email,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start video generation')
      }

      setPredictionId(data.id)
      
      // Start polling for progress
      progressInterval.current = setInterval(() => {
        if (data.id) checkProgress(data.id)
      }, 3000) // Check every 3 seconds for video
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedVideo) {
      const link = document.createElement('a')
      link.href = generatedVideo
      link.download = `generated-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

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
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              error && !selectedImage ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}>
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      setSelectedFile(null)
                      setError(null)
                    }}
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
            {error && !selectedImage && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {isGenerating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">AI 正在生成视频...</p>
                <p className="text-sm text-gray-500 mt-2">预计需要 2-5 分钟</p>
              </div>
            ) : generatedVideo ? (
              <video 
                src={generatedVideo} 
                controls 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎬</div>
                <p>上传图片开始创作</p>
              </div>
            )}
          </div>
          
          {!isGenerating && generatedVideo && (
            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">
                <strong>提示：</strong>点击下载保存视频到本地
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.open(generatedVideo, '_blank')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  预览视频
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
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