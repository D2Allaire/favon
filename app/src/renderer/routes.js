export default [
  {
    path: '/',
    name: 'start-page',
    component: require('components/StartView'),
  },
  {
    path: '/rename',
    name: 'rename',
    component: require('components/RenameView'),
  },
  {
    path: '*',
    redirect: '/',
  },
];
