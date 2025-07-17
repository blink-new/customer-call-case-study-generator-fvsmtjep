import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { AudioUploadZone } from '@/components/upload/AudioUploadZone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare, 
  Download,
  FileText,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { blink } from '@/blink/client'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CallInsight...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-6 mx-auto">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CallInsight</h1>
          <p className="text-gray-600 mb-6">
            AI-powered customer call analysis and case study generation platform
          </p>
          <Button onClick={() => blink.auth.login()} className="bg-primary hover:bg-primary/90">
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Transform your customer calls into compelling success stories with AI-powered analysis.
          </p>
        </div>

        <div className="mb-8">
          <StatsCards />
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="insights">Call Insights</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AudioUploadZone />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Sparkles className="w-5 h-5 mr-2 text-primary" />
                      AI Analysis Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Smart Transcription</p>
                        <p className="text-xs text-gray-500">Accurate speech-to-text with speaker identification</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Sentiment Analysis</p>
                        <p className="text-xs text-gray-500">Detect emotions and satisfaction levels</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Key Insights</p>
                        <p className="text-xs text-gray-500">Extract pain points, solutions, and outcomes</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Case Study Generation</p>
                        <p className="text-xs text-gray-500">Auto-generate professional success stories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Customer Success Call</span>
                        </div>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Product Demo</span>
                        </div>
                        <span className="text-xs text-gray-500">5h ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm">Support Resolution</span>
                        </div>
                        <span className="text-xs text-gray-500">1d ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-900">Customer Success Call - TechCorp</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Positive</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Customer achieved 40% efficiency improvement using our solution
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-green-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          15:30 duration
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          95% satisfaction
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">Product Demo - StartupXYZ</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interested</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Strong interest in enterprise features, requesting custom pricing
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-blue-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          22:15 duration
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          3 participants
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Pain Points</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Manual data processing</span>
                          <span className="text-xs text-gray-500">67%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Integration challenges</span>
                          <span className="text-xs text-gray-500">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Scalability concerns</span>
                          <span className="text-xs text-gray-500">38%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Success Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Time savings</span>
                          <span className="text-xs font-medium text-green-600">+45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cost reduction</span>
                          <span className="text-xs font-medium text-green-600">+32%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">User satisfaction</span>
                          <span className="text-xs font-medium text-green-600">+28%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="case-studies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Case Studies</span>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate New
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">TechCorp Efficiency Success Story</h4>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        How TechCorp achieved 40% efficiency improvement and reduced operational costs by $50K annually
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Generated 2 hours ago</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3 mr-1" />
                            Word
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">StartupXYZ Growth Case Study</h4>
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Scaling from 10 to 100 users: StartupXYZ's journey with our enterprise solution
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Generated 1 day ago</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3 mr-1" />
                            Word
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Study Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Executive Summary</h4>
                      <p className="text-xs text-gray-600">
                        Brief overview of the customer, challenge, and outcome
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Challenge</h4>
                      <p className="text-xs text-gray-600">
                        Detailed description of the customer's pain points
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Solution</h4>
                      <p className="text-xs text-gray-600">
                        How your product/service addressed the challenges
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Results</h4>
                      <p className="text-xs text-gray-600">
                        Quantifiable outcomes and customer testimonials
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Recording Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
                  <p className="text-gray-500 mb-4">
                    Upload your first call recording to get started with AI analysis
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    Upload Recording
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App