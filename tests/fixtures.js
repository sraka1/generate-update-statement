export const mockInputDocument = {
    _id: 1,
    name: 'Johnny Content Creator',
    posts: [
      {
        _id: 2,
        value: 'one',
        mentions: []
      },
      {
        _id: 3,
        value: 'two',
        mentions: [
          {
            _id: 5,
            text: 'apple'
          },
          {
            _id: 6,
            text: 'orange'
          }
        ]
      },
      {
        _id: 4,
        value: 'three',
        mentions: []
      }
    ]
  }
  
  export const mockInputDocumentThirdLevelNesting = {
    _id: 1,
    name: 'Johnny Content Creator',
    posts: [
      {
        _id: 2,
        value: 'one',
        mentions: []
      },
      {
        _id: 3,
        value: 'two',
        mentions: [
          {
            _id: 5,
            text: 'apple',
            authors: []
          },
          {
            _id: 6,
            text: 'orange',
            authors: [
              {
                _id: 7,
                username: 'John'
              },
              {
                _id: 8,
                username: 'Jane'
              }
            ]
          }
        ]
      },
      {
        _id: 4,
        value: 'three',
        mentions: []
      }
    ]
  }
  