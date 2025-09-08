import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, MapPin, Calendar, User, Star, Crown, Eye, PhoneCall, MessageCircle, Search, Heart, TrendingUp } from "lucide-react";
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
      <Card
        key={profile.id}
        className="border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all duration-300 bg-white/95 backdrop-blur-sm group"
      >
        <CardContent className="p-3">
          <div className="flex items-start space-x-3">
            {/* Compact Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-1 ring-rose-100 group-hover:ring-rose-200 transition-all duration-300">
                <AvatarImage src={profile.profile_photo} className="object-cover" />
                <AvatarFallback className="text-sm font-bold text-rose-600 bg-gradient-to-br from-rose-50 to-pink-50">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Compact online status */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Compact header with name and badges */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 mb-2">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {profile.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {profile.created_by_admin && (
                    <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200 text-xs px-1.5 py-0.5">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />
                      Expert
                    </Badge>
                  )}
                  {profile.compatibility_score && (
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
                      <Star className="h-2.5 w-2.5 mr-0.5" />
                      {profile.compatibility_score}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Compact info grid */}
              <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-gray-600">
                <div className="flex items-center bg-gray-50 rounded-md px-2 py-1">
                  <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="font-medium truncate">{profile.age}y</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-md px-2 py-1">
                  <User className="h-3 w-3 mr-1 text-purple-500" />
                  <span className="font-medium truncate">{profile.gender}</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-md px-2 py-1">
                  <MapPin className="h-3 w-3 mr-1 text-rose-500" />
                  <span className="font-medium truncate">{profile.city}</span>
                </div>
              </div>

              {/* Compact additional info */}
              <div className="flex flex-wrap gap-1 mb-3 text-xs">
                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                  {profile.education}
                </span>
                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium">
                  {profile.religion}
                </span>
                {profile.height && (
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    {profile.height}
                  </span>
                )}
                {profile.distance && (
                  <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    {profile.distance}km
                  </span>
                )}
              </div>

              {/* Compact action buttons */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => onViewProfile(profile.id)}
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-3 py-1 h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  onClick={() => onInitiateCall(profile.id, profile.name)}
                  size="sm"
                  className={`font-medium px-3 py-1 h-7 text-xs ${
                    hasCallPlan && !makingCall
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!hasCallPlan || makingCall}
                >
                  {makingCall ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                  ) : (
                    <PhoneCall className="h-3 w-3 mr-1" />
                  )}
                  {hasCallPlan ? "Call" : "Locked"}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-3 py-1 h-7 text-xs shadow-sm"


>
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-10 p-1 rounded-lg">
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-rose-600 text-slate-600 font-medium rounded-md transition-all duration-200 h-8 text-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">My Matches</span>
              <span className="sm:hidden">Matches</span>
              <Badge className="ml-2 bg-rose-100 text-rose-700 text-xs px-1.5 py-0.5">
                {matches.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 text-slate-600 font-medium rounded-md transition-all duration-200 h-8 text-sm"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Discover</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="matches" className="mt-0">
            {loadingMatches ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mx-auto mb-3"></div>
                  <p className="text-gray-500 font-medium text-sm">Finding your matches...</p>
                </div>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3">{matches.map(renderProfileCard)}</div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                  Our experts are curating perfect matches for you. Check back soon!
                </p>
                <div className="max-w-sm mx-auto">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-4">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2 mr-2">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-bold text-blue-900 text-sm">Premium Matching</h4>
                    </div>
                    <p className="text-blue-700 text-xs mb-3 text-center">
                      Get priority access to verified profiles
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium h-9 shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                      onClick={onUpgrade}
                    >
                      <TrendingUp className="h-3 w-3 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}