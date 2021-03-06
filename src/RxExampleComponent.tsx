import React, { useRef, useLayoutEffect, useState } from 'react';
import * as Rx from 'rxjs';
import { map, switchMap, scan, takeUntil } from 'rxjs/operators';

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
    // 拖拽
    if (nodeRef.current && containerRef.current) {
      const mouseDown$ = Rx.fromEvent<MouseEvent>(nodeRef.current, 'mousedown');
      const mouseMove$ = Rx.fromEvent<MouseEvent>(containerRef.current, 'mousemove');
      const mouseUp$ = Rx.fromEvent<MouseEvent>(document, 'mouseup');
      const nodeOffset$ = mouseDown$.pipe(
        switchMap(downEvent => {
          return mouseMove$.pipe(
            map(moveEvent => ({
              x: moveEvent.clientX,
              y: moveEvent.clientY,
            })),
            scan<{ x: number, y: number }, { pre: { x: number, y: number }, nodeOffset: { x: number, y: number } }>(({ pre }, current) => {
              return {
                pre: current,
                nodeOffset: {
                  x: current.x - pre.x,
                  y: current.y - pre.y,
                },
              };
            }, {
              pre: {
                x: downEvent.clientX,
                y: downEvent.clientY,
              },
              nodeOffset: {
                x: 0,
                y: 0,
              }
            }),
            takeUntil(mouseUp$),
          );
        }),
      );

      const nodePos2$ = nodeOffset$.pipe(
        scan<{ pre: { x: number, y: number }, nodeOffset: { x: number, y: number } }, { x: number, y: number }>((nodePos, { nodeOffset }) => {
          console.log(nodePos);
          return {
            x: nodePos.x + nodeOffset.x,
            y: nodePos.y + nodeOffset.y,
          };
        }, {
          x: 0,
          y: 0,
        }),
      );


      // const nodePos$ = mouseDown$.pipe(
      //   switchMap(event => {
      //     return mouseMove$.pipe(
      //       map(moveEvent => {
      //         console.log(moveEvent.clientX, moveEvent.clientY);
      //         if (containerRef.current) {
      //           const { top, left } = containerRef.current.getBoundingClientRect();
      //           return {
      //             x: moveEvent.clientX - left - event.offsetX, // moveEvent.clientX -- 鼠标相对可视区域距离; left -- 画布相对可是区域位置; event.offsetX -- 鼠标相对方块的位置
      //             y: moveEvent.clientY - top - event.offsetY,
      //           };
      //         }
      //         return { x: 0, y: 0 };
      //       }),
      //       takeUntil(mouseUp$),
      //     );
      //   }),
      // );

      // 缩放
      const mouseWheel$ = Rx.fromEvent<WheelEvent>(containerRef.current, 'mousewheel');
      const room$ = mouseWheel$.pipe(
        scan<WheelEvent, { room: number; offsetX: number; offsetY: number }>(
          (roomConf, event) => {
            console.log(event, 'mousewheel');
            const currentRoom = roomConf.room + (event.deltaY * 0.01) / 53;
            if (containerRef.current) {
              const boundingRect = containerRef.current.getBoundingClientRect();

              const diffWidth = boundingRect.width * (currentRoom - roomConf.room);
              const diffHeight = boundingRect.height * (currentRoom - roomConf.room);

              // 鼠标相对画布的位置
              const clientX = event.clientX - boundingRect.left;
              const clientY = event.clientY - boundingRect.top;

              const xFactor = (clientX - roomConf.offsetX) / roomConf.room / boundingRect.width;
              const yFactor = (clientY - roomConf.offsetY) / roomConf.room / boundingRect.height;

              console.log(roomConf, boundingRect, currentRoom, diffWidth, diffHeight, clientX, clientY);
              return {
                room: currentRoom,
                offsetX: roomConf.offsetX - diffWidth * xFactor,
                offsetY: roomConf.offsetY - diffHeight * yFactor,
              };
            }
            return {
              room: 1,
              offsetX: 0,
              offsetY: 0,
            };
          },
          {
            room: 1,
            offsetX: 0,
            offsetY: 0,
          },
        ),
      );



      nodePos2$.subscribe(posxy => {
        setPos(posxy);
        console.log(posxy, 'posxy');
      });

      room$.subscribe(x => {
        setRoom(x.room);
        setOffsetX(x.offsetX);
        setOffsetY(x.offsetY);
      });
    }
  }, [nodeRef.current]);

  return (
    <div ref={containerRef} className="container">
      <div
        className="node-container"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${room})` }}
      >
        <div ref={nodeRef} style={{ left: pos.x, top: pos.y }} className="node">
          node
        </div>
      </div>
    </div>
  );
}
