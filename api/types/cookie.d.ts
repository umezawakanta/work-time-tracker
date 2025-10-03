declare module 'cookie' {
  export function serialize(name: string, value: string, options?: any): string;
  export function parse(str: string, options?: any): { [key: string]: string };
}
