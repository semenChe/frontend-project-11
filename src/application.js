import i18next from 'i18next';
import onChange from 'on-change';
import { setLocale, string } from 'yup';

import resources from './locales/index.js';
import render from './render.js';

export default () => {
  const lng = 'ru';

  setLocale({
    mixed: {
      default: 'default',
      required: 'empty',
      notOneOf: 'alreadyExists',
    },
    string: {
      url: 'invalidUrl',
    },
  });

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng,
      debug: false,
      resources,
    })
    .then(() => {
      const elements = {
        form: document.querySelector('.rss-form'),
        urlInput: document.getElementById('url-input'),
        feedback: document.querySelector('.feedback'),
      };

      const initialState = {
        form: {
          state: 'filling',
          fields: { url: '' },
          error: '',
        },
        feeds: [],
      };

      const state = onChange(initialState, render(elements, initialState, i18nInstance));

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
            const message = error.message ?? 'default';
            state.form.error = message;
          })
          .finally(() => {
            state.form.state = 'filling';
          });
      });

      elements.urlInput.addEventListener('change', (e) => {
        state.form.fields.url = e.target.value.trim();
      });
    });
};
