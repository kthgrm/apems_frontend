import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Resolution } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const ArchiveResolution = ({ resolution, onArchived }: { resolution: Resolution, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/resolutions/${resolution.id}/archive`, {
                password: password
            });
            toast.success('Resolution archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                // notify parent that this resolution was archived
                onArchived(resolution.id);
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
                Delete project
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
                            You are about to delete the resolution "{resolution.resolution_number}". This action requires password confirmation.
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

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<Resolution>[] => [
    {
        accessorKey: "resolution_number",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Resolution Number" />
        },
        cell: ({ row }) => {
            const resolution = row.original
            return (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                        <span className="font-medium">{resolution.resolution_number}</span>
                        <span className="text-xs text-muted-foreground">ID: {resolution.id}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "user.name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Submitted By" />
        },
        cell: ({ row }) => {
            const resolution = row.original
            return (
                <div className="flex items-center gap-2">
                    <span>{resolution.user.first_name + ' ' + resolution.user.last_name}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "partner_agency",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Partner Agency/Organization" />
        },
        cell: ({ row }) => {
            const partnerAgency = row.getValue("partner_agency") as string
            if (!partnerAgency) return <span className="text-xs text-muted-foreground">No partner agency</span>

            return (
                <div className="flex items-center gap-2">
                    <span>{partnerAgency}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "effectivity",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Effectivity" />
        },
        cell: ({ row }) => {
            const date = row.getValue("effectivity") as string
            if (!date) return <span className="text-xs text-muted-foreground">Not set</span>

            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        {new Date(date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "expiration",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Expiration" />
        },
        cell: ({ row }) => {
            const date = row.getValue("expiration") as string
            if (!date) return <span className="text-xs text-muted-foreground">Not set</span>

            const expirationDate = new Date(date);

            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        {expirationDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "contact_person",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Contact Person" />
        },
        cell: ({ row }) => {
            const resolution = row.original
            const contactPerson = resolution.contact_person
            const contactInfo = resolution.contact_number_email

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{contactPerson || 'N/A'}</span>
                    {contactInfo && (
                        <span className="text-xs text-muted-foreground">{contactInfo}</span>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const resolution = row.original

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
                            <Link to={`/admin/resolution/${resolution.id}`} className="font-light">
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/resolution/${resolution.id}/edit`} className="font-light">
                                Edit resolution
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ArchiveResolution resolution={resolution} onArchived={onArchived} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]