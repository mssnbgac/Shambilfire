import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

interface GalleryData {
  images: string[]; // base64 data URLs
  videos: string[]; // base64 data URLs
  updatedAt: string;
}

function readGallery(): GalleryData {
  try {
    if (fs.existsSync(GALLERY_FILE)) {
      return JSON.parse(fs.readFileSync(GALLERY_FILE, 'utf-8'));
    }
  } catch {}
  return { images: [], videos: [], updatedAt: new Date().toISOString() };
}

function writeGallery(data: GalleryData) {
  try {
    fs.mkdirSync(path.dirname(GALLERY_FILE), { recursive: true });
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Vercel read-only filesystem — writes are silently ignored
  }
}

// GET - fetch gallery
export async function GET() {
  try {
    const data = readGallery();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}

// POST - add images or videos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gallery = readGallery();

    if (body.images && Array.isArray(body.images)) {
      gallery.images = [...gallery.images, ...body.images];
    }
    if (body.videos && Array.isArray(body.videos)) {
      gallery.videos = [...gallery.videos, ...body.videos];
    }
    gallery.updatedAt = new Date().toISOString();

    writeGallery(gallery);
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save gallery' }, { status: 500 });
  }
}

// DELETE - remove image or video by index
export async function DELETE(request: NextRequest) {
  try {
    const { type, index } = await request.json();
    const gallery = readGallery();

    if (type === 'image' && typeof index === 'number') {
      gallery.images = gallery.images.filter((_, i) => i !== index);
    } else if (type === 'video' && typeof index === 'number') {
      gallery.videos = gallery.videos.filter((_, i) => i !== index);
    }
    gallery.updatedAt = new Date().toISOString();

    writeGallery(gallery);
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
