declare module 'react-dom/client' {
  import * as React from 'react';

  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment, options?: {
    unstable_strictMode?: boolean;
    identifierPrefix?: string;
    onRecoverableError?: (error: unknown) => void;
  }): Root;

  export function hydrateRoot(
    container: Element | DocumentFragment,
    initialChildren: React.ReactNode,
    options?: {
      onRecoverableError?: (error: unknown) => void;
      identifierPrefix?: string;
    }
  ): Root;
}
