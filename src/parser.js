const domParser = new DOMParser();

const rssParser = (contents) => {
  const xmlDom = domParser.parseFromString(contents, 'application/xml');

  return Array.from(xmlDom.querySelectorAll('item')).map((item) => {
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const link = item.querySelector('link');

    return {
      title: title.textContent,
      description: description.textContent,
      link: link.textContent,
    };
  });
};

export default rssParser;