import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import type { TechnologyTransfer } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Folder, Users, Trash, Eye, SquarePen } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Archive Project Component with Password Confirmation
const ArchiveProjectButton = ({ project, onArchived }: { project: TechnologyTransfer, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/tech-transfers/${project.id}/archive`, {
                password: password
            });
            toast.success('Project archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                // notify parent that this project was archived
                onArchived(project.id);
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
                            You are about to delete the project "{project.name}". This action requires password confirmation.
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

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<TechnologyTransfer>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Project Name" />
        },
        cell: ({ row }) => {
            const project = row.original
            return (
                <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {project.id}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Description" />
        },
        cell: ({ row }) => {
            const description = row.getValue("description") as string
            if (!description) return <span className="text-xs text-muted-foreground">Not set</span>

            return (
                <span>{description}</span>
            )
        },
    },
    {
        accessorKey: "purpose",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Purpose" />
        },
        cell: ({ row }) => {
            const purpose = row.getValue("purpose") as string
            if (!purpose) return <span className="text-xs text-muted-foreground">Not set</span>

            return (
                <span>{purpose}</span>
            )
        },
    },
    {
        accessorKey: "agency_partner",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Agency Partner" />
        },
        cell: ({ row }) => {
            const agencyPartner = row.getValue("agency_partner") as string
            if (!agencyPartner) return <span className="text-xs text-muted-foreground">No agency partner</span>

            return (
                <span>{agencyPartner}</span>
            )
        },
    },
    {
        accessorKey: "start_date",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Start Date" />
        },
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
        accessorKey: "leader",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Leader" />
        },
        cell: ({ row }) => {
            const leader = row.getValue("leader") as string
            if (!leader) return <span className="text-xs text-muted-foreground">Not assigned</span>

            return (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{leader}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "user.first_name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Submitted By" />
        },
        cell: ({ row }) => {
            const project = row.original
            return (
                <span>{project.user.first_name + " " + project.user.last_name}</span>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Status" />
        },
        cell: ({ row }) => {
            const project = row.original
            return (
                <Badge className={`capitalize ${project.status === 'approved' ? 'bg-green-200 text-green-800' : project.status === 'pending' ? 'bg-yellow-200 text-yellow-600' : 'bg-red-200 text-red-800'}`}>
                    {project.status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const project = row.original

            return (
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-800 hover:text-white">
                                <Link to={`/user/technology-transfer/${project.id}`} className="font-light">
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
                                <Link to={`/user/technology-transfer/${project.id}/edit`} className="font-light">
                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>

                    <ArchiveProjectButton project={project} onArchived={onArchived} />
                </div>
            )
        },
    },
]