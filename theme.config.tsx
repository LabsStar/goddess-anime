import React from 'react'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Goddess Anime</span>,
  project: {
    link: 'https://github.com/LabsStar/goddess-anime',
  },
  chat: {
    link: 'https://discord.gg/ssCu7TYD4T',
  },
  docsRepositoryBase: 'https://github.com/LabsStar/goddess-anime/tree/docs',
  footer: {
    text: 'CC0 1.0 Universal',
  },
  faviconGlyph: '✦',
  useNextSeoProps() {
    const { frontMatter } = useConfig()
    return {
      description: 'Goddess Anime Cards is a website / bot where you can trade anime cards with other users. You can also buy cards from the shop and sell your own cards to other users.',
      openGraph: {
        images: [
          { url: 'https://cdn.discordapp.com/avatars/1045919089048178828/ff3d1e4231d97a4c0013973142bf3d56.webp' }
        ]
      },
      titleTemplate: '%s – Goddess Anime',
    }
  }
}

export default config
