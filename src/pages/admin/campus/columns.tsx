import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import type { Campus } from "@/types";
import { Trash, LoaderCircle, Building, SquarePen, Eye } from "lucide-react";
import { useState } from "react";
import { asset } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Delete Campus Component with Password Confirmation
const DeleteCampusButton = ({ campus, onDelete }: { campus: Campus, onDelete?: (id: number | string) => void }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const closeDialog = () => {
        if (isLoading) return; // Prevent closing during loading
        setIsDialogOpen(false);
        setPassword('');
        setErrorMessage('');
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!password.trim()) {
            setErrorMessage('Please enter your password to confirm.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await api.delete(`/campuses/${campus.id}`, {
                data: { password }
            });
            toast.success('Campus deleted successfully');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onDelete) {
                // notify parent that this campus was archived
                onDelete(campus.id);
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
                    Delete
                </TooltipContent>
            </Tooltip>

            <Dialog open={isDialogOpen} onOpenChange={() => { }}>
                <DialogContent
                    className="sm:max-w-[425px]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Delete Campus</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{campus.name}" campus?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Enter your password to confirm:
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full"
                                placeholder="Password"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleDelete();
                                    }
                                }}
                            />
                            {errorMessage && <InputError message={errorMessage} />}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading || !password.trim()}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    Delete College
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const columns = (onDelete: (id: number | string) => void): ColumnDef<Campus>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Campus Name" />
        },
        cell: ({ row }) => {
            const campus = row.original
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage
                            src={campus.logo ? asset(campus.logo) : undefined}
                            alt={`${campus.name} logo`}
                        />
                        <AvatarFallback className="bg-slate-100">
                            <Building className='p-0.5' />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{campus.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {campus.id}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Created" />
        },
        cell: ({ row }) => {
            const createdAt = row.original.created_at
            if (!createdAt) return "N/A"

            const date = new Date(createdAt)
            return (
                <div className="flex flex-col">
                    <span className="text-sm">
                        {date.toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString('en-PH', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Last Updated" />
        },
        cell: ({ row }) => {
            const updatedAt = row.original.updated_at
            if (!updatedAt) return "N/A"

            const date = new Date(updatedAt)

            return (
                <div className="flex flex-col">
                    <span className="text-sm">{date.toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}</span>
                    <span className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString('en-PH', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const campus = row.original

            return (
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-800 hover:text-white">
                                <Link to={`/admin/campus/${campus.id}`} className="flex items-center gap-2">
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
                                <Link to={`/admin/campus/${campus.id}/edit`} className="flex items-center gap-2">
                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>

                    <DeleteCampusButton campus={campus} onDelete={onDelete} />
                </div>
            )
        },
    },
];