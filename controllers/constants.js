'use strict'
module.exports = {

  // return key-value list
  // e.g. for 'Types'
  // [{id: 'food-and-drinks', label: 'Food and Drinks'},...]
  // getKeyLabel(constantName, keyProp, labelProp, limit) {
  //   if (!this._messages || !this[constantName]) {
  //     console.log('no messages or no constant in constants.js')
  //     return
  //   }
  //   var that = this,
  //     arr = []
  //   this[constantName].forEach(function(id) {
  //     if (!limit || (limit >= 0 && arr.length < limit)) {
  //       var obj = {}
  //       obj[keyProp || 'id'] = id
  //       obj[labelProp || 'label'] = that._messages['constants_' + constantName + '_' + id] || id
  //       arr.push(obj)
  //     }
  //   })
  //   return arr
  // },

  UI: {
    CLASSES: {
      showHeader: 'watchScrollHeader_show',
      hideHeader: 'watchScrollHeader_hide'
    }
  },

  DaysOfWeek: [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ],

  cookieNames: {
    session: 'bookingapp.session'
  },

  blankOptionValue: '_default',

  areaOptions: {
    tokyo: [
      'A1301',
      'A1307',
      'A1303',
      'A1306',
      'A1311',
      'A1302',
      'A1310',
      'A1304',
      'A1313'
    ]
  },

  areaCoords: {
    'A1301': {
      latitude: 35.671252,
      longitude: 139.765657
    },
    'A1307': {
      latitude: 35.664122,
      longitude: 139.729426
    },
    'A1303': {
      latitude: 35.658129,
      longitude: 139.702133
    },
    'A1306': {
      latitude: 35.669051,
      longitude: 139.711835
    },
    'A1311': {
      latitude: 35.714889,
      longitude: 139.785173
    },
    'A1302': {
      latitude: 35.682157,
      longitude: 139.769084
    },
    'A1310': {
      latitude: 35.697591,
      longitude: 139.772796
    },
    'A1304': {
      latitude: 35.69384,
      longitude: 139.703549
    },
    'A1313': {
      latitude: 35.663173,
      longitude: 139.774276
    }
  },

  PRICE_OPITONS: [
    {text: '¥0', value: -1},
    {text: '¥1,000', value: 1000},
    {text: '¥2,000', value: 2000},
    {text: '¥3,000', value: 3000},
    {text: '¥4,000', value: 4000},
    {text: '¥5,000', value: 5000},
    {text: '¥6,000', value: 6000},
    {text: '¥8,000', value: 8000},
    {text: '¥10,000', value: 10000},
    {text: '¥15,000', value: 15000},
    {text: '¥20,000', value: 20000},
    {text: '¥30,000', value: 30000},
    {text: '+¥30,000', value: Number.MAX_VALUE}
  ]

}