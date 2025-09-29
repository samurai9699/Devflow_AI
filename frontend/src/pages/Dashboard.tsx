import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { PlusIcon, PlayIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
    const { user } = useAuthStore()

    const { data: analytics } = useQuery('analytics', async () => {
        const response = await api.get('/analytics/dashboard')
        return response.data
    })

    const { data: workflows } = useQuery('recent-workflows', async () => {
        const response = await api.get('/workflows?limit=5')
        return response.data
    })

    const executionStats = analytics?.executionStats || []
    const usageStats = analytics?.usageStats || {}

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />
            case 'FAILED':
                return <XCircleIcon className="h-5 w-5 text-red-500" />
            case 'RUNNING':
                return <PlayIcon className="h-5 w-5 text-blue-500" />
            default:
                return <ClockIcon className="h-5 w-5 text-yellow-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-600">
                        Here's what's happening with your workflows today.
                    </p>
                </div>

                <Link
                    to="/workflows/new"
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Workflow
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PlayIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Executions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {executionStats.reduce((acc: number, stat: any) => acc + stat._count.status, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {executionStats.length > 0 ? '94%' : '0%'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tokens Used</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {usageStats._sum?.tokens?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <PlayIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Monthly Limit</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {user?.subscription?.monthlyExecutions || 0} / {user?.subscription?.maxMonthlyExecutions || 100}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Workflows */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Recent Workflows</h2>
                        <Link to="/workflows" className="text-sm text-primary-600 hover:text-primary-500">
                            View all
                        </Link>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {workflows?.slice(0, 5).map((workflow: any) => (
                        <div key={workflow.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {getStatusIcon('COMPLETED')}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{workflow.name}</p>
                                    <p className="text-sm text-gray-500">{workflow.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                    {workflow._count?.executions || 0} executions
                                </span>
                                <Link
                                    to={`/workflows/${workflow.id}/edit`}
                                    className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}

                    {(!workflows || workflows.length === 0) && (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-500">No workflows yet. Create your first workflow to get started!</p>
                            <Link to="/workflows/new" className="btn btn-primary mt-4">
                                Create Workflow
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}