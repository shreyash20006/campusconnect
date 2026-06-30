import React from 'react';
import { MOCK_EVENTS } from '@/lib/data';
import EventDetailsClient from './EventDetailsClient';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  
  // Find event (defaults to mock seed list)
  const event = MOCK_EVENTS.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return <EventDetailsClient event={event} />;
}

// Generate static params for fast SSR generation of mock events
export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    id: event.id,
  }));
}
