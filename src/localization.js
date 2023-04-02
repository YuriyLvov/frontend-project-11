import * as yup from 'yup';
import i18next from 'i18next';

const initLocalization = () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          urlNotValid: 'Ссылка должна быть валидным URL',
          rssAdded: 'RSS успешно загружен',
          urlAlredyExist: 'RSS уже существует',
          notValid: 'Ресурс не содержит валидный RSS',
        },
      },
    },
  });

  yup.setLocale({
    string: {
      url: i18next.t('urlNotValid'),
    },
  });
};

export default initLocalization;
