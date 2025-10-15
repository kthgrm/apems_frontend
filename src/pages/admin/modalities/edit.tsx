import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { Modalities } from '@/types';
import { Building, Radio, Tv } from 'lucide-react';
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ModalityEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [modality, setModality] = useState<Modalities | null>(null);
    const [techTransfers, setTechTransfers] = useState<Array<{ value: number; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        tech_transfer_id: '',
        modality: '',
        tv_channel: '',
        radio: '',
        online_link: '',
        time_air: '',
        period: '',
        partner_agency: '',
        hosted_by: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch tech transfers for dropdown
                const techTransfersRes = await api.get('tech-transfers');
                const techTransfersData = techTransfersRes.data.data.map((tt: any) => ({
                    value: tt.id,
                    label: tt.name,
                }));
                setTechTransfers(techTransfersData);

                // Fetch modality details
                const response = await api.get(`modalities/${id}`);
                const modalityData = response.data.data;
                setModality(modalityData);

                // Populate form with fetched data
                setData({
                    tech_transfer_id: modalityData?.tech_transfer_id?.toString() || '',
                    modality: modalityData?.modality || '',
                    tv_channel: modalityData?.tv_channel || '',
                    radio: modalityData?.radio || '',
                    online_link: modalityData?.online_link || '',
                    time_air: modalityData?.time_air || '',
                    period: modalityData?.period || '',
                    partner_agency: modalityData?.partner_agency || '',
                    hosted_by: modalityData?.hosted_by || '',
                });
            } catch (error) {
                console.error('Failed to fetch modality data', error);
                toast.error('Failed to load modality data');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.put(`/modalities/${id}`, data);

            toast.success('Modality updated successfully!');
            navigate(-1);
        } catch (err: any) {
            console.error('Submission error:', err.response?.data || err);

            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);
        } finally {
            setProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const breadcrumbs = [
        {
            title: 'Modalities',
            href: '/admin/modalities',
        },
        {
            title: isLoading ? 'Loading...' : modality ? modality.tech_transfer.name : 'Not Found',
            href: `/admin/modalities/${id}`,
        },
        {
            title: 'Edit',
            href: `/admin/modalities/${id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading modalities details...
                </div>
            ) : (
                modality ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Modality</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update Modality'}
                                    </Button>
                                    <Button
                                        type="button"
                                        className="justify-start bg-red-800 hover:bg-red-900"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Modality Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Modality Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Radio className="h-5 w-5" />
                                                Basic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Modality ID</Label>
                                                    <Input
                                                        value={modality.id}
                                                        readOnly
                                                        className="mt-1 bg-muted"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm" htmlFor="project_id">Related Project</Label>
                                                    <Select
                                                        value={data.tech_transfer_id.toString()}
                                                        onValueChange={(value) => handleSelectChange('tech_transfer_id', value)}
                                                    >
                                                        <SelectTrigger className="mt-1 w-full">
                                                            <SelectValue placeholder="Select Project" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {techTransfers.map((tech_transfer) => (
                                                                <SelectItem key={tech_transfer.value} value={tech_transfer.value.toString()}>
                                                                    {tech_transfer.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.tech_transfer_id} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Delivery Mode</Label>
                                                    <Select
                                                        value={data.modality}
                                                        onValueChange={(value) => handleSelectChange('modality', value)}
                                                    >
                                                        <SelectTrigger className="mt-1 w-full">
                                                            <SelectValue placeholder="Select delivery mode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="TV">Television</SelectItem>
                                                                <SelectItem value="Radio">Radio</SelectItem>
                                                                <SelectItem value="Online">Online</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.modality} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Air Time / Schedule</Label>
                                                    <Input
                                                        id="time_air"
                                                        value={data.time_air}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="e.g., 8:00 AM - 9:00 AM"
                                                    />
                                                    <InputError message={errors.time_air} />
                                                </div>
                                                <div >
                                                    <Label className="text-sm font-light">Period / Duration</Label>
                                                    <Input
                                                        id="period"
                                                        value={data.period}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="e.g., 1 month, 6 weeks"
                                                    />
                                                    <InputError message={errors.period} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Media Channels */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Tv className="h-5 w-5" />
                                                Media Channels
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">TV Channel</Label>
                                                    <Input
                                                        id="tv_channel"
                                                        value={data.tv_channel}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter TV channel name"
                                                    />
                                                    <InputError message={errors.tv_channel} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Radio Station</Label>
                                                    <Input
                                                        id="radio"
                                                        value={data.radio}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter radio station name"
                                                    />
                                                    <InputError message={errors.radio} />
                                                </div>
                                                <div className='col-span-2'>
                                                    <Label className="text-sm font-light">Online Link / Platform</Label>
                                                    <Input
                                                        id="online_link"
                                                        value={data.online_link}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter URL or platform name"
                                                    />
                                                    <InputError message={errors.online_link} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Partnership Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building className="h-5 w-5" />
                                                Partnership & Organization
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Partner Agency</Label>
                                                    <Input
                                                        id="partner_agency"
                                                        value={data.partner_agency}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter partner agency name"
                                                    />
                                                    <InputError message={errors.partner_agency} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Hosted By</Label>
                                                    <Input
                                                        id="hosted_by"
                                                        value={data.hosted_by}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter hosting organization"
                                                    />
                                                    <InputError message={errors.hosted_by} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Institution Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building className="h-5 w-5" />
                                                Department
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium">Campus</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {modality?.tech_transfer.college.campus.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(modality.tech_transfer.college.campus.logo)} alt="Campus logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm font-medium">{modality?.tech_transfer.college.campus.name}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium">College</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {modality?.tech_transfer.college.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(modality.tech_transfer.college.logo)} alt="College logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{modality?.tech_transfer.college.name}</span>
                                                        <span className="text-xs text-muted-foreground">{modality?.tech_transfer.college.code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Record Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Record Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Created</span>
                                                    <div className='flex flex-col items-end'>
                                                        <span>{new Date(modality.created_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(modality.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Last Updated</span>
                                                    <div className='flex flex-col items-end'>
                                                        <span>{new Date(modality.updated_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(modality.updated_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Created By</span>
                                                    <span>{modality?.user.first_name + ' ' + modality?.user.last_name}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Modality not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}