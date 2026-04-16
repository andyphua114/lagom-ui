import { useEffect, useRef } from "react";

export function useAutoScroll(dependencies: readonly unknown[]) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, dependencies);

  return containerRef;
}
