import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Toaster, toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Plus, X, Shield, Mail, Lock, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [newKeyword, setNewKeyword] = useState('')
  const [newDomain, setNewDomain] = useState('')

  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase()
    if (!keyword) {
      toast.error('Please enter a keyword')
      return
    }
    if (settings.protectedKeywords.includes(keyword)) {
      toast.error('This keyword is already protected')
      return
    }
    updateSettings({
      protectedKeywords: [...settings.protectedKeywords, keyword]
    })
    setNewKeyword('')
    toast.success('Protected keyword added')
  }

  const removeKeyword = (keyword: string) => {
    updateSettings({
      protectedKeywords: settings.protectedKeywords.filter(k => k !== keyword)
    })
    toast.success('Protected keyword removed')
  }

  const addDomain = () => {
    const domain = newDomain.trim().toLowerCase()
    if (!domain) {
      toast.error('Please enter a domain')
      return
    }
    if (settings.protectedDomains.includes(domain)) {
      toast.error('This domain is already protected')
      return
    }
    updateSettings({
      protectedDomains: [...settings.protectedDomains, domain]
    })
    setNewDomain('')
    toast.success('Protected domain added')
  }

  const removeDomain = (domain: string) => {
    updateSettings({
      protectedDomains: settings.protectedDomains.filter(d => d !== domain)
    })
    toast.success('Protected domain removed')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-6">Manage your preferences and safety settings</p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modify Scope</div>
                  <div className="text-sm font-bold text-gray-900">
                    {settings.enableModifyScope ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Protected Keywords</div>
                  <div className="text-sm font-bold text-gray-900">{settings.protectedKeywords.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Protected Domains</div>
                  <div className="text-sm font-bold text-gray-900">{settings.protectedDomains.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gmail Permissions - Full Width */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Gmail Permissions</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Control what QuitInbox can do with your Gmail account
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Modify Scope
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Archive and delete emails
                      </div>
                    </div>
                    <Switch
                      checked={settings.enableModifyScope}
                      onCheckedChange={(checked) =>
                        updateSettings({ enableModifyScope: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-base flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Send Scope
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Send unsubscribe emails
                      </div>
                    </div>
                    <Switch
                      checked={settings.enableSendScope}
                      onCheckedChange={(checked) =>
                        updateSettings({ enableSendScope: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Protected Keywords */}
          <Card className="shadow-sm border-0 rounded-xl overflow-hidden h-fit bg-white">
            <CardHeader className="pb-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-bold text-gray-900">Protected Keywords</CardTitle>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Protect important emails from bulk actions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* Add new keyword */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="e.g., invoice, receipt"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                />
                <Button onClick={addKeyword} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Existing keywords */}
              <div className="max-h-64 overflow-y-auto">
                {settings.protectedKeywords.length === 0 ? (
                  <div className="text-center py-6">
                    <Shield className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No keywords yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.protectedKeywords.map((keyword, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-yellow-100 transition-colors"
                      >
                        <span>{keyword}</span>
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="text-yellow-700 hover:text-yellow-900 transition-colors"
                          aria-label="Remove keyword"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Protected Domains */}
          <Card className="shadow-sm border-0 rounded-xl overflow-hidden h-fit bg-white">
            <CardHeader className="pb-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-bold text-gray-900">Protected Domains</CardTitle>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Mark important senders (banks, gov, etc.)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* Add new domain */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                  placeholder="e.g., bank.com, irs.gov"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
                <Button onClick={addDomain} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Existing domains */}
              <div className="max-h-64 overflow-y-auto">
                {settings.protectedDomains.length === 0 ? (
                  <div className="text-center py-6">
                    <Lock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No domains yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.protectedDomains.map((domain, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-green-100 transition-colors"
                      >
                        <span>{domain}</span>
                        <button
                          onClick={() => removeDomain(domain)}
                          className="text-green-700 hover:text-green-900 transition-colors"
                          aria-label="Remove domain"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>

      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  )
}
