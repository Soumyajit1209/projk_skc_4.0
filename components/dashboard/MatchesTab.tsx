
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles,  MapPin , Calendar , User , Star, Crown ,Eye , PhoneCall,MessageCircle,Search ,   } from "lucide-react";
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
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="h-14 w-14 border-2 border-blue-100">
                <AvatarImage src={profile.profile_photo} />
                <AvatarFallback className="text-base font-semibold text-blue-500 bg-blue-50">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{profile.name}</h3>
                  {profile.created_by_admin && (
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 px-1.5">
                      <Crown className="h-3 w-3 mr-1" />
                      Expert
                    </Badge>
                  )}
                  {profile.compatibility_score && (
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50 px-1.5">
                      <Star className="h-3 w-3 mr-1" />
                      {profile.compatibility_score}% Match
                    </Badge>
                  )}
                </div>
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
                  {profile.distance && (
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.distance}km away
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                  <span>{profile.education}</span>
                  <span>•</span>
                  <span>{profile.religion}</span>
                  {profile.height && (
                    <>
                      <span>•</span>
                      <span>{profile.height}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <div className="flex space-x-2">
                <Button
                  onClick={() => onViewProfile(profile.id)}
                  size="sm"
                  variant="outline"
                  className="px-3 py-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  onClick={() => onInitiateCall(profile.id, profile.name)}
                  size="sm"
                  className={`px-3 py-1 text-xs ${
                    hasCallPlan ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!hasCallPlan || makingCall}
                >
                  {makingCall ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PhoneCall className="h-3 w-3 mr-1" />
                      {hasCallPlan ? "Call" : "Locked"}
                    </>
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              My Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Profiles
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="matches" className="mt-0">
            {loadingMatches ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-4">{matches.map(renderProfileCard)}</div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-500 mb-6">Our experts are working to find perfect matches for you.</p>
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Expert Matching</span>
                    </div>
                    <p className="text-xs text-blue-700 text-center mb-3">
                      Get curated matches based on compatibility
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={onUpgrade}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
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
