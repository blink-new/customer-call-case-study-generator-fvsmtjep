import { Button } from '@/components/ui/button'
import { Mic, FileAudio, BookOpen, BarChart3 } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CallInsight</h1>
              <p className="text-sm text-gray-500">AI-Powered Case Study Generator</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <FileAudio className="w-4 h-4 mr-2" />
              Analysis
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <BookOpen className="w-4 h-4 mr-2" />
              Case Studies
            </Button>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Upload Call
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}