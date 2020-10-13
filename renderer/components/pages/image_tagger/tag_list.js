import React from 'react';
import { findTagIndex } from './utils';

export default ({ tagList, selectedTags, toggleTags }) => {
  const getBorderColor = (tag) => (
    findTagIndex(tag, selectedTags) === -1 ? '#ddd' : '#777'
  );

  // const getContent = (tag) => {
  //   const {
  //     left, top, width, height,
  //   } = tag.properties;

  //   return `(${left}, ${top}, ${width}, ${height})`;
  // };

  return (
    <>
      <h5 className="nav-group-title">
        Tags
      </h5>
      {
        tagList.map((tag) => {
          const { label, key } = tag.properties;

          return (
            <div
              className="list-group-item"
              role="button"
              key={key}
              style={{
                position: 'relative',
                padding: '5px 10px',
                border: `1px solid ${getBorderColor(tag)}`,
                borderRadius: '3px',
                marginTop: '5px',
              }}
              tabIndex={0}
              onClick={() => { toggleTags(tag); }}
              onKeyDown={() => (null)}
            >
              <span
                className="icon icon-record"
                style={{ color: label.color, marginRight: '5px' }}
              />
              <strong>{label.name}</strong>
              <span
                className="icon icon-delete"
                style={{
                  position: 'absolute',
                  right: 0,
                  color: label.color,
                }}
              />
            </div>
          );
        })
      }
    </>
  );
};
