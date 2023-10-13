# mahiro

Control PC with your device you want.

## Requirement

- Node.js `>=16.13.0`
- Rust

If you want to run `mahiro` on Linux as host server, need to install below packages.

> Linux users may have to install `libxdo-dev` if they are using `X11`. For example, on Debian-based distros:
>
> ```Bash
> apt-get install libxdo-dev
> ```
>
> On Arch:
>
> ```Bash
> pacman -S xdotool
> ```
>
> On Fedora:
>
> ```Bash
> dnf install libX11-devel libxdo-devel
> ```
>
> On Gentoo:
>
> ```Bash
> emerge -a xdotool
> ```

(Followed by enigo: [GitHub](https://github.com/enigo-rs/enigo))

## Setup

```bash
$ cd path/to/mahiro
$ npm install
```

## Run Application

**Run as Desktop Application**

```bash
$ npm run tauri:dev
```

**Run as Web Application**

```bash
$ npm run web:dev
```
