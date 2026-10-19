# Pasta `images/`

O site usa **fotografias locais em WebP** (carregam rápido e funcionam sem
ligação ao CDN do Unsplash). Os ficheiros atuais são placeholders — troca-os
pelas fotografias reais da loja quando as tiveres.

## Ficheiros atuais e como substituí-los

| Ficheiro | Uso | Substituir por |
|---|---|---|
| `hero-800/1280/1600/1920.webp` | fundo do hero (`srcset`) | foto de ambiente da loja, 1920 × 1280 |
| `sobre-600.webp`, `sobre-900.webp` | foto principal "Sobre nós" | interior com cadeiras de couro |
| `sobre-detalhe-600.webp` | foto sobreposta | detalhe: cadeira, latão, madeira |
| `galeria-1…9.webp` | galeria de trabalhos | cortes e barbas reais (800 px de largura) |
| `equipa-1…3.webp` | retratos da equipa | 640 × 800, recorte centrado na cara |

Para substituir: gera um `.webp` com o **mesmo nome** e coloca-o aqui —
não é preciso mexer em mais nada (o `index.html` já aponta para estes nomes).
As proporções atuais mantêm o layout sem saltos; se mudares a proporção,
atualiza também os atributos `width`/`height` do `<img>` correspondente.

> Para gerar WebP: `ffmpeg -i foto.jpg -vf scale=1600:-1 foto.webp`,
> ou o conversor online que preferires.

Única exceção: a imagem de capa das redes sociais (`og:image`, no `<head>`)
continua remota — redes sociais exigem um URL absoluto; quando o site tiver
domínio, aponta-a para `https://tudominio.pt/images/sobre-900.webp`.

## Ícones e logótipos

- `favicon.svg` — ícone do separador (monograma "VII").
- `logo.svg` — versão horizontal, útil para impressão/redes.
- `icone-192.png`, `icone-512.png`, `icone-maskable-512.png` — ícones do PWA
  (usados pelo `manifest.json` para "adicionar ao ecrã principal").
- `apple-touch-icon.png` — ícone iOS (180 × 180).

As cores estão no `css/style.css` (`:root`): `#1A1A1A` carvão, `#B8924A`
dourado, `#F4EEE3` creme, `#1F3B2D` verde-garrafa. Se mudares o dourado,
regenera os PNG com os novos valores (o SVG é editável em qualquer editor de texto).
