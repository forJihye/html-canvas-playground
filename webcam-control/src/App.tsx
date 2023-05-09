import { useState } from 'react';
import './App.css';
import Webcam from './Webcam';
import Controls from './Controls';

function App() {
  const [pageSize, setPageSize] = useState({width: 1080, height: 1920});
  const [options, setOptions] = useState({width: 750, height: 750, direction: 'right'});
  
  return (
    <section style={{width: pageSize.width, height: pageSize.height, position: 'absolute', left: 0, top: 0, background: '#ddd'}}>
      <Controls pageSize={pageSize} options={options} setPageSize={setPageSize} setOptions={setOptions} />
      <Webcam width={options.width} height={options.height} options={options} />
    </section>
  )
}

export default App
