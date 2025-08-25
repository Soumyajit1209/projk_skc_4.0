
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
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-blue-100">
            <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
            <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
              {userProfile?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900">{userProfile?.name}</h3>
          <p className="text-sm text-gray-500">{userProfile?.age} years old</p>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            {userProfile?.city}, {userProfile?.state}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
            {userProfile?.occupation}
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300" onClick={onEditProfile}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full hover:bg-purple-50 hover:border-purple-300" onClick={onChangePassword}>
            <Settings className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
