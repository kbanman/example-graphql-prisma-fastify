
## Setup

1. Populate a `.env` file:
```shell
cp .env.example .env
```

## Gotchas

There is something about `typescript-transform-paths` or `ts-patch` that doesn't work with typescript 5.6. Symptoms:
```
TypeError: tsInstance.getOriginalSourceFile is not a function
```