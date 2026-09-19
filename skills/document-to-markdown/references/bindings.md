# anydoc Bindings Reference

When the task lives inside a Node.js, Python, or Rust codebase, prefer the library over shelling out to the CLI. Every binding exposes the same conversion through the same document model, so output is identical to the CLI's. Each package ships types or stubs.

## Node.js

Install with `npm install @firecrawl/anydoc`.

```js
import { toDocument, toMarkdown, toMarkdownBytes } from '@firecrawl/anydoc';

const markdown = await toMarkdown('report.docx');                  // from a file path
const scanned = await toMarkdown('scan.pdf', { ocr: 'hosted' });   // opt in to hosted OCR
const fromBytes = await toMarkdownBytes(bytes);                    // format detected from content
const fromCsv = await toMarkdownBytes(bytes, 'csv');               // signature-less formats need a name
const document = await toDocument(bytes);                          // document model with embedded assets
```

Errors expose the variant name on `error.code`. Full API reference: [node/README.md](https://github.com/firecrawl/anydoc/blob/main/node/README.md).

## Python

Install with `pip install firecrawl-anydoc`.

```python
import anydoc

markdown = anydoc.to_markdown("report.docx")             # from a file path
scanned = anydoc.to_markdown("scan.pdf", ocr="hosted")   # opt in to hosted OCR
from_bytes = anydoc.to_markdown_bytes(data)              # format detected from content
from_csv = anydoc.to_markdown_bytes(data, "csv")         # signature-less formats need a name
document = anydoc.to_document(data)                      # document model with embedded assets
```

Python raises one `anydoc.ConvertError` subclass per variant, or `OSError` when the file cannot be read. Full API reference: [python/README.md](https://github.com/firecrawl/anydoc/blob/main/python/README.md).

## Rust

Install with `cargo add anydoc`.

```rust
let markdown = anydoc::to_markdown("report.docx")?;
let from_bytes = anydoc::to_markdown_bytes(&bytes, None)?;
let from_csv = anydoc::to_markdown_bytes(&bytes, anydoc::Format::Csv)?;
let document = anydoc::to_document(&bytes, None)?;
```

The Rust crate has no `ocr` option and never makes network calls. Full API reference: [crates.io/crates/anydoc](https://crates.io/crates/anydoc).

## Format detection

Each binding exposes content-based detection plus extension- and path-based helpers: `formatFromBytes` in Node, `anydoc.format_from_bytes` in Python, and `Format::from_bytes` in Rust. CSV has no content marker, so name it explicitly through an extension, a path, or the format argument.

## Error variants

A conversion fails only when no complete Markdown could come out of the file. The variants:

| Variant | Meaning |
| --- | --- |
| `Unsupported` | Unknown format, or one that cannot be converted. |
| `NeedsOcr` | Scanned or image-only pages of a PDF, listed in `pages`. |
| `Malformed` | Structurally unusable; no meaningful content could be extracted. |
| `Encrypted` | Encrypted or password-protected. |
| `ResourceLimit` | Crossed a fixed safety limit (decompression, nesting, node count). |
| `MissingPart` | A part required for meaningful output is absent. |
| `Io` | The file could not be read; path-based entry points only. |

## Hosted OCR

`ocr: 'hosted'` in Node, `ocr="hosted"` in Python, or `--ocr hosted` on the CLI sends the document to Firecrawl Parse when it needs OCR. Only documents that need OCR leave the machine, but the whole document goes, since Parse has no page selection. `apiKey`, `api_key`, or `--api-key`, or the `FIRECRAWL_API_KEY` environment variable, raise rate limits; `apiUrl`, `api_url`, or `--api-url`, or `FIRECRAWL_API_URL`, point at another Parse deployment. If Parse cannot convert the document, Node rejects with `code: 'hosted'` and Python raises `HostedError`. Ask the user for explicit consent before enabling hosted OCR, and state that the entire document will be uploaded.
