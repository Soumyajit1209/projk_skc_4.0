import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Edit, Settings, CheckCircle, Star } from "lucide-react";
import { UserProfile } from "../../types/types";

interface ProfileCardProps {
  userProfile: UserProfile | null;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export default function ProfileCard({ userProfile, onEditProfile, onChangePassword }: ProfileCardProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-5">
        {/* Profile header with improved spacing */}
        <div className="text-center mb-5">
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-blue-100 shadow-lg">
              <AvatarImage 
                src={userProfile?.profile_photo || "/placeholder.svg"} 
                className="object-cover"
              />
              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-semibold">
                {userProfile?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* Verification badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate px-2">
            {userProfile?.name}
          </h3>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <p className="text-sm text-gray-600">{userProfile?.age} years old</p>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
              <Star className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>

        {/* Profile details with improved layout */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            <MapPin className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
            <span className="truncate font-medium">
              {userProfile?.city}, {userProfile?.state}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            <Briefcase className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
            <span className="truncate font-medium">{userProfile?.occupation}</span>
          </div>
        </div>

        {/* Action buttons with modern styling */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 font-medium transition-all duration-200 h-10"
            onClick={onEditProfile}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 text-purple-700 font-medium transition-all duration-200 h-10"
            onClick={onChangePassword}
          >
            <Settings className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}