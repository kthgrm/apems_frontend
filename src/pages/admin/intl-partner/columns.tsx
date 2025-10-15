import type { ColumnDef } from '@tanstack/react-table';
import type { InternationalPartner } from '@/types';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Handshake, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { useState } from "react";
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

// Archive Partnership Component with Password Confirmation
const ArchivePartnershipButton = ({ partnership, onArchived }: { partnership: InternationalPartner, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/international-partners/${partnership.id}/archive`, {
                password: password
            });
            toast.success('Partnership archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                // notify parent that this partner was archived
                onArchived(partnership.id);
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
                    // Small delay to let dropdown close first
                    setTimeout(() => setIsDialogOpen(true), 100);
                }}
            >
                <Trash className="h-4 w-4" />
                Delete partner
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
                            You are about to delete the partnership with "{partnership.agency_partner}". This action requires password confirmation.
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
        accessorKey: 'agency_partner',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Agency Partner"
            />
        ),
        cell: ({ row }) => {
            const partnership = row.original;
            return (
                <div className="flex items-center gap-2" >
                    <Handshake className="h-4 w-4 text-green-500" />
                    <div className="flex flex-col">
                        <span className="font-medium">{partnership.agency_partner}</span>
                        <span className="text-xs text-muted-foreground">ID: {partnership.id}</span>
                    </div>
                </div >
            )
        },
    },
    {
        accessorKey: 'activity_conducted',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Activity Conducted"
            />
        ),
    },
    {
        accessorKey: 'location',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Location"
            />
        ),
    },
    {
        accessorKey: 'start_date',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Start Date"
            />
        ),
        cell: ({ row }) => {
            const date = row.getValue("start_date") as string
            if (!date) return <span className="text-xs text-muted-foreground">Not set</span>

            return (
                <span className="text-sm">
                    {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
    },
    {
        accessorKey: 'duration',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Duration"
            />
        ),
        cell: ({ row }) => {
            const partnership = row.original
            return (
                <div className="flex flex-col">
                    {/* Compute duration in days if start_date and end_date exist */}
                    {partnership.start_date && partnership.end_date ? (
                        <span className="text-sm font-medium">
                            {(() => {
                                const start = new Date(partnership.start_date);
                                const end = new Date(partnership.end_date);
                                const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                return `${diff} day${diff !== 1 ? 's' : ''}`;
                            })()}
                        </span>
                    ) : (
                        <span className="text-sm font-medium">N/A</span>
                    )}
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const partnershipA = rowA.original;
            const partnershipB = rowB.original;

            // Calculate duration for row A
            const getDuration = (partnership: InternationalPartner) => {
                if (!partnership.start_date || !partnership.end_date) return -1; // Put N/A at the end
                const start = new Date(partnership.start_date);
                const end = new Date(partnership.end_date);
                return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            };

            const durationA = getDuration(partnershipA);
            const durationB = getDuration(partnershipB);

            return durationA - durationB;
        },
    },
    {
        accessorKey: "user",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Submitted By" />
        },
        cell: ({ row }) => {
            const partnership = row.original
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{partnership.user.first_name} {partnership.user.last_name}</span>
                    <span className="text-xs text-muted-foreground">{partnership.user.email}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const partnership = row.original

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
                            <Link to={`/admin/international-partner/${partnership.id}`} className="font-light">
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/international-partner/${partnership.id}/edit`} className="font-light">
                                Edit partnership
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ArchivePartnershipButton partnership={partnership} onArchived={onArchived} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];
