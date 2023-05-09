import { ChangeEvent, FC } from "react";

const Controls: FC<{
  pageSize: {width: number; height: number;}
  options: {width: number; height: number; direction: string};
  setPageSize: React.Dispatch<React.SetStateAction<{width: number; height: number;}>>;
  setOptions: React.Dispatch<React.SetStateAction<{width: number; height: number; direction: string}>>;
}> = ({
  pageSize,
  options,
  setPageSize,
  setOptions,
  ...props
}) => {

  const handlerPageChange = (key: string) => (ev: ChangeEvent<HTMLInputElement>) => {
    const target = ev.target;
    setPageSize(prevState => ({...prevState, [key]: Number(target.value)}));
  }
  
  
  const handlerOptionsChange = (key: string) => (ev: ChangeEvent<HTMLInputElement>) => {
    const target = ev.target;
    setOptions(prevState => ({...prevState, [key]: key === 'direction' ? target.value : Number(target.value)}));
  }

  return <div {...props} className="form-control-group">
    <div>
      <div className="form-control">
        <div className="label">전체 화면 너비</div>
        <input value={pageSize.width} onChange={handlerPageChange('width')} />
      </div>
      <div className="form-control">
        <div className="label">전체 화면 높이</div>
        <input value={pageSize.height} onChange={handlerPageChange('height')} />
      </div>
    </div>
    <div>
      <div className="form-control">
        <div className="label">카메라 가로 크기</div>
        <input value={options.width} onChange={handlerOptionsChange('width')} />
      </div>
      <div className="form-control">
        <div className="label">카메라 세로 크기</div>
        <input value={options.height} onChange={handlerOptionsChange('height')} />
      </div>
      <div className="form-control">
        <div className="label">카메라 회전 방향</div>
        {[{label: '기본', value: 'center'}, {label: '오른쪽', value: 'right'}, {label: '왼쪽', value: 'left'}].map(({label, value}, i) => {
          return <div key={`opt-${i}`}>
            <input type="radio" name="direction" id={value} value={value} checked={options.direction === value} onChange={handlerOptionsChange('direction')} />
            <label htmlFor={value}>{label}</label>
          </div>
        })}
      </div>
    </div>
  </div>
}

export default Controls;