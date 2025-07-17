import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileAudio, FileText, X, CheckCircle, Mic, FileType } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  type: 'audio' | 'transcript'
}

export function AudioUploadZone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState('audio')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const processFiles = useCallback((fileList: File[], fileType: 'audio' | 'transcript') => {
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

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id)
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

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100)
          const status = newProgress === 100 ? 'completed' : 'uploading'
          return { ...file, progress: newProgress, status }
        }
        return file
      }))
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, progress: 100, status: 'completed' } : file
      ))
    }, 2000 + Math.random() * 2000)
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
    if (file.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />
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
                  {audioFiles.map(file => (
                    <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
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
                        
                        {file.status === 'completed' && (
                          <p className="text-xs text-green-600 mt-1">
                            Upload completed • Ready for analysis
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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
                  {transcriptFiles.map(file => (
                    <div key={file.id} className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
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
                        
                        {file.status === 'completed' && (
                          <p className="text-xs text-green-600 mt-1">
                            Upload completed • Ready for analysis
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}