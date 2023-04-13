import i18next from 'i18next';

const domParser = new DOMParser();

const rssParser = (contents) => {
  try {
    const xmlDom = domParser.parseFromString(contents, 'application/xml');

    const items = Array.from(xmlDom.querySelectorAll('item')).map((item) => {
      const title = item.querySelector('title');
      const description = item.querySelector('description');
      const link = item.querySelector('link');

      return {
        title: title.textContent,
        description: description.textContent,
        link: link.textContent,
      };
    });

    const feedTitle = xmlDom.querySelector('channel title');
    const feedDescription = xmlDom.querySelector('channel description');

    const feed = {
      title: feedTitle.textContent,
      description: feedDescription.textContent,
      items,
    };

    return feed;
  } catch (error) {
    throw new Error(i18next.t('notValid'));
  }
};

export default rssParser;
