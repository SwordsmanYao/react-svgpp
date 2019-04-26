import React, { useRef, useLayoutEffect, useState } from 'react';
import * as Rx from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import './styles.less';

export interface IProps {
  text: string;
}

export default function ExampleComponent(props: IProps) {
  const [pos, setPos] = useState({x: 0, y: 0});
  
  // const [data, setData] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Rx.interval(10).subscribe(x => {
    //   setData(x);
    // });
    if (nodeRef.current) {
      const mouseDown$ = Rx.fromEvent(nodeRef.current, 'mousedown');
      const mouseMove$ = Rx.fromEvent(document, 'mousemove');
      const mouseUp$ = Rx.fromEvent(document, 'mouseup');

      mouseDown$.pipe(
        map((event: any) => ({
          pos: {
            x: 0,
            y: 0,
          },
          event,
        })),
        switchMap(initialState => {
          const initialPos = initialState.pos;
          const { clientX, clientY } = initialState.event;
          return mouseMove$.pipe(
            map((moveEvent: any) => ({
              x: moveEvent.clientX - clientX + initialPos.x,
              y: moveEvent.clientY - clientY + initialPos.y,
            })),
            takeUntil(mouseUp$),
          );
        }),
      ).subscribe(posxy => {
        setPos(posxy);
      });

      mouseDown$.subscribe(event => {
        console.log(event, 'event');
      });
    }
  }, [nodeRef.current]);

  return (
    <div className="container">
      <div ref={nodeRef} style={{ left: pos.x, top: pos.y }} className="node">
        node
      </div>
    </div>
  );
}
