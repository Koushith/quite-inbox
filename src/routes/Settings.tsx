import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Toaster, toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Plus, X, Shield, Mail } from 'lucide-react'

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your preferences and protected lists</p>
        </div>

        <div className="space-y-6">

          <Card className="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">Enable Modify Scope</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow archiving and deleting messages
                  </div>
                </div>
                <Switch
                  checked={settings.enableModifyScope}
                  onCheckedChange={(checked) =>
                    updateSettings({ enableModifyScope: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">Enable Send Scope</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Send unsubscribe emails via Gmail API
                  </div>
                </div>
                <Switch
                  checked={settings.enableSendScope}
                  onCheckedChange={(checked) =>
                    updateSettings({ enableSendScope: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Protected Keywords</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Messages containing these keywords will be marked as important and protected from bulk actions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {/* Add new keyword */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="e.g., invoice, statement, receipt"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                />
                <Button onClick={addKeyword} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm px-6">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Existing keywords */}
              <div className="flex flex-wrap gap-2">
                {settings.protectedKeywords.map((keyword, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Remove keyword"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {settings.protectedKeywords.length === 0 && (
                  <div className="text-center py-8 w-full">
                    <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No protected keywords yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add keywords to protect important emails</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Protected Domains</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Senders from these domains will be marked as important (banks, government, etc.)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {/* Add new domain */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                  placeholder="e.g., bank.com, irs.gov, paypal.com"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                />
                <Button onClick={addDomain} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm px-6">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Existing domains */}
              <div className="flex flex-wrap gap-2">
                {settings.protectedDomains.map((domain, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <span>{domain}</span>
                    <button
                      onClick={() => removeDomain(domain)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Remove domain"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {settings.protectedDomains.length === 0 && (
                  <div className="text-center py-8 w-full">
                    <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No protected domains yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add domains to protect important senders</p>
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
