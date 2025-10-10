import { NavLink } from 'react-router-dom'
import {
    HomeIcon,
    CogIcon,
    ChartBarIcon,
    PlayIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Workflows', href: '/workflows', icon: PlayIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Teams', href: '/teams', icon: UserGroupIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
    return (
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900">DevFlow AI</h1>
            </div>

            <nav className="px-3">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${isActive
                                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}