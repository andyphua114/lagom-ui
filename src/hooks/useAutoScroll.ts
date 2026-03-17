import { useEffect, useRef } from 'react';

export function useAutoScroll(dependencies: readonly unknown[]) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, dependencies);

  return endRef;
}
