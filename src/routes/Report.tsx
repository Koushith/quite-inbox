import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Bug, MessageSquare } from 'lucide-react'

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
  comments: number
}

export default function ReportPage() {
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const GITHUB_REPO = 'Koushith/quite-inbox'
  const NEW_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new`

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/issues?state=open&sort=created&direction=desc`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch issues')
      }

      const data = await response.json()
      setIssues(data)
    } catch (err) {
      console.error('Error fetching issues:', err)
      setError('Failed to load issues. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Bug</h1>
                <p className="text-gray-600">
                  Found an issue? Let us know and track the progress here
                </p>
              </div>
              <Button
                onClick={() => window.open(NEW_ISSUE_URL, '_blank')}
                className="bg-gray-900 hover:bg-gray-800 font-semibold shadow-sm"
                size="lg"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report New Bug
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Open Issues
              </div>
              <div className="text-3xl font-bold text-gray-900">{issues.length}</div>
              <div className="text-xs text-gray-500 mt-1">Active bug reports</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                Response Time
              </div>
              <div className="text-3xl font-bold text-blue-600">&lt; 24h</div>
              <div className="text-xs text-blue-600 mt-1">Average response time</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">
                GitHub
              </div>
              <div className="text-xl font-bold text-green-600 break-all">
                {GITHUB_REPO}
              </div>
              <div className="text-xs text-green-600 mt-1">Repository</div>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Open Issues</h2>
              <p className="text-sm text-gray-600 mt-1">
                Browse existing issues or click on any to view details on GitHub
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                  <p className="text-gray-600">Loading issues...</p>
                </div>
              ) : error ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bug className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium mb-2">{error}</p>
                  <Button
                    onClick={fetchIssues}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : issues.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Open Issues
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    Great! There are no open bug reports at the moment. If you find an issue,
                    please report it.
                  </p>
                  <Button
                    onClick={() => window.open(NEW_ISSUE_URL, '_blank')}
                    variant="outline"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Report First Bug
                  </Button>
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="px-6 py-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => window.open(issue.html_url, '_blank')}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <img
                        src={issue.user.avatar_url}
                        alt={issue.user.login}
                        className="w-10 h-10 rounded-full"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                              {issue.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              <span>#{issue.number}</span>
                              <span>•</span>
                              <span>opened on {formatDate(issue.created_at)}</span>
                              <span>•</span>
                              <span>by {issue.user.login}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        </div>

                        {/* Labels and Comments */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {issue.labels.map((label) => (
                            <Badge
                              key={label.name}
                              variant="outline"
                              className="text-xs font-medium"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                borderColor: `#${label.color}`,
                                color: `#${label.color}`
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                          {issue.comments > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{issue.comments}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bug className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">How to Report a Bug</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-medium">1.</span>
                    <span>
                      Click "Report New Bug" button to open GitHub issue form
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">2.</span>
                    <span>
                      Describe the issue with steps to reproduce
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">3.</span>
                    <span>
                      Add screenshots if possible to help us understand better
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">4.</span>
                    <span>
                      Track the progress here and get notified when it's fixed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
