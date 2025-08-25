
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
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="search" className="mt-0">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  Search Filters
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Location</Label>
                  <Input
                    placeholder="City or State"
                    value={searchFilters.location}
                    onChange={(e) => handleSearchFilterChange("location", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Gender</Label>
                  <Select
                    value={searchFilters.gender}
                    onValueChange={(v) => handleSearchFilterChange("gender", v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Min Age</Label>
                    <Input
                      type="number"
                      placeholder="18"
                      value={searchFilters.ageMin}
                      onChange={(e) => handleSearchFilterChange("ageMin", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Max Age</Label>
                    <Input
                      type="number"
                      placeholder="65"
                      value={searchFilters.ageMax}
                      onChange={(e) => handleSearchFilterChange("ageMax", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Religion</Label>
                  <Select
                    value={searchFilters.religion}
                    onValueChange={(v) => handleSearchFilterChange("religion", v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
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
              <div className="flex justify-center mt-6">
                <Button
                  onClick={onSearch}
                  disabled={loadingSearch}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                >
                  {loadingSearch ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Profiles
                    </>
                  )}
                </Button>
              </div>
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Search Results ({searchResults.length})</h4>
                  {!activePlans.normal_plan?.isActive && (
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 p-2 text-xs">
                      <AlertDescription>Upgrade to premium to view full details</AlertDescription>
                    </Alert>
                  )}
                </div>
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{profile.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-3 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {profile.age} yrs
                          </span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {profile.gender}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {profile.city}
                          </span>
                        </div>
                      </div>
                      {!activePlans.normal_plan?.isActive && (
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            onClick={onUpgrade}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Upgrade to View
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
                <p className="text-gray-500">Use filters above to find compatible profiles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
