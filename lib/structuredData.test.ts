import { buildOrganizationSchema, buildWebSiteSchema } from './structuredData'

vi.mock('@/i18n/navigation', () => ({
  getPathname: ({ locale }: { href: string; locale: string }) => `/${locale}`,
}))

describe('buildOrganizationSchema', () => {
  it('builds an Organization schema identified by a stable #organization id', () => {
    const schema = buildOrganizationSchema()

    expect(schema['@type']).toBe('Organization')
    expect(schema['@id']).toMatch(/#organization$/)
    expect(schema.name).toBe('Flight Radar')
  })
})

describe('buildWebSiteSchema', () => {
  it('builds a WebSite schema pointing at the locale-prefixed homepage', () => {
    const schema = buildWebSiteSchema('de')

    expect(schema['@type']).toBe('WebSite')
    expect(schema.inLanguage).toBe('de')
    expect(schema.url).toMatch(/\/de$/)
  })

  it('links back to the organization via publisher', () => {
    const organization = buildOrganizationSchema()
    const website = buildWebSiteSchema('en')

    expect(website.publisher).toEqual({ '@id': organization['@id'] })
  })
})
