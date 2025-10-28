import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import type { ImpactAssessment } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash, BarChart, SquarePen, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ArchiveAssessmentButton = ({ assessment, onArchived }: { assessment: ImpactAssessment, onArchived?: (id: number | string) => void }) => {
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
            await api.patch(`/impact-assessments/${assessment.id}/archive`, {
                password: password
            });
            toast.success('Assessment archived successfully.');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            if (onArchived) {
                onArchived(assessment.id);
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
                            You are about to delete this impact assessment. This action requires password confirmation.
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

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<ImpactAssessment>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="RREID" />
        },
        cell: ({ row }) => {
            const assessment = row.original;
            return (
                <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{assessment.id}</span>
                </div>
            );
        },
    },
    {
        accessorFn: (row) => row.tech_transfer?.name,
        id: "project_name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Project Assessment" />
        },
        cell: ({ row }: any) => {
            const assessment = row.original;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{assessment.tech_transfer.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Title" />
        },
        cell: ({ row }) => {
            const assessment = row.original;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{assessment.title}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Description" />
        },
        cell: ({ row }) => {
            const assessment = row.original;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{assessment.description}</span>
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const assessment = row.original

            return (
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-blue-800 hover:bg-blue-800 hover:text-white">
                                <Link to={`/user/impact-assessment/${assessment.id}`}>
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
                                <Link to={`/user/impact-assessment/${assessment.id}/edit`}>

                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>

                    <ArchiveAssessmentButton assessment={assessment} onArchived={onArchived} />
                </div>
            )
        },
    },
];
