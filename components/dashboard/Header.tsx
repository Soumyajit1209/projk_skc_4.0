import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Home, Check, PhoneCall } from "lucide-react";
import { UserProfile, ActivePlan } from "../../types/types";

interface HeaderProps {
  user: any;
  userProfile: UserProfile | null;
  activePlans: ActivePlan;
  logout: () => void;
}

export default function Header({ user, userProfile, activePlans, logout }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
            <div className="ml-6 hidden sm:flex space-x-1">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-center">
              <h1 className="text-sm font-bold bg-blue-400 bg-clip-text text-transparent">
                Welcome Back, {user?.name}!
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {activePlans.normal_plan?.isActive ? (
                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50 text-xs">
                  Free
                </Badge>
              )}
              {activePlans.call_plan?.isActive && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                  <PhoneCall className="h-3 w-3 mr-1" />
                  {activePlans.call_plan.credits_remaining} calls
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900 hidden sm:block">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}