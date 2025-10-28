import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

type Campus = {
    id: number;
    name: string;
};

type College = {
    id: number;
    name: string;
};

type FilterComponentProps = {
    onFilterChange?: (filters: {
        userType: string;
        campus: string;
        college: string;
    }) => void;
};

export function FilterComponent({ onFilterChange }: FilterComponentProps) {
    const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
    const [campusFilter, setCampusFilter] = useState<string>("all");
    const [collegeFilter, setCollegeFilter] = useState<string>("all");
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);

    // Fetch campuses and colleges
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [campusesRes, collegesRes] = await Promise.all([
                    api.get('/campuses'),
                    api.get('/colleges')
                ]);
                setCampuses(campusesRes.data.data || []);
                setColleges(collegesRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch filter data:', error);
            }
        };
        fetchFilterData();
    }, []);

    // Notify parent of filter changes
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                userType: userTypeFilter,
                campus: campusFilter,
                college: collegeFilter,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userTypeFilter, campusFilter, collegeFilter]);

    const handleUserTypeFilterChange = (value: string) => {
        setUserTypeFilter(value);
    };

    const handleCampusFilterChange = (value: string) => {
        setCampusFilter(value);
    };

    const handleCollegeFilterChange = (value: string) => {
        setCollegeFilter(value);
    };

    const clearFilters = () => {
        setUserTypeFilter("all");
        setCampusFilter("all");
        setCollegeFilter("all");
    };

    const hasActiveFilters = userTypeFilter !== "all" || campusFilter !== "all" || collegeFilter !== "all";

    return (
        <div className="flex items-center space-x-2">
            <Select value={userTypeFilter} onValueChange={handleUserTypeFilterChange}>
                <SelectTrigger className="w-[120]">
                    <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">CESU</SelectItem>
                </SelectContent>
            </Select>

            <Select value={campusFilter} onValueChange={handleCampusFilterChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id.toString()}>
                            {campus.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={collegeFilter} onValueChange={handleCollegeFilterChange}>
                <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                            {college.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-8 px-2 lg:px-3"
                >
                    Clear
                </Button>
            )}
        </div>
    );
}