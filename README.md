# Hive

Hive offers a pipeline that chains together processes to process documents.

Hive is configured using `hive.js` files. A `hive.js` file declares `rule`s which are then chained
together to produce a pipeline.

## Rule

There are three kinds of rules.

-   `render`: Render rules can be ran. They look as follows:

    ```js
    hive.render({
      name: 'rule_name',
      processor: RULE,
      inputs: {
        input_name_1: INPUT,
        input_name_2: INPUT,
      },
      output: PATTERN,
    });
    ```

-   `declare`: Takes a JS file and declares it as a runnable process. They look as follows:

    ```js
    hive.declare({
      name: 'rule_name',
      processor: FILE,
      inputs: {
        input_name_1: I_TYPE,
        input_name_2: I_TYPE,
      },
      output: O_TYPE,
    });
    ```

    The JS file will be executed with a global object called `$hive`. This contains the inputs,
    keyed by the input keys. The JS file is expected to return the output with the correct type.

    The JS file also have access to `$hiveGlobals`. This has a similar structure to `$hive` except
    it contains values defined in the project's configuration file.

-   `load`: Takes a file, or group of files and declares their type.

    ```js
    hive.load({
      name: 'rule_name',
      srcs: [FILE, GLOB],
      output: O_TYPE,
    });
    ```

---

`FILE` is a `string` with the following format:

```js
'ROOT/path/relative/from/root'
```

---

`ROOT` specifies where the path is relative from. This can be the following:

-   `@root`: Relative to the root of the project, i.e.: where the `hive_project.json` file is
    located.
-   `@out`: Out directory as specified in `hive_project.json`.
-   `.`: The current directory, or the directory where the current `hive.yaml` is located.
-   `/`: The root directory of the system.
-   `@custom`: Or any custom directories with label `custom`. This should be specified in the
    `hive_project.json`.

---

`PATTERN` is similar to `FILE`. It's a `string` that Hive uses to generate file paths. It looks
like:

```js
'ROOT/path/relative/from/root/{input_name_1}'
```

`ROOT` takes in exactly the same values as in `FILE`. Unlike `FILE`, `PATTERN` can specify the
input argument keys to generate the files. For example, say a declare rule takes in an input `A`
with type `string`. However, a render rule `R` gives input `A` an array of `string`:
`"a", "b", "c"`. If `R`'s `render` specifies the pattern as:

```js
'./{A}.txt'
```

`R` will generate the files `a.txt`, `b.txt`, and `c.txt` when ran.

---

`RULE` is also similar to `FILE`. It refers to a rule in a `hive.js` file. It looks like:

```js
'ROOT/path/relative/from/root:rule_name'
```

`rule_name` must be a rule that exists in the `hive.js` file in that directory.

---

`GLOB` is the output of `hive.glob` method. This method takes a glob pattern that looks like:

```js
hive.glob('ROOT/glob/expression')
```

---

`O_TYPE` specifies the type of output. This is a string that looks like:

```js
'number'
```

Valid types are:

-   `boolean`
-   `number`
-   `string`
-   `object`
-   `function`
-   MIME types
-   Array types of the above types, which are just the type suffixed with `[]`.

---

`I_TYPE` specifies the type of input. This takes in a regex string:

```js
'number|boolean|string:flags'
```

`flags` contains regex flags. If the last flag is `[]`, it indicates that the input type is an
array.

---

`INPUT` can be an object of any of the following types:

-   `boolean`
-   `number`
-   `string`
-   `object`
-   `function`
-   Array of the above types. The array elements cannot be mixed.
-   `RULE`: The type used depends on which type of rule this refers to:

    -   `load`: the rule's `output`
    -   `declare`: `function`
    -   `render`: the rule's processor's `output`
