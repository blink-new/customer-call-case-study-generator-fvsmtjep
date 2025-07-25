import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, FileText, Clock, Star } from 'lucide-react'

export function StatsCards() {
  const stats = [
    {
      title: 'Total Calls Analyzed',
      value: '247',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Case Studies Generated',
      value: '89',
      change: '+23%',
      icon: Star,
      color: 'text-emerald-600'
    },
    {
      title: 'Avg. Processing Time',
      value: '2.4m',
      change: '-8%',
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {stat.change}
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}