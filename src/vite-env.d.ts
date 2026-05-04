/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_BUILD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
