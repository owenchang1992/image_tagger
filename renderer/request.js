export const FIND_ONE = 'findOne';
export const UPDATE = 'update';
export const FIND = 'find';

export const send2Local = (channel, content) => {
  window.api.send(channel, {
    ...content,
  });
};

export const findOne = (type, contents) => ({
  type,
  name: FIND_ONE,
  contents,
});

export const find = (type, contents) => ({
  type,
  name: FIND,
  contents,
});

export const update = (type, contents) => ({
  type,
  name: UPDATE,
  contents,
});

export const removeListener = (channel, handler) => {
  window.api.removeListener(channel, handler);
};

export const receive = (channel, handler) => {
  window.api.receive(channel, handler);
};
