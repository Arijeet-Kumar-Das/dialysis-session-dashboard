interface EmptyStateProps {
    title: string;
    description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 14l2 2 4-4" />
                </svg>
            </div>
            <h3 className="text-slate-600 font-semibold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">{description}</p>
        </div>
    );
}