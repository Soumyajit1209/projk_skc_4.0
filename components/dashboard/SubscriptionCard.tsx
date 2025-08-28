
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, PhoneCall, Check } from "lucide-react";
import { ActivePlan } from "../../types/types";

interface SubscriptionCardProps {
  activePlans: ActivePlan;
  onUpgrade: () => void;
  formatDate: (dateString: string) => string;
}

export default function SubscriptionCard({ activePlans, onUpgrade, formatDate }: SubscriptionCardProps) {
 return (
  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
    <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
        Your Subscriptions
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
      {/* Premium Plan Card - responsive */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">Premium Plan</span>
          </div>
          {activePlans.normal_plan?.isActive ? (
            <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-1.5 sm:px-2">
              Active
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 text-[10px] sm:text-xs px-1.5 sm:px-2">
              Inactive
            </Badge>
          )}
        </div>
        
        {activePlans.normal_plan?.isActive ? (
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              {activePlans.normal_plan.plan_name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              {activePlans.normal_plan.daysLeft} days remaining
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              Expires: {formatDate(activePlans.normal_plan.expires_at)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-gray-600">Unlock full profile details</p>
            <Button 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-7 sm:h-8 text-xs" 
              onClick={onUpgrade}
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
      
      {/* Call Plan Card - responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">Call Plan</span>
          </div>
          {activePlans.call_plan?.isActive ? (
            <Badge className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs px-1.5 sm:px-2">
              <span className="hidden sm:inline">{activePlans.call_plan.credits_remaining} calls</span>
              <span className="sm:hidden">{activePlans.call_plan.credits_remaining}</span>
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 text-[10px] sm:text-xs px-1.5 sm:px-2">
              No calls
            </Badge>
          )}
        </div>
        
        {activePlans.call_plan?.isActive ? (
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              {activePlans.call_plan.plan_name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              {activePlans.call_plan.credits_remaining} credits remaining
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              Expires: {formatDate(activePlans.call_plan.expires_at)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-gray-600">Connect with matches via calls</p>
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-xs" 
              onClick={onUpgrade}
            >
              Buy Credits
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
}
