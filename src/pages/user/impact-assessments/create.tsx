import React, { useState, useEffect } from 'react';
import { LoaderCircle, ScrollText } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';

export default function UserImpactAssessmentsCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [activeTab, setActiveTab] = useState('assessment-details');
    const [techTransfers, setTechTransfers] = useState<any[]>([]);

    const [data, setData] = useState({
        tech_transfer_id: '',
        beneficiary: '',
        geographic_coverage: '',
        num_direct_beneficiary: '',
        num_indirect_beneficiary: '',
    });

    useEffect(() => {
        const fetchTechTransfers = async () => {
            try {
                const response = await api.get('/user/tech-transfers');
                setTechTransfers(response.data.data);
            } catch (err) {
                console.error('Failed to fetch tech transfers:', err);
                toast.error('Failed to load projects');
            }
        };

        fetchTechTransfers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/impact-assessments', data);
            toast.success('Impact assessment created successfully!');
            navigate('/user/impact-assessments');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Impact Assessments', href: '/user/impact-assessments' },
        { title: 'Add New Assessment', href: '/user/impact-assessments/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Create New Impact Assessment</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabbed Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="assessment-details" className="text-sm">
                                Assessment Details
                            </TabsTrigger>
                        </TabsList>

                        {/* Assessment Details Tab */}
                        <TabsContent value="assessment-details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ScrollText className="h-5 w-5" />
                                        Assessment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="beneficiary">
                                                Beneficiary
                                            </Label>
                                            <Input
                                                id="beneficiary"
                                                value={data.beneficiary}
                                                onChange={handleChange}
                                                placeholder="Enter beneficiary type (e.g., farmers, SMEs, local government, schools)"
                                                className="h-10"
                                                required
                                                disabled={processing}
                                            />
                                            <InputError message={errors.beneficiary} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="geographic_coverage">Geographic Coverage</Label>
                                            <Input
                                                id="geographic_coverage"
                                                value={data.geographic_coverage}
                                                onChange={handleChange}
                                                placeholder="Enter geographic coverage"
                                                className="h-10"
                                                required
                                                disabled={processing}
                                            />
                                            <InputError message={errors.geographic_coverage} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="num_direct_beneficiary">Direct Beneficiary</Label>
                                            <Input
                                                id="num_direct_beneficiary"
                                                value={data.num_direct_beneficiary}
                                                type='number'
                                                onChange={handleChange}
                                                placeholder="Enter Organization/Institution"
                                                disabled={processing}
                                                required
                                            />
                                            <InputError message={errors.num_direct_beneficiary} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="num_indirect_beneficiary">Indirect Beneficiary</Label>
                                            <Input
                                                id="num_indirect_beneficiary"
                                                value={data.num_indirect_beneficiary}
                                                type='number'
                                                onChange={handleChange}
                                                placeholder="Enter Organization/Institution"
                                                disabled={processing}
                                                required
                                            />
                                            <InputError message={errors.num_indirect_beneficiary} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label>Project</Label>
                                            <Select
                                                value={data.tech_transfer_id ? data.tech_transfer_id : ''}
                                                onValueChange={(value) => {
                                                    setData((prev) => ({ ...prev, tech_transfer_id: value }));
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
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
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
