import type { Thing, WithContext } from 'schema-dts'

type Props = {
  data: WithContext<Thing> | WithContext<Thing>[]
}

export default function JsonLd({ data }: Props) {
  const schemas = Array.isArray(data) ? data : [data]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={'@id' in schema ? schema['@id'] : index}
          type='application/ld+json'
          // JSON-LD requires a raw <script> tag per Next.js's guidance
          // (node_modules/next/dist/docs/01-app/02-guides/json-ld.md); the
          // `<` escape below is XSS hardening it also recommends, since
          // JSON.stringify does not sanitize the payload.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
