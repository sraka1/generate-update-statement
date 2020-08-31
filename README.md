## @sraka1/generate-update-statement

A quick script/module that takes a given input based on a spec and modifies it into a DBMS compatible statement. The code should mostly be self-explanatory, however comments have been added for extra clarity.

The module has one named export - the function `generateUpdateStatement`.

### Install deps
```
yarn install
```

### Run the test suite
```
yarn run test
```

### Run linter
```
yarn run lint
yarn run lint --fix #fix linting errors
```

#### General notes
- The initial implementation ideal/thought process: since this needs to be generic and support unlimited nesting, some sort of recursion would be needed. In that mindset, flattening the object tree seemed very in line with what the final DBMS output should be. Additionally, an intermediary layer resolves the id from the subtree being processed. Also, some special cases are checked ("_delete" metadata field) and metadata fields are ignored / not added to the insertion data itself.
- This uses vanilla JS (ES6) without any dependencies except a couple lodash functions, however, using a functional programming library/toolkit such a ramda might create a more concise and equally performant solution (couple recipes that touch on this https://github.com/ramda/ramda/wiki/Cookbook#rename-keys-of-an-object or https://github.com/ramda/ramda/wiki/Cookbook#get-object-by-id), but obviously with a larger dependency tree
- In ES6, there are many constructs that one can use instead of helpers such as those provided by lodash, but to I find code is more concise when using i.e. `_.has(mutation, index)` rather than `Object.prototype.hasOwnProperty.call(mutation, index)` - even though under the hood the former just wraps the latter
- The spec specified the implementation to be JS, if this restriction was not in place, TypeScript would be preferred
- The only driver here are the unit tests, however it should be trivial to import the module should one want to use it in other contexts (i.e. a REST web interface or a CLI)
- To test genericness, an additional fixture with a third nesting level was added in the tests

#### Spec ambiguities or conflicts
- The spec did not specify what to do in case of outright invalid mutations (i.e. updating a sub-document that does not exist). Since the DBMS would most likely return an error, there is no sense in providing anything to it (provided that we are sure that the “original document” input is correct). The only question is whether to throw an exception outright or simply ignore the mutation and not translate it into a statement. This implementation throws an exception (or JS Error object, to be precise).
- Some of the comments in the spec seem to have a couple mistakes - i.e. ```“//OUTPUT: Update text field in mention at index 1, for post at index 0
{ "$update": {"posts.1.mentions.0.text": "pear”}}” (1 and 0 should be reversed) also “//OUTPUT: Add mention for post at index 2
{"$add": {"posts.1.mentions": {"text": "banana”}}}”``` (should be 1, not 2)
- On the appending example in the spec, in the first example it adds an array with the object to be added  `[{"value": "four”}]`, but in the second one, it adds only the object - `{"text": "banana"}`. I followed the second schema. Unit tests have been slightly updated in-lieu of that (they do not match exactly what was in the spec)

##### Possible future improvements:
- There are definitely ways to simplify the code and have it a bit more concise
- If the DBMS exposes a validation client/library (i.e. for MongoDB this would be https://github.com/mongodb-js/mongodb-language-model), perhaps it would make sense to syntactically validate statements beforehand as well - first thought that pops into head is i.e. if nesting levels are limited on the DBMS or something like that...
- To make this even more robust, adding some fuzzy testing might be interesting - to generate document-like structures on-the-fly and throw also on-the-fly generated mutations at them. This could perhaps catch some special cases?
- ~~To reduce DB load, there might be occurrences where the same post might be added, updated and removed (I’m thinking of a stream of updates coming in, which are batched into a single DBMS query). In this particular case, no query would need to be executed.~~ Nevermind, spec explicitly says this does not need to be handled.

