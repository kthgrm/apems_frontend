import type { ColumnDef } from '@tanstack/react-table';
import type { Award } from '@/types';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Trash, AwardIcon, SquarePen, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { useState } from "react";
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Archive Award Component with Password Confirmation
const ArchiveAwardButton = ({ award, onArchived }: { award: Award, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/awards/${award.id}/archive`, {
                password: password
            });
            toast.success('Award deleted successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                // notify parent that this award was archived
                onArchived(award.id);
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
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-800 hover:bg-red-800 hover:text-white"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Small delay to let dropdown close first
                            setTimeout(() => setIsDialogOpen(true), 100);
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete</p>
                </TooltipContent>
            </Tooltip>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    resetDialog();
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            To delete this award, please enter your password to confirm this action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-1 items-center gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputError message={errorMessage} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetDialog} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleArchive} disabled={isLoading} className="bg-red-800 hover:bg-red-900">
                            {isLoading ? 'Deleting...' : 'Delete Award'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<Award>[] => [
    {
        accessorKey: "award_name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Award Name" />
        },
        cell: ({ row }) => {
            const award = row.original
            return (
                <div className="flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-yellow-600" />
                    <div className="flex flex-col">
                        <span className="font-medium">{award.award_name}</span>
                        <span className="text-xs text-muted-foreground">ID: {award.id}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Description" />
        },
    },
    {
        accessorKey: "people_involved",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="People Involved" />
        },
        cell: ({ row }) => {
            const people = row.original.people_involved
            const peopleList = people?.split(", ")
            return (
                <span className="text-sm flex flex-wrap gap-1">
                    {peopleList ? (
                        peopleList.map((person) => (
                            <Badge variant={"outline"} key={person}>
                                {person}
                            </Badge>
                        ))
                    ) : "No people involved"}
                </span>
            )
        }
    },
    {
        accessorKey: "date_received",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Date Received" />
        },
        cell: ({ row }) => {
            const dateReceived = row.original.date_received
            if (!dateReceived) return "N/A"

            const date = new Date(dateReceived)
            return (
                <span className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
    },
    {
        accessorKey: "user",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Submitted By" />
        },
        cell: ({ row }) => {
            const award = row.original
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{award.user.first_name} {award.user.last_name}</span>
                    <span className="text-xs text-muted-foreground">{award.user.email}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const award = row.original

            return (
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-800 hover:text-white">
                                <Link to={`/admin/awards-recognition/${award.id}`} className="font-light">
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-green-800 hover:bg-green-800 hover:text-white">
                                <Link to={`/admin/awards-recognition/${award.id}/edit`} className="font-light">
                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>

                    <ArchiveAwardButton award={award} onArchived={onArchived} />
                </div>
            )
        },
    },
];
