# Hive

Hive offers a pipeline that chains together processes to process documents.

Hive is configured using `hive.yml` files. A `hive.yml` file consists of `rule`s, keyed by their
names. A Hive operation chains together these rules to produce the pipeline.

## Rule

There are two kinds of rules.

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
            input_name_1: TYPE
            input_name_2: TYPE
        output: TYPE
    ```

    The JS file will be executed with a global object called `_hive`. This contains the inputs,
    keyed by the input keys. The JS file is expected to return the output with the correct type.

`FILE` is a YAML tag with the following format:

```yaml
!!file ROOT:path/relative/from/root
```

`ROOT` specifies where the path is relative from. This can be the following:

-   `root`: Relative to the root of the project, i.e.: where the `hive_project.yml`  file is
    located.
-   `out`: Out directory as specified in `hive_project.yml`.
-   `.`: The current directory, or the directory where the current `hive.yml` is located.
-   `/`: The root directory of the system.

`PATTERN` is similar to `FILE`. It's a YAML tag that Hive uses to generate file paths. It looks
like:

```yaml
!!pattern ROOT:path/relative/from/root/{input_name_1}
```

`ROOT` takes in exactly the same values as in `FILE`. Unlike `FILE`, `PATTERN` can specify the
input argument keys to generate the files. For example, say a declare rule takes in an input `A`
with type `string`. However, a render rule `R` gives input `A` an array of `string`:
`"a", "b", "c"`. If `R`'s `render` specifies the pattern as:

```yaml
!!pattern .:{A}.txt`
```

`R` will generate the files `a.txt`, `b.txt`, and `c.txt` when ran.

`RULE` is also similar to `FILE`. It refers to a rule in a `hive.yml` file. It looks like:

```yaml
!!rule ROOT:path/relative/from/root:rule_name
```

`rule_name` must be a rule that exists in the `hive.yaml` file in that directory.

`TYPE` specifies the type of input. Type is a tag that looks like:

```yaml
!!type number
```

Valid types are:

-   `number`
-   `boolean`
-   `string`
-   `object`
-   `number[]`, `boolean[]`, `string[]`, `object[]`

`INPUT` can be any `number`, `boolean`, `string`, `object`, the array types, any `FILE`, or any
`RULE`.
