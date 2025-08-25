
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, CreditCard } from "lucide-react";

interface QuickActionsProps {
  onViewCallLogs: () => void;
  onViewPlans: () => void;
}

export default function QuickActions({ onViewCallLogs, onViewPlans }: QuickActionsProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 text-gray-900">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start hover:bg-blue-50" onClick={onViewCallLogs}>
            <History className="h-4 w-4 mr-2 text-blue-500" />
            Call History
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-purple-50" onClick={onViewPlans}>
            <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
            View Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
