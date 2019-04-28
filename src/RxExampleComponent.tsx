import React, { useRef, useLayoutEffect, useState } from 'react';
import * as Rx from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import './styles.less';

export interface IProps {
  text: string;
}

export default function RxExampleComponent(props: IProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (nodeRef.current) {
      const mouseDown$ = Rx.fromEvent<MouseEvent>(nodeRef.current, 'mousedown');
      const mouseMove$ = Rx.fromEvent<MouseEvent>(document, 'mousemove');
      const mouseUp$ = Rx.fromEvent<MouseEvent>(document, 'mouseup');

      const nodePos$ = mouseDown$
        .pipe(
          switchMap(event => {
            return mouseMove$.pipe(
              map(moveEvent => {
                return ({
                  x: moveEvent.clientX - event.offsetX,
                  y: moveEvent.clientY - event.offsetY,
                });
              }),
              takeUntil(mouseUp$),
            );
          }),
        );

      nodePos$.subscribe(posxy => {
        setPos(posxy);
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
