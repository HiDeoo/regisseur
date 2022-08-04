<div align="center">
  <h1>regisseur 📜</h1>
  <p><em>A person who stages a theatrical production.</em></p>
  <p>
    <a href="https://user-images.githubusercontent.com/494699/182808699-f06bcd81-7f43-4cbc-a292-fda0066517d7.gif" title="Screenshot of regisseur">
      <img alt="Screenshot of regisseur" src="https://user-images.githubusercontent.com/494699/182808699-f06bcd81-7f43-4cbc-a292-fda0066517d7.gif" width="520" />
    </a>
  </p>
</div>

<div align="center">
  <a href="https://github.com/HiDeoo/regisseur/actions/workflows/integration.yml">
    <img alt="Integration Status" src="https://github.com/HiDeoo/regisseur/actions/workflows/integration.yml/badge.svg" />
  </a>
  <a href="https://github.com/HiDeoo/regisseur/blob/main/LICENSE">
    <img alt="License" src="https://badgen.net/github/license/hideoo/regisseur" />
  </a>
  <br /><br />
</div>

## Features

Some not entirely automated processes or sensitive workflows still rely on manual steps usually described in text documents which can be hard to follow, where it is easy to miss a step or get lost in the process.

`regisseur` is a small utility allowing you to describe such workflows in a simple, human-readable format called [**_plays_**](#play-files) and automatically prompt you for every step or [**_act_**](#acts) of a play and wait for a confirmation keyword before proceeding to the next one.

- Human-readable play in [HJSON format](https://hjson.github.io)
- Resumability of a play (i.e. you can resume a play from any given act)
- Configurable confirmation keyword (`done` by default)
- Restrict a play to a specific Git branch (e.g. `main` or `develop`)
- Restrict a play to a clean Git working tree (i.e. no uncommited changes)

## Usage

You can either add `regisseur` to your project and invoke it with your favorite package manager (or through a script entry in your project's `package.json` file):

```shell
$ pnpm add -D regisseur
$ pnpm regisseur …
```

or use it directly with `npx` or `pnpx`:

```shell
$ pnpx regisseur …
```

## Commands

### Run a play

To run a play, you can simply invoke `regisseur` and optionaly specify the play to run:

```shell
$ pnpx regisseur [play]
```

> **Note**
> The `play` argument can either be the path to a play file, the file name of a play file located in the `plays` directory, or the name of a play specified in the play itself. This argument can also be omitted to either play the `default.play` file in the `plays` directory or the only file in this directory if you have only one play in your project.

### Resume a play

You can resume a play from a given step or **_act_** by specifying its number with the `-c, --continue` option:

```shell
$ pnpx regisseur [play] -c <actNumber>
```

### List all plays

To quickly list all plays in your project, you can use the `list` command:

```shell
$ pnpx regisseur list
```

### Validate a play

To validate a play, you can use the `validate` command:

```shell
$ pnpx regisseur validate [play]
```

> **Note**
> The `play` argument can either be the path to a play file, the file name of a play file located in the `plays` directory, or the name of a play specified in the play itself. This argument can also be omitted to either play the `default.play` file in the `plays` directory or the only file in this directory if you have only one play in your project.

## Play files

Play files are files located in the `plays` directory with the `.play` extension using the [HJSON format](https://hjson.github.io).

To run a default play when running the `regisseur` command without any arguments, you can use the `default.play` file.

### Global options

#### Name

A play can be a given a human-readable name:

```hjson
{
  name: Release the thing
}
```

#### Confirmation keyword

By default, an act can be validated using the `done` keyword but you can specify a different keyword for an entire play:

```hjson
{
  confirmation: ok
}
```

#### Git branch restriction

A play can be restricted to a specific Git branch:

```hjson
{
  branch: main
}
```

#### Git clean working tree restriction

A play can be restricted to a clean Git working tree:

```hjson
{
  clean: true
}
```

### Acts

The various steps or **_acts_** of a play are described using the `acts` property. Each act is composed of a `title` and `scenes` describing how to complete the act:

```hjson
{
  name: Release the thing

  acts: [
    {
      title: Build the thing
      scenes: [
        Do the first thing
        Do the second thing
        Do the third thing
      ]
    }
    {
      title: Publish the thing
      scenes: [
        Do this
        Do that
        Run this thing
      ]
    }
  ]
}
```

An act can also temporarily override the confirmation keyword:

```hjson
{
  acts: [
    {
      title: Do that thing
      confirmation: ok
      scenes: [
        Do this
        Do that
      ]
    }
  ]
}
```

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/regisseur/blob/main/LICENSE) for more information.
