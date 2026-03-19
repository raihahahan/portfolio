---
title: Relational Database Implementation - Parser
published_at: 2026-03-15T16:00:00.000Z
read_time: 10
prev_post: content/posts/Relational-Database-Implementation---Executor.md
next_post: content/posts/Relational-Database-Implementation---Planner.md
excerpt: 'Lexer, Recursive-Descent Parser, and Semantic Analyzer'
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite ([start here](https://mraihan.dev/blog/Implementing-a-relational-database-from-scratch---Storage-Layer)).\
> \
> **Summary of this post:**\
> 1\. The lexer tokenises SQL strings into a stream of typed tokens\
> 2\. The parser uses recursive descent with precedence climbing to build an abstract syntax tree\
> 3\. The analyzer resolves names and types against the catalog, producing a fully typed representation\
> \
> **Github:** [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Recap

So far, the storage and execution layers of the database engine are done.

1. **Disk manager:** Handles raw disk page I/O of 8192 bytes each.
2. **Buffer manager:** Acts as the cache layer to store working pages in-memory.
3. **Slotted Page:** Determines the layout of data within a single page.
4. **Access layer:** Provides heap files as the access path for the database. A heap file is a singly-linked list of pages to store records in a single relation.
5. **Catalog layer:** Manages metadata (tables, attributes, types) stored as tables themselves, with bootstrap logic for first-time initialisation.
6. **Model layer:** Handles user tables and dynamic schemas, bridging the catalog's metadata with the access layer's heap files.
7. **Executor engine:** Evaluates operator trees using the Volcano iterator model (Open/Next/Close). Operators include SeqScanOp, FilterOp, ProjectionOp, LimitOp, InsertOp, UpdateOp, and DeleteOp.

\
The executor can evaluate any operator tree, but so far those trees were assembled manually in code. To actually run SQL, the engine needs a way to turn a string like `SELECT name FROM students WHERE id >= 2` into an operator tree. That is the parser's job.

# Introduction

Turning SQL text into an executable plan is a multi-stage process. This implementation splits it into three distinct phases, each with a clear responsibility:

1. **Lexer (tokenisation):** scans raw SQL text character by character and produces a flat stream of typed tokens (keywords, identifiers, numbers, operators, etc.)
2. **Parser (syntax analysis):** consumes the token stream and builds an abstract syntax tree (AST) using recursive descent. The AST captures the syntactic structure of the SQL statement but knows nothing about whether the tables or columns actually exist.
3. **Analyzer (semantic analysis):** walks the AST and resolves every name against the catalog. Column references become typed `ColumnInfo` objects, table names become `TableInfo` objects, and the output is a fully resolved representation ready for the planner.

\
This three-stage pipeline mirrors how Postgres processes SQL. Each stage is independent: the lexer knows nothing about SQL grammar, the parser knows nothing about the database schema, and the analyzer knows nothing about execution.

```
"SELECT name FROM students WHERE id >= 2"
  |  Lexer
  v
[SELECT] [name] [FROM] [students] [WHERE] [id] [>=] [2]
  |  Parser
  v
SelectStmt { target: [ColumnRef("name")], from: "students",
             where: BinaryExpr(">=", ColumnRef("id"), Literal(2)) }
  |  Analyzer
  v
Query { range_table: TableInfo{...}, target_list: [TargetEntry{...}],
        where_clause: AnalyzedBinaryExpr{...} }
```

# Lexer

The lexer scans the input string left to right, skipping whitespace, and produces one token at a time. Each token has a type, a lexeme (the raw text), and a byte offset for error reporting.

```cpp
struct Token {
    TokenType type;
    std::string_view lexeme;
    size_t pos;
};
```

Token types include `Identifier`, `Keyword`, `Number`, `StringLiteral`, `Operator`, `Comma`, `LParen`, `RParen`, `Semicolon`, and `EndOfFile`.

## Keyword recognition

SQL keywords are case-insensitive. The lexer handles this by lowercasing each identifier-like token and checking it against a compile-time keyword table:

```cpp
Token Lexer::lex_identifier_or_keyword() {
    size_t start = _pos;

    while (!eof() && (std::isalnum(peek()) || peek() == '_')) {
        advance();
    }

    auto text = _input.substr(start, _pos - start);

    std::string lower;
    lower.reserve(text.size());
    for (char c : text) lower.push_back(std::tolower(c));

    for (auto& [kw, type] : keywords) {
        if (lower == kw) {
            return {type, text, start};
        }
    }

    return {TokenType::Identifier, text, start};
}
```

The keyword table currently has 42 entries, covering not just what is implemented (SELECT, FROM, WHERE, INSERT, UPDATE, DELETE, CREATE, DROP, etc.) but also reserved words for future features (JOIN, GROUP BY, ORDER BY, HAVING, etc.). This ensures that these words cannot be used as identifiers.

## Operators

Single-character operators (`=`, `<`, `>`, `+`, `-`, `*`, `/`) and two-character operators (`<=`, `>=`, `!=`, `<>`) are handled by the lexer. The lexer greedily checks for a two-character match first before falling back to a single character.

## String literals

String literals are delimited by single quotes. Escaped quotes (doubled single quotes, as in `'it''s'`) are handled by the lexer. When a closing quote is immediately followed by another quote, the lexer continues scanning rather than terminating the literal. Unterminated strings produce an error with the starting position.

# Abstract syntax tree

The parser produces an AST made up of nodes that capture the syntactic structure of a SQL statement. Every node inherits from `AstNode`:

## Expressions

Expressions form a hierarchy:

* `ColumnRef` - column reference, optionally table-qualified (e.g. `students.id`)
* `Literal` - an integer, string, or NULL literal
* `BinaryExpr` - two sub-expressions joined by an operator (`=`, `>=`, `AND`, `OR`, `+`, `-`, etc.)
* `UnaryExpr` - a prefix operator applied to a sub-expression (`NOT`, unary `-`)

```cpp
struct BinaryExpr : Expr {
    std::string op;
    std::unique_ptr<Expr> lhs;
    std::unique_ptr<Expr> rhs;
};
```

## Statement types

Each SQL statement type has its own AST node:

* `SelectStmt` - target list, FROM table, optional WHERE and LIMIT
* `InsertStmt` - table name, optional column list, one or more value rows
* `UpdateStmt` - table name, SET clauses, optional WHERE
* `DeleteStmt` - table name, optional WHERE
* `CreateTableStmt` - table name, column definitions (name + type)
* `DropTableStmt` - table name, optional IF EXISTS flag

\
The AST is purely syntactic. A `ColumnRef` with name `"foo"` does not know whether `foo` is a valid column. That validation happens in the analyzer.

# Recursive-descent parser

The parser is a hand-written recursive-descent parser. It consumes tokens one at a time from the lexer and builds the AST by calling parse functions that correspond to grammar rules.

## Entry point

The parser entry point inspects the first keyword to determine the statement type, then dispatches to the appropriate parse function:

```cpp
std::unique_ptr<AstNode> Parser::Parse(const std::string& sql) {
    Lexer lexer{sql};
    Parser parser{std::move(lexer)};

    std::unique_ptr<AstNode> stmt;
    if (parser.check_keyword("select"))
        stmt = parser.parse_select_stmt();
    else if (parser.check_keyword("insert"))
        stmt = parser.parse_insert_stmt();
    else if (parser.check_keyword("update"))
        stmt = parser.parse_update_stmt();
    else if (parser.check_keyword("delete"))
        stmt = parser.parse_delete_stmt();
    else if (parser.check_keyword("create"))
        stmt = parser.parse_create_table_stmt();
    else if (parser.check_keyword("drop"))
        stmt = parser.parse_drop_table_stmt();
    else
        parser.error("expected SELECT, INSERT, UPDATE, DELETE, "
                     "CREATE, or DROP");

    return stmt;
}
```

## Parsing SELECT

`parse_select_stmt` follows the grammar: `SELECT target_list FROM table [WHERE expr] [LIMIT n]`. Each clause is parsed sequentially:

```cpp
std::unique_ptr<SelectStmt> Parser::parse_select_stmt() {
    consume_keyword("select");

    auto stmt = std::make_unique<SelectStmt>();
    stmt->target_list = parse_target_list();

    consume_keyword("from");
    Token table_tok = consume(TokenType::Identifier);
    stmt->from_table = std::string(table_tok.lexeme);

    if (match_keyword("where")) {
        stmt->where = parse_expr();
    }

    if (match_keyword("limit")) {
        Token limit_tok = consume(TokenType::Number);
        stmt->limit = std::stoull(std::string(limit_tok.lexeme));
    }

    return stmt;
}
```

`consume_keyword` asserts the current token is the expected keyword (case-insensitive) and advances. `match_keyword` checks and advances only if matched, returning a boolean. This pattern keeps each parse function clean and linear.

## Expression parsing with precedence climbing

Expressions are the trickiest part of the parser. SQL expressions have multiple precedence levels: OR is the loosest, then AND, then NOT, then comparison operators, then additive operators, and finally primary expressions (literals, column refs, parenthesised sub-expressions).\
\
The parser handles this with a chain of functions, each calling the next-higher-precedence level:

```
parse_expr -> parse_or_expr -> parse_and_expr -> parse_not_expr
  -> parse_comparison_expr -> parse_additive_expr -> parse_primary_expr
```

Each level follows the same pattern: parse the left operand at the next-higher precedence, then loop while the current token matches the operator at this level, consuming the operator and parsing the right operand.

```cpp
std::unique_ptr<Expr> Parser::parse_and_expr() {
    auto left = parse_not_expr();

    while (check_keyword("and")) {
        advance();
        auto right = parse_not_expr();
        auto node = std::make_unique<BinaryExpr>();
        node->op = "AND";
        node->lhs = std::move(left);
        node->rhs = std::move(right);
        left = std::move(node);
    }

    return left;
}
```

This produces left-associative trees naturally. `a AND b AND c` becomes `AND(AND(a, b), c)`, which is the correct evaluation order.\
\
At the lowest level, `parse_primary_expr` handles literals, column references (including table-qualified names like `t.id`), NULL, TRUE/FALSE, parenthesised expressions, and unary minus.

## DML and DDL parsing

INSERT, UPDATE, DELETE, CREATE TABLE, and DROP TABLE each have dedicated parse functions. They follow a straightforward pattern of consuming expected keywords and tokens in order.\
\
For example, INSERT parses: `INSERT INTO table [(columns)] VALUES (exprs) [, (exprs)]*`. UPDATE parses: `UPDATE table SET col = expr [, col = expr]* [WHERE expr]`. CREATE TABLE parses column definitions within parentheses, validating that each type name is a supported type (INT or TEXT).

# Analyzer

The analyzer is where semantics are integrated into the syntax. It takes an AST node and the catalog, and produces a fully resolved representation where every name has been validated and every expression has been type-checked.

## Name resolution

The first thing the analyzer does for any statement is resolve the table name against the catalog:

```cpp
catalog::TableInfo Analyzer::resolve_table(const std::string& table_name) {
    auto info = _catalog.LookupTable(table_name);
    if (!info.has_value()) {
        throw DbError(ErrorCode::UndefinedTable,
                       "table \"" + table_name + "\" does not exist");
    }
    return info.value();
}
```

Once the table is resolved, its columns are fetched from the catalog and sorted by ordinal position. Column references in expressions are then resolved against this column list.

## Analyzing SELECT

For a SELECT statement, the analyzer:

1. Resolves the FROM table and retrieves its columns
2. Analyzes the target list. If `SELECT *`, expands it into all columns; otherwise resolves each column reference
3. Analyzes the WHERE clause (if present), producing a typed expression tree
4. Carries the LIMIT through unchanged

```cpp
std::unique_ptr<Query> Analyzer::analyze_select(const SelectStmt& stmt) {
    auto query = std::make_unique<Query>();

    query->range_table = resolve_table(stmt.from_table);
    query->table_columns =
        _catalog.GetTableColumns(query->range_table.table_id);

    std::sort(query->table_columns.begin(), query->table_columns.end(),
              [](const catalog::ColumnInfo& a, const catalog::ColumnInfo& b) {
                  return a.ordinal_position < b.ordinal_position;
              });

    query->target_list =
        analyze_target_list(stmt.target_list, query->table_columns);

    if (stmt.where) {
        query->where_clause =
            analyze_expr(*stmt.where, query->table_columns);
    }

    query->limit_count = stmt.limit;

    return query;
}
```

The output is a `Query` object where `range_table` is a full `TableInfo`, `target_list` contains `TargetEntry` objects with resolved `ColumnInfo` and type information, and `where_clause` is an `AnalyzedExpr` tree.

## Expression analysis

Each AST expression node is transformed into a corresponding `AnalyzedExpr` node that carries type information:

* `ColumnRef` -> `AnalyzedColumnRef` (with full `ColumnInfo` including type and ordinal position)
* `Literal` -> `AnalyzedLiteral` (with inferred type: integer literals are INT, string literals are TEXT, NULL has type 0)
* `BinaryExpr` -> `AnalyzedBinaryExpr` (with both sides analyzed and type-checked)
* `UnaryExpr` -> `AnalyzedUnaryExpr`

```cpp
struct AnalyzedColumnRef : AnalyzedExpr {
    catalog::ColumnInfo column;
};

struct AnalyzedLiteral : AnalyzedExpr {
    std::string value;
    Literal::LiteralType lit_type;
};
```

These typed expression nodes are what the planner and executor work with. The `result_type` field on every `AnalyzedExpr` tells downstream components the type of the expression without needing to re-derive it.

## Type checking

The analyzer enforces type compatibility for comparisons and arithmetic. Equality operators (`=`, `!=`, `<>`) require both sides to have the same type. Ordering operators (`<`, `>`, `<=`, `>=`) and arithmetic (`+`, `-`) require both sides to be INT. NULL is compatible with any type.\
\
Type mismatches produce clear error messages:

```cpp
if (ltype != rtype) {
    throw DbError(
        ErrorCode::TypeMismatch,
        "operator " + op + " cannot compare " +
            type_name(ltype) + " and " + type_name(rtype),
        pos);
}
```

## Star expansion

When the target list contains `*`, the analyzer expands it into one `TargetEntry` per column in the table, ordered by ordinal position. This means the rest of the pipeline (planner, executor) never sees `*` and always receives an explicit list of columns.

## DML analysis

INSERT, UPDATE, and DELETE follow similar patterns:

* **INSERT:** resolves the table, validates that the number of values matches the number of columns, type-checks each value against its target column, and produces an `AnalyzedInsert` with `AnalyzedExpr` value trees
* **UPDATE:** resolves the table, resolves each SET column name, type-checks assignment values, analyzes the optional WHERE clause, and produces an `AnalyzedUpdate`
* **DELETE:** resolves the table, analyzes the optional WHERE clause, and produces an `AnalyzedDelete`

## DDL analysis

CREATE TABLE validates that the table does not already exist, that column names are unique, and that column types are supported (INT or TEXT). DROP TABLE validates that the table exists (unless IF EXISTS is specified) and that system catalog tables cannot be dropped.

# Output types

The analyzer produces an `AnalyzedStmt` that wraps the specific output for each statement type:

```cpp
enum class StmtType { Select, Insert, Update, Delete, CreateTable, DropTable };

struct AnalyzedStmt {
    StmtType type;
    std::unique_ptr<Query> select_query;
    std::unique_ptr<AnalyzedInsert> insert_query;
    std::unique_ptr<AnalyzedUpdate> update_query;
    std::unique_ptr<AnalyzedDelete> delete_query;
    std::unique_ptr<AnalyzedCreateTable> create_table;
    std::unique_ptr<AnalyzedDropTable> drop_table;
};
```

This tagged-union style ensures that downstream consumers (the planner) can switch on the statement type and access the appropriate query object. Only one of the inner pointers is non-null for any given statement.

# Future work

The parser currently supports a useful subset of SQL. Future improvements include:

1. JOIN syntax (INNER, LEFT, RIGHT, CROSS) and multi-table FROM clauses
2. Aggregate functions (COUNT, SUM, AVG, MIN, MAX) and GROUP BY / HAVING
3. ORDER BY and ASC/DESC
4. Subqueries in WHERE and FROM
5. More expression types (BETWEEN, IN, LIKE, CASE)

\
The keyword table already reserves these words, so they cannot be used as identifiers. Extending the parser to support them is a matter of adding the corresponding parse functions and AST nodes.

# Summary

The parser turns raw SQL strings into fully typed, catalog-validated representations in three clean stages. The lexer handles tokenisation and case-insensitive keyword recognition. The recursive-descent parser builds an AST that captures syntactic structure. The analyzer resolves names, checks types, and produces the `AnalyzedStmt` that the planner consumes. Each stage is independent and testable in isolation, and the three-stage design makes it straightforward to add new SQL features.

# References

* [PostgreSQL source: `scan.l`](https://github.com/postgres/postgres/blob/master/src/backend/parser/scan.l) - lexer (flex-based tokeniser for SQL)
* [PostgreSQL source: `gram.y`](https://github.com/postgres/postgres/blob/master/src/backend/parser/gram.y) - parser (bison grammar). PostgreSQL uses a generated parser rather than hand-written recursive descent, but the grammar rules correspond closely to the parse functions in this implementation
* [PostgreSQL source: `analyze.c`](https://github.com/postgres/postgres/blob/master/src/backend/parser/analyze.c) - semantic analysis (name resolution, type checking, star expansion)
* [PostgreSQL Documentation: The Parser Stage](https://www.postgresql.org/docs/current/parser-stage.html) - official docs on how PostgreSQL's parser transforms SQL text into a parse tree
* [Crafting Interpreters: Parsing Expressions](https://craftinginterpreters.com/parsing-expressions.html) - Robert Nystrom's chapter on recursive-descent parsing with precedence climbing, the same technique used in this implementation
* [The SQL Query Roadtrip: Parsing and Analysis](https://internals-for-interns.com/posts/postgresql-sql-parsing/) - covers how PostgreSQL transforms SQL text into a validated Query tree through lexing, parsing, and semantic analysis
