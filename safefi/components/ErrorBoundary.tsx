"use client";
import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { fallback: ReactNode; onError?: (e: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    this.props.onError?.(e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
