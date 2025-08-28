
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Filter, X, Calendar, User, MapPin , Zap } from "lucide-react";
import { UserProfile, ActivePlan, SearchFilters } from "../../types/types";

interface SearchTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  searchResults: UserProfile[];
  loadingSearch: boolean;
  onSearch: () => void;
  onResetFilters: () => void;
  activePlans: ActivePlan;
  onUpgrade: () => void;
  onViewProfile: (profileId: number) => void;
}

export default function SearchTab({
  activeTab,
  setActiveTab,
  searchFilters,
  setSearchFilters,
  searchResults,
  loadingSearch,
  onSearch,
  onResetFilters,
  activePlans,
  onUpgrade,
  onViewProfile,
}: SearchTabProps) {
  const handleSearchFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters({ ...searchFilters, [key]: value });
  };

  return (
  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
    <CardContent className="p-3 sm:p-4 lg:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="search" className="mt-0">
          {/* Search filters section - responsive */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <h4 className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
                Search Filters
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-gray-500 hover:text-gray-700 self-start sm:self-auto h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            {/* Responsive grid for filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {/* Location */}
              <div className="sm:col-span-1">
                <Label className="text-xs text-gray-600 mb-1 block">Location</Label>
                <Input
                  placeholder="City or State"
                  value={searchFilters.location}
                  onChange={(e) => handleSearchFilterChange("location", e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              
              {/* Gender */}
              <div className="sm:col-span-1">
                <Label className="text-xs text-gray-600 mb-1 block">Gender</Label>
                <Select
                  value={searchFilters.gender}
                  onValueChange={(v) => handleSearchFilterChange("gender", v)}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Age range - responsive grid */}
              <div className="grid grid-cols-2 gap-2 sm:col-span-1 lg:col-span-1">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Min Age</Label>
                  <Input
                    type="number"
                    placeholder="18"
                    value={searchFilters.ageMin}
                    onChange={(e) => handleSearchFilterChange("ageMin", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Max Age</Label>
                  <Input
                    type="number"
                    placeholder="65"
                    value={searchFilters.ageMax}
                    onChange={(e) => handleSearchFilterChange("ageMax", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Religion */}
              <div className="sm:col-span-1">
                <Label className="text-xs text-gray-600 mb-1 block">Religion</Label>
                <Select
                  value={searchFilters.religion}
                  onValueChange={(v) => handleSearchFilterChange("religion", v)}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Christian">Christian</SelectItem>
                    <SelectItem value="Sikh">Sikh</SelectItem>
                    <SelectItem value="Buddhist">Buddhist</SelectItem>
                    <SelectItem value="Jain">Jain</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search button - centered and responsive */}
            <div className="flex justify-center mt-4 sm:mt-6">
              <Button
                onClick={onSearch}
                disabled={loadingSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm"
              >
                {loadingSearch ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Search Profiles</span>
                    <span className="sm:hidden">Search</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                  Search Results ({searchResults.length})
                </h4>
                {!activePlans.normal_plan?.isActive && (
                  <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 p-2 text-xs sm:text-sm">
                    <AlertDescription>Upgrade to premium to view full details</AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Results list - responsive cards */}
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all hover:border-blue-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate mb-1">
                        {profile.name}
                      </h3>
                      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-2 sm:gap-3">
                        <span className="flex items-center">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {profile.age} yrs
                        </span>
                        <span className="flex items-center">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {profile.gender}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {profile.city}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action button - responsive */}
                    {!activePlans.normal_plan?.isActive && (
                      <div className="flex justify-end sm:ml-4">
                        <Button
                          size="sm"
                          onClick={onUpgrade}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs sm:text-sm h-7 sm:h-8"
                        >
                          <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          <span className="hidden sm:inline">Upgrade to View</span>
                          <span className="sm:hidden">Upgrade</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state - responsive
            <div className="text-center py-8 sm:py-12">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">Use filters above to find compatible profiles</p>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
