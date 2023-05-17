import * as yup from 'yup';

const initLocalization = (i18instance) => {
  yup.setLocale({
    string: {
      url: i18instance.t('urlNotValid'),
    },
    mixed: {
      required: i18instance.t('required'),
    },
  });
};

export default initLocalization;
