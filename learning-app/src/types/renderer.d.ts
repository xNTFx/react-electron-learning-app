export interface IElectronAPI {
  invoke(arg0: string): string[];
  receive(
    arg0: string,
    arg1: (success: boolean, message: string) => void,
  ): unknown;
  send(
    arg0: string,
    arg1: { filePath?: string; uniqueFilename: string; fileType?: string },
  ): unknown;
  loadPreferences: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: {
      send(arg0: string, arg1: { uniqueFilename: string }): unknown;
      send(
        arg0: string,
        arg1: { filePath: string; uniqueFilename: string; fileType: string },
      ): unknown;
      receive(
        arg0: string,
        arg1: (success: boolean, message: string) => void,
      ): () => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<>;
    };
  }
}


export {};
