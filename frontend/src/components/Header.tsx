import { Menu } from '@headlessui/react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'

export default function Header() {
    const { user, logout } = useAuthStore()

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1" />

                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                        <BellIcon className="h-5 w-5" />
                    </button>

                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center space-x-2 text-sm">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                            <span className="text-gray-700">{user?.name}</span>
                        </Menu.Button>

                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={logout}
                                        className={`${active ? 'bg-gray-100' : ''
                                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Sign out
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                </div>
            </div>
        </header>
    )
}