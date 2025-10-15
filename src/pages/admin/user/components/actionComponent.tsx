import { Button } from "@/components/ui/button";
import { Plus, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "@/types";

type ActionComponentProps = {
    selectedUsers: User[];
    onActivateSelected: () => void;
    onDeactivateSelected: () => void;
};

export function ActionComponent({ selectedUsers, onActivateSelected, onDeactivateSelected }: ActionComponentProps) {
    return (
        <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
                <>
                    <Button
                        onClick={onActivateSelected}
                        size="sm"
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate ({selectedUsers.length})
                    </Button>
                    <Button
                        onClick={onDeactivateSelected}
                        size="sm"
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                    >
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate ({selectedUsers.length})
                    </Button>
                </>
            )}
            <Link to="/admin/users/create">
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </Link>
        </div>
    );
}