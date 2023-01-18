import { string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId, flatten } from 'lodash';

import resources from './locales/index.js';
import render from './render.js';
import parseRSS from './utils/parser.js';

const defaultLanguage = 'ru';
const timeout = 5000;

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
  btn: document.querySelector('button[type="submit"]'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),
  modal: {
    modalElement: document.querySelector('.modal'),
    title: document.querySelector('.modal-title'),
    body: document.querySelector('.modal-body'),
    fullArticleButton: document.querySelector('.full-article'),
  },
};

setLocale({
  mixed: {
    notOneOf: 'rssAlreadyExists',
    defaultError: 'dataIsNotValid',
  },
  string: {
    url: 'notValidURL',
  },
});

const getAxiosResponse = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';
  const preparedURL = new URL(allOriginsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

const addFeeds = (id, parsedFeed, link, watchedState) => {
  watchedState.uploadedData.feeds.push({ ...parsedFeed, id, link });
};

const addPosts = (feedId, posts, watchedState) => {
  const preparedPosts = posts.map((post) => ({ ...post, feedId, id: uniqueId() }));
  watchedState.uploadedData.posts = preparedPosts.concat(watchedState.uploadedData.posts);
};

const postsUpdate = (feedId, watchedState) => {
  const inner = () => {
    const linkesFeed = watchedState.uploadedData.feeds.map(({ link }) => getAxiosResponse(link));

    Promise.allSettled(linkesFeed)
      .then((responses) => {
        const postsParsed = responses
          .filter(({ status }) => status === 'fulfilled')
          .map(({ value }) => {
            const parsedData = parseRSS(value.data.contents);
            return parsedData ? parsedData.posts : [];
          });
        const receivedPosts = flatten(postsParsed);
        console.log(receivedPosts);
        const linkPosts = watchedState.uploadedData.posts.map(({ link }) => link);
        const newPosts = receivedPosts.filter(({ link }) => !linkPosts.includes(link));
        if (newPosts.length > 0) {
          addPosts(feedId, newPosts, watchedState);
        }
      })
      .catch((console.error))
      .finally(() => {
        setTimeout(inner, timeout);
      });
  };
  setTimeout(inner, timeout);
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        inputData: '',
        registrationProcess: {
          state: 'filling',
          error: '',
        },
        uploadedData: {
          feeds: [],
          posts: [],
        },
        readPostIds: new Set(),
        modal: {
          title: '',
          description: '',
          link: '',
        },
      };

      const watchedState = onChange(state, render(state, elements, i18nInstance));

      elements.form.addEventListener('input', (e) => {
        e.preventDefault();
        watchedState.inputData = e.target.value;
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const schema = string()
          .url()
          .notOneOf(state.uploadedData.feeds.map(({ link }) => link))
          .trim();
        schema.validate(state.inputData)
          .then(() => {
            watchedState.registrationProcess.state = 'sending';
            return getAxiosResponse(state.inputData);
          })
          .then((response) => {
            const parsedRSS = parseRSS(response.data.contents);
            if (!parsedRSS) {
              throw new Error('noRSS');
            }
            const feedId = uniqueId();

            addFeeds(feedId, parsedRSS.feed, state.inputData, watchedState);
            addPosts(feedId, parsedRSS.posts, watchedState);

            postsUpdate(feedId, watchedState);

            watchedState.registrationProcess.state = 'finished';
          })
          .catch((err) => {
            watchedState.registrationProcess.error = err.message ?? 'defaultError';
            watchedState.registrationProcess.state = 'failed';
          });
      });

      elements.modal.modalElement.addEventListener('show.bs.modal', (e) => {
        const postId = e.relatedTarget.getAttribute('data-id');
        watchedState.readPostIds.add(postId);
        const post = state.uploadedData.posts
          .find(({ id }) => postId === id);
        const { title, description, link } = post;
        watchedState.modal = { title, description, link };
      });

      elements.posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        if (postId) {
          watchedState.readPostIds.add(postId);
        }
      });
    });
};
