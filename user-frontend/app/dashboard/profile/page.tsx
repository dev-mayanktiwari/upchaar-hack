"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Save, User } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  allergies: string[]
  chronicDiseases: string[]
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        // This would normally come from the API
        // const response = await userService.getProfile()
        // setUser(response.data.user)

        // Mock data for demonstration
        const mockUser: UserProfile = {
          name: "John Doe",
          email: "john.doe@example.com",
          dateOfBirth: "1985-06-15",
          gender: "male",
          bloodGroup: "O+",
          allergies: ["Penicillin", "Peanuts"],
          chronicDiseases: ["Hypertension"],
          emergencyContact: {
            name: "Jane Doe",
            relationship: "Spouse",
            phone: "+1 (555) 123-4567",
          },
        }

        setUser(mockUser)
        setEditedUser(mockUser)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Failed to load profile",
          description: "There was an error loading your profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [toast])

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedUser(user)
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (editedUser) {
      if (name.includes(".")) {
        const [parent, child] = name.split(".")
        setEditedUser({
          ...editedUser,
          [parent]: {
            ...editedUser[parent as keyof UserProfile],
            [child]: value,
          },
        })
      } else {
        setEditedUser({
          ...editedUser,
          [name]: value,
        })
      }
    }
  }

  const handleSaveProfile = async () => {
    if (!editedUser) return

    try {
      setIsSaving(true)

      // In a real app, we would call the API
      // await userService.updateProfile(editedUser)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUser(editedUser)
      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Profile Not Found</h3>
          <p className="text-sm text-muted-foreground">We couldn't load your profile information.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">View and manage your personal information</p>
          </div>
          <Button onClick={handleEditToggle} variant={isEditing ? "outline" : "default"}>
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="personal">
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="medical">Medical Information</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input id="name" name="name" value={editedUser?.name || ""} onChange={handleInputChange} />
                      ) : (
                        <div className="rounded-md border p-2">{user.name}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="rounded-md border p-2 bg-muted">{user.email}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={editedUser?.dateOfBirth || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="rounded-md border p-2">{new Date(user.dateOfBirth).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <select
                          id="gender"
                          name="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editedUser?.gender || ""}
                          onChange={(e) => handleInputChange(e as any)}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <div className="rounded-md border p-2">
                          {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Your medical details and health information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      {isEditing ? (
                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editedUser?.bloodGroup || ""}
                          onChange={(e) => handleInputChange(e as any)}
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <div className="rounded-md border p-2">{user.bloodGroup}</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <div className="rounded-md border p-2 min-h-[60px]">
                      {user.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No allergies recorded</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Chronic Diseases</Label>
                    <div className="rounded-md border p-2 min-h-[60px]">
                      {user.chronicDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.chronicDiseases.map((disease) => (
                            <span
                              key={disease}
                              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No chronic diseases recorded</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Contact information for emergencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.name">Contact Name</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact.name"
                        name="emergencyContact.name"
                        value={editedUser?.emergencyContact.name || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="rounded-md border p-2">{user.emergencyContact.name}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact.relationship"
                        name="emergencyContact.relationship"
                        value={editedUser?.emergencyContact.relationship || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="rounded-md border p-2">{user.emergencyContact.relationship}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact.phone"
                        name="emergencyContact.phone"
                        value={editedUser?.emergencyContact.phone || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="rounded-md border p-2">{user.emergencyContact.phone}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

