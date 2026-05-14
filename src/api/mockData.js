// Иерархия оборудования CATOCA
export const MOCK_EQUIPMENT = [
  // Уровень 1: Фабрики
  { id: 'F2', name: 'ФАБРИКА 2', parentId: null, isEquipment: false, status: 'working' },
  
  // Уровень 2: Участки
  { id: 'F2-SEC1', name: 'УЧАСТОК ДРОБЛЕНИЯ', parentId: 'F2', isEquipment: false, status: 'working' },
  { id: 'F2-SEC2', name: 'УЧАСТОК СОРТИРОВКИ', parentId: 'F2', isEquipment: false, status: 'working' },
  
  // Уровень 3: Агрегаты
  { 
    id: 'FB2-BN-001', 
    name: 'Приемный бункер', 
    parentId: 'F2-SEC1', 
    isEquipment: true, 
    status: 'working',
    lastStatusChange: '2026-05-10T09:00:00Z',
    statusAuthor: 'Николай Марилов',
    commissioningDate: '2018-03-12'
  },
  { 
    id: 'FB2-PT-001', 
    name: 'Питатель', 
    parentId: 'F2-SEC1', 
    isEquipment: true, 
    status: 'working',
    lastStatusChange: '2026-05-11T12:00:00Z',
    statusAuthor: 'Сергей Кузнецов',
    commissioningDate: '2018-04-15'
  },
  { 
    id: 'FB2-DR-001', 
    name: 'Дробилка', 
    parentId: 'F2-SEC1', 
    isEquipment: true, 
    status: 'not_working',
    lastStatusChange: '2026-05-13T07:30:00Z',
    statusAuthor: 'Иван Петров',
    commissioningDate: '2019-11-20'
  },
  { 
    id: 'FB2-CV-101', 
    name: 'Конвейер 101', 
    parentId: 'F2-SEC2', 
    isEquipment: true, 
    status: 'working',
    lastStatusChange: '2026-05-12T15:00:00Z',
    statusAuthor: 'Николай Марилов',
    commissioningDate: '2020-06-01'
  },
  { 
    id: 'FB2-PRG-101', 
    name: 'Перегрузка 101-102', 
    parentId: 'F2-SEC2', 
    isEquipment: true, 
    status: 'working',
    lastStatusChange: '2026-05-12T15:10:00Z',
    statusAuthor: 'Сергей Кузнецов',
    commissioningDate: '2020-06-05'
  },
  { 
    id: 'FB2-CV-102', 
    name: 'Конвейер 102', 
    parentId: 'F2-SEC2', 
    isEquipment: true, 
    status: 'ppm',
    lastStatusChange: '2026-05-13T08:00:00Z',
    statusAuthor: 'Дмитрий Волков',
    commissioningDate: '2020-07-22'
  },
  { 
    id: 'FB2-CV-103', 
    name: 'Конвейер 103', 
    parentId: 'F2-SEC2', 
    isEquipment: true, 
    status: 'working',
    lastStatusChange: '2026-05-10T09:00:00Z',
    statusAuthor: 'Николай Марилов',
    commissioningDate: '2022-01-10'
  }
];

export const MOCK_TICKETS = [
  {
    id: 'BN001-1001',
    equipmentId: 'FB2-BN-001',
    type: 'accident',
    status: 'open',
    createdAt: '2026-05-13T09:00:00Z',
    authorName: 'Петр Электрик',
    description: 'Выход из строя пускателя. Замена контактора КТ-6033.',
    service: 'Electrical',
    downtimeDuration: 4.5,
    comments: []
  },
  {
    id: 'CV103-1002',
    equipmentId: 'FB2-CV-103',
    type: 'accident',
    status: 'open',
    createdAt: '2026-05-14T07:30:00Z',
    authorName: 'Иван Механик',
    description: 'Износ футеровки приемной воронки. Пробой ленты.',
    service: 'Mechanics',
    downtimeDuration: 12,
    comments: [
      { id: 'c1', authorName: 'Николай Марилов', text: 'Заказана новая лента, ждем доставку со склада.', timestamp: '2026-05-14T07:45:00Z' }
    ]
  },
  {
    id: 'CV102-1003',
    equipmentId: 'FB2-CV-102',
    type: 'ppm',
    status: 'completed',
    createdAt: '2026-05-13T08:00:00Z',
    authorName: 'Сергей Кузнецов',
    description: 'Плановая замена роликов и очистка конвейера.',
    service: 'Mechanics',
    downtimeDuration: 8,
    comments: []
  },
  {
    id: 'DR001-1004',
    equipmentId: 'FB2-DR-001',
    type: 'accident',
    status: 'completed',
    createdAt: '2026-05-09T07:30:00Z',
    authorName: 'Дмитрий Волков',
    description: 'Заклинивание натяжного барабана. Очистка и смазка.',
    service: 'Mechanics',
    downtimeDuration: 20,
    comments: []
  },
  {
    id: 'PT001-1005',
    equipmentId: 'FB2-PT-001',
    type: 'accident',
    status: 'completed',
    createdAt: '2026-05-12T14:00:00Z',
    authorName: 'Петр Электрик',
    description: 'Разрыв стыка ленты. Вулканизация.',
    service: 'Mechanics',
    downtimeDuration: 6,
    comments: []
  },
  {
    id: 'DR001-1006',
    equipmentId: 'FB2-DR-001',
    type: 'warning',
    status: 'open',
    createdAt: '2026-05-14T06:15:00Z',
    authorName: 'Николай Марилов',
    description: 'Повышенная вибрация на подшипнике главного вала.',
    service: 'Mechanics',
    downtimeDuration: 0,
    comments: []
  },
  {
    id: 'CV101-1007',
    equipmentId: 'FB2-CV-101',
    type: 'ppm',
    status: 'completed',
    createdAt: '2026-05-05T09:00:00Z',
    authorName: 'Сергей Кузнецов',
    description: 'Ежемесячное ТО конвейера. Проверка натяжения ленты.',
    service: 'Mechanics',
    downtimeDuration: 4,
    comments: []
  },
  {
    id: 'PRG101-1008',
    equipmentId: 'FB2-PRG-101',
    type: 'accident',
    status: 'completed',
    createdAt: '2026-04-28T15:20:00Z',
    authorName: 'Иван Петров',
    description: 'Завал перегрузочного узла. Очистка вручную.',
    service: 'General',
    downtimeDuration: 3.5,
    comments: []
  },
  {
    id: 'PT001-1009',
    equipmentId: 'FB2-PT-001',
    type: 'warning',
    status: 'completed',
    createdAt: '2026-05-02T11:45:00Z',
    authorName: 'Петр Электрик',
    description: 'Перегрев двигателя питателя. Продувка системы охлаждения.',
    service: 'Electrical',
    downtimeDuration: 1.5,
    comments: []
  },
  {
    id: 'BN001-1010',
    equipmentId: 'FB2-BN-001',
    type: 'accident',
    status: 'completed',
    createdAt: '2026-04-20T08:00:00Z',
    authorName: 'Николай Марилов',
    description: 'Обрыв датчика уровня в бункере. Замена кабельной трассы.',
    service: 'Automation',
    downtimeDuration: 5,
    comments: []
  },
  {
    id: 'CV103-1011',
    equipmentId: 'FB2-CV-103',
    type: 'warning',
    status: 'open',
    createdAt: '2026-05-13T16:30:00Z',
    authorName: 'Иван Механик',
    description: 'Неравномерный износ ленты. Требуется центровка.',
    service: 'Mechanics',
    downtimeDuration: 0,
    comments: []
  },
  {
    id: 'CV102-1012',
    equipmentId: 'FB2-CV-102',
    type: 'ppm',
    status: 'open',
    createdAt: '2026-05-14T05:00:00Z',
    authorName: 'Сергей Кузнецов',
    description: 'Замена масла в редукторе.',
    service: 'Mechanics',
    downtimeDuration: 2,
    comments: []
  },
  {
    id: 'DR001-1013',
    equipmentId: 'FB2-DR-001',
    type: 'accident',
    status: 'open',
    createdAt: '2026-05-14T07:20:00Z',
    authorName: 'Дмитрий Волков',
    description: 'Попадание недробимого тела. Сработала защита.',
    service: 'Mechanics',
    downtimeDuration: 3,
    comments: []
  },
  {
    id: 'PT001-1014',
    equipmentId: 'FB2-PT-001',
    type: 'warning',
    status: 'completed',
    createdAt: '2026-04-25T13:00:00Z',
    authorName: 'Петр Электрик',
    description: 'Сбой в работе частотного преобразователя.',
    service: 'Electrical',
    downtimeDuration: 0.5,
    comments: []
  },
  {
    id: 'CV101-1015',
    equipmentId: 'FB2-CV-101',
    type: 'ppm',
    status: 'completed',
    createdAt: '2026-04-15T09:00:00Z',
    authorName: 'Сергей Кузнецов',
    description: 'Инспекция роликоопор и очистителей.',
    service: 'Mechanics',
    downtimeDuration: 2,
    comments: []
  }
];

export const MOCK_DOWNTIME_LOG = [
  { id: 'dl-1', equipmentId: 'FB2-BN-001', type: 'accident', description: 'Выход из строя пускателя', hours: 4.5, startTime: '2026-05-13T09:00:00Z', status: 'closed', service: 'Electrical' },
  { id: 'dl-2', equipmentId: 'FB2-CV-103', type: 'accident', description: 'Износ футеровки', hours: 12.0, startTime: '2026-05-14T07:30:00Z', status: 'open', service: 'Mechanics' },
  { id: 'dl-3', equipmentId: 'FB2-DR-001', type: 'accident', description: 'Заклинивание дробилки', hours: 20.0, startTime: '2026-05-09T07:30:00Z', status: 'closed', service: 'Mechanics' },
  { id: 'dl-4', equipmentId: 'FB2-CV-102', type: 'ppm', description: 'Плановая замена роликов', hours: 8.0, startTime: '2026-05-13T08:00:00Z', status: 'closed', service: 'Mechanics' },
  { id: 'dl-5', equipmentId: 'FB2-PT-001', type: 'accident', description: 'Разрыв стыка ленты', hours: 6.0, startTime: '2026-05-12T14:00:00Z', status: 'closed', service: 'Mechanics' },
  { id: 'dl-6', equipmentId: 'FB2-CV-102', type: 'ppm', description: 'Замена масла в редукторе', hours: 2.0, startTime: '2026-05-14T05:00:00Z', status: 'open', service: 'Mechanics' },
  { id: 'dl-7', equipmentId: 'FB2-DR-001', type: 'accident', description: 'Попадание недробимого тела', hours: 3.0, startTime: '2026-05-14T07:20:00Z', status: 'open', service: 'Mechanics' },
  { id: 'dl-8', equipmentId: 'FB2-CV-101', type: 'ppm', description: 'Ежемесячное ТО', hours: 4.0, startTime: '2026-05-05T09:00:00Z', status: 'closed', service: 'Mechanics' },
  { id: 'dl-9', equipmentId: 'FB2-PRG-101', type: 'accident', description: 'Завал перегрузки', hours: 3.5, startTime: '2026-04-28T15:20:00Z', status: 'closed', service: 'General' },
  { id: 'dl-10', equipmentId: 'FB2-BN-001', type: 'accident', description: 'Обрыв датчика уровня', hours: 5.0, startTime: '2026-04-20T08:00:00Z', status: 'closed', service: 'Automation' }
];


export const MOCK_KNOWLEDGE_BASE = [
  {
    id: 'kb-1',
    title: 'Инструкция по замене футеровки бункера',
    category: 'mechanics',
    authorName: 'Николай Марилов',
    date: '2026-05-01T10:00:00Z',
    content: 'Полное описание процесса замены защитных плит бункера...',
    attachments: [{ name: 'Manual_BN_001.pdf', size: '2.4 MB' }],
    equipmentId: 'FB2-BN-001',
    tags: ['футеровка', 'бункер', 'ремонт']
  },
  {
    id: 'kb-2',
    title: 'Схема электрическая Конвейера 103',
    category: 'electrical',
    authorName: 'Петр Электрик',
    date: '2026-05-05T08:00:00Z',
    content: 'Принципиальная схема управления и силовых цепей...',
    attachments: [{ name: 'Schema_CV_103.dwg', size: '1.1 MB' }],
    equipmentId: 'FB2-CV-103',
    tags: ['схема', 'электрика', 'конвейер']
  }
];

export const MOCK_MATERIALS = [
  { id: 'mat-1', itemName: 'Подшипник SKF 6205', quantity: 12, unit: 'pcs', urgency: 'planned', status: 'new', equipmentId: 'FB2-CV-103', authorName: 'Иван Механик', createdAt: '2026-05-10T10:00:00Z' },
  { id: 'mat-2', itemName: 'Лента конвейерная 800мм', quantity: 50, unit: 'm', urgency: 'critical', status: 'processing', equipmentId: 'FB2-CV-103', authorName: 'Николай Марилов', createdAt: '2026-05-12T09:30:00Z' }
];

export const MOCK_SERVICES = [
  'Mechanics',
  'Electrical',
  'Automation',
  'Supply',
  'General'
];
