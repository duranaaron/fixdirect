import { Link } from '@inertiajs/react';
import { MapPin, Calendar, Wallet, Hammer } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function JobCard({
    id,
    title,
    description,
    category,
    address,
    date,
    compensation,
    poster,
    image,
}: {
    id?: number;
    title?: string;
    description?: string;
    category?: string;
    address?: string;
    date?: string;
    compensation?: string;
    poster?: string;
    image?: string | null;
}) {
    return (
        <Card className="max-w-2xl overflow-hidden rounded-2xl border-gray-200 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    <div className="h-48 w-full shrink-0 bg-neutral-100 sm:h-auto sm:w-48">
                        {image ? (
                            <img
                                src={image}
                                alt={title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                <Hammer size={40} className="opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-6">
                        <div className="mb-2 flex items-start justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{title}</h2>
                            <Badge
                                variant="secondary"
                                className="shrink-0 rounded-full border-none bg-blue-50 px-4 py-1.5 font-medium text-blue-600 hover:bg-blue-50"
                            >
                                {category}
                            </Badge>
                        </div>

                        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-500">
                            {description}
                        </p>

                        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
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

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-sm text-gray-400">
                                Gepost door {poster}
                            </span>
                            <Button asChild className="rounded-full bg-[#4A90E2] px-6 text-white hover:bg-[#357ABD]">
                                <Link href={id ? `/jobs/${id}` : '#'}>
                                    Bekijk details
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}