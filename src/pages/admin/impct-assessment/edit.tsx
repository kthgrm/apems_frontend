import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { ImpactAssessment } from '@/types';
import { Building, Users } from 'lucide-react';
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ImpactAssessmentEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState<ImpactAssessment | null>(null);
    const [techTransfers, setTechTransfers] = useState<Array<{ value: number; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        tech_transfer_id: '',
        beneficiary: '',
        geographic_coverage: '',
        num_direct_beneficiary: 0,
        num_indirect_beneficiary: 0,
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

                // Fetch assessment details
                const response = await api.get(`impact-assessments/${id}`);
                const assessmentData = response.data.data;
                setAssessment(assessmentData);

                // Populate form with fetched data
                setData({
                    tech_transfer_id: assessmentData?.tech_transfer_id?.toString() || '',
                    beneficiary: assessmentData?.beneficiary || '',
                    geographic_coverage: assessmentData?.geographic_coverage || '',
                    num_direct_beneficiary: assessmentData?.num_direct_beneficiary || 0,
                    num_indirect_beneficiary: assessmentData?.num_indirect_beneficiary || 0,
                });
            } catch (error) {
                console.error('Failed to fetch assessment data', error);
                toast.error('Failed to load assessment data');
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
            await api.put(`/impact-assessments/${id}`, data);

            toast.success('Assessment updated successfully!');
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
            title: 'Impact Assessments',
            href: '/admin/impact-assessment',
        },
        {
            title: isLoading ? 'Loading...' : assessment ? assessment.tech_transfer.name : 'Not Found',
            href: `/admin/impact-assessment/${id}`,
        },
        {
            title: 'Edit',
            href: `/admin/impact-assessment/${id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading assessment details...
                </div>
            ) : (
                assessment ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Assessment</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update Assessment'}
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
                                {/* Main Assessment Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Assessment Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Assessment Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Assessment ID</Label>
                                                <Input value={assessment.id} readOnly className="mt-1 bg-muted" />
                                            </div>
                                            <div>
                                                <Label className="text-sm" htmlFor="tech_transfer_id">Related Project</Label>
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
                                                {errors.tech_transfer_id && <InputError message={errors.tech_transfer_id} className="mt-1" />}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium" htmlFor="beneficiary">Primary Beneficiary *</Label>
                                                <Input
                                                    id="beneficiary"
                                                    value={data.beneficiary}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Enter beneficiary information"
                                                />
                                                {errors.beneficiary && <InputError message={errors.beneficiary} className="mt-1" />}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium" htmlFor="geographic_coverage">Geographic Coverage *</Label>
                                                <Input
                                                    id="geographic_coverage"
                                                    value={data.geographic_coverage}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Enter geographic coverage area"
                                                />
                                                {errors.geographic_coverage && <InputError message={errors.geographic_coverage} className="mt-1" />}
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
                                                    <Label className="text-sm font-medium" htmlFor="num_direct_beneficiary">Direct Beneficiaries *</Label>
                                                    <Input
                                                        id="num_direct_beneficiary"
                                                        type="number"
                                                        min="0"
                                                        value={data.num_direct_beneficiary}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="0"
                                                    />
                                                    {errors.num_direct_beneficiary && <InputError message={errors.num_direct_beneficiary} className="mt-1" />}
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium" htmlFor="num_indirect_beneficiary">Indirect Beneficiaries *</Label>
                                                    <Input
                                                        id="num_indirect_beneficiary"
                                                        type="number"
                                                        min="0"
                                                        value={data.num_indirect_beneficiary}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="0"
                                                    />
                                                    {errors.num_indirect_beneficiary && <InputError message={errors.num_indirect_beneficiary} className="mt-1" />}
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
                                                    {assessment?.tech_transfer.college.campus.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(assessment.tech_transfer.college.campus.logo)} alt="Campus logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm font-medium">{assessment?.tech_transfer.college.campus.name}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium">College</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {assessment?.tech_transfer.college.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(assessment.tech_transfer.college.logo)} alt="College logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{assessment?.tech_transfer.college.name}</span>
                                                        <span className="text-xs text-muted-foreground">{assessment?.tech_transfer.college.code}</span>
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
                                                        <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(assessment.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Last Updated</span>
                                                    <div className='flex flex-col items-end'>
                                                        <span>{new Date(assessment.updated_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(assessment.updated_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Created By</span>
                                                    <span>{assessment?.user.first_name + ' ' + assessment?.user.last_name}</span>
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
                        Assessment not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}