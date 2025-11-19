export async function getUsers() {
  const res = await fetch('/api/users')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch users: ${res.status} ${text}`)
  }
  return res.json()
}

export async function createUser(pseudo: string) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pseudo }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create user: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to delete user: ${res.status} ${text}`)
  }
  return true
}

export async function updateUser(id: number, pseudo: string) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pseudo }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update user: ${res.status} ${text}`)
  }
  return res.json()
}
