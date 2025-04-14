// Content remains the same as before
interface Window {
  ethereum?: any;
}

declare module '@metamask/jazzicon' {
  export default function(diameter: number, seed: number): HTMLElement;
}
