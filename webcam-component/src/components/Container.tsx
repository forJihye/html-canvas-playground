import CommonNode from './CommonNode';

const Container: NodeFC<{}> = ({className = '', ...props}) => {
  return <CommonNode
    {...props}
    className={'page-container ' + className}
    style={{
      width: env.SCREEN_WIDTH + 'px',
      height: env.SCREEN_HEIGHT + 'px',
    }} 
  />;
};

export default Container;