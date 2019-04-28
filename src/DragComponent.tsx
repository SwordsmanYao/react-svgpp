import React, { useRef, useLayoutEffect, useState } from 'react';
import './styles.less';

export interface IProps {
  text: string;
}

export default function DragComponent(props: IProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.onmousedown = ev => {
        if (nodeRef.current) {
          document.onmousemove = e => {
            setPos({
              x: e.clientX,
              y: e.clientY,
            });
            console.log(e.offsetX, e.offsetY, 'move');
            document.onmouseup = event => {
              if (nodeRef.current) {
                document.onmousemove = null;
              }
            };
          };
        }
        console.log(ev);
        // setPos({
        //   x: 0,
        //   y: 0,
        // });
      };
    }
  }, [nodeRef.current]);

  return (
    <div className="container">
      <div ref={nodeRef} style={{ left: pos.x - 50, top: pos.y - 50 }} className="node">
        node
      </div>
    </div>
  );
}
