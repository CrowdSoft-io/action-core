# Core action

This action prepares a shell script for remote server execution.

## Inputs

### `platform`

**Required** The name of the platform to build.

### `user`

**Required** The username.

### `max_releases`

**Optional** The maximum number of old releases. Default `5`.

### `infrastructure_dir`

**Optional** The name of the infrastructure configuration directory. Default `"infrastructure"`.

## Outputs

### `version`

The version of the build.

### `build_dir`

The name of build directory.

### `release_dir`

The name of release directory.

### `install_script`

The path to install script.

### `run_composer`

Need to run composer install.

## Example usage

```yaml
uses: CrowdSoft-io/action-build@v1.0
with:
  platform: 'next'
  user: 'developer'
```
