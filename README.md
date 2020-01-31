<p align="center">
  <a href="https://github.com/peachjar/action-docker-login/actions"><img alt="typescript-action status" src="https://github.com/peachjar/action-docker-login/workflows/build-test/badge.svg"></a>
</p>

# Github Action: Docker Login

Login to Docker.  This implementation allows logging into multiple registries in one action.

## Usage

The first registry is specified with the `registry` input.  All subsequent registries are suffixed with a number (starting at 2 and stopping at 5).

The syntax for registry input is:

`<registry url> <password> <username>`

Or if username is not needed:

`<registry url> <password>`

```
uses: peachjar/action-docker-login@v1
with:
    registry: docker.pkg.github.com ${{ secrets.GITHUB_TOKEN }} ${{ github.actor }}
    registry2: quay.io ${{ secrets.QUAY_PASSWORD }} ${{ secrets.QUAY_USERNAME }}
    registry3: index.docker.io/v1/ ${{ secrets.DOCKER_PASSWORD }} ${{ secrets.DOCKER_USERNAME }}
    registry4: ...
    registry5: ...
```
