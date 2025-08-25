
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Briefcase,
  Home,
  PhoneCall,
  MessageCircle,
  Info,
  Heart,
  Star,
  MapPin,
  GraduationCap,
  DollarSign,
  Users as Family,
} from "lucide-react";
import { UserProfile, ActivePlan } from "../../types/types";

interface ProfileDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMatch: UserProfile | null;
  activePlans: ActivePlan;
  makingCall: boolean;
  onInitiateCall: (targetUserId: number, targetName: string) => void;
}

export default function ProfileDetailsModal({
  open,
  onOpenChange,
  selectedMatch,
  activePlans,
  makingCall,
  onInitiateCall,
}: ProfileDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Details</DialogTitle>
        </DialogHeader>
        {selectedMatch && (
          <div className="space-y-6">
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src={selectedMatch.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl font-bold text-blue-500 bg-white">
                      {selectedMatch.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMatch.name}</h2>
                    <div className="flex items-center space-x-3 text-blue-100 text-sm mt-1">
                      <span>{selectedMatch.age} years</span>
                      <span>•</span>
                      <span>{selectedMatch.city}, {selectedMatch.state}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                        {selectedMatch.religion}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                        {selectedMatch.marital_status}
                      </Badge>
                      {selectedMatch.compatibility_score && (
                        <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                          <Star className="h-3 w-3 mr-1" />
                          {selectedMatch.compatibility_score}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onInitiateCall(selectedMatch.id, selectedMatch.name)}
                    className={`text-sm ${
                      activePlans.call_plan?.isActive
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!activePlans.call_plan?.isActive || makingCall}
                  >
                    {makingCall ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PhoneCall className="h-4 w-4 mr-2" />
                    )}
                    {activePlans.call_plan?.isActive ? "Call Now" : "Locked"}
                  </Button>
                  <Button className="text-sm bg-blue-600 hover:bg-blue-700 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button variant="outline" className="text-sm border-white/30 text-white bg-white/20 hover:bg-white/30">
                    <Heart className="h-4 w-4 mr-2" />
                    Shortlist
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Personal Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">{selectedMatch.height || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{selectedMatch.weight || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mother Tongue:</span>
                      <span className="font-medium">{selectedMatch.mother_tongue || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Caste:</span>
                      <span className="font-medium">{selectedMatch.caste || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-green-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Professional Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{selectedMatch.education || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-medium">{selectedMatch.occupation || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Income:</span>
                      <span className="font-medium">{selectedMatch.income || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-purple-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Family Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Family Type:</span>
                      <span className="font-medium">{selectedMatch.family_type || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Family Status:</span>
                      <span className="font-medium">{selectedMatch.family_status || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-yellow-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">About Me:</span>
                      <p className="font-medium mt-1">{selectedMatch.about_me || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Partner Preferences:</span>
                      <p className="font-medium mt-1">{selectedMatch.partner_preferences || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
