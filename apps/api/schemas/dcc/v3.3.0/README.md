# Pinned DCC v3.3.0 schema files (official PTB downloads)

| File | Source | SHA-256 |
|---|---|---|
| dcc.xsd | https://www.ptb.de/dcc/v3.3.0/dcc.xsd | b8872150500d2d8bdd66817d27e7ee16b4df7037e803cf316483b98174a7f73f |
| SI_Format.xsd | https://www.ptb.de/si/v2.2.1/SI_Format.xsd | a6483bc3f22b7a5193912d4699ec2462de4ca3f069762300e4f749e54653a2e8 |
| xmldsig-core-schema.xsd | https://www.ptb.de/dcc/d-sig/xmldsig-core-schema.xsd | b44ee18f3cbf818c09b07f9e1fecd2009d1a580b9fc62776dc5ad6ce7eccedcf |

The XSD is published by PTB under LGPL v3 (see header of dcc.xsd).
`schemaLocation` entries inside dcc.xsd were rewritten from the remote URLs to the
local filenames so that `xmllint --nonet` resolves them, satisfying the
"validate without network access" rule (docs/DCC_IMPLEMENTATION.md §3).
