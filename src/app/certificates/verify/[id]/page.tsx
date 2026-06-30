import React from 'react';
import VerifyClient from './VerifyClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
  const { id } = await params;
  return <VerifyClient certificateId={id} />;
}
