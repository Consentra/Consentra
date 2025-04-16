
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}
