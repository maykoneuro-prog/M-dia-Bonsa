import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to search for lyrics using Gemini
app.get("/api/lyrics/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: "Parâmetro 'q' (busca) é obrigatório." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chave do Gemini API não configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Check if query is a URL
    const isUrl = query.startsWith("http://") || query.startsWith("https://");
    let urlContent = "";

    if (isUrl) {
      try {
        console.log(`Buscando conteúdo da URL: ${query}`);
        const fetchRes = await fetch(query, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
          }
        });
        
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          // Strip out heavy non-text blocks to keep tokens reasonable and optimize parsing
          const cleanedHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "");
          
          urlContent = cleanedHtml.substring(0, 100000); // 100k chars is plenty for lyrics page HTML
        } else {
          console.warn(`Fetch da URL falhou com status: ${fetchRes.status}`);
        }
      } catch (err) {
        console.error("Erro ao buscar conteúdo da URL:", err);
      }
    }

    let prompt = "";
    if (urlContent) {
      prompt = `Você recebeu o HTML de uma página de letras de música (como letras.mus.br ou semelhante).
Sua tarefa é analisar este HTML, identificar e extrair o título exato da música, o artista/cantor correspondente e a letra completa contida nele.

--- HTML COMEÇO ---
${urlContent}
--- HTML FIM ---

Instruções cruciais:
1. Extraia com precisão o Título e o Artista exatos da música a partir do HTML.
2. Divida a letra inteira da música em uma sequência de slides ideais para projeção de igreja (estilo Datashow/Holyrics). Cada slide deve conter no máximo entre 2 e 4 linhas. Não resuma a música, forneça a letra inteira estruturada do início ao fim!
3. Classifique cada slide com um 'type' adequado: 'Estrofe', 'Coro', 'Ponte', 'Ministração' ou 'Introdução'.
4. Se for uma música internacional que possui versão em português muito conhecida, retorne obrigatoriamente a letra e título da versão em PORTUGUÊS.
5. Retorne as informações estruturadas no formato JSON abaixo.

Formato de retorno esperado (JSON absoluto):
{
  "title": "Título Correto da Música",
  "artist": "Nome Correto do Cantor ou Ministério",
  "slides": [
    {
      "type": "Estrofe" | "Coro" | "Ponte" | "Ministração" | "Introdução",
      "lines": ["Linha 1 do slide", "Linha 2 do slide"]
    }
  ]
}`;
    } else {
      prompt = `Você é um mecanismo de busca e estruturador especializado em letras de louvores cristãos (Hinos da Harpa Cristã, Cantor Cristão, Adoração, Gospel Contemporâneo de cantores e ministérios como Fernandinho, Gabriela Rocha, Aline Barros, Bruna Karla, Diante do Trono, Morada, Preto no Branco, Kemuel, Nívea Soares, Hillsong, Isaías Saad, etc.).
O usuário está buscando pelo louvor ou trecho: "${query}".

Instruções cruciais:
1. Encontre a letra oficial e completa deste louvor em sua base de dados de conhecimento. Se a busca conter erros de digitação, abreviações ou apenas um pequeno trecho, identifique com precisão qual é o louvor mais provável e famoso correspondente e forneça-o.
2. Divida a letra inteira da música em uma sequência de slides ideais para projeção de igreja (estilo Datashow/Holyrics). Cada slide deve conter no máximo entre 2 e 4 linhas. Não resuma a música, forneça a letra inteira estruturada do início ao fim!
3. Classifique cada slide com um 'type' adequado: 'Estrofe', 'Coro', 'Ponte', 'Ministração' ou 'Introdução'.
4. Se for uma música internacional que possui versão em português muito conhecida (por exemplo, 'Oceans' de Hillsong ou 'Way Maker' de Sinach), retorne obrigatoriamente a letra e título da versão em PORTUGUÊS (ex: 'Oceanos' ou 'Caminho no Deserto').
5. Nunca retorne um array de slides vazio. Esforce-se ao máximo para encontrar e estruturar a letra solicitada.

Formato de retorno esperado (JSON absoluto):
{
  "title": "Título Correto da Música",
  "artist": "Nome Correto do Cantor ou Ministério",
  "slides": [
    {
      "type": "Estrofe" | "Coro" | "Ponte" | "Ministração" | "Introdução",
      "lines": ["Linha 1 do slide", "Linha 2 do slide"]
    }
  ]
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            artist: { type: "STRING" },
            slides: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING", description: "Tipo da seção, e.g., 'Estrofe', 'Coro', 'Ponte', 'Ministração'" },
                  lines: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["type", "lines"]
              }
            }
          },
          required: ["title", "artist", "slides"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia do Gemini.");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Erro na busca de letras:", error);
    return res.status(500).json({ error: "Erro ao processar busca de letras: " + error.message });
  }
});

// API route to fetch bible verses using Gemini as a robust, accurate source
app.get("/api/bible/verses", async (req, res) => {
  const version = (req.query.version as string || "nvi").toLowerCase();
  const book = (req.query.book as string || "gn").toLowerCase();
  const chapter = parseInt(req.query.chapter as string) || 1;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chave do Gemini API não configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Help Gemini map translation code to full description to ensure maximum translation fidelity
    const versionMap: Record<string, string> = {
      nvi: "NVI (Nova Versão Internacional - em Português)",
      ra: "Almeida Revista e Atualizada (RA - em Português)",
      acf: "Almeida Corrigida Fiel (ACF - em Português)"
    };
    
    const versionDesc = versionMap[version] || version;

    const prompt = `Você é uma API de Bíblia Sagrada extremamente precisa e fiel aos textos bíblicos em português.
Sua tarefa é retornar TODOS os versículos do seguinte capítulo, na versão solicitada:
- Livro (abreviação ou nome): "${book}"
- Capítulo: ${chapter}
- Versão: "${versionDesc}"

Instruções fundamentais:
1. Identifique o livro correto baseado na abreviação/nome "${book}".
2. Obtenha todos os versículos do capítulo ${chapter} na versão "${versionDesc}". Seja extremamente fiel e preciso com o texto da versão solicitada. Não pule nenhum versículo e traga o texto por completo.
3. Retorne um objeto JSON puro, contendo um campo "verses", que é um array de objetos. Cada objeto deve possuir as seguintes propriedades exatas:
   - "number": número do versículo (inteiro)
   - "text": o texto do versículo correspondente (string)
4. Não adicione nenhuma introdução, marcações de markdown adicionais, ou explicações. Retorne apenas o JSON estruturado.
5. Se por acaso o livro ou capítulo não existir, retorne um objeto JSON vazio com um array "verses" vazio.

Exemplo de formato esperado:
{
  "verses": [
    { "number": 1, "text": "No princípio, criou Deus os céus e a terra." },
    { "number": 2, "text": "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            verses: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  number: { type: "INTEGER" },
                  text: { type: "STRING" }
                },
                required: ["number", "text"]
              }
            }
          },
          required: ["verses"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia do Gemini.");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Erro na busca de versículos da bíblia:", error);
    return res.status(500).json({ error: "Erro ao processar busca de versículos da bíblia: " + error.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
