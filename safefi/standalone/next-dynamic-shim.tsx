// Stand-in for next/dynamic in the single-file build: renders nothing on the
// server, then loads the component on the client after mount.
import { useEffect, useState, type ComponentType } from "react";

export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>) {
  return function Dynamic(props: P) {
    const [C, setC] = useState<ComponentType<P> | null>(null);
    useEffect(() => {
      loader().then((m) => setC(() => m.default));
    }, []);
    return C ? <C {...props} /> : null;
  };
}
