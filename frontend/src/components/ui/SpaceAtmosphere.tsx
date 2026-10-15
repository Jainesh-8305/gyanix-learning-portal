'use client';

import dynamic from 'next/dynamic';

const SpaceCanvasBackground = dynamic(() => import('./SpaceCanvasBackground'), {
  ssr: false,
});
const CosmicCursor = dynamic(() => import('./CosmicCursor'), { ssr: false });

export default function SpaceAtmosphere() {
  return (
    <>
      <SpaceCanvasBackground />
      <CosmicCursor />
    </>
  );
}
