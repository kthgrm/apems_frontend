import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, ArrowUpDown, ShieldCheck, Shield, UserCheck, UserX, Eye, Edit, ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type ColumnProps = {
    onDelete: (user: User) => void;
    onToggleAdmin: (user: User) => void;
    selectedUsers: User[];
    onSelectAll: (selected: boolean) => void;
    onSelectUser: (user: User, selected: boolean) => void;
};

export const columns = ({ onDelete, onToggleAdmin, selectedUsers, onSelectAll, onSelectUser }: ColumnProps): ColumnDef<User>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(!!value);
                    onSelectAll(!!value);
                }}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => {
            const user = row.original;
            const isSelected = selectedUsers.some(u => u.id === user.id);
            const isAdmin = user.role === "admin";

            return !isAdmin ? (
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                        onSelectUser(user, !!value);
                    }}
                    aria-label="Select row"
                />
            ) : null;
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "first_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const firstName = row.getValue("first_name") as string;
            const lastName = row.original.last_name;
            return <div className="font-medium">{`${firstName} ${lastName}`}</div>;
        },
        filterFn: (row, _id, value) => {
            const firstName = row.getValue("first_name") as string;
            const lastName = row.original.last_name;
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            return fullName.includes(value.toLowerCase());
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "college",
        header: "Campus & College",
        cell: ({ row }) => {
            const college = row.getValue("college") as any;
            return (
                <div className="text-sm">
                    {college ? (
                        <>
                            <div className="font-medium">{college.campus.name}</div>
                            <div className="text-muted-foreground">{college.name}</div>
                        </>
                    ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const isAdmin = row.getValue("role") === "admin";
            return (
                <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? (
                        <>
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Admin
                        </>
                    ) : (
                        <>
                            <Shield className="mr-1 h-3 w-3" />
                            CESU
                        </>
                    )}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-green-500" : "bg-red-800"}>
                    {isActive ? (
                        <>
                            <UserCheck className="mr-1 h-3 w-3" />
                            Active
                        </>
                    ) : (
                        <>
                            <UserX className="mr-1 h-3 w-3" />
                            Inactive
                        </>
                    )}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                            {user.role === "admin" ? (
                                <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remove Admin
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]