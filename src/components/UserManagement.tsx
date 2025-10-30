import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Mail, Shield, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number | string;
  username: string;
  email: string;
  role: 'admin' | 'cashier' | 'staff';
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
}

const UserManagement = () => {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff' as User['role'],
    status: 'active' as User['status']
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const roleColors = {
    admin: 'bg-gradient-brand text-white shadow-lg',
    cashier: 'bg-primary/10 text-primary border border-primary/20',
    staff: 'bg-green-100 text-green-700 border border-green-200'
  };

  // 🔥 Fetch users from API
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated]);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'staff', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role, status: user.status });
    setIsDialogOpen(true);
  };

  // 💾 Save user (create or update)
  const handleSave = async () => {
    if (!formData.username || !formData.email || (!editingUser && !formData.password)) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const url = editingUser ? `${API_URL}/users/${editingUser.id}/` : `${API_URL}/users/create/`;
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Something went wrong');
      }

      toast({
        title: editingUser ? "User updated" : "User added",
        description: editingUser ? "User updated successfully" : "User created successfully",
      });

      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // 🗑 Delete user
  const handleDelete = async (id: number | string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      toast({ title: "Cannot delete", description: "Cannot delete last admin", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast({ title: "Deleted", description: "User removed successfully" });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">User Management</h2>
        <Button onClick={handleAdd} className="btn-professional hover-glow">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id} className="hover-lift border-0 shadow-md bg-gradient-card">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-brand text-white">{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.username}</h3>
                    <Badge className={roleColors[user.role]}><Shield className="h-3 w-3 mr-1" />{user.role}</Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex space-x-4">
                    <div className="flex items-center"><Mail className="h-4 w-4 mr-1" />{user.email}</div>
                    <div className="flex items-center"><User className="h-4 w-4 mr-1" />Since {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)}> <Trash2 className="h-4 w-4" /> </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>{editingUser ? "Update user info" : "Create new user"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label>Username *</Label>
            <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <Label>Email *</Label>
            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Label>Password {!editingUser && '*'}</Label>
            <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <Label>Role *</Label>
            <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v as User['role']})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as User['status']})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingUser ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
