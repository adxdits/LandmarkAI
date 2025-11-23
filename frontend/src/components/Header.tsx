import React, { useEffect, useState } from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, ListItemIcon, Divider, Drawer, List, ListItem } from '@mui/material'
import { Flight, Menu as MenuIcon, Check, Delete, Edit } from '@mui/icons-material'
import { getUserHistory, deleteHistory } from '../services/historyApi'
import { deleteUser, updateUser } from '../services/userApi'
import { getUsers, createUser } from '../services/userApi'

type User = { id?: number; pseudo: string }

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newPseudo, setNewPseudo] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [userToRename, setUserToRename] = useState<User | null>(null)
  const [renamePseudo, setRenamePseudo] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [histories, setHistories] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [histToDelete, setHistToDelete] = useState<any | null>(null)
  const [isDeletingHistory, setIsDeletingHistory] = useState(false)
  const [deleteHistoryError, setDeleteHistoryError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const list: User[] = await getUsers()
        if (!mounted) {
          return
        }
        if (!list || list.length === 0) {
          const created = await createUser('defaut')
          setUsers([created])
          setCurrentUser(created)
          if (created.id) {
            localStorage.setItem('currentUserId', String(created.id))
          }
          localStorage.setItem('currentUserPseudo', created.pseudo)
        } else {
          setUsers(list)
          const storedId = localStorage.getItem('currentUserId')
          let selected: User | undefined = undefined
          if (storedId) {
            selected = list.find(u => String(u.id) === storedId)
          }
          if (!selected) {
            selected = list[0]
          }
          setCurrentUser(selected)
          if (selected && selected.id) {
            localStorage.setItem('currentUserId', String(selected.id))
          }
          if (selected) {
            localStorage.setItem('currentUserPseudo', selected.pseudo)
          }
        }
      } catch (e) {
        console.error('Failed to load users', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleSelectUser = (u: User) => {
    setCurrentUser(u)
    if (u.id) localStorage.setItem('currentUserId', String(u.id))
    localStorage.setItem('currentUserPseudo', u.pseudo)
    handleClose()
  }

  const openConfirmDelete = (u: User, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDeleteError(null)
    setUserToDelete(u)
    setIsConfirmOpen(true)
  }

  const closeConfirmDelete = () => {
    setIsConfirmOpen(false)
    setUserToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete || userToDelete.id === undefined) return
    try {
      setIsDeleting(true)
      await deleteUser(userToDelete.id)
      // refresh list
      const list: User[] = await getUsers()
      if (!list || list.length === 0) {
        // create default if none
        const created = await createUser('defaut')
        setUsers([created])
        setCurrentUser(created)
        if (created.id) {
          localStorage.setItem('currentUserId', String(created.id))
        }
        localStorage.setItem('currentUserPseudo', created.pseudo)
      } else {
        setUsers(list)
        // if deleted user was current, pick first
        if (currentUser?.id === userToDelete.id) {
          const sel = list[0]
          setCurrentUser(sel)
          if (sel.id) {
            localStorage.setItem('currentUserId', String(sel.id))
          }
          localStorage.setItem('currentUserPseudo', sel.pseudo)
        }
      }
      closeConfirmDelete()
    } catch (e: any) {
      console.error('Delete failed', e)
      setDeleteError(e?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const openRenameDialog = (u: User, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRenameError(null)
    setUserToRename(u)
    setRenamePseudo(u.pseudo)
    setIsRenameOpen(true)
  }

  const closeRenameDialog = () => {
    setIsRenameOpen(false)
    setUserToRename(null)
    setRenamePseudo('')
    setRenameError(null)
  }

  const handleRenameUser = async () => {
    if (!userToRename || userToRename.id === undefined) return
    const trimmed = renamePseudo.trim()
    if (!trimmed) {
      setRenameError('Le pseudo ne peut pas être vide')
      return
    }
    try {
      setIsRenaming(true)
      const updated = await updateUser(userToRename.id, trimmed)
      const list: User[] = await getUsers()
      setUsers(list)
      // if renamed user is current, update currentUser and localStorage
      if (currentUser?.id === userToRename.id) {
        setCurrentUser(updated)
        if (updated.id) {
          localStorage.setItem('currentUserId', String(updated.id))
        }
        localStorage.setItem('currentUserPseudo', updated.pseudo)
      }
      closeRenameDialog()
    } catch (e: any) {
      console.error('Rename failed', e)
      setRenameError(e?.message || 'Erreur lors du renommage')
    } finally {
      setIsRenaming(false)
    }
  }

  const openNewUserDialog = () => {
    setCreateError(null)
    setNewPseudo('')
    setIsNewDialogOpen(true)
    handleClose()
  }

  const closeNewUserDialog = () => {
    setIsNewDialogOpen(false)
    setNewPseudo('')
    setCreateError(null)
  }

  const handleCreateUser = async () => {
    const trimmed = newPseudo.trim()
    if (!trimmed) {
      setCreateError('Le pseudo ne peut pas être vide')
      return
    }
    try {
      setIsCreating(true)
      const created = await createUser(trimmed)
      // refresh list
      const list: User[] = await getUsers()
      setUsers(list)
      setCurrentUser(created)
      if (created.id) {
        localStorage.setItem('currentUserId', String(created.id))
      }
      localStorage.setItem('currentUserPseudo', created.pseudo)
      closeNewUserDialog()
    } catch (e: any) {
      console.error('Failed to create user', e)
      setCreateError(e?.message || 'Erreur')
    } finally {
      setIsCreating(false)
    }
  }

  const avatarLetter = currentUser?.pseudo ? currentUser.pseudo.charAt(0).toUpperCase() : 'U'

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #EBEBEB',
      }}
    >
      <Toolbar>
        <IconButton edge="start" sx={{ mr: 2, color: 'primary.main' }} onClick={async () => {
          // open history drawer for current user
          setDrawerOpen(true)
          const stored = localStorage.getItem('currentUserId')
          if (!stored) return
          const uid = Number(stored)
          if (!uid) return
          try {
            setLoadingHistory(true)
            const h = await getUserHistory(uid)
            setHistories(h || [])
          } catch (e) {
            console.error('Failed to load history', e)
            setHistories([])
          } finally {
            setLoadingHistory(false)
          }
        }}>
          <MenuIcon />
        </IconButton>
        <Flight sx={{ mr: 1, color: 'primary.main' }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}
        >
          OneEurotrip
        </Typography>

        <IconButton onClick={handleAvatarClick} aria-controls={anchorEl ? 'user-menu' : undefined} aria-haspopup="true" aria-expanded={Boolean(anchorEl)}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>{avatarLetter}</Avatar>
        </IconButton>

        <Menu id="user-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} PaperProps={{ sx: { minWidth: 260 } }}>
          {users && users.length > 0 ? (
            users.map(u => (
              <MenuItem key={u.id} selected={currentUser?.id === u.id} onClick={() => handleSelectUser(u)} sx={{ py: 1.25 }}>
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.light', color: 'secondary.contrastText', fontWeight: 700 }}>
                    {u.pseudo ? u.pseudo.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </ListItemIcon>
                <Box sx={{ flex: 1, ml: 1 }}> 
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{u.pseudo}</Typography>
                  {u.id !== undefined && (
                    <Typography variant="caption" color="text.secondary">id: {u.id}</Typography>
                  )}
                </Box>
                {currentUser?.id === u.id && (
                  <Check color="primary" fontSize="small" />
                )}
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => openRenameDialog(u, e)}
                  aria-label={`Rename ${u.pseudo}`}
                  sx={{ ml: 1 }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => openConfirmDelete(u, e)}
                  aria-label={`Delete ${u.pseudo}`}
                  sx={{ ml: 1 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ py: 1.5 }}>No User</MenuItem>
          )}

          <Divider />

          <MenuItem onClick={openNewUserDialog} sx={{ py: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}>+</Avatar>
            </ListItemIcon>
            <ListItemText primary="Add User" sx={{ ml: 1 }} />
          </MenuItem>
        </Menu>

        <Dialog open={isNewDialogOpen} onClose={closeNewUserDialog} fullWidth maxWidth="xs">
          <DialogTitle>New User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Pseudo"
              type="text"
              fullWidth
              value={newPseudo}
              onChange={(e) => setNewPseudo(e.target.value)}
              disabled={isCreating}
              helperText={createError ?? ''}
              error={Boolean(createError)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeNewUserDialog} disabled={isCreating}>Cancel</Button>
            <Button onClick={handleCreateUser} variant="contained" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={isConfirmOpen} onClose={closeConfirmDelete} fullWidth maxWidth="xs">
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the user <strong>{userToDelete?.pseudo}</strong> ?
            </Typography>
            {deleteError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>{deleteError}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDelete} disabled={isDeleting}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={isRenameOpen} onClose={closeRenameDialog} fullWidth maxWidth="xs">
          <DialogTitle>Rename User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Pseudo"
              type="text"
              fullWidth
              value={renamePseudo}
              onChange={(e) => setRenamePseudo(e.target.value)}
              disabled={isRenaming}
              helperText={renameError ?? ''}
              error={Boolean(renameError)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRenameDialog} disabled={isRenaming}>Cancel</Button>
            <Button onClick={handleRenameUser} variant="contained" disabled={isRenaming}>
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogActions>
        </Dialog>
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 360, height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }} role="presentation">
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Historique — {currentUser?.pseudo ?? ''}</Typography>
              <Divider sx={{ mb: 1 }} />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <List>
                {loadingHistory && (
                  <ListItem>
                    <ListItemText primary="Chargement..." />
                  </ListItem>
                )}
                {!loadingHistory && histories.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Aucun historique" />
                  </ListItem>
                )}
                {!loadingHistory && histories.map(h => (
                  <ListItem key={h.id} alignItems="flex-start" secondaryAction={
                    <IconButton edge="end" aria-label="delete" size="small" onClick={() => {
                      setDeleteHistoryError(null)
                      setHistToDelete(h)
                    }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={`${h.ticket?.poi?.name ?? 'Destination'} — ${h.ticket?.price ?? ''} €`}
                      secondary={`${h.ticket?.poi?.location ?? ''}${h.purchase_date ? ' — ' + new Date(h.purchase_date).toLocaleDateString() : ''}`}
                    />
                    {/* Clickable booking link button */}
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = h.ticket?.flight_url || h.ticket?.flightUrl || h.ticket?.bookingUrl
                          if (!url) return
                          // open in new tab safely
                          window.open(url, '_blank', 'noopener,noreferrer')
                        }}
                        disabled={!h.ticket?.flight_url && !h.ticket?.flightUrl && !h.ticket?.bookingUrl}
                      >
                        Voir le vol
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Dialog open={histToDelete !== null} onClose={() => { if (!isDeletingHistory) setHistToDelete(null); }} fullWidth maxWidth="xs">
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogContent>
                <Typography>
                  Voulez-vous vraiment supprimer cette entrée de l'historique ?
                </Typography>
                {histToDelete && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">{histToDelete.ticket?.poi?.name ?? 'Destination'}</Typography>
                    <Typography variant="body2" color="text.secondary">{histToDelete.ticket?.poi?.location ?? ''}</Typography>
                  </Box>
                )}
                {deleteHistoryError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>{deleteHistoryError}</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setHistToDelete(null)} disabled={isDeletingHistory}>Annuler</Button>
                <Button color="error" variant="contained" onClick={async () => {
                  if (!histToDelete || histToDelete.id === undefined) return
                  try {
                    setIsDeletingHistory(true)
                    await deleteHistory(histToDelete.id)
                    setHistories(prev => prev.filter(x => x.id !== histToDelete.id))
                    setHistToDelete(null)
                  } catch (e: any) {
                    console.error('Failed to delete history', e)
                    setDeleteHistoryError(e?.message || 'Erreur lors de la suppression')
                  } finally {
                    setIsDeletingHistory(false)
                  }
                }} disabled={isDeletingHistory}>{isDeletingHistory ? 'Suppression...' : 'Supprimer'}</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}

export default Header