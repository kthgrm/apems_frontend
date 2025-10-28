export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    isDropdown?: boolean;
    subItems?: NavItem[];
    items?: NavItem[];
    isGroup?: boolean;
}

export interface User {
    avatar?: string;
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    college_id: number
    college: College
}

export interface Campus {
    id: number;
    name: string;
    logo: string;
    created_at: string;
    updated_at: string;
}

export interface College {
    id: number;
    name: string;
    code: string;
    logo: string;

    campus_id: number;
    campus: Campus;

    created_at: string;
    updated_at: string;
}

export interface TechnologyTransfer {
    id: number;
    name: string;
    description: string;
    category: string;
    purpose: string;
    start_date: string;
    end_date: string;
    tags: string;
    leader: string;
    deliverables?: string | null;
    agency_partner: string;
    contact_person: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    copyright: 'yes' | 'no' | 'pending';
    ip_details?: string | null;
    is_assessment_based: boolean;
    monitoring_evaluation_plan?: string | null;
    sustainability_plan?: string | null;
    reporting_frequency: number;

    attachment_paths?: string[] | null;
    attachment_link?: string | null;

    user_id: number;
    user: User;

    college_id: number;
    college: College;

    is_archived?: boolean;

    created_at: string;
    updated_at: string;
}

export interface Resolution {
    id: number;
    user_id: number;
    user: User;
    title: string;
    attachment_paths?: string[];
    is_archived?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Engagement {
    id: number;
    user_id: number;
    user: User;
    college_id: number;
    college: College;

    agency_partner: string;
    location: string;
    activity_conducted: string;
    start_date: string;
    end_date: string;
    number_of_participants: number;
    faculty_involved: string;
    narrative: string;

    attachment_paths?: string[] | null;
    attachment_link?: string | null;
    is_archived: boolean;

    created_at: string;
    updated_at: string;
}

export interface Award {
    id: number;
    user_id: number;
    user: User;
    college_id: number;
    college: College;

    award_name: string;
    description: string;
    date_received: string;
    
    event_details: string;
    location: string;
    awarding_body: string;
    people_involved: string;

    attachment_paths?: string[] | null;
    attachment_link?: string | null;
    is_archived: boolean;

    created_at: string;
    updated_at: string;
}

export interface ImpactAssessment {
    id: number;

    user_id: string;
    user: User;

    tech_transfer_id: string;
    tech_transfer: TechnologyTransfer;

    beneficiary: string;
    num_direct_beneficiary: number;
    num_indirect_beneficiary: number;
    geographic_coverage: string;
    is_archived: boolean;

    created_at: string;
    updated_at: string;
}

export interface Modalities {
    id: number;

    user_id: string;
    user: User;

    tech_transfer_id: string;
    tech_transfer: TechnologyTransfer;
    
    modality: string;
    tv_channel?: string | null;
    radio?: string | null;
    online_link?: string | null;
    time_air: string;
    period: string;
    partner_agency: string;
    hosted_by: string;
    is_archived: boolean;

    created_at: string;
    updated_at: string;
}