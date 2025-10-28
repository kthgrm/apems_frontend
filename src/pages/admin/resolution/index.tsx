import { Button } from '@/components/ui/button';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { Resolution } from '@/types';
import {
    FileText,
    Plus,
    MoreVertical,
    LoaderCircle,
    Eye,
    Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { asset } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';

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
                Delete
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
                            You are about to delete the resolution "{resolution.title}". This action requires password confirmation.
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

export default function Resolution() {
    const [resolutions, setResolutions] = useState<Resolution[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/resolutions`);
                setResolutions(response.data.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleArchived = (id: number | string) => {
        setResolutions((prev) => prev.filter((r) => String(r.id) !== String(id)));
    };

    const breadcrumbs = [{ title: 'Resolution', href: '/admin/resolution' }];

    const openFile = (filePath: string) => {
        window.open(asset(filePath), '_blank');
    };

    const isPDF = (filePath: string) => filePath?.toLowerCase().endsWith('.pdf');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Resolutions</h1>
                        <p className="text-gray-600">
                            Manage and view all uploaded resolutions
                        </p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Link to="/admin/resolution/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resolution
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <LoaderCircle className="animate-spin h-8 w-8 mb-3 text-blue-500" />
                        Loading resolutions...
                    </div>
                ) : resolutions.length === 0 ? (
                    <div className="text-center text-gray-500">
                        <p className="mb-4">No resolutions found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {resolutions.map(({ attachment_paths = [], ...resolution }) => {
                            const hasAttachments = Array.isArray(attachment_paths) && attachment_paths.length > 0;
                            const firstAttachment = hasAttachments ? attachment_paths[0] : null;

                            const fileUrl = firstAttachment ? asset(firstAttachment) : '';
                            const pdfPreviewUrl = firstAttachment
                                ? `${fileUrl}?#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
                                : '';

                            return (
                                <div
                                    key={resolution.id}
                                    className="group relative rounded-xl border border-gray-200 bg-gray-100/80 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col items-center text-center"
                                    onClick={() => {
                                        if (firstAttachment) openFile(firstAttachment);
                                    }}
                                >
                                    {/* Preview Area */}
                                    <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {firstAttachment ? (
                                            isPDF(firstAttachment) ? (
                                                <div>
                                                    <iframe
                                                        src={pdfPreviewUrl}
                                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                                        style={{
                                                            overflow: 'hidden',
                                                            transform: 'scale(1.1)',
                                                            transformOrigin: '20% 50%',
                                                        }}
                                                        title={resolution.id.toString()}
                                                    />
                                                    <div className="absolute inset-0 cursor-pointer" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <FileText className="h-10 w-10 mb-1" />
                                                    <p className="text-xs">DOC / DOCX</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FileText className="h-10 w-10 mb-1" />
                                                <p className="text-xs">No File</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between w-full mt-2">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {resolution.title ?? 'Untitled Resolution'}
                                        </p>
                                    </div>

                                    {/* Actions Menu */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="p-1 rounded-full hover:bg-gray-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-700" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {firstAttachment && (
                                                    <DropdownMenuItem onClick={() => openFile(firstAttachment)}>
                                                        <Eye className="h-4 w-4" /> View
                                                    </DropdownMenuItem>
                                                )}
                                                <ArchiveResolution
                                                    resolution={resolution}
                                                    onArchived={handleArchived}
                                                />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
