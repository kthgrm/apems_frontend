import { useRef, useState, type DragEventHandler } from 'react';
import { CheckCircle2, FileText, LoaderCircle, Upload, X } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ResolutionCreate() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const addFile = (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;

        const selectedFile = newFiles[0];
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!validTypes.includes(selectedFile.type)) {
            alert(`File ${selectedFile.name} is not a valid file type`);
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            alert(`File ${selectedFile.name} is too large. Maximum size is 10MB`);
            return;
        }

        // Replace previous file if any
        setFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDrag: DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop: DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            addFile(e.dataTransfer.files);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        // Backend expects attachments[] (array)
        formData.append('attachments[]', file);

        try {
            setUploading(true);
            setSuccess(false);

            const response = await api.post('/resolutions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSuccess(true);
                toast.success('Resolution uploaded successfully!');
                removeFile();
                navigate('/admin/resolution');
            } else {
                toast.error(response.data.message || 'Upload failed.');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(
                error.response?.data?.message || 'An error occurred while uploading.'
            );
        } finally {
            setUploading(false);
        }
    };

    const breadcrumbs = [
        { title: 'Resolution', href: '/admin/resolution' },
        { title: 'New Resolution', href: '/admin/resolution/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Upload Resolution</h1>
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => addFile(e.target.files)}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>

                            <div>
                                <p className="text-lg font-semibold text-gray-700 mb-1">
                                    Drag and drop your file here
                                </p>
                                <p className="text-sm text-gray-500 mb-4">or</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Browse File
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Supported formats: PDF, DOC, DOCX (Max 10MB)
                            </p>
                        </div>
                    </div>

                    {/* File Preview */}
                    {file && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Selected File
                            </h2>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <FileText className="h-8 w-8 text-blue-500" />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={removeFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-red-500" />
                                </button>
                            </div>

                            {/* Submit Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" onClick={removeFile}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : success ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Uploaded
                                        </>
                                    ) : (
                                        'Upload File'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
