import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import * as wawoff2 from "wawoff2";

import { getCollection } from "astro:content";
import { readFileSync } from "fs";
import type { APIContext } from "astro";
import type { GetStaticPaths } from "astro";

export const getStaticPaths = (async () => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return posts.map((p) => ({ params: { slug: p.id } }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { slug } = context.params;
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const post = posts.find((p) => p.id === slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const { title, description, category, pubDate } = post.data;

  const fontPath = `${process.cwd()}/src/fonts/prxnv-reg.woff2`;
  const fontBuffer = readFileSync(fontPath);
  const decompressed = await wawoff2.decompress(fontBuffer);
  const fontRegData = Buffer.from(decompressed);

  const fontPathBld = `${process.cwd()}/src/fonts/prxnv-bld.woff2`;
  const fontBufferBld = readFileSync(fontPathBld);
  const decompressedBld = await wawoff2.decompress(fontBufferBld);
  const fontBldData = Buffer.from(decompressedBld);

  const faviconPath = `${process.cwd()}/public/favicon.svg`;
  let faviconSvg = readFileSync(faviconPath, "utf-8");
  // Replace the styles with dark mode colors
  faviconSvg = faviconSvg.replace(
    /<style>[\s\S]*?<\/style>/,
    "<style>path { fill: white; stroke: #161619; }</style>",
  );
  const faviconDataUrl = `data:image/svg+xml;base64,${Buffer.from(faviconSvg).toString("base64")}`;

  const svg = await satori(
    {
      type: "div",
      props: {
        children: [
          {
            type: "div",
            props: {
              children: [
                {
                  type: "img",
                  props: {
                    src: faviconDataUrl,
                    style: { width: 80, height: 80, marginRight: 20 },
                  },
                },
                {
                  type: "div",
                  props: {
                    children: [
                      {
                        type: "span",
                        props: {
                          children: "ALEXIS MORIN",
                          style: { fontSize: 40, fontFamily: "pn-bld" },
                        },
                      },
                      {
                        type: "span",
                        props: {
                          children: "DESIGNER",
                          style: { fontSize: 40, letterSpacing: "12px" },
                        },
                      },
                    ],
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      color: "#fff",
                    },
                  },
                },
              ],
              style: {
                display: "flex",
                alignItems: "center",
                marginBottom: 40,
              },
            },
          },
          {
            type: "div",
            props: {
              children: `#${category}`,
              style: { fontSize: 24, color: "#888", fontFamily: "monospace" },
            },
          },
          {
            type: "h1",
            props: {
              children: title,
              style: {
                fontSize: 60,
                fontWeight: 700,
                margin: "20px 0",
                color: "#fff",
                fontFamily: "pn-bld",
              },
            },
          },
          {
            type: "p",
            props: {
              children: description,
              style: { fontSize: 32, color: "#aaa", margin: "0" },
            },
          },
        ],
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          /*backgroundColor: "#09090c",*/
          backgroundImage:
            "linear-gradient(180deg,hsl(240deg 14% 4%) 0%,hsl(240deg 17% 5%) 44%,hsl(240deg 11% 5%) 64%,hsl(240deg 13% 6%) 76%,hsl(240deg 9% 6%) 84%,hsl(240deg 9% 7%) 89%,hsl(240deg 11% 7%) 93%,hsl(240deg 7% 8%) 95%,hsl(240deg 9% 9%) 97%,hsl(240deg 6% 9%) 100%)",
          padding: "60px",
          fontFamily: "pn-reg",
        },
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "pn-reg",
          data: fontRegData,
          weight: 400,
          style: "normal",
        },
        {
          name: "pn-bld",
          data: fontBldData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3153600", //1 year
    },
  });
}
