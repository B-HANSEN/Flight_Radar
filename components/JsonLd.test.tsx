import { render } from '@testing-library/react'
import type { Organization, WithContext } from 'schema-dts'
import JsonLd from './JsonLd'

const organization: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://example.com/#organization',
  name: 'Flight Radar',
  url: 'https://example.com',
}

function getScripts(container: HTMLElement) {
  return container.querySelectorAll('script[type="application/ld+json"]')
}

describe('JsonLd', () => {
  it('renders a single schema as one ld+json script tag', () => {
    const { container } = render(<JsonLd data={organization} />)
    const scripts = getScripts(container)

    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].innerHTML)).toEqual(organization)
  })

  it('renders an array of schemas as separate script tags', () => {
    const website: WithContext<Organization> = {
      ...organization,
      '@id': 'https://example.com/#website',
    }
    const { container } = render(<JsonLd data={[organization, website]} />)
    const scripts = getScripts(container)

    expect(scripts).toHaveLength(2)
    expect(JSON.parse(scripts[0].innerHTML)['@id']).toBe(
      'https://example.com/#organization',
    )
    expect(JSON.parse(scripts[1].innerHTML)['@id']).toBe(
      'https://example.com/#website',
    )
  })

  it('falls back to the array index as the key when a schema has no @id', () => {
    const withoutId: WithContext<Organization> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Flight Radar',
      url: 'https://example.com',
    }
    const { container } = render(<JsonLd data={[withoutId]} />)

    expect(getScripts(container)).toHaveLength(1)
  })

  it('escapes angle brackets to prevent breaking out of the script tag', () => {
    const unsafe: WithContext<Organization> = {
      ...organization,
      name: '</script><script>alert(1)</script>',
    }
    const { container } = render(<JsonLd data={unsafe} />)
    const script = getScripts(container)[0]

    expect(script.innerHTML).not.toContain('</script>')
    expect(JSON.parse(script.innerHTML).name).toBe(
      '</script><script>alert(1)</script>',
    )
  })
})
