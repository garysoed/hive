# Hive

Hive offers a pipeline that chains together processes to process documents.

Hive is configured using `hive.yml` files. A `hive.yml` file consists of `rule`s, keyed by their
names. A Hive operation chains together these rules to produce the pipeline.

## Rule

There are three kinds of rules.

-   `render`: Render rules can be ran. They look as follows:

    ```yaml
    rule_name:
        render: PATTERN
        processor: RULE
        inputs:
            input_name_1: INPUT
            input_name_2: INPUT
    ```

-   `declare`: Takes a JS file and declares it as a runnable process. They look as follows:

    ```yaml
    rule_name:
        declare: FILE
        inputs:
            input_name_1: I_TYPE
            input_name_2: I_TYPE
        output: O_TYPE
    ```

    The JS file will be executed with a global object called `_hive`. This contains the inputs,
    keyed by the input keys. The JS file is expected to return the output with the correct type.

-   `load`: Takes a file, or group of files and declares their type.

    ```yaml
    rule_name:
        load: FILE|GLOB
        as: O_TYPE
    ```

---

`FILE` is a YAML tag with the following format:

```yaml
!!hive/file ROOT:path/relative/from/root
```

---

`ROOT` specifies where the path is relative from. This can be the following:

-   `root`: Relative to the root of the project, i.e.: where the `hive_project.yml`  file is
    located.
-   `out`: Out directory as specified in `hive_project.yml`.
-   `.`: The current directory, or the directory where the current `hive.yml` is located.
-   `/`: The root directory of the system.

---

`PATTERN` is similar to `FILE`. It's a YAML tag that Hive uses to generate file paths. It looks
like:

```yaml
!!hive/pattern ROOT:path/relative/from/root/{input_name_1}
```

`ROOT` takes in exactly the same values as in `FILE`. Unlike `FILE`, `PATTERN` can specify the
input argument keys to generate the files. For example, say a declare rule takes in an input `A`
with type `string`. However, a render rule `R` gives input `A` an array of `string`:
`"a", "b", "c"`. If `R`'s `render` specifies the pattern as:

```yaml
!!hive/pattern .:{A}.txt`
```

`R` will generate the files `a.txt`, `b.txt`, and `c.txt` when ran.

---

`RULE` is also similar to `FILE`. It refers to a rule in a `hive.yml` file. It looks like:

```yaml
!!hive/rule ROOT:path/relative/from/root:rule_name
```

`rule_name` must be a rule that exists in the `hive.yaml` file in that directory.

---

`GLOB` refers to a group of files matching the glob expression. It looks like:

```yaml
!!hive/glob ROOT:glob/expression
```

---

`O_TYPE` specifies the type of output. This is a tag that looks like:

```yaml
!!o_type number
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

```yaml
!!i_type number|boolean|string:flags
```

`flags` contains regex flags.

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
    -   `render`: the rule's `output`
