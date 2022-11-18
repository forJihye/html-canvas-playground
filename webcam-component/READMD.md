# Kiosk React 

## 1. 에셋 로더 기능 
외부에서 가져오는 에셋 데이터나, 사용 할 데이터를 로딩하고 저장한다.

```ts
// 저장소 설정 타임
type AssetsConfig = {
  [key: string]: {
    type: 'image'|'video'|'canvas'|'webcam'|'virtualKeyboard'|'string'|'number'|'boolean'|'canvas'|'error';
    data: string|symbol|null|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement;
    options?: any;
  }
}
type Asset = AssetsConfig[keyof AssetsConfig];
type AssetKeys = keyof Asset;
type AssetValues = Asset[AssetKeys];
type AssetType = Asset['type'];
type AssetData = Asset['data'];

// 저장소 데이터 타입
type AssetsStore = Map<string, { type: AssetType; data: AssetData; loaded: boolean; }>
```

-----

## 2 저장소 설정
[에셋 저장소](#1-에셋-로더-기능) 외에 저장소에 키와 데이터를 저장하고, 사용할 때 저장된 키로 데이터를 가져와서 사용한다.

`assets 가변값, state 리액트용 불변값`

> 저장소 타입
```ts
type store = {
  get<T>(key: string) => {type: AssetType, data: T},
  set(key: string, type: AssetType, data: AssetData, options?: any) => void,
  initPath(path: string) => void,
  savePages(pages: string[]) => void
}
```

-----

## 3. 페이지 설정
필요한 모든 페이지의 이름과 React Component를 `Pages` 선언하고, 최상위 루트 `App` 에서 현재 페이지 `(state.path)` 를 찾아서 렌더링 작업.

> 페이지 컴포넌트 props 타입
```ts
type Pages = {[pageName: string]: FC<{
  pageProps: {
    assets: typeof assets;
    store: typeof store;
    state: typeof state;
    send: typeof send;
  }
}>}
```

-----

## 4. Custom Hook Re-Render
현재 페이지 `(state.path)` 상태값 업데이트하는 커스텀 훅을 이용해서 특정 액션이 발생되었을 때 리렌더링 작업.     

리액트 리렌더링 (re-render) 은 컴포넌트의 state가 변경 되었을 때 다시 렌더링할 수 있는 `useEffect` 를 촬용하여 커스텀 훅 생성.     

```tsx
import { useEffect, useState } from "react";

let render = () => {}; // 특정 액션 발생되었을 때, state 값 업데이트
export const useRerender = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    render = () => setCount(count => count+1)
  }, [count]);

  return {...state}
}
```

-----

## 5. 액션 핸들러
액션 핸들러 객체를 만들어서 핸들러 키를 이용해서 호출시킨다.  
핸들러가 트리거되어 리렌더링 한다.

* `./src/store/hook.ts`

```ts
type NodeActions = {
  goto: {next: string | Symbol};
  clickgoto: {next: string | Symbol};
  delaygoto: {next: string | Symbol, delay: number};
}

type NodeActionParams = {
  [K in keyof NodeActions]: {type: K} & NodeActions[K]
};

type NodeSendActions = ValueOf<NodeActionParams>;

type SendHandler = Partial<{
  [K in keyof NodeActions]: (params: NodeActions[K]) => void
}>;
```

-----

## 6. 공통 컴포넌트 생성
페이지 `pageProps`로 넘어오는 데이터를 받아서 처리할 수 있는 유틸 컴포넌트 생성.

```ts
// 컴포넌트 공통 
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

// 컴포넌트 리액트 노드
type NodeFC<T> = FC<T & NodeProps>
```

-----

## 7. 웹캠 가져오기

* 컴퓨터에 연결된 모든 하드웨어 미디어 디바이스 데이터 가져오기 (마이크, 카메라, 헤드셋 등)
  > navigator.mediaDevices.enumerateDevices() : Promise<MediaDeviceInfo[]>

* 반환된 미디어 디바이스 데이터에서 원하는 미디어의 라벨 정보와 비교하여 데이터 재정렬

* 웹캠에는 카메라와, 오디오 장치가 있기 때문에 미디어 `deviceId` 아이디가 동일하고, 카메라는 `{kind: videoinput}`, 오디오는 `{kind: audioinput}` 이다.  
미디어 데이터 배열을 `deviceId` 기준으로 그룹화해서 `{kind: videoinput}` 인 미디어 디바이스 데이터를 가져온다.

* 해당 미디어 장치를 웹앱에서 접근할 수 있도록 객체를 생성한다
  > navigator.mediaDevices.getUserMedia(): Promise<MediaStream>


