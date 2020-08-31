/* eslint-env jest */
import { generateUpdateStatement } from '../src'
import { mockInputDocument, mockInputDocumentThirdLevelNesting } from './fixtures'

describe('generateUpdateStatement', () => {
  it('simple field update', () => {
    const mockMutation = { posts: [{ _id: 2, value: 'too' }, { _id: 4, value: 'roo' }] }

    // Given
    const expectedResult = { $update: { 'posts.0.value': 'too', 'posts.2.value': 'roo' } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested field update', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 5, text: 'pear' }] }] }

    // Given
    const expectedResult = { $update: { 'posts.1.mentions.0.text': 'pear' } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested field update (nesting level 3)', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 6, authors: [{ _id: 8, username: 'Joanne' }] }] }] }

    // Given
    const expectedResult = { $update: { 'posts.1.mentions.1.authors.1.username': 'Joanne' } }
    // When
    const result = generateUpdateStatement(mockInputDocumentThirdLevelNesting, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('simple addition', () => {
    const mockMutation = { posts: [{ value: 'four' }] }

    // Given
    const expectedResult = { $add: { posts: { value: 'four' } } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested addition', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ text: 'banana' }] }] }

    // Given
    const expectedResult = { $add: { 'posts.1.mentions': { text: 'banana' } } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested addition (nesting level 3)', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 6, authors: [{ username: 'Emma' }] }] }] }

    // Given
    const expectedResult = { $add: { 'posts.1.mentions.1.authors': { username: 'Emma' } } }
    // When
    const result = generateUpdateStatement(mockInputDocumentThirdLevelNesting, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('simple deletion', () => {
    const mockMutation = { posts: [{ _id: 2, _delete: true }] }

    // Given
    const expectedResult = { $remove: { 'posts.0': true } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested deletion', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 6, _delete: true }] }] }

    // Given
    const expectedResult = { $remove: { 'posts.1.mentions.1': true } }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested deletion (nesting level 3)', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 6, authors: [{ _id: 7, _delete: true }] }] }] }

    // Given
    const expectedResult = { $remove: { 'posts.1.mentions.1.authors.0': true } }
    // When
    const result = generateUpdateStatement(mockInputDocumentThirdLevelNesting, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })

  it('nested deletion (nesting level 3) - non-existant node throws exception', () => {
    const mockMutation = { posts: [{ _id: 3, mentions: [{ _id: 6, authors: [{ _id: 7, _delete: true }] }] }] }

    // Then
    const throwableFunction = () => {
      generateUpdateStatement(mockInputDocument, mockMutation)
    }
    expect(throwableFunction).toThrow('Requested mutation is invalid. _id: posts.1.mentions.1.authors is not a part of the document tree.')
  })

  it('combined statement', () => {
    const mockMutation = {
      posts: [
        { _id: 2, value: 'too' },
        { value: 'four' },
        { _id: 4, _delete: true }
      ]
    }
    // Given
    const expectedResult = {
      $update: { 'posts.0.value': 'too' },
      $add: { posts: { value: 'four' } },
      $remove: { 'posts.2': true }
    }
    // When
    const result = generateUpdateStatement(mockInputDocument, mockMutation)
    // Then
    expect(result).toEqual(expectedResult)
  })
})
