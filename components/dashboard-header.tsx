'use client';

import { Search, Bell, Settings, User, Filter, Brain, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardHeader() {
	const pathname = usePathname();

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo and Title */}
					<div className="flex items-center space-x-4">
						<Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">W</span>
							</div>
							<span className="text-xl font-bold text-blue-600">Walmart</span>
						</Link>
						<span className="text-gray-400">|</span>
						<span className="text-gray-700 font-medium">Inventory Intelligence</span>
					</div>

					{/* Navigation */}
					<div className="flex items-center space-x-2">
						<Link href="/">
							<Button
								variant={pathname === '/' ? 'default' : 'ghost'}
								size="sm"
								className={pathname === '/' ? 'bg-blue-600 hover:bg-blue-700' : ''}
							>
								<BarChart3 className="h-4 w-4 mr-2" />
								Dashboard
							</Button>
						</Link>
						<Link href="/predict">
							<Button
								variant={pathname === '/predict' ? 'default' : 'ghost'}
								size="sm"
								className={pathname === '/predict' ? 'bg-blue-600 hover:bg-blue-700' : ''}
							>
								<Brain className="h-4 w-4 mr-2" />
								AI Predict
							</Button>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="flex-1 max-w-md mx-8">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								type="search"
								placeholder="Search products, SKUs, categories..."
								className="pl-10 pr-4"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center space-x-4">
						<Button variant="outline" size="sm">
							<Filter className="h-4 w-4 mr-2" />
							Filters
						</Button>

						<Button variant="ghost" size="sm" className="relative">
							<Bell className="h-5 w-5" />
							<Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
								3
							</Badge>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<User className="h-5 w-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Settings className="h-4 w-4 mr-2" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuItem>Profile</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Sign out</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</header>
	);
}
