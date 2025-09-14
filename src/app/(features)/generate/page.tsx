'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface GenerationResult {
  id: string
  status: string
  output?: string[]
  error?: string
}

export default function GeneratePage() {
  const { data: session } = useSession()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const checkProgress = async (id: string, isVideo = false) => {
    try {
      const response = await fetch(`/api/predictions/${id}`)
      const prediction = await response.json()
      
      if (prediction.status === 'succeeded' && prediction.output) {
        if (isVideo) {
          setGeneratedVideo(prediction.output)
          setIsGeneratingVideo(false)
        } else {
          setGeneratedImage(prediction.output[0])
          setIsGenerating(false)
        }
        if (progressInterval.current) {
          clearInterval(progressInterval.current)
        }
      } else if (prediction.status === 'failed') {
        setError(prediction.error || (isVideo ? 'Video generation failed' : 'Generation failed'))
        if (isVideo) {
          setIsGeneratingVideo(false)
        } else {
          setIsGenerating(false)
        }
        if (progressInterval.current) {
          clearInterval(progressInterval.current)
        }
      }
    } catch (err) {
      console.error('Error checking progress:', err)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !session) {
      if (!session) {
        setError('Please login first')
        return
      }
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)
    
    try {
      const response = await fetch('/api/predictions/text_to_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          user_id: session.user.id,
          user_email: session.user.email,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation')
      }

      setPredictionId(data.id)
      
      // Start polling for progress
      progressInterval.current = setInterval(() => {
        if (data.id) checkProgress(data.id)
      }, 2000)
      
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
    } else if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleGenerateVideo = async () => {
    if (!generatedImage || !session) return
    
    setIsGeneratingVideo(true)
    setError(null)
    
    try {
      // First upload the image to get a URL
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const file = new File([blob], 'generated-image.png', { type: 'image/png' })
      
      const formData = new FormData()
      formData.append('file', file)
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
      const videoResponse = await fetch('/api/predictions/img_to_video', {
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

      const data = await videoResponse.json()
      
      if (!videoResponse.ok) {
        throw new Error(data.error || 'Failed to start video generation')
      }

      // Start polling for progress
      progressInterval.current = setInterval(() => {
        if (data.id) checkProgress(data.id, true)
      }, 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsGeneratingVideo(false)
    }
  }

  // Cleanup interval on unmount
  useState(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  })

  // Actually, let's use useEffect for cleanup
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {isGenerating || isGeneratingVideo ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {isGeneratingVideo ? 'AI 正在生成视频...' : 'AI 正在创作中...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isGeneratingVideo ? '预计需要 2-5 分钟' : '预计需要 10-30 秒'}
                </p>
              </div>
            ) : generatedVideo ? (
              <video 
                src={generatedVideo} 
                controls 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎨</div>
                <p>在左侧输入描述开始创作</p>
              </div>
            )}
          </div>
          
          {!isGenerating && !isGeneratingVideo && (generatedImage || generatedVideo) && (
            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">
                <strong>提示：</strong>{generatedVideo ? '点击下载保存视频到本地' : '点击下载保存图像到本地'}
              </div>
              <div className="flex space-x-2">
                {generatedVideo ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleDownload}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载图像
                    </button>
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      生成视频
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}