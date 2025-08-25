
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, CheckCircle, AlertCircle } from "lucide-react";
import { useRef } from "react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFormData: {
    age: string;
    gender: string;
    height: string;
    weight: string;
    caste: string;
    religion: string;
    mother_tongue: string;
    marital_status: string;
    education: string;
    occupation: string;
    income: string;
    state: string;
    city: string;
    family_type: string;
    family_status: string;
    about_me: string;
    partner_preferences: string;
    profile_photo: string;
  };
  setEditFormData: (data: EditProfileModalProps["editFormData"]) => void;
  editingProfile: boolean;
  editError: string;
  editSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  editFormData,
  setEditFormData,
  editingProfile,
  editError,
  editSuccess,
  onSubmit,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection and convert to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, profile_photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click when the button is clicked
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center">
            <Edit className="h-5 w-5 mr-2 text-blue-500" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-sm text-gray-600">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={editFormData.age}
                onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter age"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm text-gray-600">
                Gender
              </Label>
              <Select
                value={editFormData.gender}
                onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                disabled={editingProfile}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height" className="text-sm text-gray-600">
                Height
              </Label>
              <Input
                id="height"
                value={editFormData.height}
                onChange={(e) => setEditFormData({ ...editFormData, height: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="e.g., 5'6\"
                disabled={editingProfile}
              />    
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm text-gray-600">
                Weight
              </Label>
              <Input
                id="weight"
                value={editFormData.weight}
                onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="e.g., 70 kg"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="religion" className="text-sm text-gray-600">
                Religion
              </Label>
              <Select
                value={editFormData.religion}
                onValueChange={(value) => setEditFormData({ ...editFormData, religion: value })}
                disabled={editingProfile}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Sikh">Sikh</SelectItem>
                  <SelectItem value="Buddhist">Buddhist</SelectItem>
                  <SelectItem value="Jain">Jain</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="caste" className="text-sm text-gray-600">
                Caste
              </Label>
              <Input
                id="caste"
                value={editFormData.caste}
                onChange={(e) => setEditFormData({ ...editFormData, caste: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter caste"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="mother_tongue" className="text-sm text-gray-600">
                Mother Tongue
              </Label>
              <Input
                id="mother_tongue"
                value={editFormData.mother_tongue}
                onChange={(e) => setEditFormData({ ...editFormData, mother_tongue: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter mother tongue"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="marital_status" className="text-sm text-gray-600">
                Marital Status
              </Label>
              <Select
                value={editFormData.marital_status}
                onValueChange={(value) => setEditFormData({ ...editFormData, marital_status: value })}
                disabled={editingProfile}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never Married">Never Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="education" className="text-sm text-gray-600">
                Education
              </Label>
              <Input
                id="education"
                value={editFormData.education}
                onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter education"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="occupation" className="text-sm text-gray-600">
                Occupation
              </Label>
              <Input
                id="occupation"
                value={editFormData.occupation}
                onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter occupation"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="income" className="text-sm text-gray-600">
                Annual Income
              </Label>
              <Input
                id="income"
                value={editFormData.income}
                onChange={(e) => setEditFormData({ ...editFormData, income: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="e.g., 10 LPA"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-sm text-gray-600">
                State
              </Label>
              <Input
                id="state"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter state"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm text-gray-600">
                City
              </Label>
              <Input
                id="city"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="mt-1 h-10 text-sm"
                placeholder="Enter city"
                disabled={editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="family_type" className="text-sm text-gray-600">
                Family Type
              </Label>
              <Select
                value={editFormData.family_type}
                onValueChange={(value) => setEditFormData({ ...editFormData, family_type: value })}
                disabled={editingProfile}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select family type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nuclear">Nuclear</SelectItem>
                  <SelectItem value="Joint">Joint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="family_status" className="text-sm text-gray-600">
                Family Status
              </Label>
              <Select
                value={editFormData.family_status}
                onValueChange={(value) => setEditFormData({ ...editFormData, family_status: value })}
                disabled={editingProfile}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select family status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Middle Class">Middle Class</SelectItem>
                  <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                  <SelectItem value="High Class">High Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="about_me" className="text-sm text-gray-600">
              About Me
            </Label>
            <textarea
              id="about_me"
              value={editFormData.about_me}
              onChange={(e) => setEditFormData({ ...editFormData, about_me: e.target.value })}
              className="mt-1 w-full h-24 text-sm border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself"
              disabled={editingProfile}
            />
          </div>
          <div>
            <Label htmlFor="partner_preferences" className="text-sm text-gray-600">
              Partner Preferences
            </Label>
            <textarea
              id="partner_preferences"
              value={editFormData.partner_preferences}
              onChange={(e) => setEditFormData({ ...editFormData, partner_preferences: e.target.value })}
              className="mt-1 w-full h-24 text-sm border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your ideal partner"
              disabled={editingProfile}
            />
          </div>
          <div>
            <Label htmlFor="profile_photo" className="text-sm text-gray-600">
              Profile Photo
            </Label>
            <div className="mt-1 flex items-center space-x-4">
              <Button
                type="button"
                onClick={handleUploadClick}
                disabled={editingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {editFormData.profile_photo ? "Change Photo" : "Upload Photo"}
              </Button>
              <Input
                id="profile_photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={editingProfile}
              />
              {editFormData.profile_photo && (
                <img
                  src={editFormData.profile_photo}
                  alt="Profile preview"
                  className="h-16 w-16 object-cover rounded-full"
                />
              )}
            </div>
          </div>
          {editError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}
          {editSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={editingProfile}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {editingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
