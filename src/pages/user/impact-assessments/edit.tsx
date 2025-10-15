import React, { useEffect, useState } from 'react';
import { LoaderCircle, Target, Users, Folder } from 'lucide-react';
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
import type { ImpactAssessment } from '@/types';

export default function UserImpactAssessmentEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [assessment, setAssessment] = useState<ImpactAssessment | null>(null);
    const [techTransfers, setTechTransfers] = useState<any[]>([]);

    const [processing, setProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<any>({});

    const [data, setData] = useState({
        tech_transfer_id: '',
        beneficiary: '',
        geographic_coverage: '',
        num_direct_beneficiary: 0,
        num_indirect_beneficiary: 0,
    });

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const response = await api.get(`/impact-assessments/${id}`);
                const assessment = response.data.data;
                setData({
                    tech_transfer_id: assessment.tech_transfer_id || '',
                    beneficiary: assessment.beneficiary || '',
                    geographic_coverage: assessment.geographic_coverage || '',
                    num_direct_beneficiary: assessment.num_direct_beneficiary || 0,
                    num_indirect_beneficiary: assessment.num_indirect_beneficiary || 0,
                });
                setAssessment(assessment);
                const techTransfersResponse = await api.get('/user/tech-transfers');
                setTechTransfers(techTransfersResponse.data.data || []);
            } catch (err: any) {
                toast.error('Failed to load impact assessment');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessment();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setData((prev) => ({
            ...prev,
            [id]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.put(`/impact-assessments/${id}`, data);
            toast.success('Impact assessment updated successfully!');
            navigate(`/user/impact-assessments/${id}`);
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
        { title: 'Edit Assessment', href: `/user/impact-assessments/${id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading partnership details...
                </div>
            ) : (
                assessment ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl font-medium">Edit Assessment</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Engagement Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="h-5 w-5" />
                                                Basic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Assessment ID</Label>
                                                    <Input
                                                        value={assessment?.id}
                                                        readOnly
                                                        className="mt-1 bg-muted"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Beneficiary</Label>
                                                    <Input
                                                        id='beneficiary'
                                                        value={data.beneficiary}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.beneficiary} />
                                                </div>
                                                <div className='col-span-2'>
                                                    <Label className="text-sm font-light">Geographic Coverage</Label>
                                                    <Input
                                                        id='geographic_coverage'
                                                        value={data.geographic_coverage}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.geographic_coverage} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Impact Metrics */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Impact Metrics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Direct Beneficiary</Label>
                                                    <Input
                                                        id='num_direct_beneficiary'
                                                        value={data.num_direct_beneficiary}
                                                        type='number'
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.num_direct_beneficiary} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Indirect Beneficiary</Label>
                                                    <Input
                                                        id='num_indirect_beneficiary'
                                                        value={data.num_indirect_beneficiary}
                                                        type='number'
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.num_indirect_beneficiary} />
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
                                                <Select
                                                    value={data.tech_transfer_id.toString()}
                                                    onValueChange={(value) => setData(prev => ({ ...prev, tech_transfer_id: value }))}
                                                >
                                                    <SelectTrigger className='w-full'>
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
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Assessment not found.
                    </div>
                )
            )}
        </AppLayout>
    );
}
