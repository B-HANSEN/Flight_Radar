import {
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from './structuredData'

vi.mock('@/i18n/navigation', () => ({
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    href === '/' ? `/${locale}` : `/${locale}${href}`,
}))

describe('buildOrganizationSchema', () => {
  it('builds an EducationalOrganization schema identified by a stable #organization id', () => {
    const schema = buildOrganizationSchema()

    expect(schema['@type']).toBe('EducationalOrganization')
    expect(schema['@id']).toMatch(/#organization$/)
    expect(schema.name).toBe('Flight Radar')
  })

  it('points logo at the square brand asset', () => {
    const schema = buildOrganizationSchema()

    expect(schema.logo).toEqual({
      '@type': 'ImageObject',
      url: expect.stringMatching(/\/logo\.webp$/),
      width: '512',
      height: '512',
    })
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

describe('buildWebPageSchema', () => {
  it('builds a WebPage schema for the given locale-prefixed route', () => {
    const schema = buildWebPageSchema({
      locale: 'de',
      href: '/about',
      title: 'About this project',
      description: 'Flight Radar is a flight school management platform.',
    })

    expect(schema['@type']).toBe('WebPage')
    expect(schema.url).toMatch(/\/de\/about$/)
    expect(schema.name).toBe('About this project')
    expect(schema.inLanguage).toBe('de')
  })

  it('links back to the website via isPartOf', () => {
    const website = buildWebSiteSchema('en')
    const page = buildWebPageSchema({
      locale: 'en',
      href: '/about',
      title: 'About',
      description: 'About page',
    })

    expect(page.isPartOf).toEqual({ '@id': website['@id'] })
  })
})
