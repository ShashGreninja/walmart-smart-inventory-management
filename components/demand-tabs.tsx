'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface DemandTabsProps {
	onFilterChange?: (filter: string) => void;
	productCounts?: {
		high: number;
		medium: number;
		low: number;
		all: number;
	};
}

export default function DemandTabs({ onFilterChange, productCounts }: DemandTabsProps) {
	const [activeTab, setActiveTab] = useState('all');

	const defaultCounts = {
		high: 0,
		medium: 0,
		low: 0,
		all: 0,
	};

	const counts = productCounts || defaultCounts;

	const tabData = [
		{ id: 'all', label: 'All Products', count: counts.all, color: 'bg-gray-500' },
		{ id: 'high', label: 'High Demand', count: counts.high, color: 'bg-red-500' },
		{ id: 'medium', label: 'Medium Demand', count: counts.medium, color: 'bg-yellow-500' },
		{ id: 'low', label: 'Low Demand', count: counts.low, color: 'bg-green-500' },
	];

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		onFilterChange?.(value);
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
			<TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
				{tabData.map((tab) => (
					<TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
						<span>{tab.label}</span>
						<Badge variant="secondary" className={`${tab.color} text-white text-xs px-2 py-0.5`}>
							{tab.count}
						</Badge>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
