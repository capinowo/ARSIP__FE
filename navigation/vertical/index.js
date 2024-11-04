export default [
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'ri-home-smile-line' },
  },
  {
    title: 'Management',
    icon: { icon: 'ri-computer-line' },
    children: [
      {
        title: 'Users',
        to: { name: 'management-user_manage' },
        icon: { icon: 'ri-circle-line' },
      },
      {
        title: 'Roles',
        to: { name: 'management-role_manage' },
        icon: { icon: 'ri-circle-line' },  
      },
      {
        title: 'Units',
        to: { name: 'management-unit_manage' },
        icon: { icon: 'ri-circle-line' },
      },
      {
        title: 'Permissions',
        to: { name: 'management-perm_manage' },
        icon: { icon: 'ri-circle-line' },
      },
    ],
  },
  {
    title: 'Master',
    icon: { icon: 'ri-bank-line' },
    children: [
      {
        title: 'Master Lokasi',
        to: { name: 'master-master_lokasi' },
        icon: { icon: 'ri-circle-line' },
      },
      {
        title: 'Master JRA',
        to: { name: 'master-master_jra' },
        icon: { icon: 'ri-circle-line' },
      },
    ],
  },
  {
    title: 'Arsip',
    icon: { icon: 'ri-book-shelf-line' },
    children: [
      {
        title: 'List Arsip',
        to: { name: 'arsip-list_arsip' },
        icon: { icon: 'ri-circle-line' },
      },
    ],
  },
]
