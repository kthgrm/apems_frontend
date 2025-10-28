import { DataTable } from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import { Shield, ShieldCheck, UserCheck, Users, UserX } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react'
import { columns } from './components/columns';
import toast from 'react-hot-toast';
import type { User } from '@/types';
import { FilterComponent } from './components/filterComponent';
import { ActionComponent } from './components/actionComponent';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for client-side filtering
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        admin: 0,
        user: 0,
        active: 0,
        inactive: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users');
            console.log(response.data);
            const userData = response.data.users.data;
            setUsers(userData);
            setAllUsers(userData); // Store all users
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFilterChange = useCallback((filters: { userType: string; campus: string; college: string }) => {
        let filteredUsers: User[] = [...allUsers];

        // Filter by user type
        if (filters.userType !== 'all') {
            filteredUsers = filteredUsers.filter((user: User) =>
                filters.userType === 'admin' ? user.role === 'admin' : user.role !== 'admin'
            );
        }

        // Filter by campus
        if (filters.campus !== 'all') {
            filteredUsers = filteredUsers.filter((user: User) =>
                user.college?.campus_id === parseInt(filters.campus)
            );
        }

        // Filter by college
        if (filters.college !== 'all') {
            filteredUsers = filteredUsers.filter((user: User) =>
                user.college_id === parseInt(filters.college)
            );
        }

        setUsers(filteredUsers);
    }, [allUsers]);

    const handleDelete = async (user: User) => {
        const userName = `${user.first_name} ${user.last_name}`;
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleAdmin = async (user: User) => {
        const userName = `${user.first_name} ${user.last_name}`;
        const action = user.role === 'admin' ? 'remove admin privileges from' : 'grant admin privileges to';
        if (confirm(`Are you sure you want to ${action} ${userName}?`)) {
            try {
                await api.patch(`/users/${user.id}/toggle-admin`);
                toast.success(`Admin privileges ${user.role === 'admin' ? 'removed' : 'granted'} successfully`);
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to toggle admin:', error);
                toast.error('Failed to update user');
            }
        }
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            // Select all non-admin users
            const nonAdminUsers = users.filter(user => user.role !== 'admin');
            setSelectedUsers(nonAdminUsers);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (user: User, selected: boolean) => {
        if (selected) {
            setSelectedUsers(prev => [...prev, user]);
        } else {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        }
    };

    const handleActivateSelected = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to activate');
            return;
        }

        if (confirm(`Are you sure you want to activate ${selectedUsers.length} user(s)?`)) {
            try {
                const userIds = selectedUsers.map(user => user.id);
                await api.patch('/users/bulk-activate', { user_ids: userIds });
                toast.success('Users activated successfully');
                setSelectedUsers([]);
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to activate users:', error);
                toast.error('Failed to activate users');
            }
        }
    };

    const handleDeactivateSelected = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to deactivate');
            return;
        }

        if (confirm(`Are you sure you want to deactivate ${selectedUsers.length} user(s)?`)) {
            try {
                const userIds = selectedUsers.map(user => user.id);
                await api.patch('/users/bulk-deactivate', { user_ids: userIds });
                toast.success('Users deactivated successfully');
                setSelectedUsers([]);
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to deactivate users:', error);
                toast.error('Failed to deactivate users');
            }
        }
    };

    const breadcrumbs = [
        { title: 'Users', href: '/admin/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading users...
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">User Management</h1>
                                <p className="text-muted-foreground">
                                    Manage system users and their permissions
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-5">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.admin}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">CESU Users</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.user}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.active}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                                    <UserX className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.inactive}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardContent>
                                <DataTable
                                    columns={columns({
                                        onDelete: handleDelete,
                                        onToggleAdmin: handleToggleAdmin,
                                        selectedUsers,
                                        onSelectAll: handleSelectAll,
                                        onSelectUser: handleSelectUser
                                    })}
                                    searchKey='first_name'
                                    searchPlaceholder='Search by name...'
                                    data={users}
                                    filterComponent={<FilterComponent onFilterChange={handleFilterChange} />}
                                    actionComponent={
                                        <ActionComponent
                                            selectedUsers={selectedUsers}
                                            onActivateSelected={handleActivateSelected}
                                            onDeactivateSelected={handleDeactivateSelected}
                                        />
                                    }
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    )
}