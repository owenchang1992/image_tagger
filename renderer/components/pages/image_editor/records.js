import React from 'react';
import { findRecordIndex } from './editor_utils';

export default ({
  history,
  selectedRecords,
  toggleRecords,
}) => {
  setTimeout(() => console.log(history));
  return (
    <>
      <h5 className="nav-group-title">
        Tags
      </h5>
      {
        history.map((value) => {
          const { label, key } = value.properties;

          const getContent = () => {
            const {
              left, top, width, height,
            } = value.properties;
            const { round } = Math;

            return `(${round(left)}, ${round(top)}, ${round(width)}, ${round(height)})`;
          };

          return (
            <div
              className="list-group-item"
              role="button"
              key={key}
              style={{
                position: 'relative',
                padding: '5px 0px 5px 10px',
                border: `1px solid ${findRecordIndex(value, selectedRecords) === -1 ? '#ddd' : '#777'}`,
                borderRadius: '3px',
                marginTop: '5px',
              }}
              tabIndex={0}
              onClick={() => { toggleRecords(value); }}
              onKeyDown={() => (null)}
            >
              <span className="icon icon-record" style={{ color: label.color, marginRight: '5px' }} />
              <strong>{label.name}</strong>
              <br />
              { getContent() }
            </div>
          );
        })
      }
    </>
  );
};
