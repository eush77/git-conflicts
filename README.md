[![npm](https://nodei.co/npm/git-conflicts.png)](https://nodei.co/npm/git-conflicts/)

# git-conflicts

[![Build Status][travis-badge]][travis]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][david-badge]][david]

Resolve merge conflicts in the editor. With `conflicts`, you do all the work yourself.

[travis]: https://travis-ci.org/eush77/git-conflicts
[travis-badge]: https://travis-ci.org/eush77/git-conflicts.svg?branch=master
[coveralls]: https://coveralls.io/github/eush77/git-conflicts?branch=master
[coveralls-badge]: https://coveralls.io/repos/eush77/git-conflicts/badge.svg?branch=master&service=github
[david]: https://david-dm.org/eush77/git-conflicts
[david-badge]: https://david-dm.org/eush77/git-conflicts.png

## Usage

```
$ git conflicts
```

Searches for conflicts in unmerged files in the root Git directory and opens each one in the editor. You resolve one conflict, save and exit, and continue to the next.

Conflict resolution is a process of transforming this:

```diff
<<<<<<< branch1
Content from branch 1.
=======
Content from branch 2.
>>>>>>> branch2
```

into this:

```diff
<<<<<<< branch1
Resolved conflict.
>>>>>>> branch2
```

Note that `conflicts` assumes you leave header and footer lines and put resolved lines in between.

To skip a conflict, exit without resolution and select `skip` in the prompt.

```
$ git conflicts .
```

Similar to the no-arguments case, but searches for conflicts in the current directory as opposed to the root directory.

```
$ git conflicts [filename]...
```

Similar to the above, but each unmerged file name is additionally filtered to match one of the `filenames` specified in the arguments. Each `filename` must be a path to a file or a directory, relative to the current working directory.

## Configuration

- `$EDITOR` — set this variable to override the default editor.
- `$GIT_EDITOR` — set this variable to override `$EDITOR`.

## Install

```
npm install -g git-conflicts
```

## License

MIT
