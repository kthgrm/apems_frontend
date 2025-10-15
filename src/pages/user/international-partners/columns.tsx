import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import type { InternationalPartner } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Globe, MapPin, MoreHorizontal, Trash, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

const ArchivePartnerButton = ({ partner, onArchived }: { partner: InternationalPartner, onArchived?: (id: number | string) => void }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleArchive = async () => {
        if (!password.trim()) {
            setErrorMessage('Please enter your password to confirm.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await api.patch(`/international-partners/${partner.id}/archive`, {
                password: password
            });
            toast.success('Partnership archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                onArchived(partner.id);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.password) {
                setErrorMessage(error.response.data.password);
            } else if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Archive failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetDialog = () => {
        setIsDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    return (
        <>
            <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(() => setIsDialogOpen(true), 100);
                }}
            >
                <Trash className="h-4 w-4" />
                Delete partnership
            </DropdownMenuItem>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    resetDialog();
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            You are about to delete the partnership with "{partner.agency_partner}". This action requires password confirmation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-1 items-center gap-4">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleArchive();
                                    }
                                }}
                                disabled={isLoading}
                            />
                        </div>
                        <InputError message={errorMessage} className="col-span-4" />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={resetDialog}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleArchive}
                            disabled={isLoading || !password.trim()}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {isLoading ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<InternationalPartner>[] => [
    {
        accessorKey: "agency_partner",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Agency Partner" />
        },
        cell: ({ row }) => {
            const partner = row.original
            return (
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    <Link to={`/user/international-partner/${partner.id}`} className="font-medium hover:underline">
                        <div className="flex flex-col">
                            <span className="font-medium">{partner.agency_partner}</span>
                            <span className="text-xs text-muted-foreground">ID: {partner.id}</span>
                        </div>
                    </Link>
                </div>
            )
        },
    },
    {
        accessorKey: "activity_conducted",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Activity" />
        },
        cell: ({ row }) => {
            const activity = row.getValue("activity_conducted") as string;

            if (!activity) return <span className="text-xs text-muted-foreground">Not specified</span>;
            return (
                <Badge
                    variant="outline"
                    className={`capitalize ${activity}`}
                >
                    {activity}
                </Badge>
            );
        },
    },
    {
        accessorKey: "location",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Location" />
        },
        cell: ({ row }) => {
            const location = row.getValue("location") as string;
            return (
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{location}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "start_date",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Start Date" />
        },
        cell: ({ row }) => {
            const startDate = row.getValue("start_date") as string;
            return startDate ? new Date(startDate).toLocaleDateString() : 'Not set';
        },
    },
    {
        accessorKey: "end_date",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="End Date" />
        },
        cell: ({ row }) => {
            const endDate = row.getValue("end_date") as string;
            return endDate ? new Date(endDate).toLocaleDateString() : 'Not set';
        },
    },
    {
        id: "duration",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Duration" />
        },
        cell: ({ row }) => {
            const start = row.getValue("start_date") as string;
            const end = row.getValue("end_date") as string;
            if (!start || !end) return 'N/A';
            const startDate = new Date(start);
            const endDate = new Date(end);
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            return (
                <span className="text-sm">
                    {days} day{days !== 1 ? 's' : ''}
                </span>
            );
        },
    },
    {
        accessorKey: "number_of_participants",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Participants" />
        },
        cell: ({ row }) => {
            const participants = row.getValue("number_of_participants") as number;
            return (
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{participants}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const partner = row.original

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
                        <DropdownMenuItem asChild>
                            <Link to={`/user/international-partner/${partner.id}`}>
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/user/international-partner/${partner.id}/edit`}>
                                Edit partnership
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ArchivePartnerButton partner={partner} onArchived={onArchived} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];
