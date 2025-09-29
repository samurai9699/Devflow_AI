import { useAuthStore } from '../stores/authStore'

export default function Settings() {
    const { user } = useAuthStore()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.subscription?.plan || 'Free'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">API Configuration</h2>
                </div>
                <div className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                        Configure your AI provider API keys and other integrations here.
                    </p>
                </div>
            </div>
        </div>
    )
}