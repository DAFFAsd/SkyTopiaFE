import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actionButton?: React.ReactNode;
}

export default function PageHeader({ title, description, actionButton }: PageHeaderProps) {
    return (
        <div className="mb-8 flex items-start justify-between">
            <div>
                <h1 className="font-rammetto text-3xl text-brand-purple">
                    {title}
                </h1>
                {description && (
                    <p className="text-gray-600 mt-2 font-poppins">
                        {description}
                    </p>
                )}
            </div>
            {actionButton && (
                <div className="flex-shrink-0">
                    {actionButton}
                </div>
            )}
        </div>
    );
}
