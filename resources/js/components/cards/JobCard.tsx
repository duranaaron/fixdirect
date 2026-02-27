import { MapPin, Calendar, Wallet } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function JobCard({
    title,
    description,
    category,
    address,
    date,
    compensation,
    poster,
}: {
    title?: string;
    description?: string;
    category?: string;
    address?: string;
    date?: string;
    compensation?: string;
    poster?: string;
}) {
    return (
        <Card className="max-w-2xl overflow-hidden rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="p-6">
                {/* Header met Titel en Knoppen */}
                <div className="mb-2 flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <div className="flex gap-2">
                        <Badge
                            variant="secondary"
                            className="rounded-full border-none bg-blue-50 px-4 py-1.5 font-medium text-blue-600 hover:bg-blue-50"
                        >
                            {category}
                        </Badge>
                        <Button className="rounded-full bg-[#4A90E2] px-6 text-white hover:bg-[#357ABD]">
                            Bekijk details
                        </Button>
                    </div>
                </div>

                {/* Beschrijving */}
                <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
                    {description}
                </p>

                {/* Info Sectie: Locatie, Datum, Prijs */}
                <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="text-sm">{address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-sm">{date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Wallet size={18} className="text-orange-500" />
                        <span className="text-sm font-semibold text-orange-500">
                            €{compensation}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-2">
                    <span className="text-sm text-gray-400">
                        Gepost door {poster}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
