"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Car,
  LogOut,
  Mail,
  Phone,
  Lock,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Mock user data
const MOCK_USER = {
  id: "user-001",
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 123-4567",
  username: "admin",
  avatar: null,
  joinDate: new Date(2023, 5, 15),
  vehicles: [
    {
      id: "v-001",
      name: "Tesla Model 3",
      make: "Tesla",
      model: "Model 3",
      year: "2022",
      licensePlate: "ABC-1234",
      color: "White",
    },
    {
      id: "v-002",
      name: "Toyota Camry",
      make: "Toyota",
      model: "Camry",
      year: "2020",
      licensePlate: "XYZ-5678",
      color: "Blue",
    },
  ],
  paymentMethods: [
    { id: "pm-001", type: "credit-card", last4: "4242", brand: "Visa", expMonth: 12, expYear: 2025, isDefault: true },
    { id: "pm-002", type: "paypal", email: "alex.johnson@example.com", isDefault: false },
  ],
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
    reservationReminders: true,
    paymentReceipts: true,
    promotionalOffers: false,
    parkingExpiration: true,
    specialOffers: false,
    systemUpdates: true,
  },
  accountSettings: {
    twoFactorEnabled: false,
    twoFactorMethod: "none", // "none", "app", "sms"
    autoRenewReservations: true,
    darkMode: false,
    language: "english",
    loginAlerts: true,
  },
}

export default function ProfileSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(MOCK_USER)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
  })

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  })

  // Add state for 2FA setup
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState(0)
  const [twoFactorQRCode, setTwoFactorQRCode] = useState("/placeholder.svg?height=200&width=200")
  const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState("")
  const [twoFactorMethod, setTwoFactorMethod] = useState("app")

  const handleProfileUpdate = () => {
    if (!profileForm.fullName || !profileForm.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setUser((prev) => ({
      ...prev,
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
    }))

    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    })

    setIsEditingProfile(false)
  }

  const handlePasswordUpdate = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    })

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    setIsEditingPassword(false)
  }

  const handleAddVehicle = () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.licensePlate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required vehicle fields",
        variant: "destructive",
      })
      return
    }

    const newVehicle = {
      id: `v-${Date.now()}`,
      name: vehicleForm.name || `${vehicleForm.make} ${vehicleForm.model}`,
      make: vehicleForm.make,
      model: vehicleForm.model,
      year: vehicleForm.year,
      licensePlate: vehicleForm.licensePlate,
      color: vehicleForm.color || "Not specified",
    }

    setUser((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
    }))

    toast({
      title: "Vehicle added",
      description: `${newVehicle.name} has been added to your vehicles`,
    })

    setVehicleForm({
      name: "",
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      color: "",
    })

    setIsAddingVehicle(false)
  }

  const handleRemoveVehicle = (vehicleId: string) => {
    setUser((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== vehicleId),
    }))

    toast({
      title: "Vehicle removed",
      description: "The vehicle has been removed from your account",
    })
  }

  const handleEditVehicle = (vehicleId: string) => {
    const vehicleToEdit = user.vehicles.find((v) => v.id === vehicleId)
    if (vehicleToEdit) {
      setVehicleForm({
        name: vehicleToEdit.name,
        make: vehicleToEdit.make,
        model: vehicleToEdit.model,
        year: vehicleToEdit.year,
        licensePlate: vehicleToEdit.licensePlate,
        color: vehicleToEdit.color,
      })
      setEditingVehicleId(vehicleId)
      setIsEditingVehicle(true)
      setIsAddingVehicle(true)
    }
  }

  const handleSaveVehicle = () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.licensePlate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required vehicle fields",
        variant: "destructive",
      })
      return
    }

    if (editingVehicleId) {
      setUser((prev) => ({
        ...prev,
        vehicles: prev.vehicles.map((v) =>
          v.id === editingVehicleId
            ? {
                ...v,
                name: vehicleForm.name || `${vehicleForm.make} ${vehicleForm.model}`,
                make: vehicleForm.make,
                model: vehicleForm.model,
                year: vehicleForm.year,
                licensePlate: vehicleForm.licensePlate,
                color: vehicleForm.color || "Not specified",
              }
            : v,
        ),
      }))

      toast({
        title: "Vehicle updated",
        description: "Your vehicle information has been updated successfully",
      })

      setVehicleForm({
        name: "",
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        color: "",
      })

      setEditingVehicleId(null)
      setIsEditingVehicle(false)
      setIsAddingVehicle(false)
    }
  }

  const handleAddPaymentMethod = () => {
    if (
      !paymentForm.cardNumber ||
      !paymentForm.cardName ||
      !paymentForm.expiryMonth ||
      !paymentForm.expiryYear ||
      !paymentForm.cvv
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment method fields",
        variant: "destructive",
      })
      return
    }

    const newPaymentMethod = {
      id: `pm-${Date.now()}`,
      type: "credit-card",
      last4: paymentForm.cardNumber.slice(-4),
      brand: "Visa",
      expMonth: Number.parseInt(paymentForm.expiryMonth),
      expYear: Number.parseInt(paymentForm.expiryYear),
      isDefault: paymentForm.isDefault,
    }

    setUser((prev) => {
      let updatedPaymentMethods = [...prev.paymentMethods]

      if (paymentForm.isDefault) {
        updatedPaymentMethods = updatedPaymentMethods.map((pm) => ({
          ...pm,
          isDefault: false,
        }))
      }

      return {
        ...prev,
        paymentMethods: [...updatedPaymentMethods, newPaymentMethod],
      }
    })

    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully",
    })

    setPaymentForm({
      cardNumber: "",
      cardName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
    })

    setIsAddingPaymentMethod(false)
  }

  const handleRemovePaymentMethod = (paymentId: string) => {
    const paymentToRemove = user.paymentMethods.find((pm) => pm.id === paymentId)

    if (paymentToRemove?.isDefault) {
      toast({
        title: "Cannot remove default payment method",
        description: "Please set another payment method as default first",
        variant: "destructive",
      })
      return
    }

    setUser((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((pm) => pm.id !== paymentId),
    }))

    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account",
    })
  }

  const handleSetDefaultPaymentMethod = (paymentId: string) => {
    setUser((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === paymentId,
      })),
    }))

    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated",
    })
  }

  const handleUpdateNotificationPreferences = (key: string, value: boolean) => {
    setUser((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value,
      },
    }))
  }

  const handleUpdateAccountSettings = (key: string, value: any) => {
    setUser((prev) => ({
      ...prev,
      accountSettings: {
        ...prev.accountSettings,
        [key]: value,
      },
    }))

    toast({
      title: "Settings updated",
      description: "Your account settings have been updated",
    })
  }

  const handleSetup2FA = () => {
    if (twoFactorMethod === "app") {
      setTwoFactorQRCode("/placeholder.svg?height=200&width=200")
    }
    setTwoFactorSetupStep(2)
  }

  const handleVerify2FACode = () => {
    if (twoFactorVerificationCode.length !== 6 || !/^\d+$/.test(twoFactorVerificationCode)) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      })
      return
    }

    handleUpdateAccountSettings("twoFactorEnabled", true)
    handleUpdateAccountSettings("twoFactorMethod", twoFactorMethod)

    setTwoFactorSetupStep(0)
    setTwoFactorVerificationCode("")

    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now more secure with 2FA",
    })
  }

  const handleDisable2FA = () => {
    handleUpdateAccountSettings("twoFactorEnabled", false)
    handleUpdateAccountSettings("twoFactorMethod", "none")

    toast({
      title: "Two-factor authentication disabled",
      description: "2FA has been turned off for your account",
    })
  }

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <Card className="md:row-span-2 h-fit">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                <AvatarFallback className="text-2xl">
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
              <p className="text-xs text-muted-foreground">Member since {user.joinDate.toLocaleDateString()}</p>
            </div>
            <Separator className="my-6" />
            <nav className="space-y-1">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-4">
                  <TabsTrigger value="personal" className="justify-start px-3">
                    <User className="mr-2 h-4 w-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="justify-start px-3">
                    <Car className="mr-2 h-4 w-4" />
                    Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="justify-start px-3">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start px-3">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start px-3">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </nav>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="w-full">
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact information</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditingProfile) {
                      handleProfileUpdate()
                    } else {
                      setIsEditingProfile(true)
                    }
                  }}
                >
                  {isEditingProfile ? "Save Changes" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false)
                          setProfileForm({
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone,
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleProfileUpdate}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                        <p>{user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Username</p>
                        <p>{user.username}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p>{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditingPassword) {
                      handlePasswordUpdate()
                    } else {
                      setIsEditingPassword(true)
                    }
                  }}
                >
                  {isEditingPassword ? "Save Password" : "Change Password"}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {isEditingPassword ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingPassword(false)
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordUpdate}>Update Password</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <p>••••••••</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Your Vehicles</CardTitle>
                  <CardDescription>Manage vehicles associated with your account</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingVehicle(true)
                    setVehicleForm({
                      name: "",
                      make: "",
                      model: "",
                      year: "",
                      licensePlate: "",
                      color: "",
                    })
                    setEditingVehicleId(null)
                    setIsEditingVehicle(false)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {user.vehicles.length === 0 ? (
                  <div className="text-center py-6">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No vehicles added yet</h3>
                    <p className="text-muted-foreground mb-4">Add your vehicles to make parking reservations easier.</p>
                    <Button
                      onClick={() => {
                        setIsAddingVehicle(true)
                        setVehicleForm({
                          name: "",
                          make: "",
                          model: "",
                          year: "",
                          licensePlate: "",
                          color: "",
                        })
                        setEditingVehicleId(null)
                        setIsEditingVehicle(false)
                      }}
                    >
                      Add Your First Vehicle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-accent p-2 rounded-full mr-4">
                            <Car className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{vehicle.name}</p>
                            <div className="text-sm text-muted-foreground">
                              <p>
                                {vehicle.make} {vehicle.model} {vehicle.year}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className="mr-2">{vehicle.licensePlate}</span>
                                {vehicle.color && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{vehicle.color}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditVehicle(vehicle.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Vehicle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRemoveVehicle(vehicle.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Vehicle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditingVehicle ? "Edit Vehicle" : "Add a Vehicle"}</DialogTitle>
                  <DialogDescription>
                    {isEditingVehicle
                      ? "Update your vehicle details"
                      : "Add your vehicle details to make parking reservations easier."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake">
                        Make <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="vehicleMake"
                        placeholder="e.g. Toyota"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">
                        Model <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="vehicleModel"
                        placeholder="e.g. Camry"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear">Year</Label>
                      <Input
                        id="vehicleYear"
                        placeholder="e.g. 2022"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">
                        License Plate <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="licensePlate"
                        placeholder="e.g. ABC-1234"
                        value={vehicleForm.licensePlate}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleColor">Color</Label>
                      <Input
                        id="vehicleColor"
                        placeholder="e.g. White"
                        value={vehicleForm.color}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleName">Display Name (Optional)</Label>
                      <Input
                        id="vehicleName"
                        placeholder="e.g. My Car"
                        value={vehicleForm.name}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fields marked with <span className="text-destructive">*</span> are required
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingVehicle(false)
                      setIsEditingVehicle(false)
                      setEditingVehicleId(null)
                      setVehicleForm({
                        name: "",
                        make: "",
                        model: "",
                        year: "",
                        licensePlate: "",
                        color: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={isEditingVehicle ? handleSaveVehicle : handleAddVehicle}>
                    {isEditingVehicle ? "Save Changes" : "Add Vehicle"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods for parking reservations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddingPaymentMethod(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {user.paymentMethods.length === 0 ? (
                  <div className="text-center py-6">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No payment methods added yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a payment method to make parking reservations easier.
                    </p>
                    <Button onClick={() => setIsAddingPaymentMethod(true)}>Add Payment Method</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.paymentMethods.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-accent p-2 rounded-full mr-4">
                            {payment.type === "credit-card" ? (
                              <CreditCard className="h-5 w-5" />
                            ) : (
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M7.5 19.5H3.5L5 7.5H9C11.5 7.5 12.5 9 12 11C11.5 13 9.5 14.5 7 14.5H5.5L6.5 19.5"
                                  stroke="#0070BA"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M13.5 19.5H9.5L11 7.5H15C17.5 7.5 18.5 9 18 11C17.5 13 15.5 14.5 13 14.5H11.5L12.5 19.5"
                                  stroke="#0070BA"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            {payment.type === "credit-card" ? (
                              <>
                                <p className="font-medium">
                                  {payment.brand} •••• {payment.last4}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expires {payment.expMonth.toString().padStart(2, "0")}/{payment.expYear}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium">PayPal</p>
                                <p className="text-sm text-muted-foreground">{payment.email}</p>
                              </>
                            )}
                          </div>
                          {payment.isDefault && (
                            <Badge variant="outline" className="ml-4">
                              Default
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!payment.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefaultPaymentMethod(payment.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRemovePaymentMethod(payment.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddingPaymentMethod} onOpenChange={setIsAddingPaymentMethod}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to your account for parking reservations.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="credit-card" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit-card">
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">
                          Card Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={paymentForm.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 16)
                              const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ")
                              setPaymentForm({ ...paymentForm, cardNumber: formatted })
                            }}
                            className="pl-10"
                          />
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">
                          Cardholder Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={paymentForm.cardName}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">
                            Month <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={paymentForm.expiryMonth}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, expiryMonth: value })}
                          >
                            <SelectTrigger id="expiryMonth">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1
                                return (
                                  <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                    {month.toString().padStart(2, "0")}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">
                            Year <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={paymentForm.expiryYear}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, expiryYear: value })}
                          >
                            <SelectTrigger id="expiryYear">
                              <SelectValue placeholder="YY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">
                            CVV <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentForm.cvv}
                            onChange={(e) =>
                              setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          id="isDefault"
                          checked={paymentForm.isDefault}
                          onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, isDefault: checked })}
                        />
                        <Label htmlFor="isDefault">Set as default payment method</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="paypal">
                    <div className="space-y-4 py-2">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <svg
                          className="h-10 w-10 mx-auto mb-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 19.5H3.5L5 7.5H9C11.5 7.5 12.5 9 12 11C11.5 13 9.5 14.5 7 14.5H5.5L6.5 19.5"
                            stroke="#0070BA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.5 19.5H9.5L11 7.5H15C17.5 7.5 18.5 9 18 11C17.5 13 15.5 14.5 13 14.5H11.5L12.5 19.5"
                            stroke="#0070BA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-blue-800 font-medium mb-2">Connect with PayPal</p>
                        <p className="text-sm text-blue-600 mb-4">
                          You'll be redirected to PayPal to link your account securely.
                        </p>
                        <Button
                          className="bg-[#0070BA] hover:bg-[#003087]"
                          onClick={() => {
                            toast({
                              title: "PayPal integration",
                              description: "This would redirect to PayPal in a real application.",
                            })
                          }}
                        >
                          Connect PayPal Account
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingPaymentMethod(false)
                      setPaymentForm({
                        cardNumber: "",
                        cardName: "",
                        expiryMonth: "",
                        expiryYear: "",
                        cvv: "",
                        isDefault: false,
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={user.notificationPreferences.email}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("email", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={user.notificationPreferences.push}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("push", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={user.notificationPreferences.sms}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("sms", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reservation-reminders">Reservation Reminders</Label>
                          <p className="text-sm text-muted-foreground">Reminders about upcoming reservations</p>
                        </div>
                        <Switch
                          id="reservation-reminders"
                          checked={user.notificationPreferences.reservationReminders}
                          onCheckedChange={(checked) =>
                            handleUpdateNotificationPreferences("reservationReminders", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="parking-expiration">Parking Expiration</Label>
                          <p className="text-sm text-muted-foreground">
                            Alerts when your parking time is about to expire
                          </p>
                        </div>
                        <Switch
                          id="parking-expiration"
                          checked={user.notificationPreferences.parkingExpiration}
                          onCheckedChange={(checked) =>
                            handleUpdateNotificationPreferences("parkingExpiration", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="payment-receipts">Payment Receipts</Label>
                          <p className="text-sm text-muted-foreground">Receipts for payments and transactions</p>
                        </div>
                        <Switch
                          id="payment-receipts"
                          checked={user.notificationPreferences.paymentReceipts}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("paymentReceipts", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="special-offers">Special Offers</Label>
                          <p className="text-sm text-muted-foreground">Special discounts and promotions</p>
                        </div>
                        <Switch
                          id="special-offers"
                          checked={user.notificationPreferences.specialOffers}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("specialOffers", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="system-updates">System Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Updates about the parking system and new features
                          </p>
                        </div>
                        <Switch
                          id="system-updates"
                          checked={user.notificationPreferences.systemUpdates}
                          onCheckedChange={(checked) => handleUpdateNotificationPreferences("systemUpdates", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="promotional-offers">Promotional Offers</Label>
                          <p className="text-sm text-muted-foreground">Marketing and promotional content</p>
                        </div>
                        <Switch
                          id="promotional-offers"
                          checked={user.notificationPreferences.promotionalOffers}
                          onCheckedChange={(checked) =>
                            handleUpdateNotificationPreferences("promotionalOffers", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() =>
                    toast({
                      title: "Notification preferences saved",
                      description: "Your notification preferences have been updated",
                    })
                  }
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and preferences</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.accountSettings.twoFactorEnabled ? (
                            <>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Enabled
                              </Badge>
                              <Button variant="outline" size="sm" onClick={handleDisable2FA}>
                                Disable
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setTwoFactorSetupStep(1)}>
                              Set Up
                            </Button>
                          )}
                        </div>
                      </div>

                      {twoFactorSetupStep > 0 && !user.accountSettings.twoFactorEnabled && (
                        <div className="mt-4 p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Set Up Two-Factor Authentication</h4>

                          {twoFactorSetupStep === 1 && (
                            <>
                              <p className="text-sm text-muted-foreground mb-4">Choose your preferred 2FA method:</p>
                              <RadioGroup
                                value={twoFactorMethod}
                                onValueChange={setTwoFactorMethod}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="app" id="2fa-app" />
                                  <Label htmlFor="2fa-app">Authenticator App (Google Authenticator, Authy, etc.)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sms" id="2fa-sms" />
                                  <Label htmlFor="2fa-sms">SMS Text Message</Label>
                                </div>
                              </RadioGroup>
                              <div className="flex justify-between mt-4">
                                <Button variant="outline" size="sm" onClick={() => setTwoFactorSetupStep(0)}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={handleSetup2FA}>
                                  Continue
                                </Button>
                              </div>
                            </>
                          )}

                          {twoFactorSetupStep === 2 && (
                            <>
                              {twoFactorMethod === "app" ? (
                                <>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Scan this QR code with your authenticator app:
                                  </p>
                                  <div className="flex justify-center mb-4">
                                    <img
                                      src={twoFactorQRCode || "/placeholder.svg"}
                                      alt="QR Code for 2FA"
                                      className="border p-2 rounded-lg"
                                      width={200}
                                      height={200}
                                    />
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground mb-4">
                                  We've sent a verification code to your phone number ending in {user.phone.slice(-4)}
                                </p>
                              )}

                              <div className="space-y-2 mb-4">
                                <Label htmlFor="verification-code">Enter Verification Code</Label>
                                <Input
                                  id="verification-code"
                                  placeholder="123456"
                                  value={twoFactorVerificationCode}
                                  onChange={(e) =>
                                    setTwoFactorVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                  }
                                  className="text-center tracking-widest text-lg"
                                />
                              </div>

                              <div className="flex justify-between">
                                <Button variant="outline" size="sm" onClick={() => setTwoFactorSetupStep(1)}>
                                  Back
                                </Button>
                                <Button size="sm" onClick={handleVerify2FACode}>
                                  Verify & Enable
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="login-alerts">Login Alerts</Label>
                          <p className="text-sm text-muted-foreground">Receive alerts for new login attempts</p>
                        </div>
                        <Switch
                          id="login-alerts"
                          checked={user.accountSettings.loginAlerts}
                          onCheckedChange={(checked) => handleUpdateAccountSettings("loginAlerts", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-renew">Auto-Renew Reservations</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically extend reservations when time is almost up
                          </p>
                        </div>
                        <Switch
                          id="auto-renew"
                          checked={user.accountSettings.autoRenewReservations}
                          onCheckedChange={(checked) => handleUpdateAccountSettings("autoRenewReservations", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                        </div>
                        <Switch
                          id="dark-mode"
                          checked={user.accountSettings.darkMode}
                          onCheckedChange={(checked) => handleUpdateAccountSettings("darkMode", checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={user.accountSettings.language}
                          onValueChange={(value) => handleUpdateAccountSettings("language", value)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast({
                      title: "Account deletion requested",
                      description: "Please check your email to confirm account deletion",
                      variant: "destructive",
                    })
                  }}
                >
                  Delete Account
                </Button>
                <Button
                  onClick={() =>
                    toast({
                      title: "Security settings saved",
                      description: "Your security settings have been updated",
                    })
                  }
                >
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

