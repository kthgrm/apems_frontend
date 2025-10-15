import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import type { Modalities } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Radio, MoreHorizontal, Trash, Clock, Globe, Tv } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

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
            toast.success('Modality archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
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
                Delete modality
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
                            You are about to delete this modality. This action requires password confirmation.
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

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<Modalities>[] => [
    {
        accessorFn: (row) => row.tech_transfer?.name,
        id: "project_name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Project" />
        },
        cell: ({ row }: any) => {
            const modality = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-orange-500" />
                    <div className="flex flex-col">
                        <span className="font-medium">{modality.tech_transfer.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {modality.id}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "modality",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Delivery Mode" />
        },
        cell: ({ row }: any) => {
            const modalityType = row.getValue("modality") as string;
            const getModalityIcon = () => {
                switch (modalityType?.toLowerCase()) {
                    case 'tv':
                    case 'television':
                        return <Tv className="h-3 w-3" />;
                    case 'radio':
                        return <Radio className="h-3 w-3" />;
                    case 'online':
                    case 'internet':
                        return <Globe className="h-3 w-3" />;
                    default:
                        return <Radio className="h-3 w-3" />;
                }
            };

            return modalityType ? (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    {getModalityIcon()}
                    {modalityType}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-sm">Not specified</span>
            );
        },
    },
    {
        accessorKey: "tv_channel",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="TV Channel" />
        },
        cell: ({ row }: any) => {
            const tvChannel = row.getValue("tv_channel") as string;
            return tvChannel ? (
                <span className="line-clamp-2">{tvChannel}</span>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            );
        },
    },
    {
        accessorKey: "radio",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Radio Station" />
        },
        cell: ({ row }: any) => {
            const radio = row.getValue("radio") as string;
            return radio ? (
                <span className="line-clamp-2">{radio}</span>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            );
        },
    },
    {
        accessorKey: "time_air",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Air Time" />
        },
        cell: ({ row }: any) => {
            const timeAir = row.getValue("time_air") as string;
            return timeAir ? (
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{timeAir}</span>
                </div>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            );
        },
    },
    {
        accessorKey: "partner_agency",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Partner Agency" />
        },
        cell: ({ row }: any) => {
            const partnerAgency = row.getValue("partner_agency") as string;
            return partnerAgency ? (
                <span className="line-clamp-2">{partnerAgency}</span>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const modality = row.original

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
                            <Link to={`/user/modalities/${modality.id}`}>
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/user/modalities/${modality.id}/edit`}>
                                Edit modality
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ArchiveModalityButton modality={modality} onArchived={onArchived} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];
