// components/admin/AdminSettings.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Lock, UserPlus, CreditCard } from "lucide-react"
import AdminPasswordChange from "./AdminPasswordChange"
import AdminAddUser from "./AdminAddUser"
import AdminPlansManagement from "./AdminPlansManagement"

interface AdminSettingsProps {
  userId: number
  onUserAdded?: () => void
}

export default function AdminSettings({ userId, onUserAdded }: AdminSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Settings
          </CardTitle>
          <CardDescription>Manage admin account, users, and system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </TabsTrigger>
              <TabsTrigger value="add-user" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Plans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-6">
              <div className="max-w-md">
                <AdminPasswordChange userId={userId} />
              </div>
            </TabsContent>

            <TabsContent value="add-user" className="mt-6">
              <AdminAddUser onUserAdded={onUserAdded} />
            </TabsContent>

            <TabsContent value="plans" className="mt-6">
              <AdminPlansManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}