import url from 'url';
import path from 'path';
import { DRAW_RECTANGLE } from './constant';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutTimer = setTimeout(() => {
      reject(new Error('loading image time out'));
    }, 1000);

    img.src = url.format({
      pathname: path.resolve(src),
      protocol: 'file:',
      slashes: true,
    });

    img.onload = () => {
      resolve(img);
      clearTimeout(timeoutTimer);
    };
  });
}

export function drawRectangle(props, ctx) {
  const {
    left, top, width, height, color,
  } = props;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.rect(left, top, width, height);
  ctx.stroke();
}

export function fillRectangle(props, ctx) {
  const {
    left, top, width, height, color,
  } = props;

  ctx.fillStyle = color;
  ctx.fillRect(left, top, width, height);
}

export const drawPreviewingRectangle = (position, context) => {
  drawRectangle({
    ...position,
    color: 'rgba(179, 179, 179, 1)',
  }, context);

  fillRectangle({
    ...position,
    color: 'rgba(179, 179, 179, 0.3)',
  }, context);
};

export const drawTagRectangle = (properties, context, dispatch) => {
  // Draw Rectangle
  drawRectangle(properties, context);

  const generateKey = () => {
    const {
      left, top, width, height, color,
    } = properties;
    const { round } = Math;

    return `${round(left)}${round(top)}${round(width)}${round(height)}${color}`;
  };

  // tag
  dispatch([
    DRAW_RECTANGLE,
    {
      ...properties,
      key: generateKey(properties),
    },
  ]);
};

export const drawInstructions = (ctx, imgData, tagList) => {
  ctx.putImageData(imgData, 0, 0);
  tagList.map((tag) => {
    if (tag.action === DRAW_RECTANGLE) {
      drawRectangle(tag.properties, ctx);
    }
    return true;
  });
};

export const findTagIndex = (tag, tagList) => tagList.findIndex(
  (list) => (list.properties.key === tag.properties.key),
);

export const removeFromList = (tag, tagList) => {
  tagList.splice(findTagIndex(tag, tagList), 1);
  return [...tagList];
};
