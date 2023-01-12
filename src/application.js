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
    title: document.querySelector('.modal-title'),
    body: document.querySelector('.modal-body'),
    fullArticleButton: document.querySelector('.full-article'),
  },
};

setLocale({
  mixed: {
    notOneOf: 'rssAlreadyExists',
    default: 'dataIsNotValid',
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

const addFeeds = (id, title, description, link, watchedState) => {
  watchedState.feeds.push({
    id,
    title,
    description,
    link,
  });
};

const addPosts = (feedId, posts, watchedState) => {
  const preparedPosts = posts.map((post) => ({
    feedId,
    id: uniqueId(),
    title: post.title,
    description: post.description,
    link: post.link,
  }));
  watchedState.posts = preparedPosts.concat(watchedState.posts);
};

const postsUpdate = (feedId, watchedState) => {
  const inner = () => {
    const linkesFeed = watchedState.feeds.map(({ link }) => getAxiosResponse(link));
    Promise.all(linkesFeed)
      .then((responses) => {
        const postsParsed = responses.map((response) => parseRSS(response.data.contents).posts);
        const receivedPosts = flatten(postsParsed);
        const linkPosts = watchedState.posts.map(({ link }) => link);
        const newPosts = receivedPosts.filter(({ link }) => !linkPosts.includes(link));
        if (newPosts.length > 0) {
          addPosts(feedId, newPosts, watchedState);
        }
      })
      .catch(console.error)
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
        processState: 'filling',
        inputData: '',
        error: '',
        listOfFeeds: [],
        feeds: [],
        posts: [],
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

        const schema = string().url().notOneOf(state.listOfFeeds).trim();
        schema.validate(state.inputData)
          .then(() => {
            watchedState.processState = 'sending';
          })
          .then(() => getAxiosResponse(state.inputData))
          .then((response) => {
            const parsedRSS = parseRSS(response.data.contents);
            const feedId = uniqueId();
            const title = parsedRSS.feed.channelTitle;
            const description = parsedRSS.feed.channelDescription;

            addFeeds(feedId, title, description, state.inputData, watchedState);
            addPosts(feedId, parsedRSS.posts, watchedState);

            postsUpdate(state.inputData, feedId, watchedState);

            watchedState.listOfFeeds.push(state.inputData);
            watchedState.processState = 'finished';
          })
          .catch((err) => {
            watchedState.error = err.message ?? 'default';
            watchedState.processState = 'failed';
          })
          .finally(() => {
            watchedState.processState = 'filling';
          });
      });
      elements.posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        if (postId) {
          watchedState.readPostIds.add(postId);
        }
        if (e.target.dataset.bsTarget === '#modal') {
          const post = state.posts
            .find(({ id }) => postId === id);
          const { title, description, link } = post;
          watchedState.modal = { title, description, link };
        }
      });
    });
};
