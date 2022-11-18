import { send } from "@/store/hook";
import { MouseEvent, useEffect } from "react";

const CommonNode: NodeFC<{
}> = ({className, style, actions, onClick, ...props}) => {
  useEffect(() => {
    if (props.forcegoto) send({type: 'clickgoto', ...props.forcegoto});
    if (props.delaygoto) send({type: 'delaygoto', next: props.delaygoto.next, delay: props.delaygoto.delay});

    if (actions) actions.map(action => send(action));
  }, []);

  const clickHandler = async (ev: MouseEvent) => {
    const state = await onClick?.();
    if (!state && state !== undefined) return;

    if (props.clickgoto) {
      send({type: 'goto', next: props.clickgoto});
      ev.stopPropagation();
    }
  }

  return <div {...props}
    className={className?.trim()}
    onClick={clickHandler}
    style={{
      position: 'absolute',
      ...style
    }}
  />
}

export default CommonNode;