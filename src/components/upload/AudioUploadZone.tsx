import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, FileAudio, FileText, X, CheckCircle, Mic, FileType, Brain, Sparkles, TrendingUp, AlertCircle, FileDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { blink } from '@/blink/client'

interface UploadedFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error' | 'analyzing' | 'analyzed'
  type: 'audio' | 'transcript'
  publicUrl?: string
  analysis?: CallAnalysis
}

interface CallAnalysis {
  transcript?: string
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative'
    score: number
    confidence: number
  }
  keyInsights: {
    painPoints: string[]
    solutions: string[]
    outcomes: string[]
    metrics: { metric: string; value: string; improvement: string }[]
  }
  participants: {
    customer: string
    representative: string
  }
  duration?: string
  summary: string
  caseStudyPotential: 'high' | 'medium' | 'low'
}

export function AudioUploadZone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState('audio')
  const [generatingCaseStudy, setGeneratingCaseStudy] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const processFiles = useCallback(async (fileList: File[], fileType: 'audio' | 'transcript') => {
    let filteredFiles: File[] = []
    
    if (fileType === 'audio') {
      filteredFiles = fileList.filter(file => 
        file.type.startsWith('audio/') || 
        file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)
      )
    } else {
      filteredFiles = fileList.filter(file => 
        file.type.includes('document') ||
        file.type.includes('text') ||
        file.name.match(/\.(doc|docx|txt|pdf|rtf|gdoc)$/i) ||
        file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    }

    const newFiles: UploadedFile[] = filteredFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
      type: fileType
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Process each file
    newFiles.forEach(file => {
      const originalFile = filteredFiles.find(f => f.name === file.name)
      if (originalFile) {
        uploadAndAnalyzeFile(file.id, originalFile, fileType)
      }
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles, activeTab as 'audio' | 'transcript')
  }, [processFiles, activeTab])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'transcript') => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles, fileType)
  }, [processFiles])

  const uploadAndAnalyzeFile = async (fileId: string, file: File, fileType: 'audio' | 'transcript') => {
    try {
      // Update progress during upload
      const updateProgress = (progress: number, status: UploadedFile['status']) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress, status } : f
        ))
      }

      // Upload file to storage
      updateProgress(20, 'uploading')
      const { publicUrl } = await blink.storage.upload(
        file,
        `call-analysis/${Date.now()}-${file.name}`,
        { upsert: true }
      )

      updateProgress(50, 'uploading')
      
      // Extract text content
      let textContent = ''
      if (fileType === 'audio') {
        // For audio files, transcribe using AI
        updateProgress(60, 'analyzing')
        const audioData = await file.arrayBuffer()
        const transcription = await blink.ai.transcribeAudio({
          audio: audioData,
          language: 'en'
        })
        textContent = transcription.text
      } else {
        // For document files, extract text
        updateProgress(60, 'analyzing')
        textContent = await blink.data.extractFromBlob(file)
      }

      updateProgress(80, 'analyzing')

      // Analyze the call content with AI
      const analysisPrompt = `
        Analyze this customer call transcript and extract key information for a case study:

        TRANSCRIPT:
        ${textContent}

        Please provide a JSON response with the following structure:
        {
          "sentiment": {
            "overall": "positive|neutral|negative",
            "score": 0.85,
            "confidence": 0.92
          },
          "keyInsights": {
            "painPoints": ["specific customer challenges mentioned"],
            "solutions": ["solutions provided or discussed"],
            "outcomes": ["results, benefits, or improvements mentioned"],
            "metrics": [{"metric": "Time saved", "value": "40%", "improvement": "positive"}]
          },
          "participants": {
            "customer": "customer name or company if mentioned",
            "representative": "sales/support rep name if mentioned"
          },
          "summary": "Brief 2-3 sentence summary of the call",
          "caseStudyPotential": "high|medium|low"
        }

        Focus on extracting concrete business value, specific metrics, and success indicators.
      `

      const { object: analysis } = await blink.ai.generateObject({
        prompt: analysisPrompt,
        schema: {
          type: 'object',
          properties: {
            sentiment: {
              type: 'object',
              properties: {
                overall: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
                score: { type: 'number' },
                confidence: { type: 'number' }
              },
              required: ['overall', 'score', 'confidence']
            },
            keyInsights: {
              type: 'object',
              properties: {
                painPoints: { type: 'array', items: { type: 'string' } },
                solutions: { type: 'array', items: { type: 'string' } },
                outcomes: { type: 'array', items: { type: 'string' } },
                metrics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string' },
                      value: { type: 'string' },
                      improvement: { type: 'string' }
                    },
                    required: ['metric', 'value', 'improvement']
                  }
                }
              },
              required: ['painPoints', 'solutions', 'outcomes', 'metrics']
            },
            participants: {
              type: 'object',
              properties: {
                customer: { type: 'string' },
                representative: { type: 'string' }
              },
              required: ['customer', 'representative']
            },
            summary: { type: 'string' },
            caseStudyPotential: { type: 'string', enum: ['high', 'medium', 'low'] }
          },
          required: ['sentiment', 'keyInsights', 'participants', 'summary', 'caseStudyPotential']
        }
      })

      // Update file with analysis results
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          progress: 100, 
          status: 'analyzed',
          publicUrl,
          analysis: {
            ...analysis,
            transcript: textContent
          } as CallAnalysis
        } : f
      ))

    } catch (error) {
      console.error('Error processing file:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' } : f
      ))
    }
  }

  const generateCaseStudy = async (file: UploadedFile) => {
    if (!file.analysis) return

    setGeneratingCaseStudy(file.id)
    
    try {
      const caseStudyPrompt = `
        Generate a professional case study based on this customer call analysis:

        CUSTOMER: ${file.analysis.participants.customer}
        REPRESENTATIVE: ${file.analysis.participants.representative}
        SUMMARY: ${file.analysis.summary}
        
        PAIN POINTS:
        ${file.analysis.keyInsights.painPoints.map(p => `• ${p}`).join('\n')}
        
        SOLUTIONS:
        ${file.analysis.keyInsights.solutions.map(s => `• ${s}`).join('\n')}
        
        OUTCOMES:
        ${file.analysis.keyInsights.outcomes.map(o => `• ${o}`).join('\n')}
        
        METRICS:
        ${file.analysis.keyInsights.metrics.map(m => `• ${m.metric}: ${m.value} (${m.improvement})`).join('\n')}

        Create a compelling case study with the following sections:
        1. Executive Summary
        2. Challenge
        3. Solution
        4. Results
        5. Customer Quote (if available from transcript)

        Make it professional, specific, and focused on business value.
      `

      const { text: caseStudy } = await blink.ai.generateText({
        prompt: caseStudyPrompt,
        maxTokens: 1500
      })

      // Create a downloadable file
      const blob = new Blob([caseStudy], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `case-study-${file.analysis.participants.customer.replace(/\s+/g, '-').toLowerCase()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating case study:', error)
    } finally {
      setGeneratingCaseStudy(null)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: UploadedFile) => {
    if (file.status === 'analyzed') {
      return <Brain className="w-5 h-5 text-green-600" />
    }
    if (file.status === 'analyzing') {
      return <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
    }
    if (file.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    if (file.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />
    }
    return file.type === 'audio' ? 
      <FileAudio className="w-5 h-5 text-primary" /> : 
      <FileText className="w-5 h-5 text-blue-600" />
  }

  const renderUploadZone = (type: 'audio' | 'transcript') => {
    const isAudio = type === 'audio'
    const acceptTypes = isAudio 
      ? "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
      : ".doc,.docx,.txt,.pdf,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    const title = isAudio ? "Upload Call Recordings" : "Upload Call Transcripts"
    const description = isAudio 
      ? "Drag and drop your audio files here, or click to browse. Supports MP3, WAV, M4A, AAC, OGG, and FLAC formats."
      : "Upload transcripts from Google Docs, Word documents, PDFs, or text files. We'll extract the conversation content for analysis."
    
    const icon = isAudio ? <Mic className="w-8 h-8 text-primary" /> : <FileType className="w-8 h-8 text-blue-600" />
    const inputId = `file-upload-${type}`

    return (
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver && activeTab === type ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full mb-4",
            isAudio ? "bg-primary/10" : "bg-blue-50"
          )}>
            {icon}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-500 text-center mb-6 max-w-sm">
            {description}
          </p>
          
          <input
            type="file"
            multiple
            accept={acceptTypes}
            onChange={(e) => handleFileSelect(e, type)}
            className="hidden"
            id={inputId}
          />
          
          <Button asChild className={cn(
            "hover:opacity-90",
            isAudio ? "bg-primary hover:bg-primary/90" : "bg-blue-600 hover:bg-blue-700"
          )}>
            <label htmlFor={inputId} className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderFileItem = (file: UploadedFile) => (
    <div key={file.id} className={cn(
      "p-4 rounded-lg border transition-all",
      file.type === 'audio' ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
    )}>
      <div className="flex items-start space-x-4">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
          file.type === 'audio' ? "bg-primary/10" : "bg-blue-100"
        )}>
          {getFileIcon(file)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
          
          {file.status === 'uploading' && (
            <div className="mt-2">
              <Progress value={file.progress} className="h-1" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(file.progress)}% uploaded
              </p>
            </div>
          )}
          
          {file.status === 'analyzing' && (
            <div className="mt-2">
              <Progress value={file.progress} className="h-1" />
              <p className="text-xs text-amber-600 mt-1">
                Analyzing with AI • Extracting insights...
              </p>
            </div>
          )}
          
          {file.status === 'completed' && (
            <p className="text-xs text-green-600 mt-1">
              Upload completed • Ready for analysis
            </p>
          )}
          
          {file.status === 'analyzed' && file.analysis && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-green-600">
                Analysis complete • Ready for case study
              </p>
              
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    file.analysis.sentiment.overall === 'positive' && "bg-green-100 text-green-800",
                    file.analysis.sentiment.overall === 'neutral' && "bg-yellow-100 text-yellow-800",
                    file.analysis.sentiment.overall === 'negative' && "bg-red-100 text-red-800"
                  )}
                >
                  {file.analysis.sentiment.overall} sentiment
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    file.analysis.caseStudyPotential === 'high' && "border-green-500 text-green-700",
                    file.analysis.caseStudyPotential === 'medium' && "border-yellow-500 text-yellow-700",
                    file.analysis.caseStudyPotential === 'low' && "border-gray-500 text-gray-700"
                  )}
                >
                  {file.analysis.caseStudyPotential} case study potential
                </Badge>
              </div>

              <div className="mt-3 p-3 bg-white rounded-lg border">
                <p className="text-xs font-medium text-gray-700 mb-1">Summary:</p>
                <p className="text-xs text-gray-600">{file.analysis.summary}</p>
                
                {file.analysis.keyInsights.metrics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Key Metrics:</p>
                    <div className="flex flex-wrap gap-1">
                      {file.analysis.keyInsights.metrics.slice(0, 3).map((metric, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {metric.metric}: {metric.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateCaseStudy(file)}
                  disabled={generatingCaseStudy === file.id}
                  className="text-xs"
                >
                  {generatingCaseStudy === file.id ? (
                    <>
                      <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3 h-3 mr-1" />
                      Generate Case Study
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {file.status === 'error' && (
            <p className="text-xs text-red-600 mt-1">
              Error processing file • Please try again
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFile(file.id)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  const audioFiles = files.filter(f => f.type === 'audio')
  const transcriptFiles = files.filter(f => f.type === 'transcript')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            Upload Call Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audio" className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Audio Recordings
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Transcripts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audio" className="mt-6">
              {renderUploadZone('audio')}
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              {renderUploadZone('transcript')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Uploaded Files</h4>
            
            {audioFiles.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileAudio className="w-4 h-4 mr-2 text-primary" />
                  Audio Recordings ({audioFiles.length})
                </h5>
                <div className="space-y-3">
                  {audioFiles.map(renderFileItem)}
                </div>
              </div>
            )}

            {transcriptFiles.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Transcripts ({transcriptFiles.length})
                </h5>
                <div className="space-y-3">
                  {transcriptFiles.map(renderFileItem)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}