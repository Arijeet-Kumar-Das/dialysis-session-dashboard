import type { SessionStatus } from "../../types";

interface StatusBadgeProps {
    status: SessionStatus;
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
    not_started: {
        label: "Not Started",
        className: "bg-slate-100 text-slate-500",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-amber-100 text-amber-700",
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-700",
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
            {config.label}
        </span>
    );
}