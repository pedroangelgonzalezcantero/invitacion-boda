/**
 * Script para recortar las fotos de boda y copiarlas a /public/images/
 * Usa la estrategia "attention" de Sharp: detecta automáticamente la zona
 * más importante (caras/personas) y centra el recorte ahí.
 *
 * Uso: node scripts/crop-photos.mjs
 */

import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR  = path.join(__dirname, '..', 'public', 'fotos boda')
const OUT_DIR  = path.join(__dirname, '..', 'public', 'images')

// Tamaño de salida — cuadrado para la galería
// "attention": Sharp detecta la región más saliente (caras, personas)
const OUTPUT_SIZE = 600
const MAX_PHOTOS  = 9

async function main () {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  const files = (await readdir(SRC_DIR))
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a, 10)
      const nb = parseInt(b, 10)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })
    .slice(0, MAX_PHOTOS)

  console.log(`\nProcesando ${files.length} fotos con detección automática de personas...\n`)

  for (let i = 0; i < files.length; i++) {
    const srcPath = path.join(SRC_DIR, files[i])
    const outPath = path.join(OUT_DIR, `photo${i + 1}.jpg`)

    const meta = await sharp(srcPath).metadata()
    console.log(`[${i + 1}/${files.length}] ${files[i]}  (${meta.width}×${meta.height})  → photo${i + 1}.jpg`)

    await sharp(srcPath)
      // Recorte inteligente: centra en la zona de mayor interés visual (caras/personas)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: 'cover',
        position: sharp.strategy.attention,
      })
      .jpeg({ quality: 92 })
      .toFile(outPath)
  }

  console.log('\n✅ Listo! Fotos centradas en personas → /public/images/\n')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

