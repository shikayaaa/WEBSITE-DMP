import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDoc, serverTimestamp, onSnapshot, addDoc } from "firebase/firestore";import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../../firebase";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'active';
  lastLogin: string;
  lastLogout: string;
  createdAt?: any;
  createdBy?: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastActive?: any;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    status: "active",
  });
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setCurrentAdminEmail(auth.currentUser.email || "Admin");
    }
    loadUsers();
    const unsubscribe = onSnapshot(collection(db, 'users'), () => {
      loadUsers();
    }, (error) => {
      console.error('Snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  const isUserOnline = (lastActiveTimestamp: any): boolean => {
    if (!lastActiveTimestamp) return false;
    try {
      const lastActive = lastActiveTimestamp.toDate ? lastActiveTimestamp.toDate() : new Date(lastActiveTimestamp);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
      return diffMinutes < 5;
    } catch (error) {
      return false;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Never';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Never';
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList: User[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        let role = 'client';
        try {
          const adminDoc = await getDoc(doc(db, 'admins', userDoc.id));
          if (adminDoc.exists()) {
            role = 'admin';
          } else {
            const staffDoc = await getDoc(doc(db, 'staff', userDoc.id));
            if (staffDoc.exists()) {
              role = 'staff';
            }
          }
        } catch (e) {
          console.log('Role check error:', e);
        }

        const isOnline = isUserOnline(userData.lastActive);

        usersList.push({
          id: userDoc.id,
          name: userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'Unknown',
          email: userData.email || 'No email',
          role,
          status: isOnline ? 'online' : 'offline',
          lastLogin: formatTimestamp(userData.lastLogin),
          lastLogout: formatTimestamp(userData.lastLogout),
          createdAt: userData.createdAt,
          createdBy: userData.createdBy || 'System',
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          isOnline,
          lastActive: userData.lastActive,
        });
      }

      usersList.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });

      setUsers(usersList);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading users:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check Firebase security rules.');
      } else {
        toast.error('Failed to load users: ' + (error.message || 'Unknown error'));
      }
      setLoading(false);
      setUsers([]);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "staff": return "bg-blue-100 text-blue-800";
      case "client": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "online" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const resetAddUserForm = () => {
    setNewUser({ name: "", email: "", role: "", password: "", status: "active" });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const auth = getAuth();
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('You must be logged in to create users');
      }
      let adminName = currentAdminEmail;
      try {
        const adminUserDoc = await getDoc(doc(db, 'users', currentAdmin.uid));
        if (adminUserDoc.exists()) {
          const adminData = adminUserDoc.data();
          adminName = adminData.displayName || adminData.fullName || currentAdminEmail;
        }
      } catch (e) {
        console.log('Could not fetch admin name:', e);
      }
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const userId = userCredential.user.uid;
      const now = Timestamp.now();
  await setDoc(doc(db, 'users', userId), {
  email: newUser.email,
  displayName: newUser.name,
  fullName: newUser.name,
  createdAt: now,
  createdBy: `${adminName} (${currentAdminEmail})`,
  lastActive: now,
  lastLogin: null,
  lastLogout: null,
  role: newUser.role,
});

// Auto-create contact for client users
if (newUser.role === 'client') {
  try {
    await addDoc(collection(db, 'contacts'), {
      userId: userId, // Link to user account
      name: newUser.name,
      email: newUser.email,
      phone: '', // Will be filled later
      address: '', // Will be filled later
      type: 'client',
      status: 'active',
      relatedLots: [],
      joinedDate: new Date().toISOString(),
      notes: `Account created by ${adminName}`,
      createdAt: now,
      updatedAt: now,
    });
    console.log('Auto-created contact for client user');
  } catch (contactError) {
    console.error('Failed to auto-create contact:', contactError);
    // Don't fail the user creation if contact creation fails
  }
}
      if (newUser.role === 'admin') {
        await setDoc(doc(db, 'admins', userId), {
          email: newUser.email,
          role: 'admin',
          name: newUser.name,
          createdAt: now,
        });
      } else if (newUser.role === 'staff') {
        await setDoc(doc(db, 'staff', userId), {
          email: newUser.email,
          role: 'staff',
          name: newUser.name,
          createdAt: now,
        });
      }
      try {
        await setDoc(doc(collection(db, 'activityLogs')), {
          user: `${adminName} (Admin)`,
          action: 'Created User',
          details: `Created new ${newUser.role} account for ${newUser.name} (${newUser.email})`,
          type: 'user',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.log('Could not create activity log:', logError);
      }
      toast.success(`User "${newUser.name}" created successfully!`);
      
      setSubmitting(false);
      setAddUserOpen(false);
      resetAddUserForm();
      
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setSubmitting(false);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'permission-denied') {
        toast.error('Permission denied. Check Firebase security rules.');
      } else {
        toast.error('Failed to create user: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editingUser.name || !editingUser.email || !editingUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const auth = getAuth();
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('You must be logged in');
      }
      await updateDoc(doc(db, 'users', editingUser.id), {
        displayName: editingUser.name,
        fullName: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      const oldUser = users.find(u => u.id === editingUser.id);
      if (oldUser && oldUser.role !== editingUser.role) {
        if (oldUser.role === 'admin') {
          try {
            await deleteDoc(doc(db, 'admins', editingUser.id));
          } catch (e) {
            console.log('Admin doc not found');
          }
        } else if (oldUser.role === 'staff') {
          try {
            await deleteDoc(doc(db, 'staff', editingUser.id));
          } catch (e) {
            console.log('Staff doc not found');
          }
        }
        if (editingUser.role === 'admin') {
          await setDoc(doc(db, 'admins', editingUser.id), {
            email: editingUser.email,
            role: 'admin',
            name: editingUser.name,
            createdAt: Timestamp.now(),
          });
        } else if (editingUser.role === 'staff') {
          await setDoc(doc(db, 'staff', editingUser.id), {
            email: editingUser.email,
            role: 'staff',
            name: editingUser.name,
            createdAt: Timestamp.now(),
          });
        }
      }
      try {
        let adminName = currentAdminEmail;
        const adminUserDoc = await getDoc(doc(db, 'users', currentAdmin.uid));
        if (adminUserDoc.exists()) {
          const adminData = adminUserDoc.data();
          adminName = adminData.displayName || adminData.fullName || currentAdminEmail;
        }
        await setDoc(doc(collection(db, 'activityLogs')), {
          user: `${adminName} (Admin)`,
          action: 'Updated User',
          details: `Updated user ${editingUser.name} (${editingUser.email})`,
          type: 'user',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.log('Could not create activity log:', logError);
      }
      toast.success("User updated successfully!");
      setEditUserOpen(false);
      setEditingUser(null);
      setSubmitting(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Check Firebase security rules.');
      } else {
        toast.error('Failed to update user: ' + (error.message || 'Unknown error'));
      }
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setSubmitting(true);
    try {
      const auth = getAuth();
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('You must be logged in');
      }
      const user = users.find(u => u.id === userToDelete);
      await deleteDoc(doc(db, 'users', userToDelete));
      if (user?.role === 'admin') {
        try {
          await deleteDoc(doc(db, 'admins', userToDelete));
        } catch (e) {
          console.log('Admin doc not found');
        }
      } else if (user?.role === 'staff') {
        try {
          await deleteDoc(doc(db, 'staff', userToDelete));
        } catch (e) {
          console.log('Staff doc not found');
        }
      }
      try {
        let adminName = currentAdminEmail;
        const adminUserDoc = await getDoc(doc(db, 'users', currentAdmin.uid));
        if (adminUserDoc.exists()) {
          const adminData = adminUserDoc.data();
          adminName = adminData.displayName || adminData.fullName || currentAdminEmail;
        }
        await setDoc(doc(collection(db, 'activityLogs')), {
          user: `${adminName} (Admin)`,
          action: 'Deleted User',
          details: `Deleted user ${user?.name} (${user?.email})`,
          type: 'user',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.log('Could not create activity log:', logError);
      }
      toast.success("User deleted successfully!");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setSubmitting(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Check Firebase security rules.');
      } else {
        toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
      }
      setSubmitting(false);
    }
  };

  const isAddUserFormValid = newUser.name && newUser.email && newUser.role && newUser.password;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const onlineUsers = users.filter(u => u.isOnline).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">{users.length} total users • {onlineUsers} online</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddUserOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{onlineUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{users.length - onlineUsers}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account for staff or client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="add-name" placeholder="Enter full name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email <span className="text-red-500">*</span></Label>
              <Input id="add-email" type="email" placeholder="Enter email address" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password <span className="text-red-500">*</span></Label>
              <Input id="add-password" type="password" placeholder="Enter password (min 6 characters)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role <span className="text-red-500">*</span></Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })} disabled={submitting}>
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddUserOpen(false); resetAddUserForm(); }} disabled={submitting}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser} disabled={!isAddUserFormValid || submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : ('Create User')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account details</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="edit-name" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email <span className="text-red-500">*</span></Label>
                <Input id="edit-email" type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role <span className="text-red-500">*</span></Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })} disabled={submitting}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditUserOpen(false); setEditingUser(null); }} disabled={submitting}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEdit} disabled={submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : ('Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the user account and all associated data. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>) : ('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Last Logout</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogout}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.createdBy || 'System'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}