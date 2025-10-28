import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function UserModalitiesCreate() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
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

    const steps = [
        { title: "Modality Information", icon: Radio },
    ];

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
        { title: 'New Modality', href: '/user/modalities/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-medium">New Modality</h1>
                </div>

                <div className="flex justify-center max-w-3xl mx-auto w-full">
                    {steps.map((s, index) => {
                        const Icon = s.icon;
                        const isActive = true;
                        return (
                            <div key={index} className="flex flex-col items-center w-1/3 text-center">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-12 h-12 rounded-full border-2",
                                        isActive
                                            ? "border-orange-600 bg-orange-50 text-orange-600"
                                            : "border-gray-300 text-gray-400",
                                    )}
                                >
                                    <Icon size={24} />
                                </div>
                                <p className={`mt-2 text-sm ${isActive ? "text-orange-600" : "text-gray-500"}`}>
                                    {s.title}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <Card className="max-w-3xl mx-auto w-full border-1 border-orange-500/50">
                    <CardContent>
                        <div className={cn("grid gap-6 md:grid-cols-2")}>
                            <div className="space-y-2 col-span-2">
                                <Label>Technology Transfer Project<span className="text-red-500">*</span></Label>
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
                                    Delivery Mode<span className="text-red-500">*</span>
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
                                    Air Time
                                </Label>
                                <Input
                                    id="time_air"
                                    value={data.time_air}
                                    onChange={handleChange}
                                    placeholder="e.g., 8:00 AM - 9:00 AM"
                                    disabled={processing}
                                />
                                <InputError message={errors.time_air} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tv_channel">TV Channel</Label>
                                <Input
                                    id="tv_channel"
                                    value={data.tv_channel}
                                    onChange={handleChange}
                                    placeholder="Enter TV channel name"
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
                                    disabled={processing}
                                />
                                <InputError message={errors.radio} />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="online_link">Online Link</Label>
                                <Input
                                    id="online_link"
                                    value={data.online_link}
                                    onChange={handleChange}
                                    placeholder="Enter URL"
                                    disabled={processing}
                                />
                                <InputError message={errors.online_link} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Period<span className="text-red-500">*</span></Label>
                                <Input
                                    id="period"
                                    value={data.period}
                                    onChange={handleChange}
                                    placeholder="e.g., 1 month, 6 weeks"
                                    disabled={processing}
                                />
                                <InputError message={errors.period} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hosted_by">Hosted By<span className="text-red-500">*</span></Label>
                                <Input
                                    id="hosted_by"
                                    value={data.hosted_by}
                                    onChange={handleChange}
                                    placeholder="Enter host organization"
                                    disabled={processing}
                                />
                                <InputError message={errors.hosted_by} />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="partner_agency">Partner Agency<span className="text-red-500">*</span></Label>
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

                {/* Navigation buttons */}
                <div className="flex justify-end max-w-3xl mx-auto w-full">
                    <Button onClick={handleSubmit} className='bg-orange-500 hover:bg-orange-600'>Submit</Button>
                </div>
            </div>
        </AppLayout>
    );
}
