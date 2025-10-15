import React, { useState, useEffect } from 'react';
import { Building, LoaderCircle, Radio, Tv } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserModalitiesCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [activeTab, setActiveTab] = useState('basic-information');
    const [techTransfers, setTechTransfers] = useState<any[]>([]);

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
        const fetchTechTransfers = async () => {
            try {
                const response = await api.get('/user/tech-transfers');
                setTechTransfers(response.data.data || []);
            } catch (err: any) {
                toast.error('Failed to load tech transfers');
                console.error(err);
            }
        };

        fetchTechTransfers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/modalities', data);
            toast.success('Modality created successfully!');
            navigate('/user/modalities');
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
        { title: 'Add New Modality', href: '/user/modalities/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Add New Modality</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="basic-information" className="text-sm">
                                Basic Information
                            </TabsTrigger>
                            <TabsTrigger value="media-channel" className="text-sm">
                                Media Channels
                            </TabsTrigger>
                            <TabsTrigger value="partnership-details" className="text-sm">
                                Partnership Details
                            </TabsTrigger>
                        </TabsList>

                        {/* Modality Details Tab */}
                        <TabsContent value="basic-information" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Radio className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Technology Transfer Project</Label>
                                            <Select
                                                value={data.tech_transfer_id}
                                                onValueChange={(value) => {
                                                    setData(prev => ({ ...prev, tech_transfer_id: value }));
                                                }}
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

                                        <div className="space-y-2">
                                            <Label htmlFor="modality">
                                                Delivery Mode
                                            </Label>
                                            <Select
                                                value={data.modality}
                                                onValueChange={(value) => {
                                                    setData(prev => ({ ...prev, modality: value }));
                                                }}
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

                                        <div className="space-y-2">
                                            <Label htmlFor="time_air">
                                                Air Time / Schedule
                                            </Label>
                                            <Input
                                                id="time_air"
                                                value={data.time_air}
                                                onChange={handleChange}
                                                placeholder="e.g., 8:00 AM - 9:00 AM"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.time_air} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="media-channel" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tv className="h-5 w-5" />
                                        Media Channels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tv_channel">TV Channel</Label>
                                            <Input
                                                id="tv_channel"
                                                value={data.tv_channel}
                                                onChange={handleChange}
                                                placeholder="Enter TV channel name"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.tv_channel} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="radio">Radio Station</Label>
                                            <Input
                                                id="radio"
                                                value={data.radio}
                                                onChange={handleChange}
                                                placeholder="Enter radio station name"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.radio} />
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="online_link">Online Link / Platform</Label>
                                            <Input
                                                id="online_link"
                                                value={data.online_link}
                                                onChange={handleChange}
                                                placeholder="Enter URL or platform name"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.online_link} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="partnership-details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Partnership Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="period">Period / Duration</Label>
                                            <Input
                                                id="period"
                                                value={data.period}
                                                onChange={handleChange}
                                                placeholder="e.g., 1 month, 6 weeks"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.period} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hosted_by">Hosted By</Label>
                                            <Input
                                                id="hosted_by"
                                                value={data.hosted_by}
                                                onChange={handleChange}
                                                placeholder="Enter host organization"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.hosted_by} />
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="partner_agency">Partner Agency</Label>
                                            <Input
                                                id="partner_agency"
                                                value={data.partner_agency}
                                                onChange={handleChange}
                                                placeholder="Enter partner agency name"
                                                className="h-10"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.partner_agency} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Form
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
