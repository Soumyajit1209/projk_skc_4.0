
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Your Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Premium Plan</span>
            </div>
            {activePlans.normal_plan?.isActive ? (
              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 text-xs">Inactive</Badge>
            )}
          </div>
          {activePlans.normal_plan?.isActive ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">{activePlans.normal_plan.plan_name}</p>
              <p className="text-xs text-gray-600">{activePlans.normal_plan.daysLeft} days remaining</p>
              <p className="text-xs text-gray-500">Expires: {formatDate(activePlans.normal_plan.expires_at)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Unlock full profile details</p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={onUpgrade}>
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Call Plan</span>
            </div>
            {activePlans.call_plan?.isActive ? (
              <Badge className="bg-blue-100 text-blue-700 text-xs">{activePlans.call_plan.credits_remaining} calls</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 text-xs">No calls</Badge>
            )}
          </div>
          {activePlans.call_plan?.isActive ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">{activePlans.call_plan.plan_name}</p>
              <p className="text-xs text-gray-600">{activePlans.call_plan.credits_remaining} credits remaining</p>
              <p className="text-xs text-gray-500">Expires: {formatDate(activePlans.call_plan.expires_at)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Connect with matches via calls</p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onUpgrade}>
                Buy Credits
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
