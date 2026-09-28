# `.npmrc` configuration

The `.npmrc` file at the project root defines security policies for dependency installation. It restricts the default behavior of `npm install` to reduce the attack surface.

## Current content

```ini
# Mitigates the window during which a compromised version has not yet been detected/removed.
# Trade-off: legitimate security patches are also blocked for this period.
min-release-age=7

# Does not run lifecycle scripts (preinstall, install, postinstall, prepare…)
# of transitive dependencies during `npm install`.
# Mitigates the most common attack vector: arbitrary code execution during install.
ignore-scripts=true

# Prevents installing packages from git URLs (github:, git+ssh:, etc.).
# Mitigates non-immutable dependencies outside the npm registry.
allow-git=none
```

## What each rule does

### `min-release-age=7`

- **Goal**: avoid installing very recent versions that have not yet been audited by the community.
- **Behavior**: npm blocks packages published in the last 7 days.
- **Trade-off**: legitimate security patches are also temporarily blocked.
- **Workaround**: for specific cases, use `npm install <package>@<version> --min-release-age=0`.

### `ignore-scripts=true`

- **Goal**: prevent lifecycle scripts (`preinstall`, `install`, `postinstall`, `prepare`) of dependencies from running during `npm install`.
- **Behavior**: script code is not executed automatically, reducing the risk of arbitrary code execution.
- **Trade-off**: packages that need to compile native binaries may fail.
- **Workaround**: run `node node_modules/<package>/script.js` manually if the script is trusted, or use `npm_config_ignore_scripts=false` for a specific install.

### `allow-git=none`

- **Goal**: block dependencies installed from git URLs (`github:`, `git+ssh:`, `git+https:`).
- **Behavior**: npm accepts packages only from the npm registry.
- **Trade-off**: dependencies from private forks or git repositories cannot be installed directly.
- **Workaround**: publish the package to an internal registry or use a specific tarball.

## Why it matters

Software supply chain attacks often exploit:

- Recently published versions with malicious code.
- Install scripts that run code in the developer's environment.
- Dependencies pointing to compromised git repositories.

These rules add an extra layer of defense without requiring additional tools.

## See also

- [How to contribute](../../../CONTRIBUTING.en.md)
- [README](../../../README.en.md)
