import { defineThemeConfig } from '@core';
import { Skins } from '@core/enums';
import { breakpointsVuetifyV3 } from '@vueuse/core';
import { VIcon } from 'vuetify/components/VIcon';

import logo from '@/images/undiplogo2.png'; // Import your PNG logo
import { AppContentLayoutNav, ContentWidth, FooterType, NavbarType } from '@layouts/enums';

export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: 'arsip',

    // Set the logo as an <img> tag with the PNG source and custom styles
    logo: h('img', { 
      src: logo, 
      alt: 'Logo', 
      width: '30', 
      height: '30', 
    }),

    contentWidth: ContentWidth.Boxed,
    contentLayoutNav: AppContentLayoutNav.Vertical,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.lg - 1, // Adjust for Vuetify breakpoints
    i18n: {
      enable: false,
      defaultLocale: 'en',
      langConfig: [
        {
          label: 'English',
          i18nLang: 'en',
          isRTL: false,
        },
        {
          label: 'French',
          i18nLang: 'fr',
          isRTL: false,
        },
        {
          label: 'Arabic',
          i18nLang: 'ar',
          isRTL: true,
        },
      ],
    },
    theme: 'system',
    skin: Skins.Default,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'ri-circle-line' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },

  icons: {
    chevronDown: { icon: 'ri-arrow-down-s-line' },
    chevronRight: { icon: 'ri-arrow-right-s-line' },
    close: { icon: 'ri-close-line', size: '20' },
    verticalNavPinned: { icon: 'ri-radio-button-line', size: '20' },
    verticalNavUnPinned: { icon: 'ri-circle-line', size: '20' },
    sectionTitlePlaceholder: { icon: 'ri-subtract-line' },
  },
});
