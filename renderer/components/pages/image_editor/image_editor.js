import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
} from 'react';

import { loadImage, drawRectangle, drawPreviewingRectangle } from './editor_utils';

const baseStyle = {
  borderRadius: '4px',
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
};

const historyReducer = function (state, [type, payload, properties]) {
  switch (type) {
    case 'draw-image':
      return [...state, {
        action: type,
        snapshot: payload,
        properties,
      }];
    case 'draw-rectangle':
      return [...state, {
        action: type,
        snapshot: payload,
        properties,
      }];
    default:
      return state;
  }
};

export default function imageEditor({ page, store }) {
  const canvasRef = useRef(null);
  const [history, dispatch] = useReducer(historyReducer, store.getStore(page.routingPath) || []);
  const [content, setContent] = useState(<div>loading</div>);
  const [mouseDownPoint, setMouseDownPoint] = useState({ left: -1, top: -1 });
  const [currentMousePoint, setCurrentMousePoint] = useState({ left: -1, top: -1 });
  const [mouseUpPoint, setMouseUpPoint] = useState({ left: -1, top: -1 });
  const dpi = window.devicePixelRatio;
  // console.log('image page');

  useEffect(() => {
    const onMouseDown = (e) => {
      setMouseUpPoint({ left: -1, top: -1 });
      setMouseDownPoint({
        left: e.nativeEvent.offsetX,
        top: e.nativeEvent.offsetY,
      });
      const canvas = canvasRef.current;
      canvas.onmousemove = (event) => {
        setCurrentMousePoint({
          left: event.offsetX,
          top: event.offsetY,
        });
      };
    };

    const onMouseUp = (e) => {
      setMouseUpPoint({
        left: e.nativeEvent.offsetX,
        top: e.nativeEvent.offsetY,
      });
      const canvas = canvasRef.current;
      canvas.onmousemove = null;
      setCurrentMousePoint({ left: -1, top: -1 });
    };

    const drawImage = (path) => loadImage(path)
      .then((img) => {
        const width = img.naturalWidth * dpi;
        const height = img.naturalHeight * dpi;
        setContent(
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={
              img.naturalWidth < img.naturalHeight + 25
                ? { ...baseStyle, height: '100%' }
                : { ...baseStyle, width: '100%' }
            }
            onMouseDown={(e) => onMouseDown(e)}
            onMouseUp={(e) => onMouseUp(e)}
          />,
        );
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        dispatch([
          'draw-image',
          context.getImageData(0, 0, canvas.width, canvas.height),
          { path: page.props.imagePath },
        ]);
      })
      .catch(() => {
        console.log('loading image error');
        setContent(<div>Loading Media Error</div>);
      });

    if (history.length > 0) {
      const lastWidth = history[history.length - 1].snapshot.width;
      const lastHeight = history[history.length - 1].snapshot.height;
      setContent(
        <canvas
          ref={canvasRef}
          width={lastWidth}
          height={lastHeight}
          style={
            lastWidth < lastHeight + 50
              ? { ...baseStyle, height: '100%' }
              : { ...baseStyle, width: '100%' }
          }
          onMouseDown={(e) => onMouseDown(e)}
          onMouseUp={(e) => onMouseUp(e)}
        />,
      );

      setTimeout(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.putImageData(history[history.length - 1].snapshot, 0, 0);
      }, 0);
    } else {
      drawImage(page.props.imagePath);
    }
  }, []);

  useEffect(
    // Backup history after history update
    () => store.addStore({
      name: page.routingPath,
      content: history,
    }), [history],
  );

  useEffect(() => {
    if (content.type === 'canvas') {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const scale = () => ({
        scaleX: canvas.width / context.canvas.offsetWidth,
        scaleY: canvas.height / context.canvas.offsetHeight,
      });

      const drawTagRectangle = () => {
        // Refresh to last snapshot
        context.putImageData(history[history.length - 1].snapshot, 0, 0);

        // Draw Rectangle
        const properties = {
          left: mouseDownPoint.left * scale().scaleX,
          top: mouseDownPoint.top * scale().scaleY,
          width: (mouseUpPoint.left - mouseDownPoint.left) * scale().scaleX,
          height: (mouseUpPoint.top - mouseDownPoint.top) * scale().scaleY,
          color: 'red',
        };
        drawRectangle(properties, context);

        // Record
        dispatch([
          'draw-rectangle',
          context.getImageData(0, 0, canvas.width, canvas.height),
          properties,
        ]);
      };

      const returnToLastRecord = () => {
        // Refresh to last snapshot
        context.putImageData(history[history.length - 1].snapshot, 0, 0);
      };

      if (
        mouseDownPoint.left !== -1
        && mouseDownPoint.top !== -1
        && content !== null
      ) {
        if (
          mouseUpPoint.top !== -1
          && mouseUpPoint.left !== -1
        ) {
          drawTagRectangle();
        } else if (
          currentMousePoint.top !== -1
          && currentMousePoint.left !== -1
        ) {
          returnToLastRecord();
          drawPreviewingRectangle({
            left: mouseDownPoint.left * scale().scaleX,
            top: mouseDownPoint.top * scale().scaleY,
            width: (currentMousePoint.left - mouseDownPoint.left) * scale().scaleX,
            height: (currentMousePoint.top - mouseDownPoint.top) * scale().scaleY,
          }, context);
        }
      }
    }
  }, [mouseDownPoint, mouseUpPoint, currentMousePoint]);

  return (
    <div
      id="canvas-container"
      style={{
        width: '100%',
        height: 'calc(100% - 25px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px',
      }}
    >
      { content }
    </div>
  );
}
