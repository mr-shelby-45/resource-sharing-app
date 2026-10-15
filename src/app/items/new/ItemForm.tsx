'use client'
import { useActionState, useState } from "react"
import { upload } from "@vercel/blob/client"
//uses server action to get data from the form, details for the new item to be added 

const MAX_PHOTOS = 4
type Photo = { url: string; preview: string }

async function resizeImage(file: File, maxSide = 1600): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  if (!blob) throw new Error('Could not process that image')
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
}



type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string} | void>
}
//exports item's details to page.tsx, server component, checks duplicate and adds item to db
export default function ItemForm({ action }: Props) {

  const [state, formAction] = useActionState(action, null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? [])
  e.target.value = ''   // lets the same file be picked again later
  if (files.length === 0) return
  setPhotoError('')

  const room = MAX_PHOTOS - photos.length
  if (files.length > room) {
    setPhotoError(`You can add ${MAX_PHOTOS} photos in total. Using the first ${room}.`)
  }

  setUploading(true)
  try {
    for (const file of files.slice(0, room)) {
      const small = await resizeImage(file)
      const blob = await upload(`items/${small.name}`, small, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      setPhotos(prev => [...prev, { url: blob.url, preview: URL.createObjectURL(small) }])
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    setPhotoError(
      message.includes('client token')
        ? 'Photo upload was refused. Check that you are logged in and allowed to list items.'
        : message || 'Upload failed'
    )
  } finally {
    setUploading(false)   // always unlock the form, success or failure
  }
}

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 24px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <h1 style={{ marginBottom: '8px' }}>List an Item</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Share something with your community
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Item name
            </label>
            <input name="title" type="text" placeholder="e.g. Electric drill, Ladder, Tent" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              name="description"
              placeholder="Condition, any usage notes, pickup instructions..."
              rows={4}
              style={{ resize: 'vertical' }}
            required/>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Price per day (KES)
            </label>
            <input
              name="dailyRate"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="e.g. 150. Enter 0 for free"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Photos (up to {MAX_PHOTOS})
            </label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
              Show the item and any wear, so borrowers know what to expect.
            </p>

            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {photos.map(photo => (
                  <div key={photo.url} style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.preview} alt="Item photo preview"
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} />
                    <button type="button" aria-label="Remove photo"
                      onClick={() => setPhotos(prev => prev.filter(p => p.url !== photo.url))}
                      style={{ position: 'absolute', top: '4px', right: '4px', padding: '0 7px', borderRadius: '999px' }}>
                      ×
                    </button>
                    <input type="hidden" name="imageUrls" value={photo.url} />
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS && (
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                onChange={handleFiles} disabled={uploading} />
            )}
            {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading…</p>}
            {photoError && <p style={{ fontSize: '0.85rem', color: '#c0392b' }}>{photoError}</p>}
          </div>

          {state?.error && (
            <p style={{ color: '#c0392b', fontSize: '0.9rem', padding: '10px 14px', background: '#fdecea', borderRadius: '8px' }}>
              {state.error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={uploading}
            style={{ marginTop: '8px', padding: '14px', fontSize: '1rem' }}>
            {uploading ? 'Uploading photos…' : 'List Item'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--primary)', fontWeight: '500' }}>Back to dashboard</a>
        </p>
      </div>
    </div>
  )
}