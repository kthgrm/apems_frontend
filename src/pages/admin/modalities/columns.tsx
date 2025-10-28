import type { ColumnDef } from '@tanstack/react-table';
import type { Modalities } from '@/types';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Users, Clock, Globe, Radio, Tv, Building, Eye, SquarePen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { useState } from "react";
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Archive Modality Component with Password Confirmation
const ArchiveModalityButton = ({ modality, onArchived }: { modality: Modalities, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/modalities/${modality.id}/archive`, {
                password: password
            });
            toast.success('Modality deleted successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                // notify parent that this modality was archived
                onArchived(modality.id);
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
                            You are about to delete the modality with "{modality.id}". This action requires password confirmation.
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
                            {isLoading ? 'Deleting...' : 'Delete Modality'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<Modalities>[] => [
    {
        accessorKey: 'tech_transfer.name',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Project Modality"
            />
        ),
        cell: ({ row }) => {
            const modality = row.original;
            const getModalityIcon = (modalityType: string) => {
                switch (modalityType.toLowerCase()) {
                    case 'tv':
                    case 'television':
                        return <Tv className="h-4 w-4 text-blue-500" />;
                    case 'radio':
                        return <Radio className="h-4 w-4 text-green-500" />;
                    case 'online':
                    case 'digital':
                        return <Globe className="h-4 w-4 text-purple-500" />;
                    default:
                        return <Building className="h-4 w-4 text-gray-500" />;
                }
            };

            return (
                <div className="flex items-center gap-2">
                    {getModalityIcon(modality.modality)}
                    <div className="flex flex-col">
                        <span className="font-medium">{modality.tech_transfer.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {modality.id}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'modality',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Modality Type"
            />
        ),
        cell: ({ row }) => {
            const modality = row.original.modality;
            const getModalityIcon = (modalityType: string) => {
                switch (modalityType.toLowerCase()) {
                    case 'tv':
                    case 'television':
                        return <Tv className="h-3 w-3 text-blue-600" />;
                    case 'radio':
                        return <Radio className="h-3 w-3 text-green-600" />;
                    case 'online':
                    case 'digital':
                        return <Globe className="h-3 w-3 text-purple-600" />;
                    default:
                        return <Building className="h-3 w-3 text-gray-600" />;
                }
            };

            return (
                <div className="flex items-center gap-1">
                    {getModalityIcon(modality)}
                    <span className="font-medium capitalize">{modality}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'tv_channel',
        header: 'TV Channel',
        cell: ({ row }) => {
            const tvChannel = row.original.tv_channel;
            return tvChannel ? (
                <div className="flex items-center gap-1">
                    <Tv className="h-3 w-3 text-blue-600" />
                    <span className="text-sm">{tvChannel}</span>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'radio',
        header: 'Radio Station',
        cell: ({ row }) => {
            const radio = row.original.radio;
            return radio ? (
                <div className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-green-600" />
                    <span className="text-sm">{radio}</span>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'online_link',
        header: 'Online Link',
        cell: ({ row }) => {
            const onlineLink = row.original.online_link;
            return onlineLink ? (
                <div className="flex items-center gap-1 max-w-[150px]">
                    <Globe className="h-3 w-3 text-purple-600" />
                    <a
                        href={onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                        {onlineLink}
                    </a>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'time_air',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Air Time"
            />
        ),
        cell: ({ row }) => {
            const timeAir = row.original.time_air;
            return timeAir ? (
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{timeAir}</span>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'partner_agency',
        header: 'Partner Agency',
        cell: ({ row }) => {
            const partnerAgency = row.original.partner_agency;
            return partnerAgency ? (
                <div className="flex items-center gap-1 max-w-[120px]">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate text-sm">{partnerAgency}</span>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'user.name',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Submitted By"
            />
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const modality = row.original

            return (
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-800 hover:text-white">
                                <Link to={`/admin/modalities/${modality.id}`} className="font-light">
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
                                <Link to={`/admin/modalities/${modality.id}/edit`} className="font-light">
                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>

                    <ArchiveModalityButton modality={modality} onArchived={onArchived} />
                </div>
            )
        },
    },
];
