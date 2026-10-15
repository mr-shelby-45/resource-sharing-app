import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getCurrentUser } from '@/lib/currentUser'
import { canAddItem } from '@/lib/permissions'
import { AppError } from "@/lib/errors"

// The browser asks this route for a short-lived upload token, then sends the
// file straight to Vercel Blob. Our server never touches the image bytes.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // runs on the server before any token is issued
        const user = await getCurrentUser()
        if (!user) throw new AppError(401, 'Please log in')
        const permission = canAddItem(user)
        if (!permission.allowed) throw new AppError(403, permission.message ?? 'Not allowed')

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB, after the browser has resized
          addRandomSuffix: true,
        }
      },
      // Only fires on a public URL (not on localhost). We save URLs when the
      // item form is submitted instead, so nothing to do here.
      onUploadCompleted: async () => {},
    })
    return Response.json(json)
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ message: error.message}, { status: error.status })
    }
    console.error('Upload error:', error)
    return Response.json({ message: 'Upload failed'}, { status: 400})
  }
}