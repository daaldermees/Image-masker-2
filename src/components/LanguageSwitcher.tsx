import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Save language preference in localStorage
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button 
        className={i18n.language === 'nl' ? 'active' : ''} 
        onClick={() => changeLanguage('nl')}
      >
        NL
      </button>
    </div>
  );
};

export default LanguageSwitcher; 