import _ from 'lodash' // babel-plugin-lodash

function trimDot (str) {
  if (str[str.length - 1] === '.') {
    str = str.slice(0, -1)
  }
  return str
}

function flattenMutationAndResolveIds (originalDocument, mutation, prefix = false, accumulator = null, statements = null) {
  accumulator = accumulator || {}
  statements = statements || { $update: {}, $add: {}, $remove: {} }

  // Preserve empty arrays
  if (_.isArray(mutation) && mutation.length < 1) {
    accumulator[prefix] = []
  }

  prefix = prefix ? prefix + '.' : ''

  for (const i in mutation) {
    if (_.has(mutation, i)) {
      // typeof === 'object' / _.isObject is truthy for arrays and objects
      if (_.isObject(mutation[i]) && mutation[i] !== null) {
        if (_.isPlainObject(mutation[i]) && _.has(mutation[i], '_id') && !_.has(mutation[i], '_delete')) {
          const documentTreeAtPrefix = _.get(originalDocument, trimDot(prefix))
          // If the document tree specified by the wanted mutation is invalid, throw exception
          if (_.isUndefined(documentTreeAtPrefix)) {
            throw new Error(`Requested mutation is invalid. _id: ${trimDot(prefix)} is not a part of the document tree.`)
          }
          // Find position of requested document in subtree
          const resolvedId = _.findIndex(documentTreeAtPrefix, { _id: mutation[i]._id })
          // If the document id does not exist, throw exception
          if (resolvedId < 0) {
            throw new Error(`Requested mutation is invalid. _id: ${resolvedId} is cannot be found in the document tree.`)
          }
          // Recursion on deeper objects and arrays
          flattenMutationAndResolveIds(originalDocument, mutation[i], prefix + resolvedId, accumulator, statements)
        } else if (_.isPlainObject(mutation[i]) && _.has(mutation[i], '_delete') && mutation[i]._delete) {
          const documentTreeAtPrefix = _.get(originalDocument, trimDot(prefix))
          // If the document tree specified by the wanted mutation is invalid, throw exception
          if (_.isUndefined(documentTreeAtPrefix)) {
            throw new Error(`Requested mutation is invalid. _id: ${trimDot(prefix)} is not a part of the document tree.`)
          }
          const resolvedId = _.findIndex(documentTreeAtPrefix, { _id: mutation[i]._id })
          // If the document id does not exist, throw exception
          if (resolvedId < 0) {
            throw new Error(`Requested mutation is invalid. _id: ${resolvedId} is cannot be found in the document tree.`)
          }
          // This is a deletion
          accumulator[prefix + resolvedId] = mutation[i]
          statements.$remove[prefix + resolvedId] = true
        } else if (_.isPlainObject(mutation[i]) && !_.has(mutation[i], '_id')) {
          // This is an addition
          accumulator[prefix + i] = mutation[i]
          statements.$add[trimDot(prefix)] = mutation[i]
        } else {
          const resolvedId = i
          // Recursion on deeper objects and arrays
          flattenMutationAndResolveIds(originalDocument, mutation[i], prefix + resolvedId, accumulator, statements)
        }
      } else {
        if (i !== '_id' && i !== '_delete') {
          accumulator[prefix + i] = mutation[i]
          // Simple object that is neither a deletion or addition is an update
          statements.$update[prefix + i] = mutation[i]
        }
      }
    }
  }
  return statements
}

export function generateUpdateStatement (originalDocument, mutation) {
  const statements = flattenMutationAndResolveIds(originalDocument, mutation)
  const { $update, $add, $remove } = statements
  const returnValue = {
    ...(!_.isEmpty($update) && { $update }),
    ...(!_.isEmpty($add) && { $add }),
    ...(!_.isEmpty($remove) && { $remove })
  }
  return returnValue
}
