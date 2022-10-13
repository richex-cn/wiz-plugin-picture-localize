import { join } from 'node:path'
import {
  unlinkSync,
  readFileSync,
  writeFileSync,
  createWriteStream
} from 'node:fs'
import esbuild from 'esbuild'
import copy from 'esbuild-copy-plugin'
import clear from 'esbuild-plugin-clear'
import iconv from 'iconv-lite'
import JSZip from 'jszip'

esbuild
  .build({
    entryPoints: ['src/index.js'],
    bundle: true,
    target: 'es6',
    outfile: 'dist/index.utf8.js',
    plugins: [
      copy({ from: 'src/plugin.ini', to: 'plugin.utf8.ini' }),
      clear('dist')
    ]
  })
  .then(val => {
    const fileMapping = [
      ['index.utf8.js', 'index.js'],
      ['plugin.utf8.ini', 'plugin.ini']
    ]

    const zip = new JSZip()

    fileMapping.forEach(([src, dst]) => {
      const srcFile = join('dist', src)
      const outFile = join('dist', dst)
      const content = readFileSync(join('dist', src), 'utf-8')
      const buf = iconv.encode(content, 'utf16le', {
        addBOM: true,
        stripBOM: true
      })
      zip.file(dst, buf)
      writeFileSync(outFile, buf)
      unlinkSync(srcFile)
    })

    zip
      .generateNodeStream()
      .pipe(createWriteStream('dist/Picture.Localize.wizplugin'))
  })
  .catch(() => process.exit(1))
