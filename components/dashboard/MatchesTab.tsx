
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, MapPin, Calendar, User, Star, Crown, Eye, PhoneCall, MessageCircle, Search, } from "lucide-react";
import { UserProfile, ActivePlan } from "../../types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MatchesTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matches: UserProfile[];
  loadingMatches: boolean;
  onViewProfile: (profileId: number) => void;
  onInitiateCall: (targetUserId: number, targetName: string) => void;
  activePlans: ActivePlan;
  makingCall: boolean;
  onUpgrade: () => void;
}

export default function MatchesTab({
  activeTab,
  setActiveTab,
  matches,
  loadingMatches,
  onViewProfile,
  onInitiateCall,
  activePlans,
  makingCall,
  onUpgrade,
}: MatchesTabProps) {
  const renderProfileCard = (profile: UserProfile) => {
    const hasNormalPlan = activePlans.normal_plan?.isActive;
    const hasCallPlan = activePlans.call_plan?.isActive;

    return (
      <div
        key={profile.id}
        className="bg-white border rounded-lg hover:shadow-md transition-all hover:border-blue-300"
      >
        <div className="p-3 sm:p-4">
          {/* Mobile-first responsive layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Profile info section */}
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-blue-100 flex-shrink-0">
                <AvatarImage src={profile.profile_photo} />
                <AvatarFallback className="text-sm sm:text-base font-semibold text-blue-500 bg-blue-50">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Name and badges */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {profile.name}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {profile.created_by_admin && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-amber-200 text-amber-700 bg-amber-50 px-1 sm:px-1.5">
                        <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        Expert
                      </Badge>
                    )}
                    {profile.compatibility_score && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-green-200 text-green-700 bg-green-50 px-1 sm:px-1.5">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        {profile.compatibility_score}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Basic info - stack on mobile */}
                <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-1 sm:gap-3 mb-1">
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
                  {profile.distance && (
                    <span className="flex items-center">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      {profile.distance}km
                    </span>
                  )}
                </div>

                {/* Additional info - responsive text */}
                <div className="flex flex-wrap items-center text-[10px] sm:text-xs text-gray-500 gap-1 sm:gap-3">
                  <span className="truncate">{profile.education}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate">{profile.religion}</span>
                  {profile.height && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>{profile.height}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons - responsive layout */}
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-2 sm:ml-4 justify-end sm:justify-start">
              {/* Top row buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewProfile(profile.id)}
                  size="sm"
                  variant="outline"
                  className="px-2 sm:px-3 py-1 text-xs h-7 sm:h-8 flex-1 sm:flex-none"
                >
                  <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  <span className="hidden xs:inline">View</span>
                </Button>
                <Button
                  onClick={() => onInitiateCall(profile.id, profile.name)}
                  size="sm"
                  className={`px-2 sm:px-3 py-1 text-xs h-7 sm:h-8 flex-1 sm:flex-none ${hasCallPlan
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  disabled={!hasCallPlan || makingCall}
                >
                  {makingCall ? (
                    <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <PhoneCall className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      <span className="hidden xs:inline">{hasCallPlan ? "Call" : "Lock"}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Chat button */}
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 text-xs h-7 sm:h-8 flex-1 sm:w-full"
              >
                <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden xs:inline">Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main component return with responsive tabs
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-9 sm:h-10">
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Matches</span>
              <span className="sm:hidden">Matches</span>
              <span className="ml-1">({matches.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Search Profiles</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Rest of the content remains the same but with responsive spacing */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="matches" className="mt-0">
            {loadingMatches ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">{matches.map(renderProfileCard)}</div>
            ) : (
              // Empty state with responsive sizing
              <div className="text-center py-8 sm:py-12">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
                  Our experts are working to find perfect matches for you.
                </p>
                <div className="max-w-xs sm:max-w-md mx-auto px-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
                      <span className="text-xs sm:text-sm font-medium text-blue-800">Expert Matching</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-700 text-center mb-2 sm:mb-3">
                      Get curated matches based on compatibility
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-8 text-xs sm:text-sm"
                      onClick={onUpgrade}
                    >
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Upgrade Plan
                    </Button>
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
