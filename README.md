# Barbearia Sete Colinas — site institucional

Site de página única (HTML5 + CSS3 + JavaScript sem dependências) para uma
barbearia em Lisboa. Mobile-first, acessível e com SEO local pronto a usar.

## Como abrir

- **Local:** faz duplo clique em `index.html`, ou corre um servidor estático:
  ```powershell
  npx serve .
  ```
- **Online:** arrasta a pasta para [Netlify Drop](https://app.netlify.com/drop),
  GitHub Pages ou qualquer alojamento estático. Não há build nem dependências.

## Estrutura

```
index.html        página inteira (10 secções, JSON-LD, Open Graph, ARIA)
css/style.css     estilos mobile-first + fontes @font-face locais
js/main.js        toda a interatividade (sem bibliotecas)
fonts/            Inter variável (woff2) — sem pedidos ao Google
images/           fotografias WebP locais, ícones do PWA e logótipos
manifest.json     torna o site instalável no telemóvel
robots.txt        instruções para motores de busca
sitemap.xml       mapa do site (atualizar o domínio ao publicar)
```

## O que já funciona

- **Marcações com validação completa**: telemóvel PT (9 dígitos, começa por 2/9,
  com máscara automática), bloqueio de domingos, datas passadas e > 60 dias,
  horas geradas a partir do horário do dia, resumo ao vivo e barra de progresso.
- **Indicador "Aberto / Fechado"** calculado com o relógio do visitante.
- **Galeria com lightbox** (setas, ESC, toque), **carrossel de testemunhos**
  (autoplay, pausa ao passar o rato) e **menu hambúrguer**.
- **Botão flutuante de WhatsApp** com mensagem pré-preenchida.
- **PWA**: instalável, com ícone próprio e ecrã de arranque.

## Personalização rápida (tudo em poucos cliques)

| O quê | Onde |
|---|---|
| Cores da marca | `css/style.css` → `:root` (carvão `#1A1A1A`, dourado `#B8924A`, creme `#F4EEE3`, verde `#1F3B2D`) |
| Horário | `js/main.js` → `HORARIO` |
| Serviços, preços e durações | `js/main.js` → `SERVICOS` (fonte única: atualiza cartões **e** o `<select>`) |
| WhatsApp, telefone | `js/main.js` → `WHATSAPP`; contactos no `index.html` |
| Fotografias | substitui os `.webp` em `images/` (ver `images/README.md`) |
| Textos | direto no `index.html` (pt-PT) |

## Ligar o formulário a um serviço real (Formspree, ~2 minutos)

1. Cria conta gratuita em <https://formspree.io> (50 mensagens/mês).
2. Cria um formulário novo — ele mostra um ID tipo `f/abC123XyZ`.
3. Em `js/main.js`, na configuração no topo, preenche:
   ```js
   var FORMSPREE_ID = 'abC123XyZ';
   ```
4. Pronto: os pedidos de marcação chegam por e-mail. Sem o ID, o site
   funciona em modo demonstração (confirmação simulada, sem envio).

Alternativas (EmailJS, Calendly, Google Forms) estão explicadas no fim de `js/main.js`.

## Qualidade (auditoria Lighthouse, localhost)

| Categoria | Nota |
|---|---|
| Performance | **99** |
| Acessibilidade | **100** |
| Boas práticas | **100** |
| SEO | **100** |

Testes de comportamento: 49 asserções (validação, lightbox, carrossel,
menu, sincronização de serviços) — todas a passar, sem erros de consola.

## Ao publicar

- Atualiza o domínio em `index.html` (canonical, Open Graph, JSON-LD),
  `robots.txt` e `sitemap.xml`.
- A imagem de capa das redes sociais (`og:image`) deve apontar para um URL
  absoluto no teu domínio, ex. `https://tudominio.pt/images/sobre-900.webp`.
- As fotografias e placeholders são do Unsplash e devem ser substituídas por
  imagens reais da loja antes do lançamento.
