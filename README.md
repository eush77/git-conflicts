[![npm](https://nodei.co/npm/git-conflicts.png)](https://nodei.co/npm/git-conflicts/)

# git-conflicts

[![Dependency Status][david-badge]][david]

Resolve merge conflicts in the editor. With `conflicts`, you do all the work yourself.

[david]: https://david-dm.org/eush77/git-conflicts
[david-badge]: https://david-dm.org/eush77/git-conflicts.png

## Usage

```
git conflicts
```

Opens each conflict in the editor. You resolve the conflict, save and exit, and go to the next one.

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
