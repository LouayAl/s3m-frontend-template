// frontend-template/vite/src/views/equipment-manager/data/bookletData.js
// RTG Trainee Booklet — 15 days of training content and evaluation criteria
// Rating scale: 1 = Needs improvement, 2 = Developing, 3 = Proficient, 4 = Expert

export const RATING_SCALE = [
  { value: 1, label: '1', desc: 'Needs improvement' },
  { value: 2, label: '2', desc: 'Developing' },
  { value: 3, label: '3', desc: 'Proficient' },
  { value: 4, label: '4', desc: 'Expert' },
];

export const DAYS_DATA = [
  {
    day: 1,
    title: 'Safety & RTG Introduction',
    content: [
      'Full explanation of Safety Measures',
      'Types of containers',
      'Main causes of accidents',
      'Law and Responsibility',
      'Technical description of the RTG',
      'Main Safety Features of the RTG',
      'Nominal capacity',
      'Checks / pre-inspection and post-inspection',
    ],
    criteria: [
      'Aware of his responsibilities',
      'Aware of safety procedures',
      'Aware of RTG role in the terminal',
      'Got an overview of the components of the RTG',
      'Understanding what expected of him',
      'Able to do prestart inspection and checks',
      'Able to inspect and start the engine',
      'Able to adjust seat for correct working position',
      'Aware of cabin controls uses',
      'Able to inspect cabin controls and hoisting equipments',
      'Able to adjust the crane seat',
      'Follows shut down procedures',
    ],
  },
  {
    day: 2,
    title: 'Crane Features & Trolley Control',
    content: [
      'Ability to use crane features',
      'Mastering trolley movement and manage the speed',
    ],
    criteria: [
      'Aware of RTG functions',
      'Able to manage trolley speed',
      'Able to manage hoist speed',
      'Able to be combining trolley and hoist movements',
      'Follows shutdown procedures',
    ],
  },
  {
    day: 3,
    title: 'Spreader Movements',
    content: [
      'Mastering spreader movements',
      'Precision in Container Handling',
    ],
    criteria: [
      'Able to direct the spreader in the optimal path',
      'Able to control spreader movements precisely',
      'Able to pick up containers on the ground in different Rows',
      'Able to place containers on the ground in different Rows',
    ],
  },
  {
    day: 4,
    title: 'Ground & 2nd Tier Maneuvering',
    content: [
      'Maneuvering containers on the ground',
      'Maneuvering containers on the second tier',
    ],
    criteria: [
      'Able to maneuvering containers on the ground',
      'Able to pick up containers on the second tier',
      "Able to place 20'-40' container onto 20'-40' container",
      'Able to maneuvering containers on second tier precisely with an optimal path',
    ],
  },
  {
    day: 5,
    title: 'Above 2nd Tier & Truck Loading',
    content: [
      'Maneuvering containers over the second tier',
      'Loading and discharging truck',
    ],
    criteria: [
      'Able to maneuver containers over second tiers',
      "Able to pick up 20'-40' containers on the second tier",
      "Able to place 20'-40' container onto 20'-40' container on the second tier",
      'Able to maneuver containers over second tier with an optimal path',
      'Able to gantry 00° mode',
      'Able to positioning on the new bay',
      "Able to pick up 20'-40' containers on the third tier",
      "Able to place 20'-40' containers onto 20'-40' container on the third tiers",
      'Able to maneuver containers over three tiers',
      'Able to maneuver containers over three tiers with an optimal path',
    ],
  },
  {
    day: 6,
    title: '3rd Tier & Gantry Movements',
    content: [
      'Maneuvering containers over third tier',
      'Mastering gantry movements',
    ],
    criteria: [
      'Able to maneuver containers over third tiers',
      "Able to pick up 20'-40' containers on the third tier",
      "Able to place 20'-40' container onto 20'-40' container on the third tier",
      'Able to maneuver containers on third tier precisely with an optimal path',
      'Able to gantry 90° mode',
      'Able to make 16° mode',
      'Able to travel from block to block',
      "Able to pick up 20'-40' containers on the fourth tier",
      "Able to place 20'-40' container onto 20'-40' container on the fourth tiers",
      'Able to maneuver containers over four tiers',
      'Able to maneuver containers over four tiers precisely with an optimal path',
    ],
  },
  {
    day: 7,
    title: '4th Tier & Truck Loading',
    content: [
      'Maneuvering containers over four tiers',
      'Loading and discharging truck',
    ],
    criteria: [
      "Able to pick up 20'-40' containers on the fourth tier",
      "Able to place 20'-40' container onto 20'-40' container on the fourth tiers",
      'Able to maneuver containers over four tiers with an optimal path',
      'Able to load and discharge truck',
    ],
  },
  {
    day: 8,
    title: '5th Tier & Truck Operations',
    content: [
      'Maneuvering containers over five tiers',
      'Loading and discharging truck',
    ],
    criteria: [
      "Able to pick up 20'-40' containers on the fifth tier",
      "Able to place 20'-40' container onto 20'-40' container on the fifth tiers",
      'Able to maneuver containers over five tiers',
      'Able to maneuver containers over five tiers with an optimal path',
      'Able to load and discharge truck under supervision',
    ],
  },
  {
    day: 9,
    title: '5th Tier Consolidation',
    content: [
      'Maneuvering containers over five tiers',
      'Loading and discharging truck',
    ],
    criteria: [
      'Able to maneuver containers over five tiers autonomously',
      'Able to load and discharge truck autonomously',
      'Follows all safety procedures during operations',
    ],
  },
  {
    day: 10,
    title: 'Supervised Real Operations',
    content: [
      'Practice and master basic skills during real operations under supervision of the trainer',
    ],
    criteria: [
      'Applies basic skills in real operations',
      'Follows safety rules during live operations',
      'Communicates effectively with ground crew',
      'Handles unexpected situations correctly',
    ],
  },
  {
    day: 11,
    title: 'Supervised Real Operations',
    content: [
      'Practice and master basic skills during real operations under supervision of the trainer',
    ],
    criteria: [
      'Maintains consistency in real operations',
      'Improves speed while maintaining safety',
      'Handles multiple container types',
    ],
  },
  {
    day: 12,
    title: 'Supervised Real Operations',
    content: [
      'Practice and master basic skills during real operations under supervision of the trainer',
    ],
    criteria: [
      'Demonstrates improved autonomy',
      'Handles complex scenarios independently',
      'Maintains optimal path selection',
    ],
  },
  {
    day: 13,
    title: 'Advanced Real Operations',
    content: [
      'Practice and master basic skills during real operations under supervision of the trainer',
    ],
    criteria: [
      'Operates with minimal guidance',
      'Responds to operational challenges effectively',
      'Maintains productivity standards',
    ],
  },
  {
    day: 14,
    title: 'Pre-Assessment Practice',
    content: [
      'Practice and master basic skills during real operations under supervision of the trainer',
    ],
    criteria: [
      'Ready for independent operation',
      'Demonstrates full mastery of RTG functions',
      'Follows all safety and operational procedures',
    ],
  },
  {
    day: 15,
    title: 'Final Assessment',
    content: [
      'Trainee confirms he can take responsibility for equipment',
      'Trainee confirms he acquired the RTG operating skills',
    ],
    criteria: [
      'Able to operate RTG independently and safely',
      'Demonstrates mastery of all tier operations',
      'Demonstrates mastery of gantry movements',
      'Demonstrates mastery of truck loading/discharging',
      'Confirms understanding of all safety procedures',
      'Ready for certification',
    ],
  },
];