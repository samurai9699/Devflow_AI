import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../lib/api'

interface WorkflowForm {
    name: string
    description: string
}

export default function WorkflowBuilder() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm<WorkflowForm>()

    const onSubmit = async (data: WorkflowForm) => {
        setLoading(true)
        try {
            // Basic workflow with AI generation step
            const workflowData = {
                ...data,
                steps: [
                    {
                        id: 'step-1',
                        type: 'ai_generation',
                        config: {
                            prompt: 'Generate a simple Hello World function',
                            type: 'code',
                            language: 'javascript',
                            provider: 'openai'
                        }
                    }
                ],
                triggers: [
                    {
                        type: 'manual',
                        config: {}
                    }
                ]
            }

            await api.post('/workflows', workflowData)
            toast.success('Workflow created successfully!')
            navigate('/workflows')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create workflow')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Workflow</h1>
                <p className="text-gray-600">Build an automated workflow to streamline your development process.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Workflow Name
                        </label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            type="text"
                            className="input mt-1"
                            placeholder="e.g., Generate API Documentation"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="input mt-1"
                            placeholder="Describe what this workflow does..."
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Workflow Preview</h3>
                        <p className="text-sm text-gray-600">
                            This workflow will include a basic AI code generation step. You can customize it after creation.
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/workflows')}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create Workflow'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}