import React, { useRef, useLayoutEffect, useState } from 'react';
import * as Rx from 'rxjs';
import { map, switchMap, takeUntil, scan } from 'rxjs/operators';

import './styles.less';

export interface IProps {
  text: string;
}

export default function RxExampleComponent(props: IProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  
  
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (nodeRef.current && containerRef.current) {
      const mouseDown$ = Rx.fromEvent<MouseEvent>(nodeRef.current, 'mousedown');
      const mouseMove$ = Rx.fromEvent<MouseEvent>(containerRef.current, 'mousemove');
      const mouseUp$ = Rx.fromEvent<MouseEvent>(document, 'mouseup');

      const nodePos$ = mouseDown$.pipe(
        switchMap(event => {
          return mouseMove$.pipe(
            map(moveEvent => {
              console.log(moveEvent, moveEvent.clientY, moveEvent.pageY, event.offsetX, event.offsetY);
              return {
                x: moveEvent.pageX - event.offsetX,
                y: moveEvent.pageY - event.offsetY,
              };
            }),
            takeUntil(mouseUp$),
          );
        }),
      );

      nodePos$.subscribe(posxy => {
        setPos(posxy);
      });
    }

    if (containerRef.current) {
      const mouseWheel$ = Rx.fromEvent<WheelEvent>(containerRef.current, 'mousewheel');
      const room$ = mouseWheel$.pipe(
        // map(event => ({
        //   room: event.deltaY / 53,
        //   offsetX: event.offsetX,
        //   offset
        // }),
        scan<WheelEvent, { room: number, offsetX: number, offsetY: number }>((roomConf, event) => {
          console.log(event, 'mousewheel');
          const currentRoom = roomConf.room + event.deltaY * 0.1 / 53;
          return {
            room: currentRoom,
            offsetX: roomConf.offsetX - event.offsetX * (currentRoom - roomConf.room),
            offsetY: roomConf.offsetY - event.offsetY * (currentRoom - roomConf.room),
          };
        }, {
          room: 1,
          offsetX: 0,
          offsetY: 0,
        }),
      );
      
      room$.subscribe(x => {
        setRoom(x.room);
        setOffsetX(x.offsetX);
        setOffsetY(x.offsetY);
      });
      
      mouseWheel$.subscribe(event => {
        console.log(event, 'mousewheel');
      });
    }


  }, [nodeRef.current]);

  return (
    <div ref={containerRef} className="container">
      <div className="node-container" style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${room})` }}>
        <div ref={nodeRef} style={{ left: pos.x, top: pos.y }} className="node">
          node
        </div>
      </div>
    </div>
  );
}
