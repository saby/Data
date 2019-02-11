class I18n {
   isEnabled() {
      return false;
   }

   setEnable(enable) {
   }

   getLang(): string {
      return '';
   }
}

const i18n = new I18n();

export = i18n;
