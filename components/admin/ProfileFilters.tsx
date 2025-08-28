import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter , X } from "lucide-react"
import { UserProfile } from "./types"

interface Filters {
  search: string
  caste: string
  ageMin: string
  ageMax: string
  state: string
  gender: string
  status: string
}

interface ProfileFiltersProps {
  profiles: UserProfile[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
}

export default function ProfileFilters({ profiles, filters, setFilters }: ProfileFiltersProps) {
  const getUniqueValues = (key: keyof UserProfile) => {
    if (!Array.isArray(profiles)) return []
    return [...new Set(profiles.map((profile) => profile[key]))].filter(Boolean)
  }

 return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          Filter Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Mobile/Tablet Layout */}
        <div className="block lg:hidden space-y-3">
          {/* Search - Full width on mobile */}
          <div>
            <Input
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* First row - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={filters.gender}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Second row - Age inputs */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min Age"
              value={filters.ageMin}
              onChange={(e) => setFilters((prev) => ({ ...prev, ageMin: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Max Age"
              value={filters.ageMax}
              onChange={(e) => setFilters((prev) => ({ ...prev, ageMax: e.target.value }))}
            />
          </div>

          {/* Third row - Caste and State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              value={filters.caste}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, caste: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Caste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Castes</SelectItem>
                {getUniqueValues("caste").map((caste) => (
                  <SelectItem key={caste} value={caste as string}>
                    {caste}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.state}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {getUniqueValues("state").map((state) => (
                  <SelectItem key={state} value={state as string}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-7 gap-4">
            {/* Search - 2 columns */}
            <div className="col-span-2">
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>

            {/* Caste */}
            <Select
              value={filters.caste}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, caste: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Caste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Castes</SelectItem>
                {getUniqueValues("caste").map((caste) => (
                  <SelectItem key={caste} value={caste as string}>
                    {caste}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Age Range - 1 column with 2 inputs */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin}
                onChange={(e) => setFilters((prev) => ({ ...prev, ageMin: e.target.value }))}
                className="w-1/2"
              />
              <Input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax}
                onChange={(e) => setFilters((prev) => ({ ...prev, ageMax: e.target.value }))}
                className="w-1/2"
              />
            </div>

            {/* State */}
            <Select
              value={filters.state}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {getUniqueValues("state").map((state) => (
                  <SelectItem key={state} value={state as string}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender */}
            <Select
              value={filters.gender}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters({
                search: "",
                caste: "all",
                ageMin: "",
                ageMax: "",
                state: "all",
                gender: "all",
                status: "all",
              })
            }
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          
          <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-right">
            Showing {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}