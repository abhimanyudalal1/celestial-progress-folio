// Type declarations for GSAP loaded via CDN

interface GSAPTween {
  kill(): void;
  pause(): this;
  play(): this;
  restart(): this;
  reverse(): this;
  seek(position: number | string): this;
  timeScale(value?: number): number | this;
  progress(value?: number): number | this;
  duration(value?: number): number | this;
}

interface GSAPTimeline extends GSAPTween {
  add(child: any, position?: number | string): this;
  to(targets: any, vars: any, position?: number | string): this;
  from(targets: any, vars: any, position?: number | string): this;
  fromTo(targets: any, fromVars: any, toVars: any, position?: number | string): this;
  clear(): this;
}

interface ScrollTriggerConfig {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string | Element;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: any) => void;
  onToggle?: (self: any) => void;
  toggleActions?: string;
  snap?: number | number[] | { snapTo: number | string; duration?: number };
  anticipatePin?: number;
  pinSpacing?: boolean | string;
  invalidateOnRefresh?: boolean;
  refreshPriority?: number;
}

interface ScrollTriggerInstance {
  kill(): void;
  refresh(): void;
  update(): void;
  enable(): void;
  disable(): void;
  progress(value?: number): number;
  scroll(value?: number): number;
}

interface ScrollTriggerStatic {
  create(config: ScrollTriggerConfig): ScrollTriggerInstance;
  refresh(): void;
  update(): void;
  getById(id: string): ScrollTriggerInstance | undefined;
  getAll(): ScrollTriggerInstance[];
  clearMatchMedia(): void;
  matchMedia(config: Record<string, any>): void;
}

interface MotionPathConfig {
  path?: string | Element | any[];
  align?: string | Element;
  alignOrigin?: [number, number];
  autoRotate?: boolean | number;
  start?: number;
  end?: number;
  offsetX?: number;
  offsetY?: number;
  [key: string]: any;
}

interface MotionPathStatic {
  convertToPath(targets: any, swap?: boolean): any[];
  getRawPath(value: any): any[];
  stringToRawPath(d: string): any[];
  rawPathToString(rawPath: any[]): string;
  getGlobalMatrix(element: Element): any;
  getPositionOnPath(path: any, progress: number, includeAngle?: boolean): any;
  cacheRawPathMeasurements(rawPath: any[], resolution?: number): void;
  [key: string]: any;
}

interface GSAPStatic {
  to(targets: any, vars: any): GSAPTween;
  from(targets: any, vars: any): GSAPTween;
  fromTo(targets: any, fromVars: any, toVars: any): GSAPTween;
  set(targets: any, vars: any): GSAPTween;
  timeline(vars?: any): GSAPTimeline;
  registerPlugin(...plugins: any[]): void;
  utils: {
    toArray(targets: any): any[];
    selector(selector: string): any;
    [key: string]: any;
  };
  ScrollTrigger: ScrollTriggerStatic;
  MotionPathPlugin: MotionPathStatic;
  [key: string]: any;
}

declare global {
  interface Window {
    gsap: GSAPStatic;
    ScrollTrigger: ScrollTriggerStatic;
    MotionPathPlugin: MotionPathStatic;
  }
}

export {};
