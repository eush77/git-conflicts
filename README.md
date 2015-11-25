[![npm](https://nodei.co/npm/git-conflicts.png)](https://nodei.co/npm/git-conflicts/)

# git-conflicts

[![Build Status][travis-badge]][travis]
[![Dependency Status][david-badge]][david]

Resolve merge conflicts in the editor. With `conflicts`, you do all the work yourself.

[travis]: https://travis-ci.org/eush77/git-conflicts
[travis-badge]: https://travis-ci.org/eush77/git-conflicts.svg?branch=master
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

You can abort conflict resolution process at any time by exiting with non-zero return code from the editor (editors not capable of that are not worth using).

```
git conflicts [file]...
```

Run `conflicts` on specified files.

## Configuration

- `$EDITOR` — set this variable to override the default editor.

## Install

```
npm install -g git-conflicts
```

## License

MIT
