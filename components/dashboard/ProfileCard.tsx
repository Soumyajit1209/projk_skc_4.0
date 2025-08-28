
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Edit, Settings } from "lucide-react";
import { UserProfile } from "../../types/types";

interface ProfileCardProps {
  userProfile: UserProfile | null;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export default function ProfileCard({ userProfile, onEditProfile, onChangePassword }: ProfileCardProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        {/* Profile header - responsive avatar and info */}
        <div className="text-center mb-3 sm:mb-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-2 sm:mb-3 ring-2 sm:ring-4 ring-blue-100">
            <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
            <AvatarFallback className="text-sm sm:text-lg bg-blue-100 text-blue-600">
              {userProfile?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate px-2">
            {userProfile?.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">{userProfile?.age} years old</p>
        </div>

        {/* Profile details - responsive spacing */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">
              {userProfile?.city}, {userProfile?.state}
            </span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">{userProfile?.occupation}</span>
          </div>
        </div>

        {/* Action buttons - responsive sizing */}
        <div className="space-y-1.5 sm:space-y-2">
          <Button
            variant="outline"
            className="w-full hover:bg-blue-50 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
            onClick={onEditProfile}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full hover:bg-purple-50 hover:border-purple-300 h-8 sm:h-9 text-xs sm:text-sm"
            onClick={onChangePassword}
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
