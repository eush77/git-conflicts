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
git conflicts
```

Opens each conflict in the editor. You resolve the conflict, save and exit, and go to the next one.

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
git conflicts [file]...
```

Run `conflicts` on specified files.

## Configuration

- `$EDITOR` — set this variable to override the default editor.
- `$GIT_EDITOR` — set this variable to override `$EDITOR`.

## Install

```
npm install -g git-conflicts
```

## License

MIT
