import onChange from 'on-change';
import { string } from 'yup';

import render from './render.js';

const elements = {
  form: document.querySelector('.rss-form'),
  urlInput: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
};

export default () => {
  const initialState = {
    form: {
      state: 'filling',
      fields: { url: '' },
      error: '',
    },
    feeds: [],
  };

  const state = onChange(initialState, render(elements, initialState));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.error = '';

    const getFeedUrls = state.feeds.map(({ link }) => link);
    const schema = string()
      .required()
      .url()
      .notOneOf(getFeedUrls);

    schema
      .validate(state.form.fields.url)
      .then(() => {
        state.form.state = 'sending';

        const feed = {
          link: state.form.fields.url,
        };

        state.feeds.push(feed);

        state.form.fields.url = '';
        e.target.reset();
      })
      .catch((error) => {
        state.form.error = error.message;
      })
      .finally(() => {
        state.form.state = 'filling';
      });
  });

  elements.urlInput.addEventListener('change', (e) => {
    state.form.fields.url = e.target.value.trim();
  });
};
