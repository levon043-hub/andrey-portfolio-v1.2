import draftPoster from '../../assets/img/portfolio/work6.jpg';
import pierrePoster from '../../assets/img/portfolio/work5.jpg';
import ecowoodPoster from '../../assets/img/portfolio/work9.jpg';
import sapphirePoster from '../../assets/img/portfolio/work2.jpg';
import masterProPoster from '../../assets/img/portfolio/work10.jpg';
import pafRemstakPoster from '../../assets/img/portfolio/work1.jpg';
import millikenPoster from '../../assets/img/portfolio/work3.jpg';
import legalPoster from '../../assets/img/portfolio/work7.jpg';
import omegaPoster from '../../assets/img/portfolio/work8.jpg';
import metalPoster from '../../assets/img/portfolio/work11.jpg';

const projectRecords = [
  {
    slug: 'draft',
    title: 'Драфт',
    subtitle: 'Агентство креативных коммуникаций',
    type: 'Лендинг',
    industry: 'IT и креатив',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: draftPoster,
    description: 'Тёмный лендинг для агентства креативных коммуникаций.'
  },
  {
    slug: 'pierre',
    title: 'PIERRE',
    subtitle: 'Итальянская плитка',
    type: 'Лендинг',
    industry: 'Ритейл',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: pierrePoster,
    description: 'Минималистичный лендинг для премиум-магазина плитки.'
  },
  {
    slug: 'ecowood',
    title: 'EcoWood',
    subtitle: 'Дома из дерева',
    type: 'Лендинг',
    industry: 'Строительство',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: ecowoodPoster,
    description: 'Современный лендинг для строительной компании.'
  },
  {
    slug: 'sapphire-cars',
    title: 'Sapphire Cars',
    subtitle: 'Аренда автомобилей',
    type: 'Многостраничный сайт',
    industry: 'Авто',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: sapphirePoster,
    description: 'Сайт аренды премиум-автомобилей в Крыму.'
  },
  {
    slug: 'master-pro',
    title: 'Master Pro',
    subtitle: 'Ремонт техники',
    type: 'Лендинг',
    industry: 'Услуги',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: masterProPoster,
    description: 'Лендинг сервисного центра по ремонту бытовой техники.'
  },
  {
    slug: 'paf-remstak',
    title: 'ПАФ РемСтак',
    subtitle: 'Ремонт станков',
    type: 'Многостраничный сайт',
    industry: 'Промышленность',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: pafRemstakPoster,
    description: 'Корпоративный сайт завода по обслуживанию оборудования.'
  },
  {
    slug: 'milliken',
    title: 'Милликен',
    subtitle: 'Монтаж кабелей',
    type: 'Многостраничный сайт',
    industry: 'Электромонтаж',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: millikenPoster,
    description: 'Сайт компании по прокладке высоковольтных кабелей.'
  },
  {
    slug: 'legal-services',
    title: 'Юридические услуги',
    subtitle: 'Для бизнеса',
    type: 'Многостраничный сайт',
    industry: 'Юридические услуги',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: legalPoster,
    description: 'Корпоративный сайт юридической компании.'
  },
  {
    slug: 'omegaprom',
    title: 'ОмегаПром',
    subtitle: 'Энергетика',
    type: 'Многостраничный сайт',
    industry: 'Энергетика',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: omegaPoster,
    description: 'Сайт предприятия полного цикла в энергетической сфере.'
  },
  {
    slug: 'metal-mebel',
    title: 'Метал Мебель',
    subtitle: 'Металлическая мебель',
    type: 'Многостраничный сайт',
    industry: 'Производство',
    status: 'commercial',
    role: 'Дизайн и разработка',
    poster: metalPoster,
    description: 'Интернет-каталог металлической мебели для офиса.'
  }
];

export const projects = projectRecords.map((project) => ({
  ...project,
  liveUrl: null,
  year: null,
  scope: null,
  timeline: null,
  stack: [],
  result: null,
  caseData: null
}));

export const featuredProjectSlugs = ['ecowood', 'draft', 'pierre', 'sapphire-cars', 'master-pro'];
