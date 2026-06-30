import React from 'react';
import TicketClient from './TicketClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { id } = await params;
  return <TicketClient ticketId={id} />;
}
