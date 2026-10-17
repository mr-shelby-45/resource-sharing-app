'use client'
import { useActionState, useRef, useState } from "react"
import Link from 'next/link'
import type { FormState } from '@/lib/formState'
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
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}
//exports item's details to page.tsx, server component, checks duplicate and adds item to db
export default function ItemForm({ action }: Props) {

  const [state, formAction] = useActionState(action, null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

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
    <div className="auth-wrap form-wrap">
      <div className="card form-card">
        <h1>List an Item</h1>
        <p className="muted auth-intro">Share something with your community</p>

        <form action={formAction} className="form">
          <div className="field">
            <label htmlFor="title">Item name</label>
            <input id="title" name="title" type="text" placeholder="e.g. Electric drill, Ladder, Tent" required />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} className="textarea-resize"
              placeholder="Condition, any usage notes, pickup instructions..." required />
          </div>

          <div className="field">
            <label htmlFor="dailyRate">Price per day (KES)</label>
            <input id="dailyRate" name="dailyRate" type="number" min="0" step="1" inputMode="numeric"
              placeholder="e.g. 150. Enter 0 for free" required />
          </div>

          <div className="field">
            <label>Photos ({photos.length} of {MAX_PHOTOS})</label>
            <p className="muted text-sm field-help">
              Show the item and any wear, so borrowers know what to expect.
            </p>

            <div className="photo-grid">
              {photos.map(photo => (
                <div key={photo.url} className="photo-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt="Item photo preview" />
                  <button type="button" className="photo-remove" aria-label="Remove photo"
                    onClick={() => setPhotos(prev => prev.filter(p => p.url !== photo.url))}>
                    ×
                  </button>
                  <input type="hidden" name="imageUrls" value={photo.url} />
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <button type="button" className="photo-add" disabled={uploading}
                  onClick={() => fileInput.current?.click()}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  <span>{uploading ? 'Uploading…' : photos.length === 0 ? 'Add photos' : 'Add more'}</span>
                </button>
              )}
            </div>

            {/* the real file input stays hidden; the tile above opens it */}
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
              onChange={handleFiles} disabled={uploading} />

            {photoError && <p className="field-hint">{photoError}</p>}
          </div>

          {state?.error && <p className="form-error" role="alert">{state.error}</p>}

          <button type="submit" className="btn-primary btn-lg" disabled={uploading}>
            {uploading ? 'Uploading photos…' : 'List Item'}
          </button>
        </form>

        <p className="auth-switch muted">
          <Link href="/" className="strong">Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
