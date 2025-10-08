import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { PlusIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import api from '../lib/api'

export default function Workflows() {
    const { data: workflows, isLoading } = useQuery('workflows', async () => {
        const response = await api.get('/workflows')
        return response.data
    })

    if (isLoading) {
        return <div className="flex justify-center py-8">Loading workflows...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
                <Link to="/workflows/new" className="btn btn-primary flex items-center">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Workflow
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows?.map((workflow: any) => (
                    <div key={workflow.id} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {workflow.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {workflow.description || 'No description'}
                                </p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <PlayIcon className="h-4 w-4 mr-1" />
                                    {workflow._count?.executions || 0} executions
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workflow.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {workflow.isActive ? 'Active' : 'Inactive'}
                            </span>

                            <div className="flex items-center space-x-2">
                                <Link
                                    to={`/workflows/${workflow.id}/edit`}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Link>
                                <button className="p-2 text-gray-400 hover:text-red-600">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!workflows || workflows.length === 0) && (
                <div className="text-center py-12">
                    <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new workflow.
                    </p>
                    <div className="mt-6">
                        <Link to="/workflows/new" className="btn btn-primary">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            New Workflow
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}