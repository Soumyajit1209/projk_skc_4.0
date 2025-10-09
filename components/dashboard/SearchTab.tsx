import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Filter, X, Calendar, User, MapPin, Zap, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
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

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== "");

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="search" className="mt-0">
            {/* Search filters section with modern design */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 mr-3">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Advanced Search</h4>
                    <p className="text-sm text-gray-600">Find your perfect match with precision</p>
                  </div>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetFilters}
                    className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600 font-medium"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {/* Filter grid with better spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-rose-500" />
                    Location
                  </Label>
                  <Input
                    placeholder="Enter city or state"
                    value={searchFilters.location}
                    onChange={(e) => handleSearchFilterChange("location", e.target.value)}
                    className="h-11 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                
                {/* Gender Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-500" />
                    Gender
                  </Label>
                  <Select
                    value={searchFilters.gender}
                    onValueChange={(v) => handleSearchFilterChange("gender", v)}
                  >
                    <SelectTrigger className="h-11 bg-white border-slate-300 focus:border-blue-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Age Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Age Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min (18)"
                      value={searchFilters.ageMin}
                      onChange={(e) => handleSearchFilterChange("ageMin", e.target.value)}
                      className="h-11 bg-white border-slate-300 focus:border-blue-500"
                    />
                    <Input
                      type="number"
                      placeholder="Max (65)"
                      value={searchFilters.ageMax}
                      onChange={(e) => handleSearchFilterChange("ageMax", e.target.value)}
                      className="h-11 bg-white border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Religion Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                    Religion
                  </Label>
                  <Select
                    value={searchFilters.religion}
                    onValueChange={(v) => handleSearchFilterChange("religion", v)}
                  >
                    <SelectTrigger className="h-11 bg-white border-slate-300 focus:border-blue-500">
                      <SelectValue placeholder="Any religion" />
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

                {/* Education Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Education
                  </Label>
                  <Input
                    placeholder="e.g. MBA, B.Tech"
                    value={searchFilters.education}
                    onChange={(e) => handleSearchFilterChange("education", e.target.value)}
                    className="h-11 bg-white border-slate-300 focus:border-blue-500"
                  />
                </div>

                {/* Occupation Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Profession
                  </Label>
                  <Input
                    placeholder="e.g. Engineer, Doctor"
                    value={searchFilters.occupation}
                    onChange={(e) => handleSearchFilterChange("occupation", e.target.value)}
                    className="h-11 bg-white border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Search button with modern styling */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={onSearch}
                  disabled={loadingSearch}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                >
                  {loadingSearch ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-3" />
                      Find Matches
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Search results section */}
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-lg p-2 mr-3">
                      <Search className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Search Results</h4>
                      <p className="text-sm text-gray-600">Found {searchResults.length} matching profiles</p>
                    </div>
                  </div>
                  {!activePlans.normal_plan?.isActive && (
                    <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 p-4 max-w-md">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 text-sm font-medium">
                        Upgrade to premium to view complete profile details
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Results grid */}
                <div className="grid gap-6">
                  {searchResults.map((profile) => (
                    <Card
                      key={profile.id}
                      className="border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm group"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {profile.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                              <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                                <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                                {profile.age} years
                              </span>
                              <span className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
                                <User className="h-3 w-3 mr-1 text-purple-500" />
                                {profile.gender}
                              </span>
                              <span className="flex items-center bg-rose-50 px-3 py-1 rounded-full">
                                <MapPin className="h-3 w-3 mr-1 text-rose-500" />
                                {profile.city}
                              </span>
                            </div>
                            {profile.education && (
                              <p className="text-sm text-gray-600 bg-slate-50 px-3 py-2 rounded-lg inline-block">
                                {profile.education}
                              </p>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="ml-6">
                            {activePlans.normal_plan?.isActive ? (
                              <Button
                                onClick={() => onViewProfile(profile.id)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-6 py-2 h-10 shadow-sm"
                              >
                                View Profile
                              </Button>
                            ) : (
                              <Button
                                onClick={onUpgrade}
                                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium px-6 py-2 h-10 shadow-sm"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Upgrade to View
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Enhanced empty state */
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <Search className="h-16 w-16 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Your Perfect Match</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                  Use our advanced filters above to search through thousands of verified profiles and find someone special.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="bg-blue-500 rounded-lg p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Filter className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">Smart Filters</h4>
                    <p className="text-sm text-blue-700">Refine your search with location, age, and preferences</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <div className="bg-purple-500 rounded-lg p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-900 mb-2">Verified Profiles</h4>
                    <p className="text-sm text-purple-700">Browse authentic, expert-verified member profiles</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="bg-green-500 rounded-lg p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">Premium Access</h4>
                    <p className="text-sm text-green-700">Upgrade for unlimited profile views and contact</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}