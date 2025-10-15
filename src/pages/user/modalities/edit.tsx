import React, { useEffect, useState } from 'react';
import { LoaderCircle, Radio, Tv, Folder, Building } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Modalities } from '@/types';

export default function UserModalityEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [modality, setModality] = useState<Modalities | null>(null);
    const [techTransfers, setTechTransfers] = useState<any[]>([]);
    const [processing, setProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
            try {
                // Fetch modality details
                const modalityResponse = await api.get(`/modalities/${id}`);
                const modalityData = modalityResponse.data.data;

                setData({
                    tech_transfer_id: modalityData.tech_transfer_id || '',
                    modality: modalityData.modality || '',
                    tv_channel: modalityData.tv_channel || '',
                    radio: modalityData.radio || '',
                    online_link: modalityData.online_link || '',
                    time_air: modalityData.time_air || '',
                    period: modalityData.period || '',
                    partner_agency: modalityData.partner_agency || '',
                    hosted_by: modalityData.hosted_by || '',
                });
                setModality(modalityData);

                // Fetch user's tech transfers
                const techTransfersResponse = await api.get('/user/tech-transfers');
                setTechTransfers(techTransfersResponse.data.data || []);
            } catch (err: any) {
                toast.error('Failed to load data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.put(`/modalities/${id}`, data);
            toast.success('Modality updated successfully!');
            navigate(`/user/modalities/${id}`);
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Modalities', href: '/user/modalities' },
        { title: 'Edit Modality', href: `/user/modalities/${id}/edit` },
    ];

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <form onSubmit={handleSubmit}>
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-medium">Edit Modality</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                variant="default"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Modality Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
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
                                                value={modality?.id}
                                                readOnly
                                                className="mt-1 bg-muted"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Delivery Mode</Label>
                                            <Select
                                                value={modality?.modality}
                                                onValueChange={(value) => setData(prev => ({ ...prev, modality: value }))}
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
                                        <div className='col-span-2'>
                                            <Label className="text-sm font-light">Air Time / Schedule</Label>
                                            <Input
                                                id='time_air'
                                                value={data.time_air}
                                                onChange={handleChange}
                                                className="mt-1"
                                                placeholder="e.g., 8:00 AM - 9:00 AM"
                                            />
                                            <InputError message={errors.time_air} />
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
                                                id='tv_channel'
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
                                                id='radio'
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
                                                id='online_link'
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
                                        Partnership Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-light">Period / Duration</Label>
                                            <Input
                                                id='period'
                                                value={data.period}
                                                onChange={handleChange}
                                                className="mt-1"
                                                placeholder="e.g., 1 month, 6 weeks"
                                            />
                                            <InputError message={errors.period} />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Hosted By</Label>
                                            <Input
                                                id='hosted_by'
                                                value={data.hosted_by}
                                                onChange={handleChange}
                                                className="mt-1"
                                                placeholder="Enter host organization"
                                            />
                                            <InputError message={errors.hosted_by} />
                                        </div>
                                        <div className='col-span-2'>
                                            <Label className="text-sm font-light">Partner Agency</Label>
                                            <Input
                                                id='partner_agency'
                                                value={data.partner_agency}
                                                onChange={handleChange}
                                                className="mt-1"
                                                placeholder="Enter partner agency name"
                                            />
                                            <InputError message={errors.partner_agency} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Folder className="h-5 w-5" />
                                        Related Project
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label className="text-sm font-light">Technology Transfer Project</Label>
                                            <Select
                                                value={data.tech_transfer_id.toString()}
                                                onValueChange={(value) => setData(prev => ({ ...prev, tech_transfer_id: value }))}
                                            >
                                                <SelectTrigger className="mt-1 w-full">
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {techTransfers.map((techTransfer) => (
                                                            <SelectItem
                                                                key={techTransfer.id}
                                                                value={techTransfer.id.toString()}
                                                            >
                                                                {techTransfer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.tech_transfer_id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
