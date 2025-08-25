import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Profiles
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>

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

            <div className="flex gap-2">
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

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
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
            >
              Clear Filters
            </Button>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {profiles.length} profiles
            </div>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  )
}