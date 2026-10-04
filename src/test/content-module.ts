// Test stand-in for the `virtual:content` module: the same JSON the content plugin serves at build time.
import about from '../content/pages/about.json';
import contact from '../content/pages/contact.json';
import home from '../content/pages/home.json';
import industries from '../content/pages/industries.json';
import luxury_brands from '../content/pages/luxury_brands.json';
import portfolio from '../content/pages/portfolio.json';
import services from '../content/pages/services.json';

export const pages = { about, contact, home, industries, luxury_brands, portfolio, services };
export { about, contact, home, industries, luxury_brands, portfolio, services };
