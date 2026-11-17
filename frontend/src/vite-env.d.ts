/// <reference types="vite/client" />

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export type Variants = any;
  export type Transition = any;
  export type AnimationControls = any;
  export const useAnimation: any;
  export const useMotionValue: any;
  export const useTransform: any;
  export const useSpring: any;
  export const useScroll: any;
  export const useInView: any;
  export const useDragControls: any;
  export const useVelocity: any;
  export const useReducedMotion: any;
  export const useCycle: any;
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    backgroundColor?: string | null;
    useCORS?: boolean;
    allowTaint?: boolean;
    logging?: boolean;
    imageTimeout?: number;
    removeContainer?: boolean;
    windowWidth?: number;
    windowHeight?: number;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scrollX?: number;
    scrollY?: number;
    onclone?: (clonedDoc: Document) => void;
    ignoreElements?: (element: Element) => boolean;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
