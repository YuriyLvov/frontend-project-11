import * as yup from 'yup';
import i18next from 'i18next';
import ru from './ru.js';

const initLocalization = () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: { ru },
  });

  yup.setLocale({
    string: {
      url: i18next.t('urlNotValid'),
    },
    mixed: {
      required: i18next.t('required'),
    },
  });
};

export default initLocalization;
