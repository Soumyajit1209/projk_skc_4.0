import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle, XCircle, Ban, Heart, Calendar, MapPin } from "lucide-react"
import { UserProfile } from "./types"

interface ProfileListProps {
  profiles: UserProfile[]
  setViewDialog: (dialog: { open: boolean; profile: UserProfile | null }) => void
  setApprovalDialog: (dialog: {
    open: boolean
    profile: UserProfile | null
    action: "approve" | "reject" | null
    rejectionReason: string
  }) => void
  updateUserStatus: (userId: number, status: string) => void
  setSelectedUserId: (userId: number | null) => void
  fetchMatches: (userId: number) => void
  setActiveTab: (tab: string) => void
}

export default function ProfileList({
  profiles,
  setViewDialog,
  setApprovalDialog,
  updateUserStatus,
  setSelectedUserId,
  fetchMatches,
  setActiveTab,
}: ProfileListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profiles</CardTitle>
        <CardContent>Manage and moderate user profiles</CardContent>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{profile.name || 'Unknown User'}</h3>
                    <Badge
                      variant={
                        profile.status === "approved"
                          ? "default"
                          : profile.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {profile.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {profile.age} years
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.city}, {profile.state}
                    </span>
                    <span>{profile.caste}</span>
                    <span>{profile.occupation}</span>
                    <span>{profile.gender}</span>
                  </div>
                  {profile.status === "rejected" && profile.rejection_reason && (
                    <p className="text-sm text-red-600">Reason: {profile.rejection_reason}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewDialog({ open: true, profile })}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                {profile.status === "pending" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        setApprovalDialog({
                          open: true,
                          profile,
                          action: "approve",
                          rejectionReason: "",
                        })
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setApprovalDialog({
                          open: true,
                          profile,
                          action: "reject",
                          rejectionReason: "",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}

                {profile.status === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(profile.user_id)
                      fetchMatches(profile.user_id)
                      setActiveTab("matches")
                    }}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Create Matches
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => updateUserStatus(profile.user_id, "banned")}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Ban
                </Button>
              </div>
            </div>
          ))}

          {profiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">No profiles found matching your criteria</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}