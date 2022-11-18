import { FC } from 'react';
import { state } from '@/store';
import assets from '@/assets';
import store from '@/store';
import { send } from '@/store/hook';
import { Filters } from '@/components/Canvas';

declare global {
  declare const env: {[key: string]: string};

  type ValueOf<T> = T[keyof T];
  
  type Pages = {[pageName: string]: FC<{
    pageProps: {
      assets: typeof assets;
      store: typeof store;
      state: typeof state;
      send: typeof send;
    }
  }>}

  type NodeCommonProps = {
    print?: string | {src: string; quantity?: number; delay?: number};
    clickgoto?: string | Symbol;
    delaygoto?: {delay: number; next: string | Symbol;};
    forcegoto?: {delay: number; next: string | Symbol;};
  };

  type NodeProps = {
    className?: string;
    style?: CSSProperties;
    actions?: NodeSendActions[];
    onClick?: () => void;
  } & NodeCommonProps

  type NodeFC<T> = FC<T & NodeProps>

  type NodeActions = {
    goto: {next: string | Symbol};
    clickgoto: {next: string | Symbol};
    delaygoto: {next: string | Symbol, delay: number};
    connectcanvas: {src: string; save?: string; target: HTMLCanvasElement; options: {
      width?: number;
      height?: number;
      flipX?: boolean;
      crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      filter?: Filters;
      colorize?: string;
    }}
  }

  type NodeActionParams = {
    [K in keyof NodeActions]: {type: K} & NodeActions[K]
  };
  type NodeSendActions = ValueOf<NodeActionParams>;

  type SendHandler = Partial<{
    [K in keyof NodeActions]: (params: NodeActions[K]) => void
  }>;
}