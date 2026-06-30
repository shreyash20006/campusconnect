import React from 'react';
import { MOCK_EVENTS } from '@/lib/data';
import EventRegisterClient from './EventRegisterClient';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RegisterPage({ params }: PageProps) {
  const { id } = await params;
  
  // Find event (defaults to mock seed list)
  const event = MOCK_EVENTS.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return <EventRegisterClient event={event} />;
}

// Generate static params for fast SSR pre-rendering
export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    id: event.id,
  }));
}
