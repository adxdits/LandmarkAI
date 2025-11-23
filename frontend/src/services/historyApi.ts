type PoiPayload = {
  name: string
  description?: string
  location?: string
  image_url?: string | null
}

type TicketPayload = {
  poi: { id: number }
  price: number
  transport_mode: 'Avion' | 'Train' | 'Voiture'
  start_date?: string
  end_date?: string
  flight_url?: string
}

type HistoryPayload = {
  userId: number
  ticketId: number
  purchase_date?: string
}

export async function createPoi(poi: PoiPayload) {
  const res = await fetch('/api/pois', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poi),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create poi: ${res.status} ${text}`)
  }
  return res.json()
}

export async function createTicket(ticket: TicketPayload) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create ticket: ${res.status} ${text}`)
  }
  return res.json()
}

export async function createHistory(history: HistoryPayload) {
  // debug: log payload so we can trace missing id issues
  // eslint-disable-next-line no-console
  console.debug('createHistory payload', history)
  const res = await fetch('/api/histories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(history),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create history: ${res.status} ${text}`)
  }
  return res.json()
}

type HistoryCheckRequest = {
  userId: number
  poiId?: number
  poiName?: string
  poiLocation?: string
  price?: number
  transport_mode?: 'Avion' | 'Train' | 'Voiture'
  start_date?: string
  end_date?: string
}

export async function checkUserHasTicket(req: HistoryCheckRequest) {
  const res = await fetch('/api/histories/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to check history: ${res.status} ${text}`)
  }
  return res.json() as Promise<boolean>
}

export async function getUserHistory(userId: number) {
  const res = await fetch(`/api/histories/user/${userId}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch history: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteHistory(historyId: number) {
  const res = await fetch(`/api/histories/${historyId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to delete history: ${res.status} ${text}`)
  }
  return true
}

// Helper that saves a flight: creates poi -> ticket -> history
export async function saveFlightForUser(flight: any, userId: number) {
  // Determine poi fields
  const name = flight.monument || flight.city || 'Destination'
  const description = `${flight.monument ? flight.monument + ' • ' : ''}${flight.city || ''}${flight.country ? ', ' + flight.country : ''}`
  const poi = await createPoi({ name, description, location: `${flight.city || ''}, ${flight.country || ''}` })
  // debug: ensure backend returned an id
  // eslint-disable-next-line no-console
  console.debug('createPoi response', poi)
  if (!poi || (poi.id === undefined || poi.id === null)) {
    throw new Error(`createPoi did not return an id: ${JSON.stringify(poi)}`)
  }

  const toDate = (s: string | undefined) => {
    if (!s) return undefined
    try {
      const d = new Date(s)
      if (isNaN(d.getTime())) return undefined
      return d.toISOString().slice(0, 10)
    } catch (e) {
      return undefined
    }
  }

  let ticket
  try {
    ticket = await createTicket({
      poi: { id: poi.id },
      price: Number(flight.price) || 0,
      transport_mode: 'Avion',
      flight_url: (flight as any).bookingUrl || (flight as any).bookingURL || undefined,
      start_date: toDate(flight.departureTime),
      end_date: toDate(flight.arrivalTime),
    })
  } catch (e: any) {
    // include debug info to help trace the 400
    // eslint-disable-next-line no-console
    console.error('createTicket failed', { error: e?.message || e, poi, flight })
    throw new Error(`Failed to create ticket: ${e?.message || e}`)
  }

  // validate userId before sending
  if (!userId || isNaN(Number(userId))) {
    throw new Error(`Invalid user id: ${userId}`)
  }
  const history = await createHistory({
    userId: Number(userId),
    ticketId: ticket.id,
  })

  return { poi, ticket, history }
}
