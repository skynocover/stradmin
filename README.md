# stradmin

> Strapi 後台產生器

## install

```
yarn add -D https://github.com/skynocover/stradmin.git
```

## help

```
Options:
  -a, --api <apiName>            strapi api name (default: null)
  -r, --root <strapi root path>  strapi root path (default: null)
  -s, --schema <schema path>     strapi schema path (default: null)
  -p, --page <page folder>       admin page output folder (default: "src/pages")
  -m, --modal <modal folder>     admin modal output folder (default: "src/modals")
  -h, --help                     display help for command
```

### 注意事項

- api: 指定的api名稱, 使用root則為必填
- root: strapi專案根目錄, 與schema必須擇一填入
- schema: 要產生的api的schema位置, 與root必須擇一填入

## use

> 增加一項script

```js
"stradmin": "stradmin -r /Users/ubuntu/Documents/strapi-server"
```

> 也可以在執行時填入指令

```
yarn stradmin -r /Users/ubuntu/Documents/strapi-server -a apiName
```
