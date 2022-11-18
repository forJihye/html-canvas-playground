import { useState } from "react";
import Canvas, { Filters } from "./components/Canvas";
import Container from "./components/Container";


export const START_PAGE = '_1_intro';
export const pages: Pages = {
  _1_INTRO: ({pageProps}) => {
    const {assets, store, state, send} = pageProps;
    // const canvas = useRef<CanvasHandle>(null);
    // useEffect(() => {
    //   if (canvas.current) canvas.current.draw();
    // }, []);

    return <Container>
      <h1>인트로</h1>
      <Canvas 
        src="webcam" 
        width={500} 
        height={500}
        // filter={[
          // {'grayscale': '100%'},
          // {'hue-rotate': '20deg'},
          // {'blur': '0.5px'}, // 0.89
          // {'brightness': '150%'}, // 228
          // {'contrast': '3000%'},
        // ] as Filters}
      />
    </Container>
  },
  _2_MAIN: () => {
    return <Container delaygoto={{next: "_1_intro", delay: 5}}>
    <h1>메인</h1>
    <p>5초 뒤 인트로로 이동</p>
  </Container>
  },
}
