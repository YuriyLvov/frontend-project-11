const domParser = new DOMParser();

const rssParser = (contents, feedUrl) => {
  const xmlDom = domParser.parseFromString(contents, 'application/xml');
  const xmlDomError = xmlDom.querySelector('parsererror');

  if (xmlDomError) {
    throw new Error(xmlDomError.textContent);
  }

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
    url: feedUrl,
  };

  return { feed, items };
};

export default rssParser;
