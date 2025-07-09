"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function DemandTabs() {
  const [activeTab, setActiveTab] = useState("high")

  const tabData = [
    { id: "high", label: "High Demand", count: 45, color: "bg-red-500" },
    { id: "medium", label: "Medium Demand", count: 128, color: "bg-yellow-500" },
    { id: "low", label: "Low Demand", count: 356, color: "bg-green-500" },
    { id: "all", label: "All Products", count: 529, color: "bg-gray-500" },
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
  )
}
