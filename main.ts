import axios from "axios";
import cheerio from "cheerio";
import now from "performance-now";

interface SEOStats {
  title: string;
  description: string;
  keywords: string[];
  headingTags: Record<string, number>;
  imagesWithoutAlt: number;
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  speed: {
    responseTime: number; 
    loadTime: number;    
  };
}


async function analyzeSEO(url: string): Promise<SEOStats> {
  try {

    const startResponseTime = now();
    const response = await axios.get(url);
    const responseTime = now() - startResponseTime;

    const startLoadTime = now();
    const html = response.data;
    const loadTime = now() - startLoadTime + responseTime;

    const $ = cheerio.load(html);

  
    const title = $("title").text() || "Sin título";

    const description = $('meta[name="description"]').attr("content") || "Sin descripción";

    const keywordsString = $('meta[name="keywords"]').attr("content") || "";
    const keywords = keywordsString.split(",").map((k) => k.trim());


    const headingTags: Record<string, number> = {};
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
      headingTags[tag] = $(tag).length;
    });

    const imagesWithoutAlt = $("img:not([alt])").length;

    let internal = 0,
      external = 0,
      broken = 0;

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        if (href.startsWith("http") || href.startsWith("//")) {
          external++;
        } else {
          internal++;
        }
      } else {
        broken++;
      }
    });


    return {
      title,
      description,
      keywords,
      headingTags,
      imagesWithoutAlt,
      links: { internal, external, broken },
      speed: {
        responseTime: Math.round(responseTime),
        loadTime: Math.round(loadTime),
      },
    };
  } catch (error) {
    console.error("Error al analizar la URL:", error.message);
    throw error;
  }
}

(async () => {
  const url = ""; 
  const stats = await analyzeSEO(url);
  console.log(stats);
})();
