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
        title: 'User',
        to: { name: 'management-user' },
        icon: { icon: 'ri-user-3-line' },
      },
      {
        title: 'Role',
        to: { name: 'role' },
        icon: { icon: 'ri-user-star-line' },  
      },
      {
        title: 'Unit',
        to: { name: 'unit' },
        icon: { icon: 'ri-building-2-line' },
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
        icon: { icon: 'ri-map-pin-line' },
      },
      {
        title: 'Master JRA',
        to: { name: 'master-master_jra' },
        icon: { icon: 'ri-bar-chart-line' },
      },
    ],
  },
  {
    title: 'List Arsip',
    to: { name: 'list_arsip' },
    icon: { icon: 'ri-book-shelf-line' },
  },
]
