import { getHalalBusinesses } from './halalService'

interface SpotOverrides {
  certified?: boolean | null
  certificationBody?: string | null
}

function spot({ certified = true, certificationBody = null }: SpotOverrides): unknown {
  return {
    id: 1, name: 'Testlokal', address: 'Testgasse 1, 1010 Wien', district: '1010 Wien',
    latitude: 48.2, longitude: 16.37, category: 'RESTAURANT', certified, certificationBody,
    featured: false, parking: false, openingHours: null, rating: null, phone: null, website: null,
  }
}

async function certStatusFor(overrides: SpotOverrides): Promise<string> {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [spot(overrides)],
  } as Response)
  const [business] = await getHalalBusinesses()
  return business.certStatus
}

describe('halal certification labelling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('treats the spreadsheet wording "Halal Zertifiziert" as certified', async () => {
    await expect(certStatusFor({ certificationBody: 'Halal Zertifiziert (seit 2023 – alle Standorte)' }))
      .resolves.toBe('Halal-zertifiziert')
  })

  it('treats "100% Halal" as certified', async () => {
    await expect(certStatusFor({ certificationBody: '100% Halal' })).resolves.toBe('Halal-zertifiziert')
  })

  it('does not promote a self-declared claim that merely says 100%', async () => {
    await expect(certStatusFor({ certificationBody: '100% Halal (selbstdeklariert)' }))
      .resolves.toBe('Selbst-zertifiziert')
  })

  it('keeps a Zabihah listing in its own weaker tier', async () => {
    await expect(certStatusFor({ certificationBody: 'Auf Zabihah.com als halal gelistet' }))
      .resolves.toBe('Community-gelistet')
  })

  it('labels hotels that only arrange halal on request', async () => {
    await expect(certStatusFor({ certified: false, certificationBody: 'Hotel arrangiert auf Anfrage' }))
      .resolves.toBe('Auf Anfrage')
  })

  it('falls back to self-declared for the unlabelled majority', async () => {
    await expect(certStatusFor({ certificationBody: 'Self-declared Halal' }))
      .resolves.toBe('Selbst-zertifiziert')
  })

  it('never calls an unverified spot certified', async () => {
    await expect(certStatusFor({ certified: false, certificationBody: 'Nicht verifiziert' }))
      .resolves.toBe('Selbst-zertifiziert')
  })
})
