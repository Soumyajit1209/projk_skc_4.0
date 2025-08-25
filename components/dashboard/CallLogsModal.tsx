
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Headphones, Timer , History } from "lucide-react";
import { CallLog } from "../../types/types";

interface CallLogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callLogs: CallLog[];
  loadingCallLogs: boolean;
  formatDate: (dateString: string) => string;
}

export default function CallLogsModal({ open, onOpenChange, callLogs, loadingCallLogs, formatDate }: CallLogsModalProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Call History
          </DialogTitle>
        </DialogHeader>
        {loadingCallLogs ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : callLogs.length > 0 ? (
          <div className="space-y-3">
            {callLogs.map((log) => (
              <div key={log.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${log.call_type === "outgoing" ? "bg-green-100" : "bg-blue-100"}`}
                    >
                      <PhoneCall
                        className={`h-4 w-4 ${log.call_type === "outgoing" ? "text-green-600" : "text-blue-600"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.call_type === "outgoing" ? log.receiver_name : log.caller_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.call_type === "outgoing" ? "Outgoing call" : "Incoming call"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{formatDuration(log.duration)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                    <Badge variant="outline" className="text-xs">Cost: ₹{log.cost}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text 범-gray-900 mb-2">No calls yet</h3>
            <p className="text-gray-500">Your call history will appear here</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
