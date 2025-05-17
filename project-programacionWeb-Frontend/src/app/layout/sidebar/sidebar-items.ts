import { ROLES } from '@core/models/enums';
import { RouteInfo } from './sidebar.metadata';
export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard/main',
    title: 'Inicio',
    iconType: 'material-icons-outlined',
    icon: 'home',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN, ROLES.USER]
  },
  {
    path: '/page/projects',
    title: 'Gestión de proyectos',
    iconType: 'material-icons-outlined',
    icon: 'assessment',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  },  
  {
    path: '/page/users',
    title: 'Gestión de usuarios',
    iconType: 'material-icons-outlined',
    icon: 'assessment',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  },
  {
    path: '/page/projects',
    title: 'Mis proyectos',
    iconType: 'material-icons-outlined',
    icon: 'assessment',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.USER]
  },  
];
