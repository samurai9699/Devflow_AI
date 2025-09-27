import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'

interface RegisterForm {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export default function Register() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
    const password = watch('password')

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true)
        try {
            const response = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password
            })
            login(response.data.user, response.data.token)
            toast.success('Account created successfully!')
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full name
                        </label>
                        <input
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Name must be at least 2 characters'
                                }
                            })}
                            type="text"
                            className="input mt-1"
                            placeholder="Enter your full name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            type="email"
                            className="input mt-1"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters'
                                }
                            })}
                            type="password"
                            className="input mt-1"
                            placeholder="Create a password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm password
                        </label>
                        <input
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value => value === password || 'Passwords do not match'
                            })}
                            type="password"
                            className="input mt-1"
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
            </div>
        </div>
    )
}