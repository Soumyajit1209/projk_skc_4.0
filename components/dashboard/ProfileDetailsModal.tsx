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
      <DialogContent className="max-w-3xl w-full p-4 md:p-5 rounded-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Details</DialogTitle>
        </DialogHeader>

        {selectedMatch && (
          <div className="space-y-4">
            {/* Top Section */}
            <div className="relative bg-blue-500 rounded-lg p-4 text-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* Avatar + Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarImage src={selectedMatch.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg font-bold text-blue-500 bg-white">
                      {selectedMatch.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-bold">{selectedMatch.name}</h2>
                    <p className="text-xs text-blue-100">
                      {selectedMatch.age} yrs • {selectedMatch.city}, {selectedMatch.state}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] border-white/30 text-white bg-white/20">
                        {selectedMatch.religion}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-white/30 text-white bg-white/20">
                        {selectedMatch.marital_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onInitiateCall(selectedMatch.id, selectedMatch.name)}
                    className={`text-xs px-3 ${activePlans.call_plan?.isActive
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={!activePlans.call_plan?.isActive || makingCall}
                  >
                    <PhoneCall className="h-3 w-3 mr-1" />
                    {activePlans.call_plan?.isActive ? "Call" : "Locked"}
                  </Button>
                  <Button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs border-white/30 text-white bg-white/20 hover:bg-white/30 px-3"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Shortlist
                  </Button>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Personal */}
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-blue-700 mb-1 flex items-center">
                    <User className="h-3 w-3 mr-1" /> Personal
                  </h4>
                  <div className="space-y-1">
                    <DetailRow label="Height" value={selectedMatch.height} />
                    <DetailRow label="Weight" value={selectedMatch.weight} />
                    <DetailRow label="Mother Tongue" value={selectedMatch.mother_tongue} />
                    <DetailRow label="Caste" value={selectedMatch.caste} />
                  </div>
                </CardContent>
              </Card>

              {/* Professional */}
              <Card className="border-0 shadow-sm bg-green-50">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-green-700 mb-1 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" /> Professional
                  </h4>
                  <DetailRow label="Education" value={selectedMatch.education} />
                  <DetailRow label="Occupation" value={selectedMatch.occupation} />
                  <DetailRow label="Income" value={selectedMatch.income} />
                </CardContent>
              </Card>

              {/* Family */}
              <Card className="border-0 shadow-sm bg-purple-50">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-purple-700 mb-1 flex items-center">
                    <Home className="h-3 w-3 mr-1" /> Family
                  </h4>
                  <DetailRow label="Family Type" value={selectedMatch.family_type} />
                  <DetailRow label="Family Status" value={selectedMatch.family_status} />
                </CardContent>
              </Card>

              {/* About */}
              <Card className="border-0 shadow-sm bg-yellow-50 md:col-span-2">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-yellow-700 mb-1 flex items-center">
                    <Info className="h-3 w-3 mr-1" /> About
                  </h4>
                  <p className="text-xs text-gray-600 leading-snug">
                    <span className="font-medium">About Me: </span>
                    {selectedMatch.about_me || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-600 leading-snug mt-1">
                    <span className="font-medium">Partner Preferences: </span>
                    {selectedMatch.partner_preferences || "Not provided"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[11px] text-gray-500">{label}:</span>
      <span className="text-xs font-medium text-gray-800">{value || "N/A"}</span>
    </div>
  )
}