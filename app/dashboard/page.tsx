"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MatchesTab from "@/components/dashboard/MatchesTab";
import SearchTab from "@/components/dashboard/SearchTab";
import PlansModal from "@/components/dashboard/PlansModal";
import PaymentModal from "@/components/dashboard/PaymentModal";
import CallLogsModal from "@/components/dashboard/CallLogsModal";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import ProfileDetailsModal from "@/components/dashboard/ProfileDetailsModal";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import ChangePasswordModal from "@/components/dashboard/ChangePasswordModal";
import { UserProfile, Plan, ActivePlan, CallLog, SearchFilters } from "../../types/types";
import { formatDate } from "@/utils/formatters";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activePlans, setActivePlans] = useState<ActivePlan>({});
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("matches");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    religion: "",
    education: "",
    occupation: "",
  });
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingCallLogs, setLoadingCallLogs] = useState(false);
  const [makingCall, setMakingCall] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editFormData, setEditFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    caste: "",
    religion: "",
    mother_tongue: "",
    marital_status: "",
    education: "",
    occupation: "",
    income: "",
    state: "",
    city: "",
    family_type: "",
    family_status: "",
    about_me: "",
    partner_preferences: "",
    profile_photo: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/user");
      return;
    }

    if (user && !user.profileComplete) {
      router.push("/profile/create");
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchMatches();
      fetchActivePlans();
    }
  }, [user, loading, router]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        setEditFormData({
          age: data.profile.age?.toString() || "",
          gender: data.profile.gender || "",
          height: data.profile.height || "",
          weight: data.profile.weight || "",
          caste: data.profile.caste || "",
          religion: data.profile.religion || "",
          mother_tongue: data.profile.mother_tongue || "",
          marital_status: data.profile.marital_status || "",
          education: data.profile.education || "",
          occupation: data.profile.occupation || "",
          income: data.profile.income || "",
          state: data.profile.state || "",
          city: data.profile.city || "",
          family_type: data.profile.family_type || "",
          family_status: data.profile.family_status || "",
          about_me: data.profile.about_me || "",
          partner_preferences: data.profile.partner_preferences || "",
          profile_photo: data.profile.profile_photo || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const searchProfiles = async () => {
    setLoadingSearch(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/user/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.profiles || []);
      }
    } catch (error) {
      console.error("Error searching profiles:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const fetchActivePlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/active-plan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActivePlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching active plans:", error);
    }
  };

  const fetchCallLogs = async () => {
    setLoadingCallLogs(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/call-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCallLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
      setCallLogs([]);
    } finally {
      setLoadingCallLogs(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const initiateCall = async (targetUserId: number, targetName: string) => {
    if (!activePlans.call_plan?.isActive || activePlans.call_plan.credits_remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setMakingCall(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.callUrl;
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      alert("An error occurred while making the call");
    } finally {
      setMakingCall(false);
    }
  };

  const viewProfileDetails = async (profileId: number) => {
    if (!activePlans.normal_plan?.isActive) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/user/profile-details/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedMatch(data.profile);
        setShowProfileDetails(true);
      } else {
        const errorData = await response.json();
        if (errorData.error.includes("Premium subscription required")) {
          setShowUpgradeModal(true);
        } else {
          alert(errorData.error || "Failed to fetch profile details");
        }
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
      alert("An error occurred while fetching profile details");
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
    setEditError("");
    setEditSuccess(false);
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingProfile(true);
    setEditError("");
    setEditSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setEditSuccess(true);
        await fetchUserProfile();
        setTimeout(() => {
          setShowEditProfile(false);
          setEditSuccess(false);
        }, 2000);
      } else {
        setEditError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setEditError("An error occurred while updating your profile");
    } finally {
      setEditingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords do not match");
      setChangingPassword(false);
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess(true);
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An error occurred while changing your password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header
        user={user}
        userProfile={userProfile}
        activePlans={activePlans}
        logout={logout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard
              userProfile={userProfile}
              onEditProfile={handleEditProfile}
              onChangePassword={handleChangePassword}
            />
            <SubscriptionCard
              activePlans={activePlans}
              onUpgrade={() => {
                fetchPlans();
                setShowPlansModal(true);
              }}
              formatDate={formatDate}
            />
            <QuickActions
              onViewCallLogs={() => {
                fetchCallLogs();
                setShowCallLogs(true);
              }}
              onViewPlans={() => {
                fetchPlans();
                setShowPlansModal(true);
              }}
            />
          </div>
          <div className="lg:col-span-3">
            <MatchesTab
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              matches={matches}
              loadingMatches={loadingMatches}
              onViewProfile={viewProfileDetails}
              onInitiateCall={initiateCall}
              activePlans={activePlans}
              makingCall={makingCall}
              onUpgrade={() => {
                fetchPlans();
                setShowPlansModal(true);
              }}
            />
            <SearchTab
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              searchResults={searchResults}
              loadingSearch={loadingSearch}
              onSearch={searchProfiles}
              onResetFilters={() => {
                setSearchFilters({
                  location: "",
                  gender: "",
                  ageMin: "",
                  ageMax: "",
                  religion: "",
                  education: "",
                  occupation: "",
                });
                setSearchResults([]);
              }}
              activePlans={activePlans}
              onUpgrade={() => {
                fetchPlans();
                setShowPlansModal(true);
              }}
              onViewProfile={viewProfileDetails}
            />
          </div>
        </div>
      </div>
      <PlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
        plans={plans}
        loadingPlans={loadingPlans}
        onSelectPlan={(plan) => {
          setSelectedPlan(plan);
          setShowPlansModal(false);
          setShowPaymentModal(true);
        }}
      />
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        selectedPlan={selectedPlan}
        onPaymentComplete={() => {
          setShowPaymentModal(false);
          router.push("/payments/submit");
        }}
      />
      <CallLogsModal
        open={showCallLogs}
        onOpenChange={setShowCallLogs}
        callLogs={callLogs}
        loadingCallLogs={loadingCallLogs}
        formatDate={formatDate}
      />
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onViewPlans={() => {
          setShowUpgradeModal(false);
          fetchPlans();
          setShowPlansModal(true);
        }}
      />
      <ProfileDetailsModal
        open={showProfileDetails}
        onOpenChange={setShowProfileDetails}
        selectedMatch={selectedMatch}
        activePlans={activePlans}
        makingCall={makingCall}
        onInitiateCall={initiateCall}
      />
      <EditProfileModal
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        editingProfile={editingProfile}
        editError={editError}
        editSuccess={editSuccess}
        onSubmit={handleEditSubmit}
      />
      <ChangePasswordModal
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        passwordFormData={passwordFormData}
        setPasswordFormData={setPasswordFormData}
        changingPassword={changingPassword}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}