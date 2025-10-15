import type { ColumnDef } from '@tanstack/react-table';
import type { ImpactAssessment } from '@/types';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, MapPin, Users, FilePenLine } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { useState } from "react";
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';

// Archive Assessment Component with Password Confirmation
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
                // notify parent that this assessment was archived
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
                Delete assessment
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
                            You are about to delete the assessment with "{assessment.id}". This action requires password confirmation.
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
                            {isLoading ? 'Deleting...' : 'Delete Assessment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const columns = (onArchived?: (id: number | string) => void): ColumnDef<ImpactAssessment>[] => [
    {
        id: 'tech_transfer.name',
        accessorFn: (row) => row.tech_transfer?.name || 'N/A',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Project Assessment"
            />
        ),
        cell: ({ row }) => {
            const assessment = row.original;
            return (
                <div className="flex items-center gap-2" >
                    <FilePenLine className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                        <span className="font-medium">{assessment.tech_transfer?.name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">ID: {assessment.id}</span>
                    </div>
                </div >
            )
        },
    },
    {
        accessorKey: 'beneficiary',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Beneficiary"
            />
        ),
    },
    {
        accessorKey: 'num_direct_beneficiary',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Direct Beneficiaries"
            />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700">
                    {Number(row.original.num_direct_beneficiary).toLocaleString()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'num_indirect_beneficiary',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Indirect Beneficiaries"
            />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-700">
                    {Number(row.original.num_indirect_beneficiary).toLocaleString()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'geographic_coverage',
        header: 'Geographic Coverage',
        cell: ({ row }) => (
            <div className="flex items-center gap-1 max-w-[120px]">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="truncate text-sm">
                    {row.original.geographic_coverage}
                </span>
            </div>
        ),
    },
    {
        id: 'user.full_name',
        accessorFn: (row) => `${row.user.first_name} ${row.user.last_name}`,
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Submitted By"
            />
        ),
        cell: ({ row }) => {
            const user = row.original.user;
            return <span className="font-medium">{`${user.first_name} ${user.last_name}`}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const assessment = row.original

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
                            <Link to={`/admin/impact-assessment/${assessment.id}`} className="font-light">
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/impact-assessment/${assessment.id}/edit`} className="font-light">
                                Edit assessment
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ArchiveAssessmentButton assessment={assessment} onArchived={onArchived} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];
