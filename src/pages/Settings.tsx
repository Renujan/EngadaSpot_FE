import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/UserManagement";
import { useBusinessInfo } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Store, Bell, Users, Database, Palette, Upload, Image } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { businessInfo, updateBusinessInfo } = useBusinessInfo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBusinessInfoSave = () => {
    const form = document.getElementById('business-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    updateBusinessInfo({
      shopName: formData.get('businessName') as string,
      email: formData.get('contactEmail') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    });

    toast({
      title: "Business information updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        updateBusinessInfo({ logoUrl });
        toast({
          title: "Logo updated",
          description: "Your new logo has been uploaded successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your SPOT restaurant management system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-accent/50">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Business Information */}
          <Card className="border-0 shadow-lg bg-gradient-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Business Information
              </CardTitle>
              <CardDescription>
                Update your restaurant details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-4">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/20">
                  <div className="flex-shrink-0">
                    <img 
                      src={businessInfo.logoUrl || "/src/assets/spot-logo.png"} 
                      alt="Current Logo" 
                      className="h-16 w-16 object-contain rounded-lg border border-border"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a new logo for your business. Recommended size: 256x256px
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <form id="business-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      placeholder="Your Restaurant Name"
                      defaultValue={businessInfo.shopName}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="contact@restaurant.com"
                      defaultValue={businessInfo.email}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      defaultValue={businessInfo.phone}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Restaurant Address"
                      defaultValue={businessInfo.address}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </form>
              <div className="flex justify-end">
                <Button onClick={handleBusinessInfoSave} className="hover-glow bg-gradient-brand">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="border-0 shadow-lg bg-gradient-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>Auto-save orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save orders every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>Print receipts automatically</Label>
                  <p className="text-sm text-muted-foreground">
                    Print customer receipts when orders are completed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>Low stock alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when items are running low
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-end">
                <Button className="hover-glow bg-gradient-brand">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage your notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>New order alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new orders are placed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>Daily sales summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily sales reports via email
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="space-y-0.5">
                  <Label>System maintenance alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important system updates and maintenance notices
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-end">
                <Button className="hover-glow bg-gradient-brand">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription>
                Backup and manage your restaurant data securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-6 border rounded-xl bg-gradient-subtle hover-lift">
                <div>
                  <h4 className="font-semibold text-lg">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your restaurant data as CSV files
                  </p>
                </div>
                <Button variant="outline" className="hover-lift">Export</Button>
              </div>
              
              <div className="flex items-center justify-between p-6 border rounded-xl bg-gradient-subtle hover-lift">
                <div>
                  <h4 className="font-semibold text-lg">Backup Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a backup of your current database
                  </p>
                </div>
                <Button variant="outline" className="hover-lift">Backup</Button>
              </div>
              
              <div className="flex items-center justify-between p-6 border border-destructive/20 rounded-xl bg-destructive/5">
                <div>
                  <h4 className="font-semibold text-lg text-destructive">Reset System</h4>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete all data. Use with caution.
                  </p>
                </div>
                <Button variant="destructive" className="hover:scale-105 transition-transform">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;